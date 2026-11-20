const accentGroups = {
  a: "aàáâãäå",
  c: "cç",
  e: "eèéêë",
  i: "iìíîï",
  n: "nñ",
  o: "oòóôõö",
  u: "uùúûü",
  y: "yýÿ"
};

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createAccentInsensitiveRegex(value, exact = false) {
  const normalized = value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  const pattern = Array.from(normalized, (character) => {
    const variants = accentGroups[character.toLowerCase()];
    return variants ? `[${variants}]` : escapeRegex(character);
  }).join("");
  return new RegExp(exact ? `^${pattern}$` : pattern, "i");
}
