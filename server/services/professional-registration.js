import { isValidGeoPoint } from "./geolocation.js";

const textFieldLimits = {
  name: 80,
  trade: 60,
  city: 80,
  description: 1000,
  phone: 30
};

export function validateProfessionalRegistration(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { error: "Les informations du formulaire sont invalides." };
  }

  for (const [field, maxLength] of Object.entries(textFieldLimits)) {
    const value = input[field];
    if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
      return { error: "Renseignez tous les champs du formulaire avec des valeurs valides." };
    }
  }

  if (!Number.isInteger(input.experience) || input.experience < 0 || input.experience > 80) {
    return { error: "L'expérience doit être un nombre entier entre 0 et 80." };
  }

  if (!isValidGeoPoint(input.location)) {
    return { error: "Localisez votre position avant de créer votre profil." };
  }

  return {
    data: {
      name: input.name.trim(),
      trade: input.trade.trim(),
      city: input.city.trim(),
      description: input.description.trim(),
      phone: input.phone.trim(),
      experience: input.experience,
      location: {
        type: "Point",
        coordinates: [...input.location.coordinates]
      }
    }
  };
}
