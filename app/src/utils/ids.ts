/** Short random id for local records (no crypto needed: ids never leave the device). */
export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
