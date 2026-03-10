import { signIn, isLoggedIn } from '../../src/api/auth.js';

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

function clearErrors(): void {
  loginError.textContent = '';
  passwordError.textContent = '';
  authError.textContent = '';
  authError.classList.remove('visible');
  loginInput.classList.remove('invalid');
  passwordInput.classList.remove('invalid');
}

function validate(): boolean {
  let valid = true;

  if (!loginInput.value.trim()) {
    loginError.textContent = 'Login is required';
    loginInput.classList.add('invalid');
    valid = false;
  }

  if (!passwordInput.value) {
    passwordError.textContent = 'Password is required';
    passwordInput.classList.add('invalid');
    valid = false;
  }

  return valid;
}

form.addEventListener('submit', async (e: Event): Promise<void> => {
  e.preventDefault();
  clearErrors();

  if (!validate()) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Signing in...';

  try {
    await signIn({
      login: loginInput.value.trim(),
      password: passwordInput.value,
    });
    window.location.href = '../landing/index.html';
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sign in failed. Please try again.';
    authError.textContent = message;
    authError.classList.add('visible');
    submitBtn.disabled = false;
    submitBtn.textContent = 'SIGN IN';
  }
});
