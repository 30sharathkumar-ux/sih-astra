/**
 * reverseGeocode.js
 *
 * Client-side reverse geocoding using the free BigDataCloud API.
 * No API key required. Keeps weather and location logically decoupled.
 *
 * BigDataCloud real response structure (as observed):
 *   localityName             – most specific locality (may be absent for city centres)
 *   locality                 – often same as city
 *   city                     – city name
 *   principalSubdivision     – state
 *   countryName
 *   postcode
 *   localityInfo.administrative[] – country/state/authority/district/city entries
 *   localityInfo.informative[]    – continent, timezone, river basins, constituencies
 *                                   (rarely useful for farmer display)
 *
 * Key observations:
 *   • For city-centre coordinates, localityName is often absent.
 *   • informative[] contains timezone ("Asia/Kolkata"), political entities, rivers —
 *     NOT neighbourhoods. Do NOT use informative[] for place names.
 *   • administrative[] entries with description="organization" are authorities.
 *   • administrative[] entries ending in " district" / " taluk" / " constituency"
 *     are administrative units, not human-readable localities.
 *   • The best area entry is one whose description is "district of …" and whose
 *     name is genuinely different from the city name.
 */

/** Terms that indicate an administrative body / organization, not a place. */
const AUTHORITY_SUBSTRINGS = [
  'authority',
  'corporation',
  'development',
  'metropolitan',
  'municipal',
  'board',
  'council',
  'commission',
  'trust',
  'zonal',
  'railway',
  'assembly constituency',
  'river basin',
  'subcontinent',
  'mainland',
];

/** Suffixes that make an admin name a unit rather than a usable locality. */
const ADMIN_UNIT_SUFFIXES = [
  ' urban district',
  ' rural district',
  ' north taluk',
  ' south taluk',
  ' east taluk',
  ' west taluk',
  ' taluk',
  ' tehsil',
  ' mandal',
  ' division',
  ' zone',
  ' ward',
  ' assembly constituency',
  ' parliamentary constituency',
];

/**
 * Returns true when the name is an administrative organisation or unit
 * that should not be shown as a farmer-facing place name.
 */
const isUnusableName = (name, description) => {
  if (!name) return true;
  const lower = name.toLowerCase();
  const desc  = (description || '').toLowerCase();

  // BigDataCloud marks authority bodies explicitly
  if (desc === 'organization') return true;
  if (desc === 'time zone')    return true;

  // Keyword check
  if (AUTHORITY_SUBSTRINGS.some((kw) => lower.includes(kw))) return true;

  // Suffix check
  if (ADMIN_UNIT_SUFFIXES.some((sfx) => lower.endsWith(sfx))) return true;

  // Postcode (numeric)
  if (/^\d+$/.test(name)) return true;

  // Very long names (full authority titles)
  if (name.length > 35) return true;

  return false;
};

/**
 * Build a clean, de-duplicated array of non-empty strings.
 */
const buildParts = (parts) => {
  const seen = new Set();
  return parts
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter((p) => {
      if (!p || seen.has(p.toLowerCase())) return false;
      seen.add(p.toLowerCase());
      return true;
    });
};

/**
 * Reverse geocode a lat/lon pair using BigDataCloud's free client API.
 *
 * Returns a normalized object:
 * {
 *   name:          "Roopen Agrahara"          – best specific place name found
 *   area:          "Bommanahalli"             – sub-city area (if distinct and clean)
 *   city:          "Bengaluru"
 *   state:         "Karnataka"
 *   country:       "India"
 *   postcode:      "560068"
 *   displayName:   "Roopen Agrahara"          – headline for farmer UI
 *   secondaryLine: "Bommanahalli, Bengaluru, Karnataka"
 *   displayString: same as displayName        – legacy compat field
 * }
 *
 * Returns null on failure. Never exposes raw coordinates or timezone strings.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<object|null>}
 */
