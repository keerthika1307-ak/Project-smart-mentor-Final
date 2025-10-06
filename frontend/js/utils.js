// ===== UTILITY FUNCTIONS =====

const Utils = {
    
    // ===== LOCAL STORAGE UTILITIES =====
    storage: {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Error saving to localStorage:', error);
                return false;
            }
        },
        
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Error reading from localStorage:', error);
                return defaultValue;
            }
        },
        
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Error removing from localStorage:', error);
                return false;
            }
        }
    },
    
    // ===== DOM UTILITIES =====
    dom: {
        $(selector) {
            return document.querySelector(selector);
        },
        
        show(element) {
            if (typeof element === 'string') {
                element = this.$(element);
            }
            if (element) {
                element.style.display = 'block';
                element.classList.remove('hidden');
            }
        },
        
        hide(element) {
            if (typeof element === 'string') {
                element = this.$(element);
            }
            if (element) {
                element.style.display = 'none';
                element.classList.add('hidden');
            }
        },
        
        addClass(element, className) {
            if (typeof element === 'string') {
                element = this.$(element);
            }
            if (element) {
                element.classList.add(className);
            }
        },
        
        removeClass(element, className) {
            if (typeof element === 'string') {
                element = this.$(element);
            }
            if (element) {
                element.classList.remove(className);
            }
        }
    },
    
    // ===== VALIDATION UTILITIES =====
    validate: {
        email(email) {
            return CONFIG.VALIDATION.email.test(email);
        },
        
        password(password) {
            return password.length >= CONFIG.VALIDATION.password.minLength;
        },
        
        required(value) {
            return value !== null && value !== undefined && value !== '';
        }
    }
};

// Make Utils globally available
window.Utils = Utils;
