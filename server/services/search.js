const fillerPhrases = [
  /\bbesoin\b/giu,
  /(?:^|\s)(?:à|a)\s+la\s+maison\b/giu,
  /(?:^|\s)(?:à|a)\s+domicile\b/giu,
  /\bde\s+garde\b/giu,
  /\bouverte?\b/giu,
  /\bouverts?\b/giu,
  /\bvers\b/giu
];

const stopWords = new Set([
  "a", "au", "aux", "avec", "ce", "ces", "chez", "dans", "de", "des", "du",
  "en", "et", "la", "le", "les", "ma", "mon", "ou", "pour", "proche", "un",
  "une"
]);

export function getSearchTerms(value) {
  const cleaned = fillerPhrases.reduce((text, phrase) => text.replace(phrase, " "), value.toLocaleLowerCase("fr"));
  const words = cleaned.match(/[\p{L}\p{N}]+/gu) || [];
  return [...new Set(words.filter((word) => word.length > 1 && !stopWords.has(word)))].slice(0, 12);
}
