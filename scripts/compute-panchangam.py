#!/usr/bin/env python3
"""
Compute panchangam (Hindu almanac) for a date range using PyEphem.

Active successor to scripts/archive/compute-panchangam.py — adds gulika
kalam, yamaganda kalam, and day/night choghadiya on top of the original
tithi/nakshatra/yoga/karana/rahu-kalam fields. Same astronomical basis:

  - Sun/Moon positions via PyEphem (uses JPL/VSOP87 internally)
  - Lahiri (Chitrapaksha) ayanamsha for sidereal conversion
  - Location: New Delhi (IST reference; tithi/nakshatra/yoga/karana are
    pan-India constants; only sunrise/sunset and the inauspicious/
    choghadiya windows vary by location — per-city support is out of
    scope for this pass)

Gulika kalam, yamaganda kalam, and rahu kalam all divide sunrise→sunset
into 8 equal parts and pick one part by weekday (verified against
drikpanchang/anytimeastro reference tables). Choghadiya divides both
day (sunrise→sunset) and night (sunset→next sunrise) into 8 parts each,
cycling through 7 named muhurtas (Udveg, Chal, Labh, Amrit, Kaal, Shubh,
Rog) — the day sequence steps +1 through the cycle per slot starting from
the weekday's ruling planet's muhurta, the night sequence steps -2
through the same cycle starting two slots back from the day's start.
Both step rules were verified against drikpanchang.com's own Thursday
2026-08-13 choghadiya table before trusting them here.

Usage:
  python3 scripts/compute-panchangam.py              # 90 days from today
  python3 scripts/compute-panchangam.py 2026-07-22 90

Output: research/panchangam-computed.json
"""

import ephem
import json
import math
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

# ─── Location (New Delhi — IST reference meridian) ───────────────────────────
CITY     = "New Delhi, India"
OBS_LAT  = '28.6139'   # N
OBS_LON  = '77.2090'   # E
OBS_ELEV = 216         # metres

IST = timedelta(hours=5, minutes=30)  # UTC+5:30

# ─── Lahiri / Chitrapaksha ayanamsha ─────────────────────────────────────────
J2000 = 2451545.0
LAHIRI_J2000 = 23.853085        # degrees at J2000.0
PRECESSION_PER_CENTURY = 1.39555  # degrees/Julian century (50.2388"/yr)

def lahiri_ayanamsha(jd):
    T = (jd - J2000) / 36525.0
    return LAHIRI_J2000 + T * PRECESSION_PER_CENTURY

# ─── Name tables ─────────────────────────────────────────────────────────────
NAKSHATRAS = [
    'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
    'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni',
    'Uttara Phalguni','Hasta','Chitra','Swati','Vishakha',
    'Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha',
    'Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada',
    'Uttara Bhadrapada','Revati',
]

YOGAS = [
    'Vishkambha','Priti','Ayushman','Saubhagya','Shobhana',
    'Atiganda','Sukarma','Dhriti','Shula','Ganda','Vriddhi',
    'Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata',
    'Variyan','Parigha','Shiva','Siddha','Sadhya','Shubha',
    'Shukla','Brahma','Indra','Vaidhriti',
]

SHUKLA_TITHIS = [
    'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
    'Shashthi','Saptami','Ashtami','Navami','Dashami',
    'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima',
]
KRISHNA_TITHIS = [
    'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
    'Shashthi','Saptami','Ashtami','Navami','Dashami',
    'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Amavasya',
]

# 4 fixed + 7 movable (cycle). k_index 0..59 over the 60 half-tithis.
MOVABLE_KARANAS = ['Bava','Balava','Kaulava','Taitila','Garaja','Vanija','Vishti']

def karana_name(lon_diff_deg):
    k = int(lon_diff_deg % 360.0 / 6)  # 0–59
    if k == 0:
        return 'Kimstughna'
    if k == 57:
        return 'Shakuni'
    if k == 58:
        return 'Chatushpada'
    if k == 59:
        return 'Naga'
    return MOVABLE_KARANAS[(k - 1) % 7]

LUNAR_MONTHS = [
    'Chaitra','Vaishakha','Jyeshtha','Ashadha','Shravana','Bhadrapada',
    'Ashwina','Kartika','Margashirsha','Pausha','Magha','Phalguna',
]

def lunar_month(sun_sid_deg):
    return LUNAR_MONTHS[int(sun_sid_deg / 30) % 12]

