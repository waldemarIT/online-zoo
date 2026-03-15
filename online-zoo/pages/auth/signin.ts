import { signIn, isLoggedIn } from '../../src/api/auth.js';
import { initTheme } from '../../src/theme/theme.js';
initTheme();

// Redirect if already logged in
if (isLoggedIn()) {
  window.location.href = '../landing/index.html';
}

const form = document.getElementById('signinForm') as HTMLFormElement;
const loginInput = document.getElementById('login') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const loginError = document.getElementById('loginError') as HTMLElement;
const passwordError = document.getElementById('passwordError') as HTMLElement;
const authError = document.getElementById('authError') as HTMLElement;
const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;

// ── Validation rules ───────────────────────────────────────
const LOGIN_REGEX = /^([A-Za-z][A-Za-z0-9_]{2,}|[^\s@]+@[^\s@]+\.[^\s@]+)$/; // username or email
const PASSWORD_SPECIAL = /[^A-Za-z0-9]/;        // at least 1 special char

function validateLogin(): boolean {
  const val = loginInput.value.trim();
  if (!val) {
    loginError.textContent = 'Login is required';
    loginInput.classList.add('invalid');
    return false;
  }
  if (!LOGIN_REGEX.test(val)) {
    loginError.textContent = 'Enter a valid email or a username (letters, digits, _, min 3 characters)';
    loginInput.classList.add('invalid');
    return false;
  }
  loginError.textContent = '';
  loginInput.classList.remove('invalid');
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

function checkFormValid(): void {
  const loginVal = loginInput.value.trim();
  const passVal = passwordInput.value;
  const loginOk = LOGIN_REGEX.test(loginVal);
  const passOk = passVal.length >= 6 && PASSWORD_SPECIAL.test(passVal);
  submitBtn.disabled = !(loginOk && passOk);
}

// Initially disabled
submitBtn.disabled = true;

// ── Blur validation ────────────────────────────────────────
loginInput.addEventListener('blur', (): void => {
  validateLogin();
  checkFormValid();
});

passwordInput.addEventListener('blur', (): void => {
  validatePassword();
  checkFormValid();
});

// ── Focus: clear errors ────────────────────────────────────
loginInput.addEventListener('focus', (): void => {
  loginError.textContent = '';
  loginInput.classList.remove('invalid');
});

passwordInput.addEventListener('focus', (): void => {
  passwordError.textContent = '';
  passwordInput.classList.remove('invalid');
});

// ── Input: check button state ──────────────────────────────
loginInput.addEventListener('input', checkFormValid);
passwordInput.addEventListener('input', checkFormValid);

// ── Submit ─────────────────────────────────────────────────
form.addEventListener('submit', async (e: Event): Promise<void> => {
  e.preventDefault();
  authError.textContent = '';
  authError.classList.remove('visible');

  const loginOk = validateLogin();
  const passOk = validatePassword();
  if (!loginOk || !passOk) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Signing in...';

  try {
    await signIn({
      login: loginInput.value.trim(),
      password: passwordInput.value,
    });
    window.location.href = '../landing/index.html';
  } catch {
    authError.textContent = 'Incorrect login or password';
    authError.classList.add('visible');
    submitBtn.disabled = false;
    submitBtn.textContent = 'SIGN IN';
    checkFormValid();
  }
});
