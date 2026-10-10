/** Turns a title like "Crème Brûlée!" into a URL-safe slug like "creme-brulee". */
export function slugify(text: string): string {
  return (
    text
      // Split letters from their accents ("é" becomes "e" + "´")...
      .normalize('NFKD')
      // ...then drop the accent marks.
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      // Any run of characters that aren't a-z or 0-9 becomes one dash.
      .replace(/[^a-z0-9]+/g, '-')
      // No dashes at the start or end.
      .replace(/^-|-$/g, '')
  )
}
