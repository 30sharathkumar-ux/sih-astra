/**
 * reverseGeocode.js
 * 
 * Provides human-readable location resolution using the free BigDataCloud Client API.
 * Keeps weather data and location data logically decoupled.
 */

export const getHumanReadableLocation = async (latitude, longitude) => {
  if (latitude == null || longitude == null) return null;

  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    
    // Set a reasonable timeout so reverse geocoding doesn't hang indefinitely
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    
    // Extract the most relevant city/locality and state/subdivision
    const city = data.city || data.locality || data.principalSubdivision || "";
    const state = data.principalSubdivision || "";
    const country = data.countryName || "";

    if (!city && !state && !country) return null;

    return {
      name: city,
      state: state,
      country: country,
      // Helper string for the UI: e.g. "Bengaluru, Karnataka"
      displayString: city && state && city !== state 
        ? `${city}, ${state}` 
        : (city || state || country)
    };
  } catch (error) {
    // Fail silently so it doesn't break the weather flow
    return null;
  }
};
