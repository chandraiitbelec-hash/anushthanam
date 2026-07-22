#!/usr/bin/env python3
"""
Compute panchangam (Hindu almanac) for a date range using PyEphem.

Astronomical basis:
  - Sun/Moon positions via PyEphem (uses JPL/VSOP87 internally)
  - Lahiri (Chitrapaksha) ayanamsha for sidereal conversion
  - Location: New Delhi (IST reference; tithi/nakshatra/yoga/karana are
    pan-India constants; only sunrise/sunset/rahu kalam vary by location)

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

# Rahu Kalam: which 1/8 of the day (1-indexed), keyed by weekday Sun=0..Sat=6
RAHU_PART = [8, 2, 7, 5, 6, 4, 3]  # Sun Mon Tue Wed Thu Fri Sat

# ─── Core computation ─────────────────────────────────────────────────────────

def compute_day(d: date):
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
    except ephem.CircumpolarError:
        return None

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

    sr_ist = ephem_to_ist(sr)
    ss_ist = ephem_to_ist(ss)

    # Rahu Kalam
    day_sec  = (ss_ist - sr_ist).total_seconds()
    part_sec = day_sec / 8
    weekday_sun0 = (d.weekday() + 1) % 7   # Python Mon=0 → Sun=0
    rahu_start = sr_ist + timedelta(seconds=(RAHU_PART[weekday_sun0] - 1) * part_sec)
    rahu_end   = rahu_start + timedelta(seconds=part_sec)
    rahu_kalam = f"{rahu_start.strftime('%H:%M')} – {rahu_end.strftime('%H:%M')}"

    return {
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
        'special_event_en': '',
        'special_event_te': '',
        'special_event_ta': '',
        'special_event_hi': '',
    }

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
        row = compute_day(d)
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

if __name__ == '__main__':
    main()
