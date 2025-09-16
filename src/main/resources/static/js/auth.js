// Authentication page functionality

class AuthManager {
    constructor() {
        this.currentTab = 'login';
        this.isLoading = false;
        this.init();
    }

    init() {
        // Check if user is already authenticated
        if (Auth.isAuthenticated()) {
            window.location.href = 'dashboard.html';
            return;
        }

        this.bindEvents();
        this.setupFormValidation();
    }

    bindEvents() {
        // Tab switching
        const authTabs = document.querySelectorAll('.auth-tab');
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Form submissions
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Auth switch link
        const authSwitchLink = document.getElementById('authSwitchLink');
        if (authSwitchLink) {
            authSwitchLink.addEventListener('click', (e) => {
                e.preventDefault();
                const newTab = this.currentTab === 'login' ? 'register' : 'login';
                this.switchTab(newTab);
            });
        }
    }

    setupFormValidation() {
        // Real-time email validation
        const loginEmail = document.getElementById('loginEmail');
        const registerEmail = document.getElementById('registerEmail');
        const confirmPassword = document.getElementById('confirmPassword');

        if (loginEmail) {
            loginEmail.addEventListener('blur', () => this.validateEmail('loginEmail'));
            loginEmail.addEventListener('input', () => Validation.clearError('loginEmail'));
        }

        if (registerEmail) {
            registerEmail.addEventListener('blur', () => this.validateEmail('registerEmail'));
            registerEmail.addEventListener('input', () => Validation.clearError('registerEmail'));
        }

        if (confirmPassword) {
            confirmPassword.addEventListener('blur', () => this.validatePasswordMatch());
            confirmPassword.addEventListener('input', () => Validation.clearError('confirmPassword'));
        }

        // Password strength indicator
        const registerPassword = document.getElementById('registerPassword');
        if (registerPassword) {
            registerPassword.addEventListener('input', (e) => this.updatePasswordStrength(e.target.value));
        }
    }

    switchTab(tab) {
        const authTabs = document.querySelectorAll('.auth-tab');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const authSubtitle = document.getElementById('authSubtitle');
        const authSwitchText = document.getElementById('authSwitchText');
        const authSwitchLink = document.getElementById('authSwitchLink');

        // Clear all errors when switching
        Validation.clearAllErrors();

        // Update active tab
        authTabs.forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        this.currentTab = tab;

        if (tab === 'login') {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            authSubtitle.textContent = 'Sign in to manage your tasks';
            authSwitchText.textContent = "Don't have an account?";
            authSwitchLink.textContent = 'Register here';
        } else {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            authSubtitle.textContent = 'Create your account to get started';
            authSwitchText.textContent = 'Already have an account?';
            authSwitchLink.textContent = 'Login here';
        }
    }

    validateEmail(inputId) {
        const email = document.getElementById(inputId).value;
        if (email && !Validation.email(email)) {
            Validation.showError(inputId, 'Please enter a valid email address');
            return false;
        } else {
            Validation.clearError(inputId);
            return true;
        }
    }

    validatePasswordMatch() {
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (confirmPassword && password !== confirmPassword) {
            Validation.showError('confirmPassword', 'Passwords do not match');
            return false;
        } else {
            Validation.clearError('confirmPassword');
            return true;
        }
    }

    updatePasswordStrength(password) {
        // This could be enhanced with more sophisticated password strength checking
        const strengthIndicator = document.querySelector('.password-strength');
        if (!strengthIndicator) return;

        let strength = 'weak';
        if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
            strength = 'strong';
        } else if (password.length >= 6) {
            strength = 'medium';
        }

        strengthIndicator.className = `password-strength password-strength-${strength}`;
    }

    async handleLogin(e) {
        e.preventDefault();

        if (this.isLoading) return;

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Validate form
        Validation.clearAllErrors();
        let isValid = true;

        if (!Validation.email(email)) {
            Validation.showError('loginEmail', 'Please enter a valid email address');
            isValid = false;
        }

        if (!Validation.required(password)) {
            Validation.showError('loginPassword', 'Password is required');
            isValid = false;
        }

        if (!isValid) {
            this.shakeForm('loginForm');
            return;
        }

        this.setLoading(true, 'Signing you in...');

        try {
            const response = await API.post(API_CONFIG.ENDPOINTS.LOGIN, { email, password });

            if (response.ok) {
                const data = await response.json();

                // Store authentication data
                Auth.setToken(data.token);
                Auth.setUser(email);

                Toast.success('Welcome back! Redirecting to dashboard...');

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                const errorText = await response.text();
                if (response.status === 401 || response.status === 400) {
                    this.showFormError('loginForm', 'Invalid email or password');
                } else {
                    this.showFormError('loginForm', errorText || 'Login failed. Please try again.');
                }
                this.shakeForm('loginForm');
            }
        } catch (error) {
            console.error('Login error:', error);
            if (error.message !== 'Authentication required') {
                Toast.error('Connection error. Please check your internet connection.');
            }
        } finally {
            this.setLoading(false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();

        if (this.isLoading) return;

        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate form
        Validation.clearAllErrors();
        let isValid = true;

        if (!Validation.email(email)) {
            Validation.showError('registerEmail', 'Please enter a valid email address');
            isValid = false;
        }

        if (!Validation.password(password)) {
            Validation.showError('registerPassword', 'Password must be at least 6 characters');
            isValid = false;
        }

        if (password !== confirmPassword) {
            Validation.showError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }

        if (!isValid) {
            this.shakeForm('registerForm');
            return;
        }

        this.setLoading(true, 'Creating your account...');

        try {
            const response = await API.post(API_CONFIG.ENDPOINTS.REGISTER, { email, password });

            if (response.ok) {
                const data = await response.json();

                // Store authentication data
                Auth.setToken(data.token);
                Auth.setUser(email);

                Toast.success('Account created successfully! Welcome aboard!');

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                const errorText = await response.text();
                if (response.status === 409 || response.status === 400) {
                    if (errorText.toLowerCase().includes('email') || errorText.toLowerCase().includes('exist')) {
                        this.showFormError('registerForm', 'This email is already registered. Please use a different email or try logging in.');
                    } else {
                        this.showFormError('registerForm', errorText || 'Registration failed. Please check your information.');
                    }
                } else {
                    this.showFormError('registerForm', errorText || 'Registration failed. Please try again.');
                }
                this.shakeForm('registerForm');
            }
        } catch (error) {
            console.error('Registration error:', error);
            if (error.message !== 'Authentication required') {
                Toast.error('Connection error. Please check your internet connection.');
            }
        } finally {
            this.setLoading(false);
        }
    }

    showFormError(formId, message) {
        const errorId = formId === 'loginForm' ? 'loginGeneralError' : 'registerGeneralError';
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    shakeForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.classList.add('shake');
            setTimeout(() => form.classList.remove('shake'), 500);
        }
    }

    setLoading(isLoading, message = 'Loading...') {
        this.isLoading = isLoading;

        const submitButtons = document.querySelectorAll('.auth-form .btn-primary');

        if (isLoading) {
            Loading.show(message);
            submitButtons.forEach(btn => {
                btn.disabled = true;
                const icon = btn.querySelector('.btn-icon');
                if (icon) icon.textContent = '⏳';
            });
        } else {
            Loading.hide();
            submitButtons.forEach(btn => {
                btn.disabled = false;
                const icon = btn.querySelector('.btn-icon');
                if (icon) {
                    icon.textContent = btn.closest('#loginForm') ? '🔐' : '✨';
                }
            });
        }
    }
}

// Initialize authentication manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});

// Make sure the AuthManager is available globally for debugging
window.AuthManager = AuthManager;