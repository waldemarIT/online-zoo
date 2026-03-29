import { register, isLoggedIn } from '../../src/api/auth.js';
import { initTheme } from '../../src/theme/theme.js';
initTheme();

// Redirect if already logged in
if (isLoggedIn()) {
  window.location.href = '../landing/index.html';
}

const form = document.getElementById('registerForm') as HTMLFormElement;
const nameInput = document.getElementById('name') as HTMLInputElement;
const loginInput = document.getElementById('login') as HTMLInputElement;
const emailInput = document.getElementById('email') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const confirmInput = document.getElementById('confirmPassword') as HTMLInputElement;
const nameError = document.getElementById('nameError') as HTMLElement;
const loginError = document.getElementById('loginError') as HTMLElement;
const emailError = document.getElementById('emailError') as HTMLElement;
const passwordError = document.getElementById('passwordError') as HTMLElement;
const confirmPasswordError = document.getElementById('confirmPasswordError') as HTMLElement;
const authError = document.getElementById('authError') as HTMLElement;
const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;

// ── Validation rules ───────────────────────────────────────
const NAME_REGEX = /^[A-Za-z\s]{3,}$/;
const LOGIN_REGEX = /^[A-Za-z][A-Za-z0-9_]{2,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_SPECIAL = /[^A-Za-z0-9]/;         // at least 1 special char

function validateName(): boolean {
  const val = nameInput.value.trim();
  if (!val) {
    nameError.textContent = 'Name is required';
    nameInput.classList.add('invalid');
    return false;
  }
  if (!NAME_REGEX.test(val)) {
    nameError.textContent = 'Name must contain only English letters and spaces (min 3 characters)';
    nameInput.classList.add('invalid');
    return false;
  }
  nameError.textContent = '';
  nameInput.classList.remove('invalid');
  return true;
}

function validateLogin(): boolean {
  const val = loginInput.value.trim();
  if (!val) {
    loginError.textContent = 'Login is required';
    loginInput.classList.add('invalid');
    return false;
  }
  if (!LOGIN_REGEX.test(val)) {
    loginError.textContent = 'Login must start with a letter, contain only letters/digits/_, min 3 characters';
    loginInput.classList.add('invalid');
    return false;
  }
  loginError.textContent = '';
  loginInput.classList.remove('invalid');
  return true;
}

function validateEmail(): boolean {
  const val = emailInput.value.trim();
  if (!val) {
    emailError.textContent = 'Email is required';
    emailInput.classList.add('invalid');
    return false;
  }
  if (!EMAIL_REGEX.test(val)) {
    emailError.textContent = 'Enter a valid email address';
    emailInput.classList.add('invalid');
    return false;
  }
  emailError.textContent = '';
  emailInput.classList.remove('invalid');
  return true;
}

function validatePassword(): boolean {
  const val = passwordInput.value;
  if (!val) {
    passwordError.textContent = 'Password is required';
    passwordInput.classList.add('invalid');
    return false;
  }
  if (val.length < 6) {
    passwordError.textContent = 'Password must be at least 6 characters';
    passwordInput.classList.add('invalid');
    return false;
  }
  if (!PASSWORD_SPECIAL.test(val)) {
    passwordError.textContent = 'Password must contain at least 1 special character';
    passwordInput.classList.add('invalid');
    return false;
  }
  passwordError.textContent = '';
  passwordInput.classList.remove('invalid');
  return true;
}

function validateConfirm(): boolean {
  const val = confirmInput.value;
  if (!val) {
    confirmPasswordError.textContent = 'Please confirm your password';
    confirmInput.classList.add('invalid');
    return false;
  }
  if (val !== passwordInput.value) {
    confirmPasswordError.textContent = 'Passwords do not match';
    confirmInput.classList.add('invalid');
    return false;
  }
  confirmPasswordError.textContent = '';
  confirmInput.classList.remove('invalid');
  return true;
}

function checkFormValid(): void {
  const nameOk = NAME_REGEX.test(nameInput.value.trim());
  const loginOk = LOGIN_REGEX.test(loginInput.value.trim());
  const emailOk = EMAIL_REGEX.test(emailInput.value.trim());
  const passVal = passwordInput.value;
  const passOk = passVal.length >= 6 && PASSWORD_SPECIAL.test(passVal);
  const confirmOk = confirmInput.value === passwordInput.value && confirmInput.value.length > 0;
  submitBtn.disabled = !(nameOk && loginOk && emailOk && passOk && confirmOk);
}

// Initially disabled
submitBtn.disabled = true;

// ── Blur validation ────────────────────────────────────────
nameInput.addEventListener('blur', (): void => { validateName(); checkFormValid(); });
loginInput.addEventListener('blur', (): void => { validateLogin(); checkFormValid(); });
emailInput.addEventListener('blur', (): void => { validateEmail(); checkFormValid(); });
passwordInput.addEventListener('blur', (): void => { validatePassword(); checkFormValid(); });
confirmInput.addEventListener('blur', (): void => { validateConfirm(); checkFormValid(); });

// ── Focus: clear errors ────────────────────────────────────
nameInput.addEventListener('focus', (): void => { nameError.textContent = ''; nameInput.classList.remove('invalid'); });
loginInput.addEventListener('focus', (): void => { loginError.textContent = ''; loginInput.classList.remove('invalid'); });
emailInput.addEventListener('focus', (): void => { emailError.textContent = ''; emailInput.classList.remove('invalid'); });
passwordInput.addEventListener('focus', (): void => { passwordError.textContent = ''; passwordInput.classList.remove('invalid'); });
confirmInput.addEventListener('focus', (): void => { confirmPasswordError.textContent = ''; confirmInput.classList.remove('invalid'); });

// ── Input: check button state ──────────────────────────────
nameInput.addEventListener('input', checkFormValid);
loginInput.addEventListener('input', checkFormValid);
emailInput.addEventListener('input', checkFormValid);
passwordInput.addEventListener('input', checkFormValid);
confirmInput.addEventListener('input', checkFormValid);

// ── Submit ─────────────────────────────────────────────────
form.addEventListener('submit', async (e: Event): Promise<void> => {
  e.preventDefault();
  authError.textContent = '';
  authError.classList.remove('visible');

  const nameOk = validateName();
  const loginOk = validateLogin();
  const emailOk = validateEmail();
  const passOk = validatePassword();
  const confirmOk = validateConfirm();
  if (!nameOk || !loginOk || !emailOk || !passOk || !confirmOk) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account...';

  try {
    await register({
      name: nameInput.value.trim(),
      login: loginInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value,
    });
    window.location.href = '../landing/index.html';
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
    authError.textContent = message;
    authError.classList.add('visible');
    submitBtn.disabled = false;
    submitBtn.textContent = 'CREATE ACCOUNT';
    checkFormValid();
  }
});
