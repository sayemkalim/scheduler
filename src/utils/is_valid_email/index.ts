const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
function isValidEmail(e: string) {
  return !!e && EMAIL_RE.test(e.trim());
}

export { isValidEmail };