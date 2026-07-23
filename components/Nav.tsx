'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useLang, SITE_NAMES, LANGUAGE_LABELS, LANGUAGES } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import type { Theme } from '@/context/ThemeContext';
import SearchBar from '@/components/SearchBar';
import { useDismissable } from '@/hooks/useDismissable';
import { UI } from '@/lib/ui-strings';

import type { Language } from '@/lib/types';

type NavLink = { href: string; key: keyof typeof UI['en'] };

const NAV_LINKS: NavLink[] = [
  { href: '/gods',           key: 'gods' },
  { href: '/festivals',      key: 'festivals' },
  { href: '/vrathams',       key: 'vrathams' },
  { href: '/pujas',          key: 'pujas' },
  { href: '/shlokas',        key: 'shlokas' },
  { href: '/bhagavad-gita',  key: 'bhagavadGita' },
  { href: '/panchangam',     key: 'panchangam' },
  { href: '/upcoming',       key: 'upcoming' },
];

export default function Nav() {
  const { lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Dismiss each popover on outside-click / Escape.
  const searchRef = useDismissable<HTMLDivElement>(searchOpen, () => setSearchOpen(false));
  const langRef = useDismissable<HTMLDivElement>(langOpen, () => setLangOpen(false));
  useDismissable<HTMLDivElement>(mobileOpen, () => setMobileOpen(false), { escapeOnly: true });

  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);

  // Move focus into the drawer when it opens, and back to the toggle when it closes.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (mobileOpen) {
      mobileNavRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    } else {
      hamburgerRef.current?.focus();
    }
  }, [mobileOpen]);

  function linkLabel(link: NavLink) {
    return UI[lang][link.key] as string;
  }

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        height: '64px',
        background: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center',
      }}>
        <div className="wide-width" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '32px' }}>

          {/* Site name + tagline — always visible */}
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1018 856" width="34" height="29" aria-hidden="true">
              <g transform="translate(0,856) scale(0.1,-0.1)" style={{ fill: 'var(--color-gold)' }} stroke="none">
                <path d="M5075 5753 c-50 -100 -205 -339 -408 -628 -108 -154 -229 -334 -268 -400 -223 -369 -354 -696 -404 -1005 -25 -153 -23 -422 4 -557 50 -251 146 -451 313 -650 63 -75 74 -83 105 -83 91 0 397 -57 433 -81 12 -7 7 -17 -28 -50 -38 -36 -48 -40 -75 -35 -413 87 -876 63 -1132 -58 -126 -59 -160 -105 -114 -154 71 -77 251 -137 484 -162 78 -8 132 -7 245 5 152 15 179 21 300 62 161 54 301 144 414 264 72 76 146 177 146 198 0 6 9 11 20 11 11 0 20 -5 20 -11 0 -20 72 -120 141 -193 183 -196 392 -293 716 -332 117 -14 154 -15 253 -5 219 23 344 60 448 131 87 59 77 107 -34 167 -174 95 -451 141 -764 130 -131 -5 -224 -17 -420 -54 -19 -3 -34 5 -65 36 -24 26 -35 44 -30 50 18 17 167 48 319 67 l148 18 59 65 c155 168 274 410 326 661 25 119 25 447 0 575 -87 450 -266 819 -677 1400 -217 307 -345 502 -410 628 -14 26 -27 47 -30 47 -3 0 -19 -26 -35 -57z m-14 -1111 c304 -337 518 -771 574 -1165 18 -128 19 -218 1 -327 -41 -251 -147 -416 -374 -583 -27 -21 -22 4 12 60 109 179 125 376 43 541 -13 26 -45 87 -71 135 -63 116 -77 162 -85 282 l-6 100 -96 -145 c-143 -215 -195 -331 -219 -489 -20 -124 17 -284 95 -410 25 -41 43 -76 40 -79 -3 -3 -40 21 -82 54 -231 177 -348 444 -313 714 22 169 87 325 243 585 94 157 155 286 183 390 20 74 26 236 12 328 -4 26 -4 47 1 47 4 0 23 -17 42 -38z"/>
                <path d="M3838 5272 c-25 -64 -61 -151 -78 -192 -42 -100 -79 -217 -82 -259 -3 -31 2 -38 57 -80 86 -65 245 -222 291 -285 21 -30 44 -55 49 -55 6 -1 28 34 49 77 56 109 161 295 213 376 32 50 43 75 39 92 -9 34 -117 164 -199 240 -62 57 -269 204 -286 204 -3 0 -27 -53 -53 -118z"/>
                <path d="M6245 5333 c-87 -53 -171 -118 -226 -174 -50 -50 -145 -167 -163 -201 l-18 -34 58 -89 c56 -88 180 -309 219 -392 23 -50 36 -53 61 -15 32 49 237 253 307 304 l68 51 -6 41 c-11 67 -54 192 -121 349 -34 81 -65 161 -69 177 -4 16 -10 32 -14 34 -4 3 -47 -20 -96 -51z"/>
                <path d="M2850 5022 c0 -5 9 -21 20 -34 96 -123 199 -371 243 -588 14 -68 23 -129 58 -400 26 -199 55 -344 92 -468 l24 -83 154 -157 c85 -86 180 -188 211 -227 98 -123 205 -293 278 -443 39 -81 77 -158 83 -171 11 -23 16 -24 102 -22 50 1 94 6 98 10 4 5 -11 31 -35 59 -104 122 -221 353 -267 524 -68 253 -70 581 -6 870 17 75 78 267 100 315 8 17 15 38 15 46 0 24 -116 172 -199 254 -94 93 -211 185 -321 254 -161 100 -429 216 -571 248 -25 6 -53 13 -62 17 -9 3 -17 2 -17 -4z"/>
                <path d="M7340 5020 c-14 -4 -52 -16 -85 -25 -188 -53 -352 -127 -537 -242 -179 -111 -366 -280 -465 -421 -44 -63 -50 -77 -43 -100 5 -15 25 -76 45 -137 139 -416 147 -812 25 -1175 -44 -131 -190 -391 -250 -445 -39 -35 -26 -43 73 -47 50 -2 97 0 103 5 6 4 22 35 34 70 52 143 177 357 317 539 43 56 146 170 229 253 l150 150 27 85 c43 140 71 290 102 560 26 226 39 308 69 422 39 150 113 318 190 432 26 38 45 72 44 76 -2 4 -14 4 -28 0z"/>
                <path d="M7402 4868 c-22 -28 -94 -183 -116 -252 -54 -164 -77 -285 -116 -606 -18 -151 -40 -290 -56 -356 -23 -99 -24 -99 70 -43 46 27 89 49 95 49 12 0 13 -36 3 -92 -6 -33 -16 -43 -97 -96 -119 -78 -257 -195 -385 -328 -131 -136 -216 -245 -311 -399 -79 -126 -173 -321 -163 -336 3 -5 14 -9 24 -9 11 0 74 -14 140 -31 l121 -32 52 36 c63 43 274 257 343 347 228 298 367 629 415 990 17 123 16 449 -1 719 -7 125 -10 264 -6 333 4 65 5 118 3 118 -3 0 -9 -6 -15 -12z"/>
                <path d="M2804 4648 c0 -123 -4 -349 -9 -503 -8 -298 -2 -402 36 -579 72 -338 196 -603 407 -864 108 -135 164 -194 261 -276 102 -87 121 -98 143 -85 22 12 203 59 228 59 12 0 23 6 26 14 9 23 -111 257 -200 390 -194 291 -374 470 -694 693 -58 40 -60 42 -67 98 -3 31 -4 59 -1 62 8 9 56 -14 121 -57 32 -21 62 -37 66 -35 3 3 -1 40 -11 82 -10 43 -21 105 -24 138 -4 33 -11 85 -16 115 -5 30 -14 96 -20 145 -38 308 -59 409 -118 585 -27 81 -102 232 -118 237 -5 2 -9 -85 -10 -219z"/>
                <path d="M1517 3859 c-184 -11 -199 -17 -126 -54 127 -65 269 -176 409 -321 146 -152 185 -203 389 -509 376 -563 661 -839 1059 -1027 117 -55 138 -59 127 -25 -3 12 -9 65 -12 118 -6 112 3 138 72 196 25 20 45 42 45 48 0 6 -28 35 -63 63 -331 268 -609 739 -697 1182 -13 64 -30 122 -39 132 -22 22 -259 103 -406 138 -225 54 -484 74 -758 59z"/>
                <path d="M8315 3859 c-195 -13 -437 -66 -652 -142 -110 -39 -126 -49 -135 -82 -4 -16 -22 -88 -39 -160 -36 -153 -55 -212 -99 -320 -128 -307 -347 -610 -595 -821 l-59 -50 61 -60 c72 -70 81 -104 63 -219 -18 -108 -18 -110 5 -107 32 5 253 117 335 170 159 102 346 266 479 420 110 127 172 214 456 632 157 232 299 393 462 524 84 68 230 162 278 180 7 2 7 7 0 14 -5 6 -87 15 -182 21 -187 12 -212 12 -378 0z"/>
                <path d="M8853 3690 c-272 -166 -435 -341 -725 -775 -260 -388 -408 -568 -615 -746 -216 -186 -404 -297 -679 -399 -25 -9 -40 -27 -68 -82 -44 -86 -46 -101 -8 -94 15 3 47 8 72 11 244 34 524 128 745 252 205 114 336 214 501 384 192 198 333 414 474 724 172 377 282 603 342 697 16 26 28 52 26 57 -1 5 -31 -8 -65 -29z"/>
                <path d="M1310 3710 c0 -5 16 -34 35 -65 55 -86 125 -228 287 -585 152 -335 255 -510 406 -690 313 -374 698 -613 1166 -724 80 -20 200 -43 254 -50 53 -8 53 -2 3 89 l-39 70 -124 50 c-292 119 -567 313 -786 555 -131 145 -211 251 -375 494 -277 414 -405 566 -602 721 -71 55 -207 145 -220 145 -3 0 -5 -4 -5 -10z"/>
                <path d="M5077 2198 c-90 -116 -246 -241 -372 -297 -202 -91 -362 -124 -600 -124 -230 1 -388 29 -534 94 -35 16 -66 29 -68 29 -11 0 12 -67 47 -138 62 -127 120 -209 166 -235 23 -13 163 -46 237 -56 185 -26 408 2 592 72 84 33 220 110 306 173 84 63 121 99 236 232 l28 33 60 -77 c65 -84 211 -207 324 -274 232 -138 557 -201 806 -155 95 17 189 41 216 55 46 25 111 129 189 304 26 58 17 75 -28 52 -39 -20 -125 -52 -180 -66 -174 -45 -488 -55 -657 -20 -273 56 -483 166 -648 340 -47 49 -88 90 -90 90 -3 0 -16 -15 -30 -32z"/>
                <path d="M2085 1990 c-134 -34 -235 -73 -380 -148 -100 -52 -275 -167 -275 -181 0 -3 39 -22 88 -41 48 -19 218 -101 378 -182 427 -216 565 -269 834 -318 158 -30 158 -30 215 38 107 124 233 225 362 288 40 19 73 39 73 43 0 4 -44 15 -97 25 -354 65 -716 229 -1003 455 -36 28 -69 51 -75 50 -5 0 -59 -13 -120 -29z"/>
                <path d="M7957 1976 c-167 -136 -432 -282 -672 -370 -74 -27 -297 -86 -327 -86 -32 0 -118 -22 -118 -30 0 -4 42 -28 93 -54 114 -57 247 -163 329 -263 l63 -76 72 7 c40 3 92 10 116 15 302 69 382 100 757 288 291 145 454 223 470 223 16 0 60 23 60 31 0 17 -200 146 -317 205 -138 69 -271 116 -390 139 -43 8 -79 15 -80 15 -1 0 -26 -20 -56 -44z"/>
                <path d="M5055 1749 c-111 -114 -232 -199 -390 -273 -248 -117 -544 -154 -797 -100 -46 10 -33 -12 45 -74 178 -141 336 -226 547 -295 406 -133 905 -133 1310 0 41 13 89 30 105 37 17 7 46 19 65 26 130 51 470 283 447 306 -3 3 -53 -2 -111 -10 -134 -20 -201 -20 -335 0 -282 41 -548 169 -747 359 -44 41 -81 75 -84 75 -3 0 -28 -23 -55 -51z"/>
                <path d="M3523 1420 c-269 -92 -492 -281 -612 -520 -65 -129 -135 -339 -119 -355 3 -3 32 -1 64 5 33 6 236 14 453 19 378 9 445 14 611 48 127 25 210 53 350 116 58 27 203 118 214 135 3 5 -7 14 -22 20 -270 98 -341 132 -487 228 -101 66 -248 195 -304 265 -23 30 -48 57 -54 60 -7 4 -49 -6 -94 -21z"/>
                <path d="M6500 1331 c-157 -161 -274 -244 -475 -340 -49 -23 -97 -46 -105 -50 -8 -4 -54 -20 -103 -35 -48 -15 -85 -32 -82 -36 12 -19 162 -113 239 -150 82 -39 199 -79 291 -99 167 -37 232 -42 625 -51 223 -5 423 -14 445 -19 22 -5 55 -12 74 -17 l34 -7 -7 39 c-14 78 -66 222 -117 327 -69 141 -176 272 -300 365 -73 54 -229 136 -309 160 -36 11 -72 23 -80 25 -10 4 -56 -36 -130 -112z"/>
                <path d="m 8778.6063,4178.8766 c -8,-5 -51,-11 -95,-15 -867,-71 -947,-76 -962,-65 -28,24 -1,37 85,42 48,2 233,12 412,21 179,9 339,18 355,20 67,7 219,5 205,-3 z"/>
                <path d="m 2013.6063,4161.8766 c 461,-25 459,-25 463,-51 4,-27 2,-27 -169,-13 -64,5 -172,14 -240,19 -118,10 -360,31 -572,49 -53,5 -101,13 -105,17 -8,9 221,2 623,-21 z"/>
                <path d="m 2228.6063,4507.8766 c 230,-36 278,-49 264,-71 -3,-5 -22,-7 -42,-3 -103,17 -396,74 -400,78 -9,10 9,24 26,20 9,-2 78,-13 152,-24 z"/>
                <path d="m 8645.6063,5080.8766 c -19,-19 -864,-296 -881,-290 -14,5 -14,10 -4,26 6,11 21,22 32,24 12,3 136,40 276,82 140,42 264,79 275,82 51,13 222,65 240,73 24,10 71,13 62,3 z"/>
                <path d="m 1768.6063,5030.8766 c 102,-30 205,-61 230,-68 25,-8 83,-25 130,-39 47,-13 123,-36 170,-51 47,-15 94,-29 105,-32 30,-9 45,-23 45,-45 0,-12 -5,-18 -12,-16 -7,3 -206,69 -443,147 -236,79 -436,149 -444,156 -18,18 -18,18 219,-52 z"/>
                <path d="m 7488.6063,5898.8766 c 0,-16 -198,-178 -517,-424 -145,-112 -173,-129 -173,-108 0,19 659,541 682,541 5,0 8,-4 8,-9 z"/>
                <path d="m 2821.6063,5838.8766 c 56,-44 265,-211 480,-383 53,-44 97,-83 97,-88 0,-15 -23,-11 -46,8 -12,9 -122,96 -245,191 -264,206 -399,321 -399,340 0,16 25,1 113,-68 z"/>
                <path d="m 2415.6063,5658.8766 c 121.804,-71.8668 234.811,-138.8468 335.721,-198.9666 281.012,-167.4203 468.205,-281.6388 490.279,-300.0334 15,-14 16,-18 3,-30 -13,-13 -20,-11 -58,10 -220,126 -1153,711 -1228,771 -65,51 46,-10 457,-252 z"/>
                <path d="m 8258.6063,5928.8766 c 0,-25 -1257,-811 -1297,-811 -19,0 -22,28 -5,42 18,15 209,133 427,263 72,42 155,92 185,110 30,18 73,43 95,55 22,12 99,57 170,100 205,122 420,248 423,249 1,1 2,-3 2,-8 z"/>
                <path d="m 6928.6063,6434.8766 c 0,-7 -28,-51 -62,-98 -79,-107 -169,-229 -185,-249 -31,-37 -208,-268 -235,-307 -32,-44 -48,-54 -48,-30 0,13 220,317 348,482 34,44 65,85 69,90 56,74 100,124 111,125 1,0 2,-6 2,-13 z"/>
                <path d="m 3302.6063,6420.8766 c 135,-161 496,-647 496,-668 0,-25 -14,-17 -45,28 -16,23 -84,112 -150,197 -141,180 -292,382 -317,423 -32,50 -21,64 16,20 z"/>
                <path d="m 7637.6063,6600.8766 c -87,-100 -476,-509 -710,-748 -108,-110 -218,-224 -246,-252 -54,-57 -83,-68 -83,-31 0,16 144,166 520,540 286,285 525,518 531,518 7,0 2,-12 -12,-27 z"/>
                <path d="m 3079.6063,6109.8766 c 339,-337 530,-533 527,-543 -2,-7 -11,-15 -19,-17 -19,-4 -355,336 -835,843 -224,237 -230,245 -216,245 6,0 251,-238 543,-528 z"/>
                <path d="m 4031.6063,6666.8766 c 91,-205 269,-651 262,-657 -3,-3 -10,-1 -15,4 -17,17 -269,614 -316,746.9999 -42,122 -2,68 69,-93.9999 z"/>
                <path d="m 6258.6063,6826.8765 c 0,-10 -133,-351.9999 -165,-423.9999 -7,-16 -46,-106 -85,-200 -67,-160 -100,-221 -100,-185 0,20 135,366 225,575 43,99 84,194.9999 91,212.9999 14,31 34,44 34,21 z"/>
                <path d="m 5498.6063,6995.8765 c 0,-49 -35,-324.9999 -69,-557.9999 -17,-113 -31,-221 -31,-241 0,-20 -6,-42 -14,-48 -20,-17 -25,4 -16,69 4,30 13,105 20,165 18,166 79,610.9999 86,628.9999 10,27 24,18 24,-16 z"/>
                <path d="m 4719.6063,7010.8765 c 5,-14 18,-90 29,-167 11,-78 24,-169.9999 30,-205.9999 5,-36 14,-108 20,-160 6,-52 17,-144 25,-205 18,-134 18,-125 1,-125 -10,0 -16,19 -21,68 -3,37 -10,87 -15,112 -14,65 -48,300 -70,479.9999 -26,207 -26,273 1,203 z"/>
                <path d="m 6875.6063,7115.8765 c -18,-35 -53,-99 -77,-143 -24,-44 -63,-115 -87,-157 -23,-43 -43,-78.9999 -43,-81.9999 0,-3 -93,-172 -150,-271 -13,-22 -40,-69 -60,-105 -20,-36 -49,-87 -65,-115 -16,-27 -66,-117 -112,-200 -47,-82 -90,-155 -96,-162 -18,-19 -41,0 -34,28 6,24 107,204 281,498 53,90 96,165 96,166 0,4 275,462.9999 325,542.9999 26,41 49,71 52,69 3,-3 -11,-34 -30,-69 z"/>
                <path d="m 3475.6063,6902.8765 c 278,-460.9999 573,-978.9999 573,-1004.9999 0,-12 -7,-20 -18,-20 -12,0 -44,48 -106,158 -49,86 -124,218 -166,292 -94,165 -127,223 -155,275 -12,22 -45,81 -73,131 -29,50.9999 -52,93.9999 -52,95.9999 0,3 -22,43 -48,89 -83,144 -142,257 -142,271 0,15 58,-73 187,-287 z"/>
                <path d="m 4193.6063,7471.8765 c 15,-54 53,-183 83,-284 42,-140 242,-860.9999 267,-961.9999 28,-114 29,-143 5,-143 -21,0 -60,135 -210,729.9999 -45,176 -101,398 -126,494 -40,159 -53,234 -38,219 3,-3 11,-28 19,-54 z"/>
                <path d="m 5998.6063,7361.8765 c -50,-206 -167,-673.9999 -215,-858.9999 -116,-443 -115,-439 -143,-411 -12,12 -13,22 -3,58 6,24 33,126 60,228 27,102 70,259 96,350 25,90.9999 57,202.9999 69,249.9999 13,47 54,193 92,325 72,251 99,287 44,59 z"/>
                <path d="m 5122.6063,6852.8765 c 4,-424.9999 3,-684.9999 -2,-693.9999 -6,-8 -17,-11 -26,-8 -19,8 -18,-50 -17,701.9999 1,578 6,773 19,805 13,35 20,-163 26,-805 z"/>
                <circle cx="6968.9692" cy="-7282.9097" transform="scale(1,-1)" r="30"/>
                <circle cx="6301.6777" cy="-6948.4971" transform="scale(1,-1)" r="30"/>
                <circle cx="6056.6812" cy="-7633.4082" transform="scale(1,-1)" r="30"/>
                <circle cx="5498.7393" cy="-7128.9966" transform="scale(1,-1)" r="30"/>
                <circle cx="5098.0698" cy="-7772.9805" transform="scale(1,-1)" r="30"/>
                <circle cx="4685.5698" cy="-7139.3481" transform="scale(1,-1)" r="30"/>
                <circle cx="4132.0762" cy="-7630.9336" transform="scale(1,-1)" r="30"/>
                <circle cx="3906.8518" cy="-6924.3232" transform="scale(1,-1)" r="30"/>
                <circle cx="3228.2444" cy="-7292.8916" transform="scale(1,-1)" r="30"/>
                <circle cx="3202.4536" cy="-6531.1821" transform="scale(1,-1)" r="30"/>
                <circle cx="2451.5671" cy="-6720.7939" transform="scale(1,-1)" r="30"/>
                <circle cx="2631.2749" cy="-5974.3359" transform="scale(1,-1)" r="30"/>
                <circle cx="1843.4937" cy="-5989.2808" transform="scale(1,-1)" r="30"/>
                <circle cx="1425.6444" cy="-5120.9551" transform="scale(1,-1)" r="30"/>
                <circle cx="1924.4773" cy="-4540.1533" transform="scale(1,-1)" r="30"/>
                <circle cx="1290.4049" cy="-4185.2251" transform="scale(1,-1)" r="30"/>
                <circle cx="7003.6064" cy="-6537.8765" transform="scale(1,-1)" r="30"/>
                <circle cx="7742.7476" cy="-6702.8765" transform="scale(1,-1)" r="30"/>
                <circle cx="7578.6064" cy="-5982.8765" transform="scale(1,-1)" r="30"/>
                <circle cx="8393.6064" cy="-6012.0308" transform="scale(1,-1)" r="30"/>
                <circle cx="8776.6484" cy="-5126.7939" transform="scale(1,-1)" r="30"/>
                <circle cx="8910.3848" cy="-4195.3154" transform="scale(1,-1)" r="30"/>
              </g>
            </svg>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 600,
              color: 'var(--color-gold)',
              lineHeight: 1.1,
            }}>
              {SITE_NAMES[lang]}
            </span>
          </Link>

          {/* Desktop nav links — CSS hides this on mobile */}
          <nav className="nav-desktop" style={{ gap: '24px', flex: 1 }}>
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} style={{
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
                onMouseOver={e => (e.currentTarget.style.color = 'var(--color-gold)')}
                onMouseOut={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
              >
                {linkLabel(link)}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>

            {/* Search — always visible */}
            <div ref={searchRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setSearchOpen(o => !o)}
                aria-label={UI[lang].navSearchLabel}
                aria-expanded={searchOpen}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '36px', height: '36px',
                  color: searchOpen ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  flexShrink: 0,
                }}
                onMouseOver={e => (e.currentTarget.style.color = 'var(--color-gold)')}
                onMouseOut={e => (e.currentTarget.style.color = searchOpen ? 'var(--color-gold)' : 'var(--color-text-secondary)')}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="7.5" cy="7.5" r="5" />
                  <line x1="11.5" y1="11.5" x2="16" y2="16" />
                </svg>
              </button>

              {searchOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: 'min(420px, calc(100vw - 32px))',
                  zIndex: 100,
                }}>
                  <SearchBar autoFocus onSelect={() => setSearchOpen(false)} />
                </div>
              )}
            </div>

            {/* Language switcher — CSS hides this on mobile */}
            <div ref={langRef} className="nav-desktop" style={{ position: 'relative' }}>
              <button
                onClick={() => setLangOpen(o => !o)}
                aria-label={UI[lang].navSwitchLanguage}
                aria-expanded={langOpen}
                aria-haspopup="true"
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  background: 'none',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {LANGUAGE_LABELS[lang]}
              </button>

              {langOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  minWidth: '180px',
                  zIndex: 100,
                }}>
                  {LANGUAGES.map(l => (
                    <button
                      key={l}
                      onClick={() => { setLang(l as Language); setLangOpen(false); }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '10px 16px',
                        fontSize: '13px',
                        color: l === lang ? 'var(--color-gold)' : 'var(--color-text-primary)',
                        background: l === lang ? 'rgba(184,134,11,0.08)' : 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: l === lang ? 500 : 400,
                      }}
                    >
                      {LANGUAGE_LABELS[l]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle — CSS hides this on mobile */}
            <div className="nav-desktop" role="group" aria-label={UI[lang].themeLabel} style={{ gap: '2px', display: 'flex' }}>
              {(['light', 'dark', 'system'] as Theme[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  aria-pressed={theme === t}
                  aria-label={t === 'light' ? UI[lang].themeLight : t === 'dark' ? UI[lang].themeDark : UI[lang].themeSystem}
                  title={t === 'light' ? UI[lang].themeLight : t === 'dark' ? UI[lang].themeDark : UI[lang].themeSystem}
                  style={{
                    fontSize: '14px',
                    padding: '5px 8px',
                    background: theme === t ? 'var(--color-gold)' : 'none',
                    color: theme === t ? '#fff' : 'var(--color-text-secondary)',
                    border: `1px solid ${theme === t ? 'var(--color-gold)' : 'var(--color-border)'}`,
                    borderRadius: t === 'light' ? '6px 0 0 6px' : t === 'system' ? '0 6px 6px 0' : '0',
                    cursor: 'pointer',
                    lineHeight: 1,
                  }}
                >
                  {t === 'light' ? '☀' : t === 'dark' ? '☾' : '⊙'}
                </button>
              ))}
            </div>

            {/* Hamburger — CSS hides this on desktop */}
            <button
              ref={hamburgerRef}
              onClick={() => setMobileOpen(o => !o)}
              className="nav-hamburger"
              aria-label={mobileOpen ? UI[lang].navCloseMenu : UI[lang].navOpenMenu}
              aria-expanded={mobileOpen}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-primary)', fontSize: '22px',
                padding: '4px', lineHeight: 1,
                width: '36px', height: '36px',
                alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.3)' }}
          onClick={() => setMobileOpen(false)}
        >
          <nav
            ref={mobileNavRef}
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', top: '64px', left: 0, right: 0,
              background: 'var(--color-bg)',
              borderBottom: '1px solid var(--color-border)',
              padding: '8px 24px 24px',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontSize: '16px',
                  color: 'var(--color-text-primary)',
                  textDecoration: 'none',
                  padding: '14px 0',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                {linkLabel(link)}
              </Link>
            ))}

            {/* Language picker in drawer */}
            <div style={{ paddingTop: '20px' }}>
              <p style={{
                fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--color-text-secondary)',
                margin: '0 0 10px',
              }}>
                {UI[lang].navLanguageHeading}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {LANGUAGES.map(l => (
                  <button
                    key={l}
                    onClick={() => { setLang(l as Language); setMobileOpen(false); }}
                    style={{
                      padding: '7px 18px',
                      fontSize: '14px',
                      fontWeight: l === lang ? 600 : 400,
                      color: l === lang ? '#fff' : 'var(--color-text-secondary)',
                      background: l === lang ? 'var(--color-gold)' : 'transparent',
                      border: `1px solid ${l === lang ? 'var(--color-gold)' : 'var(--color-border)'}`,
                      borderRadius: '20px',
                      cursor: 'pointer',
                    }}
                  >
                    {LANGUAGE_LABELS[l]}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme picker in drawer */}
            <div style={{ paddingTop: '20px' }}>
              <p style={{
                fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--color-text-secondary)',
                margin: '0 0 10px',
              }}>
                {UI[lang].themeLabel}
              </p>
              <div role="group" aria-label={UI[lang].themeLabel} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(['light', 'dark', 'system'] as Theme[]).map(t => {
                  const label = t === 'light' ? UI[lang].themeLight : t === 'dark' ? UI[lang].themeDark : UI[lang].themeSystem;
                  return (
                    <button
                      key={t}
                      onClick={() => { setTheme(t); setMobileOpen(false); }}
                      aria-pressed={theme === t}
                      style={{
                        padding: '7px 18px',
                        fontSize: '14px',
                        fontWeight: theme === t ? 600 : 400,
                        color: theme === t ? '#fff' : 'var(--color-text-secondary)',
                        background: theme === t ? 'var(--color-gold)' : 'transparent',
                        border: `1px solid ${theme === t ? 'var(--color-gold)' : 'var(--color-border)'}`,
                        borderRadius: '20px',
                        cursor: 'pointer',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
