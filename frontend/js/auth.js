// ===== AUTHENTICATION MODULE =====

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }
    
    init() {
        const token = Utils.storage.get(CONFIG.TOKEN_KEY);
        const user = Utils.storage.get(CONFIG.USER_KEY);
        
        if (token && user) {
            this.currentUser = user;
            this.isAuthenticated = true;
            API.setToken(token);
        }
        
        this.bindEvents();
    }
    
    bindEvents() {
        const loginForm = Utils.dom.$('#login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        const registerForm = Utils.dom.$('#register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        
        // Role selection change handler
        const roleInputs = document.querySelectorAll('input[name="role"]');
        roleInputs.forEach(input => {
            input.addEventListener('change', (e) => this.handleRoleChange(e));
        });
    }
    
    handleRoleChange(e) {
        const selectedRole = e.target.value;
        const adminSecretGroup = Utils.dom.$('#admin-secret-group');
        
        if (selectedRole === 'admin') {
            Utils.dom.show(adminSecretGroup);
            Utils.dom.$('#admin-secret').required = true;
        } else {
            Utils.dom.hide(adminSecretGroup);
            Utils.dom.$('#admin-secret').required = false;
            Utils.dom.$('#admin-secret').value = '';
        }
    }
    
    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const credentials = {
            email: formData.get('email').trim(),
            password: formData.get('password')
        };
        
        const submitBtn = form.querySelector('button[type="submit"]');
        this.setButtonLoading(submitBtn, true);
        
        try {
            const response = await API.login(credentials);
            
            if (response.success) {
                this.currentUser = response.data.user;
                this.isAuthenticated = true;
                
                Toast.show(CONFIG.SUCCESS.login, 'success');
                
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1000);
            }
        } catch (error) {
            console.error('Login error:', error);
            Toast.show(error.message || CONFIG.ERRORS.unknown, 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }
    
    async handleRegister(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const userData = {
            email: formData.get('email').trim(),
            password: formData.get('password'),
            role: formData.get('role')
        };
        
        // Add admin secret if role is admin
        if (userData.role === 'admin') {
            const adminSecret = formData.get('adminSecret');
            if (!adminSecret) {
                Toast.show('Admin secret code is required', 'error');
                return;
            }
            userData.adminSecret = adminSecret;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        this.setButtonLoading(submitBtn, true);
        
        try {
            const response = await API.register(userData);
            
            if (response.success) {
                this.currentUser = response.data.user;
                this.isAuthenticated = true;
                
                Toast.show(CONFIG.SUCCESS.register, 'success');
                
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1000);
            }
        } catch (error) {
            console.error('Register error:', error);
            Toast.show(error.message || CONFIG.ERRORS.unknown, 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }
    
    setButtonLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            const icon = button.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-spinner fa-spin';
            }
        } else {
            button.disabled = false;
            const icon = button.querySelector('i');
            if (icon) {
                if (button.closest('#login-form')) {
                    icon.className = 'fas fa-sign-in-alt';
                } else if (button.closest('#register-form')) {
                    icon.className = 'fas fa-user-plus';
                }
            }
        }
    }
    
    redirectToDashboard() {
        Utils.dom.hide('#auth-container');
        Utils.dom.show('#dashboard-container');
        
        // Show appropriate dashboard based on user role
        if (this.currentUser.role === 'student') {
            Utils.dom.show('#student-dashboard');
            Utils.dom.hide('#admin-dashboard');
            this.loadStudentDashboard();
        } else if (this.currentUser.role === 'admin' || this.currentUser.role === 'mentor') {
            Utils.dom.show('#admin-dashboard');
            Utils.dom.hide('#student-dashboard');
            
            // Show admin management nav only for admins
            if (this.currentUser.role === 'admin') {
                Utils.dom.show('#admin-mgmt-nav');
            }
            
            this.loadAdminDashboard();
        }
        
        // Update user info in nav
        this.updateUserInfo();
    }
    
    updateUserInfo() {
        const userName = Utils.dom.$('#user-name');
        const userEmail = Utils.dom.$('#user-email');
        const adminUserName = Utils.dom.$('#admin-user-name');
        const adminUserEmail = Utils.dom.$('#admin-user-email');
        
        if (userName) userName.textContent = this.currentUser.email.split('@')[0];
        if (userEmail) userEmail.textContent = this.currentUser.email;
        if (adminUserName) adminUserName.textContent = this.currentUser.email.split('@')[0];
        if (adminUserEmail) adminUserEmail.textContent = this.currentUser.email;
    }
    
    async loadStudentDashboard() {
        try {
            // Load student dashboard content
            const content = Utils.dom.$('#student-content');
            if (content) {
                content.innerHTML = '<div class="loading">Loading dashboard...</div>';
                
                // Load student profile section by default
                await StudentDashboard.loadSection('profile');
            }
        } catch (error) {
            console.error('Error loading student dashboard:', error);
        }
    }
    
    async loadAdminDashboard() {
        try {
            // Load admin dashboard content
            const content = Utils.dom.$('#admin-content');
            if (content) {
                content.innerHTML = '<div class="loading">Loading dashboard...</div>';
                
                // Load overview section by default
                await AdminDashboard.loadSection('overview');
            }
        } catch (error) {
            console.error('Error loading admin dashboard:', error);
        }
    }
    
    async logout() {
        try {
            await API.logout();
            Toast.show(CONFIG.SUCCESS.logout, 'success');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.currentUser = null;
            this.isAuthenticated = false;
            
            Utils.dom.hide('#dashboard-container');
            Utils.dom.hide('#student-dashboard');
            Utils.dom.hide('#admin-dashboard');
            Utils.dom.show('#auth-container');
            
            // Reset to login page
            showLogin();
        }
    }
    
    checkAuth() {
        return this.isAuthenticated && this.currentUser;
    }
}

// ===== TOAST NOTIFICATION SYSTEM =====
class ToastManager {
    constructor() {
        this.container = Utils.dom.$('#toast-container');
        this.toasts = [];
    }
    
    show(message, type = 'info', duration = CONFIG.NOTIFICATION_TIMEOUT) {
        const toast = this.createToast(message, type);
        this.container.appendChild(toast);
        this.toasts.push(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            this.remove(toast);
        }, duration);
        
        toast.addEventListener('click', () => {
            this.remove(toast);
        });
    }
    
    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = this.getIcon(type);
        
        toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;
        
        return toast;
    }
    
    getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }
    
    remove(toast) {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            
            const index = this.toasts.indexOf(toast);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        }, 300);
    }
}

// ===== AUTH UI FUNCTIONS =====
function showLogin() {
    Utils.dom.hide('#register-page');
    Utils.dom.show('#login-page');
    Utils.dom.addClass('#login-page', 'active');
    Utils.dom.removeClass('#register-page', 'active');
}

function showRegister() {
    Utils.dom.hide('#login-page');
    Utils.dom.show('#register-page');
    Utils.dom.addClass('#register-page', 'active');
    Utils.dom.removeClass('#login-page', 'active');
}

function logout() {
    if (Auth) {
        Auth.logout();
    }
}

// Create global instances
const Auth = new AuthManager();
const Toast = new ToastManager();

// Make globally available
window.Auth = Auth;
window.Toast = Toast;
