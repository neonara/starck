import axios from "axios";

export const geocodeAdresse = async (adresse) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(adresse)}&format=json`;
    const response = await axios.get(url, {
      headers: {
        "Accept-Language": "fr",
        "User-Agent": "your-app-name (your@email.com)" // requis par Nominatim
      }
    });
    const result = response.data;

    if (result.length > 0) {
      return {
        latitude: parseFloat(result[0].lat),
        longitude: parseFloat(result[0].lon)
      };
    }
    return null;
  } catch (err) {
    console.error("Erreur de géocodage :", err);
    return null;
  }
};
