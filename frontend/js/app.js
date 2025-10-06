// ===== MAIN APPLICATION =====

class SmartMentorApp {
    constructor() {
        this.isInitialized = false;
    }
    
    async init() {
        try {
            // Show loading spinner
            this.showLoading();
            
            // Check authentication status
            await this.checkAuthStatus();
            
            // Hide loading spinner
            this.hideLoading();
            
            this.isInitialized = true;
            console.log('✅ Smart Mentor App initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.showError('Failed to initialize application');
        }
    }
    
    showLoading() {
        const loadingSpinner = Utils.dom.$('#loading-spinner');
        if (loadingSpinner) {
            Utils.dom.show(loadingSpinner);
        }
    }
    
    hideLoading() {
        const loadingSpinner = Utils.dom.$('#loading-spinner');
        if (loadingSpinner) {
            setTimeout(() => {
                Utils.dom.hide(loadingSpinner);
            }, 1000);
        }
    }
    
    showError(message) {
        this.hideLoading();
        
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f7fafc;">
                <div style="text-align: center; background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #f56565; margin-bottom: 1rem;"></i>
                    <h1 style="color: #2d3748; margin-bottom: 1rem;">Application Error</h1>
                    <p style="color: #718096; margin-bottom: 1.5rem;">${message}</p>
                    <button onclick="location.reload()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer;">
                        <i class="fas fa-refresh"></i> Reload Application
                    </button>
                </div>
            </div>
        `;
    }
    
    async checkAuthStatus() {
        if (Auth.checkAuth()) {
            try {
                // Verify token is still valid
                await API.getCurrentUser();
                
                // Show dashboard
                Utils.dom.hide('#auth-container');
                Utils.dom.show('#dashboard-container');
                
            } catch (error) {
                console.warn('Token validation failed:', error);
                Auth.logout();
                this.showAuthPage();
            }
        } else {
            this.showAuthPage();
        }
    }
    
    showAuthPage() {
        Utils.dom.show('#auth-container');
        Utils.dom.hide('#dashboard-container');
        
        // Show login page by default
        showLogin();
    }
}

// ===== INITIALIZE APPLICATION =====
const App = new SmartMentorApp();

// Make App globally available
window.App = App;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
