// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Question Normalizer
// Sanitizes and prepares user query strings without altering semantic meaning
// ====================================================================

export function normalizeQuestion(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}
