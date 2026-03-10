import { register, isLoggedIn } from '../../src/api/auth.js';

// Redirect if already logged in
if (isLoggedIn()) {
  window.location.href = '../landing/index.html';
}

const form = document.getElementById('registerForm') as HTMLFormElement;
const nameInput = document.getElementById('name') as HTMLInputElement;
const loginInput = document.getElementById('login') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const nameError = document.getElementById('nameError') as HTMLElement;
const loginError = document.getElementById('loginError') as HTMLElement;
const passwordError = document.getElementById('passwordError') as HTMLElement;
const authError = document.getElementById('authError') as HTMLElement;
const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;

function clearErrors(): void {
  nameError.textContent = '';
  loginError.textContent = '';
  passwordError.textContent = '';
  authError.textContent = '';
  authError.classList.remove('visible');
  nameInput.classList.remove('invalid');
  loginInput.classList.remove('invalid');
  passwordInput.classList.remove('invalid');
}

function validate(): boolean {
  let valid = true;

  if (!nameInput.value.trim()) {
    nameError.textContent = 'Name is required';
    nameInput.classList.add('invalid');
    valid = false;
  }

  if (!loginInput.value.trim()) {
    loginError.textContent = 'Login is required';
    loginInput.classList.add('invalid');
    valid = false;
  } else if (loginInput.value.trim().length < 3) {
    loginError.textContent = 'Login must be at least 3 characters';
    loginInput.classList.add('invalid');
    valid = false;
  }

  if (!passwordInput.value) {
    passwordError.textContent = 'Password is required';
    passwordInput.classList.add('invalid');
    valid = false;
  } else if (passwordInput.value.length < 6) {
    passwordError.textContent = 'Password must be at least 6 characters';
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
  submitBtn.textContent = 'Creating account...';

  try {
    await register({
      name: nameInput.value.trim(),
      login: loginInput.value.trim(),
      password: passwordInput.value,
    });
    window.location.href = '../landing/index.html';
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
    authError.textContent = message;
    authError.classList.add('visible');
    submitBtn.disabled = false;
    submitBtn.textContent = 'CREATE ACCOUNT';
  }
});