# ─── Weekday-indexed inauspicious windows (1-indexed 1/8th-of-day part) ──────
# Keyed by weekday Sun=0..Sat=6. Verified against anytimeastro.com's
# per-weekday Rahu/Yamaganda/Gulika tables (assuming 6am sunrise / 6pm sunset,
# 1.5hr parts): e.g. Sunday Yamaganda 12:00–1:30pm = part 5, Gulika
# 3:00–4:30pm = part 7; Monday Yamaganda 10:30am–12pm = part 4, Gulika
# 1:30–3pm = part 6; Tuesday Yamaganda 9–10:30am = part 3, Gulika
# 12–1:30pm = part 5.
RAHU_PART      = [8, 2, 7, 5, 6, 4, 3]  # Sun Mon Tue Wed Thu Fri Sat
YAMAGANDA_PART = [5, 4, 3, 2, 1, 7, 6]
GULIKA_PART    = [7, 6, 5, 4, 3, 2, 1]

# ─── Choghadiya ───────────────────────────────────────────────────────────────
# 7-name cycle; day sequence starts at the weekday-lord's muhurta and steps
# +1 through the cycle per slot, night sequence starts 2 slots back from the
# day's start and steps -2 per slot. Verified against drikpanchang.com's
# live Thursday 2026-08-13 choghadiya table (day: Shubh,Rog,Udveg,Char,Labh,
# Amrit,Kaal,Shubh; night: Amrit,Char,Rog,Kaal,Labh,Udveg,Shubh,Amrit).
CHOGHADIYA_CYCLE = ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog']
CHOGHADIYA_DAY_START = [0, 3, 6, 2, 5, 1, 4]  # Sun..Sat -> index into cycle

def choghadiya_slots(start_idx, step, sr_ist, part):
    names = [CHOGHADIYA_CYCLE[(start_idx + step * i) % 7] for i in range(8)]
    slots = []
    for i, name in enumerate(names):
        s = sr_ist + timedelta(seconds=i * part)
        e = s + timedelta(seconds=part)
        slots.append(f"{s.strftime('%H:%M')}-{e.strftime('%H:%M')}:{name}")
    return '|'.join(slots)

# ─── Core computation ─────────────────────────────────────────────────────────

