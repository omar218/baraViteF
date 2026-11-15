export function isValidGeoPoint(point) {
  if (
    !point ||
    typeof point !== "object" ||
    point.type !== "Point" ||
    !Array.isArray(point.coordinates) ||
    point.coordinates.length !== 2
  ) {
    return false;
  }

  const [longitude, latitude] = point.coordinates;
  return Number.isFinite(longitude) && longitude >= -180 && longitude <= 180 &&
    Number.isFinite(latitude) && latitude >= -90 && latitude <= 90;
}

export function parseGeoPoint(latitudeInput, longitudeInput) {
  if (latitudeInput === undefined && longitudeInput === undefined) {
    return { point: null };
  }

  if (
    typeof latitudeInput !== "string" ||
    typeof longitudeInput !== "string" ||
    !latitudeInput.trim() ||
    !longitudeInput.trim()
  ) {
    return { error: "Fournissez une latitude et une longitude valides." };
  }

  const latitude = Number(latitudeInput);
  const longitude = Number(longitudeInput);
  const point = { type: "Point", coordinates: [longitude, latitude] };

  return isValidGeoPoint(point)
    ? { point }
    : { error: "La latitude ou la longitude est hors limites." };
}
