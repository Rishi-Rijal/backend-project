const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return emailRegex.test(email);
}

export {isValidEmail}