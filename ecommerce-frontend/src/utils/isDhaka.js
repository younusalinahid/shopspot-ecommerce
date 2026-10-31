/** Same check as the backend: city or district mentions Dhaka (English or Bangla). */
export const isDhaka = (...values) => values.some(v => /dhaka|\u09A2\u09BE\u0995\u09BE/i.test(v || ''));
