// ===== APPLICATION CONFIGURATION ===== 
// Updated: 2025-01-29 02:38 - Fixed API URL

const CONFIG = {
    // API Configuration - FIXED: Changed from 3002 to 3001
    API_BASE_URL: 'http://localhost:3001/api',
    
    // Authentication
    TOKEN_KEY: 'smart_mentor_token',
    USER_KEY: 'smart_mentor_user',
    
    // Notification Settings
    NOTIFICATION_TIMEOUT: 5000, // 5 seconds
    
    // Date Formats
    DATE_FORMAT: 'DD/MM/YYYY',
    DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
    
    // Validation Rules
    VALIDATION: {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        password: {
            minLength: 6
        }
    },
    
    // Error Messages
    ERRORS: {
        network: 'Network error. Please check your connection.',
        unauthorized: 'Session expired. Please login again.',
        validation: 'Please check your input and try again.',
        server: 'Server error. Please try again later.',
        unknown: 'An unexpected error occurred.'
    },
    
    // Success Messages
    SUCCESS: {
        login: 'Login successful! Welcome back.',
        logout: 'Logged out successfully.',
        register: 'Account created successfully!'
    }
};

// Freeze the configuration to prevent modifications
Object.freeze(CONFIG);
