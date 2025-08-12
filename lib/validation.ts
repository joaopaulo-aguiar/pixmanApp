/**
 * Utility functions for form validation
 */

/**
 * Masks a CPF string with the format XXX.XXX.XXX-XX
 */
export function maskCPF(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/**
 * Validates an email address using regex
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a Brazilian CPF using the official algorithm
 */
export function isCpfValid(cpf: string): boolean {
  // Remove non-numeric characters
  const sanitizedCpf = cpf.replace(/\D/g, '');

  // Check if it has 11 digits
  if (sanitizedCpf.length !== 11) {
    return false;
  }

  // Check if all digits are the same (invalid case)
  if (/^(\d)\1+$/.test(sanitizedCpf)) {
    return false;
  }

  // Validation of the first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(sanitizedCpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let digit1 = (remainder === 10 || remainder === 11) ? 0 : remainder;
  if (digit1 !== parseInt(sanitizedCpf.charAt(9))) {
    return false;
  }

  // Validation of the second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(sanitizedCpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  let digit2 = (remainder === 10 || remainder === 11) ? 0 : remainder;
  if (digit2 !== parseInt(sanitizedCpf.charAt(10))) {
    return false;
  }

  return true;
}

/**
 * Sanitizes CPF by removing non-numeric characters
 */
export function sanitizeCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/**
 * Validates if a string is not empty after trimming
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validates if a value is a valid number
 */
export function isValidNumber(value: string | number): boolean {
  return !isNaN(Number(value)) && isFinite(Number(value));
}