export const getHumanReadableLocation = async (latitude, longitude) => {
  if (latitude == null || longitude == null) return null;

  try {
    const url =
      `https://api.bigdatacloud.net/data/reverse-geocode-client` +
      `?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;

    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 6000);
    const response   = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();

    // ── Top-level fields ─────────────────────────────────────────────────────
    const rawLocalityName = (data.localityName || '').trim();
    const rawLocality     = (data.locality || '').trim();
    const rawCity         = (data.city || '').trim();
    const rawState        = (data.principalSubdivision || '').trim();
    const rawCountry      = (data.countryName || '').trim();
    const rawPostcode     = (data.postcode || '').trim();

    // ── DIAGNOSTIC: log only place-name fields, NEVER coordinates ────────────
    // Remove or silence this block once the correct field is confirmed.
    console.group('[ReverseGeocode] BigDataCloud field dump');
    console.log('localityName:        ', rawLocalityName || '(empty)');
    console.log('locality:            ', rawLocality     || '(empty)');
    console.log('city:                ', rawCity         || '(empty)');
    console.log('principalSubdivision:', rawState        || '(empty)');
    console.log('countryName:         ', rawCountry      || '(empty)');
    console.log('postcode:            ', rawPostcode     || '(empty)');
    console.log('administrative levels:',
      (data.localityInfo?.administrative ?? []).map(
        (l) => `[lvl${l.adminLevel ?? '?'} ord${l.order ?? '?'}] ${l.name} (${l.description || 'no desc'})`
      )
    );
    console.log('informative entries: ',
      (data.localityInfo?.informative ?? []).map(
        (l) => `[ord${l.order ?? '?'}] ${l.name} (${l.description || 'no desc'})`
      )
    );
    console.groupEnd();
    // ── END DIAGNOSTIC ────────────────────────────────────────────────────────

    // ── Best locality name ────────────────────────────────────────────────────
    //
    // Priority: localityName → locality (only if different from city)
    // We intentionally do NOT use informative[] for names because BigDataCloud's
    // informative array contains timezones, river basins, constituencies, etc.
    // rather than actual neighbourhoods for Indian urban coordinates.

    let localityName = '';
    if (rawLocalityName && !isUnusableName(rawLocalityName, '')) {
      localityName = rawLocalityName;
    } else if (
      rawLocality &&
      rawLocality.toLowerCase() !== rawCity.toLowerCase() &&
      !isUnusableName(rawLocality, '')
    ) {
      localityName = rawLocality;
    }
    // If locality === city or is absent, localityName stays ''

    // ── Sub-city area from administrative levels ──────────────────────────────
    //
    // Walk administrative[] most-specific first (highest order number).
    // Sort descending by order so we get the most specific level first.
    // Accept the first entry that:
    //   • is not an unusable authority/unit name
    //   • is not the same as localityName, city, state, or country
    //   • is at adminLevel >= 6 (sub-city is typically 6–8)
    //   • has a description that indicates it's a real area ("area in", "locality", etc.)
    //     OR has no description at all but passes all other filters

    const adminLevels = [...(data.localityInfo?.administrative ?? [])]
      .sort((a, b) => (b.order || 0) - (a.order || 0)); // most-specific first

    let areaName = '';
    for (const lvl of adminLevels) {
      const n    = (lvl.name || '').trim();
      const desc = (lvl.description || '').toLowerCase();
      const lvlNum = lvl.adminLevel ?? 0;

      if (!n) continue;
      if (isUnusableName(n, lvl.description)) continue;
      if (lvlNum < 6) continue; // country/state level — skip
      if (n.toLowerCase() === (localityName || rawCity).toLowerCase()) continue;
      if (n.toLowerCase() === rawCity.toLowerCase())    continue;
      if (n.toLowerCase() === rawState.toLowerCase())   continue;
      if (n.toLowerCase() === rawCountry.toLowerCase()) continue;

      // Only accept entries that describe a real sub-city area
      const isArea =
        desc.includes('area') ||
        desc.includes('locality') ||
        desc.includes('neighbourhood') ||
        desc.includes('suburb') ||
        desc.includes('ward') ||
        desc.includes('village') ||
        desc === ''; // no description — pass through other filters

      if (!isArea) continue;

      areaName = n;
      break;
    }

    // ── Compose the result ────────────────────────────────────────────────────
    //
    // displayName  = most specific single name (locality or city)
    // secondaryLine = area + city + state, de-duplicated

    const name    = localityName || rawCity || rawState || rawCountry;
    const area    = areaName;
    const city    = rawCity !== (localityName || rawCity) ? rawCity
                    : (localityName ? rawCity : '');  // show city when locality differs
    const state   = rawState;
    const country = rawCountry;
    const postcode = rawPostcode;

    if (!name && !state && !country) return null;

    const displayName = name;

    // Secondary: area (if any) + city + state. Deduplicate against displayName.
    const secondaryParts = buildParts([area, rawCity, state])
      .filter((p) => p.toLowerCase() !== displayName.toLowerCase());
    const secondaryLine = secondaryParts.join(', ');

    return {
      name,
      area:          area     || undefined,
      city:          rawCity  || undefined,
      state:         state    || undefined,
      country:       country  || undefined,
      postcode:      postcode || undefined,
      displayName,
      secondaryLine: secondaryLine || undefined,
      // Legacy field — keeps existing Dashboard/WeatherCard code working
      displayString: displayName,
    };
  } catch {
    return null; // fail silently; weather must work independently
  }
};
