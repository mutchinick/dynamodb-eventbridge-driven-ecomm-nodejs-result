/**
 *
 */
export function trimStringTo64(str: string): string {
  if (str.length <= 64) {
    return str
  }
  return str.slice(0, 64)
}
