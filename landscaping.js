// Client-side script to handle login and signup forms
document.addEventListener('DOMContentLoaded', () => {
	const showLoginBtn = document.getElementById('show-login');
	const showSignupBtn = document.getElementById('show-signup');
	const loginForm = document.getElementById('login-form');
	const signupForm = document.getElementById('signup-form');
	const messageEl = document.getElementById('message');

	function showMessage(text, isError = false) {
		messageEl.textContent = text;
		messageEl.className = isError ? 'message error' : 'message success';
	}

	showLoginBtn.addEventListener('click', () => {
		showLoginBtn.classList.add('active');
		showSignupBtn.classList.remove('active');
		loginForm.classList.remove('hidden');
		signupForm.classList.add('hidden');
		messageEl.textContent = '';
	});

	showSignupBtn.addEventListener('click', () => {
		showSignupBtn.classList.add('active');
		showLoginBtn.classList.remove('active');
		signupForm.classList.remove('hidden');
		loginForm.classList.add('hidden');
		messageEl.textContent = '';
	});

	// LOGIN FORM
	loginForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		const email = document.getElementById('login-email').value.trim();
		const password = document.getElementById('login-password').value;

		try {
			const res = await fetch('http://localhost:3000/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'Login failed');

			// Store token, user_id, and name
			localStorage.setItem('ia_token', data.token);
			localStorage.setItem('ia_user_id', data.user_id);
			localStorage.setItem('ia_user_name', data.name);

			showMessage('Login successful — welcome ' + (data.name || '') + '.');
			
			// Redirect to profile page after 1 second
			setTimeout(() => {
				window.location.href = 'ls-profile.html';
			}, 1000);
		} catch (err) {
			showMessage(err.message, true);
		}
	});

	// SIGNUP FORM
	signupForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		const name = document.getElementById('signup-name').value.trim();
		const email = document.getElementById('signup-email').value.trim();
		const password = document.getElementById('signup-password').value;

		try {
			const res = await fetch('http://localhost:3000/api/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, password }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'Sign up failed');

			showMessage('Account created — please log in.');
			
			// Switch to login view and clear fields
			setTimeout(() => {
				showLoginBtn.click();
				loginForm.reset();
				signupForm.reset();
			}, 500);
		} catch (err) {
			showMessage(err.message, true);
		}
	});
});

// End of landscaping.js