def compute_day(d: date, next_day_sunrise_ist):
    """Returns (row_dict, this_day_sunrise_ist) or (None, None) if circumpolar."""
    obs = ephem.Observer()
    obs.lat  = OBS_LAT
    obs.lon  = OBS_LON
    obs.elev = OBS_ELEV
    obs.pressure = 0  # disable atmospheric refraction for consistency

    date_str = d.strftime('%Y/%m/%d')
    obs.date = ephem.Date(date_str)  # midnight UTC (= 5:30 AM IST)

    sun  = ephem.Sun()
    moon = ephem.Moon()

    # Sunrise / sunset
    try:
        sr = obs.next_rising(sun,  start=ephem.Date(date_str))
        ss = obs.next_setting(sun, start=sr)
        sr_next = obs.next_rising(sun, start=ss)
    except ephem.CircumpolarError:
        return None, None

    # Compute bodies at sunrise
    obs.date = sr
    sun.compute(obs)
    moon.compute(obs)

    jd = float(ephem.julian_date(sr))

    # Ecliptic longitudes (tropical)
    ecl_sun  = ephem.Ecliptic(sun,  epoch=sr)
    ecl_moon = ephem.Ecliptic(moon, epoch=sr)
    sun_trop  = math.degrees(float(ecl_sun.lon))  % 360.0
    moon_trop = math.degrees(float(ecl_moon.lon)) % 360.0

    # Sidereal (subtract Lahiri ayanamsha)
    ayanamsha = lahiri_ayanamsha(jd)
    sun_sid  = (sun_trop  - ayanamsha) % 360.0
    moon_sid = (moon_trop - ayanamsha) % 360.0

    # Tithi (Moon - Sun tropical, every 12° = one tithi)
    lon_diff = (moon_trop - sun_trop) % 360.0
    tithi_abs = int(lon_diff / 12) + 1   # 1–30
    if tithi_abs <= 15:
        paksha   = 'Shukla'
        tithi_en = SHUKLA_TITHIS[tithi_abs - 1]
        tithi_num = tithi_abs
    else:
        paksha   = 'Krishna'
        tithi_en = KRISHNA_TITHIS[tithi_abs - 16]
        tithi_num = tithi_abs - 15

    # Nakshatra (Moon sidereal, 27 segments)
    nakshatra_en = NAKSHATRAS[int(moon_sid * 27 / 360) % 27]

    # Yoga (Sun + Moon sidereal, same 27 segments)
    yoga_lon = (sun_sid + moon_sid) % 360.0
    yoga_en  = YOGAS[int(yoga_lon * 27 / 360) % 27]

    # Karana
    karana_en = karana_name(lon_diff)

    # Lunar month (Sun sidereal rashi)
    lunar_month_en = lunar_month(sun_sid)

    # Sunrise / sunset in IST
    def ephem_to_ist(ep_date):
        return ephem.Date(ep_date).datetime() + IST

    sr_ist      = ephem_to_ist(sr)
    ss_ist      = ephem_to_ist(ss)
    sr_next_ist = ephem_to_ist(sr_next)

    weekday_sun0 = (d.weekday() + 1) % 7   # Python Mon=0 → Sun=0

    def window(part_table, sr_ist_, day_sec):
        part_sec = day_sec / 8
        start = sr_ist_ + timedelta(seconds=(part_table[weekday_sun0] - 1) * part_sec)
        end   = start + timedelta(seconds=part_sec)
        return f"{start.strftime('%H:%M')} – {end.strftime('%H:%M')}"

    day_sec = (ss_ist - sr_ist).total_seconds()
    night_sec = (sr_next_ist - ss_ist).total_seconds()

    rahu_kalam     = window(RAHU_PART, sr_ist, day_sec)
    yamaganda_kalam = window(YAMAGANDA_PART, sr_ist, day_sec)
    gulika_kalam    = window(GULIKA_PART, sr_ist, day_sec)

    day_start_idx = CHOGHADIYA_DAY_START[weekday_sun0]
    night_start_idx = (day_start_idx - 2) % 7

    choghadiya_day   = choghadiya_slots(day_start_idx, 1, sr_ist, day_sec / 8)
    choghadiya_night = choghadiya_slots(night_start_idx, -2, ss_ist, night_sec / 8)

    row = {
        'date':           d.strftime('%Y-%m-%d'),
        'tithi_en':       tithi_en,
        'tithi_number':   tithi_num,
        'paksha':         paksha,
        'nakshatra_en':   nakshatra_en,
        'yoga_en':        yoga_en,
        'karana_en':      karana_en,
        'lunar_month_en': lunar_month_en,
        'sunrise':        sr_ist.strftime('%H:%M'),
        'sunset':         ss_ist.strftime('%H:%M'),
        'rahu_kalam':     rahu_kalam,
        'gulika_kalam':   gulika_kalam,
        'yamaganda_kalam': yamaganda_kalam,
        'choghadiya_day':   choghadiya_day,
        'choghadiya_night': choghadiya_night,
        'special_event_en': '',
        'special_event_te': '',
        'special_event_ta': '',
        'special_event_hi': '',
    }
    return row, sr_ist

# ─── CLI entry point ──────────────────────────────────────────────────────────

def main():
    if len(sys.argv) >= 2:
        start = date.fromisoformat(sys.argv[1])
    else:
        start = date.today()

    days = int(sys.argv[2]) if len(sys.argv) >= 3 else 90

    results = []
    for i in range(days + 1):
        d = start + timedelta(days=i)
        row, _ = compute_day(d, None)
        if row:
            results.append(row)
        if (i + 1) % 10 == 0:
            print(f"  {i+1}/{days+1} days computed...", flush=True)

    out = Path(__file__).parent.parent / 'research' / 'panchangam-computed.json'
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(results, indent=2, ensure_ascii=False))

    print(f"\n✓ {len(results)} days written to {out}")
    print(f"  Location: {CITY} ({OBS_LAT}N, {OBS_LON}E, IST)")
    print(f"  Range:    {results[0]['date']} → {results[-1]['date']}")
    print(f"\nSample (first day):")
    r = results[0]
    print(f"  {r['date']}: {r['paksha']} {r['tithi_en']} · {r['nakshatra_en']} · {r['lunar_month_en']}")
    print(f"  Sunrise {r['sunrise']}  Sunset {r['sunset']}  Rahu {r['rahu_kalam']}")
    print(f"  Gulika {r['gulika_kalam']}  Yamaganda {r['yamaganda_kalam']}")
    print(f"  Choghadiya (day):   {r['choghadiya_day']}")
    print(f"  Choghadiya (night): {r['choghadiya_night']}")

if __name__ == '__main__':
    main()
