// Common JavaScript functions shared across pages

// Configuration
const API_CONFIG = {
    BASE_URL: `${window.location.protocol}//${window.location.hostname}:${window.location.port}`,
    ENDPOINTS: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        TASKS: '/tasks'
    }
};

// Authentication utilities
const Auth = {
    getToken() {
        return localStorage.getItem('authToken');
    },

    setToken(token) {
        localStorage.setItem('authToken', token);
    },

    getUser() {
        return localStorage.getItem('currentUser');
    },

    setUser(email) {
        localStorage.setItem('currentUser', email);
    },

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        // Redirect to auth page
        if (window.location.pathname !== '/auth.html' && window.location.pathname !== '/index.html') {
            window.location.href = 'auth.html';
        }
    },

    isAuthenticated() {
        return this.getToken() && this.getUser();
    },

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'auth.html';
            return false;
        }
        return true;
    }
};

// API utilities
const API = {
    async call(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;

        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        // Add auth token if available
        const token = Auth.getToken();
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            headers: { ...defaultHeaders, ...options.headers },
            ...options
        };

        try {
            const response = await fetch(url, config);

            // Handle unauthorized responses
            if (response.status === 401 || response.status === 403) {
                Auth.logout();
                throw new Error('Authentication required');
            }

            return response;
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    },

    async get(endpoint) {
        return this.call(endpoint, { method: 'GET' });
    },

    async post(endpoint, data) {
        return this.call(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async put(endpoint, data) {
        return this.call(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async patch(endpoint, data = null) {
        const options = { method: 'PATCH' };
        if (data) {
            options.body = JSON.stringify(data);
        }
        return this.call(endpoint, options);
    },

    async delete(endpoint) {
        return this.call(endpoint, { method: 'DELETE' });
    }
};

// Toast notification system
const Toast = {
    container: null,

    init() {
        if (!this.container) {
            this.container = document.getElementById('toast') || this.createToastContainer();
        }
    },

    createToastContainer() {
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
        return toast;
    },

    show(message, type = 'success', duration = 3000) {
        this.init();

        this.container.textContent = message;
        this.container.className = `toast ${type}`;
        this.container.style.display = 'block';

        // Auto-hide after duration
        setTimeout(() => {
            this.hide();
        }, duration);
    },

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    },

    success(message, duration) {
        this.show(message, 'success', duration);
    },

    error(message, duration) {
        this.show(message, 'error', duration);
    },

    warning(message, duration) {
        this.show(message, 'warning', duration);
    },

    info(message, duration) {
        this.show(message, 'info', duration);
    }
};

// Loading overlay utilities
const Loading = {
    show(message = 'Loading...') {
        let overlay = document.getElementById('loadingOverlay');
        if (!overlay) {
            overlay = this.createOverlay();
        }

        const text = overlay.querySelector('#loadingText');
        if (text) {
            text.textContent = message;
        }

        overlay.classList.add('show');
    },

    hide() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    },

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';

        overlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p id="loadingText">Loading...</p>
            </div>
        `;

        document.body.appendChild(overlay);
        return overlay;
    }
};

// Form validation utilities
const Validation = {
    email(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    password(password, minLength = 6) {
        return password && password.length >= minLength;
    },

    required(value) {
        return value && value.trim().length > 0;
    },

    showError(inputId, message) {
        const input = document.getElementById(inputId);
        const errorElement = document.getElementById(`${inputId}Error`);

        if (input) {
            input.classList.add('error');
        }

        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    },

    clearError(inputId) {
        const input = document.getElementById(inputId);
        const errorElement = document.getElementById(`${inputId}Error`);

        if (input) {
            input.classList.remove('error');
        }

        if (errorElement) {
            errorElement.classList.remove('show');
        }
    },

    clearAllErrors() {
        const errorInputs = document.querySelectorAll('input.error');
        const errorMessages = document.querySelectorAll('.error-message.show');

        errorInputs.forEach(input => input.classList.remove('error'));
        errorMessages.forEach(error => error.classList.remove('show'));
    }
};

// Utility functions
const Utils = {
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    formatDate(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays === -1) return 'Yesterday';
        if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
        if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
            hour: 'numeric',
            minute: 'numeric'
        });
    },

    isOverdue(dateString) {
        if (!dateString) return false;
        return new Date(dateString) < new Date();
    },

    isUpcoming(dateString, hoursThreshold = 24) {
        if (!dateString) return false;
        const deadline = new Date(dateString);
        const now = new Date();
        const hoursDiff = (deadline - now) / (1000 * 60 * 60);
        return hoursDiff > 0 && hoursDiff < hoursThreshold;
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Modal utilities
const Modal = {
    show(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    },

    hide(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    },

    confirm(message, onConfirm, onCancel) {
        const confirmModal = document.getElementById('confirmModal');
        if (!confirmModal) return;

        const messageElement = confirmModal.querySelector('#confirmMessage');
        const confirmBtn = confirmModal.querySelector('#confirmActionBtn');
        const cancelBtn = confirmModal.querySelector('#confirmCancelBtn');

        if (messageElement) {
            messageElement.textContent = message;
        }

        // Remove existing listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);

        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        // Add new listeners
        newConfirmBtn.addEventListener('click', () => {
            this.hide('confirmModal');
            if (onConfirm) onConfirm();
        });

        newCancelBtn.addEventListener('click', () => {
            this.hide('confirmModal');
            if (onCancel) onCancel();
        });

        this.show('confirmModal');
    }
};

// Initialize common functionality when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize toast system
    Toast.init();

    // Add click handlers for modal close buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            const modalId = e.target.id;
            Modal.hide(modalId);
        }

        if (e.target.classList.contains('modal-close')) {
            const modal = e.target.closest('.modal-overlay');
            if (modal) {
                Modal.hide(modal.id);
            }
        }
    });

    // Handle escape key for modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal-overlay.show');
            if (openModal) {
                Modal.hide(openModal.id);
            }
        }
    });
});

// Export utilities for use in other files
window.Auth = Auth;
window.API = API;
window.Toast = Toast;
window.Loading = Loading;
window.Validation = Validation;
window.Utils = Utils;
window.Modal = Modal;