// ===== API SERVICE =====

class ApiService {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.token = Utils.storage.get(CONFIG.TOKEN_KEY);
    }
    
    setToken(token) {
        this.token = token;
        Utils.storage.set(CONFIG.TOKEN_KEY, token);
    }
    
    clearToken() {
        this.token = null;
        Utils.storage.remove(CONFIG.TOKEN_KEY);
        Utils.storage.remove(CONFIG.USER_KEY);
    }
    
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }
        
        return headers;
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            mode: 'cors',
            credentials: 'omit', // Changed from 'include' to 'omit' to avoid CORS issues
            ...options
        };
        
        console.log('API Request:', { url, config }); // Debug log
        
        // Retry mechanism for network errors
        const maxRetries = 3;
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Attempt ${attempt}/${maxRetries} for ${endpoint}`);
                
                const response = await fetch(url, config);
                
                console.log('API Response:', { 
                    status: response.status, 
                    ok: response.ok, 
                    headers: Object.fromEntries(response.headers.entries()) 
                }); // Debug log
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || `HTTP ${response.status}`);
                }
                
                return data;
            } catch (error) {
                lastError = error;
                console.error(`API Request Error (Attempt ${attempt}):`, { 
                    endpoint, 
                    url, 
                    error: error.message, 
                    stack: error.stack 
                });
                
                // If it's a network error and we have retries left, wait and try again
                if (attempt < maxRetries && (
                    error.message.includes('fetch') || 
                    error.message.includes('network') ||
                    error.message.includes('Failed to fetch') ||
                    error.name === 'TypeError'
                )) {
                    console.log(`Retrying in ${attempt * 1000}ms...`);
                    await new Promise(resolve => setTimeout(resolve, attempt * 1000));
                    continue;
                }
                
                // If it's an auth error, clear token and reload
                if (error.message.includes('401') || error.message.includes('unauthorized')) {
                    this.clearToken();
                    window.location.reload();
                }
                
                break; // Exit retry loop for non-network errors
            }
        }
        
        // If we get here, all retries failed
        throw lastError;
    }
    
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }
    
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
    
    // ===== AUTHENTICATION ENDPOINTS =====
    async login(credentials) {
        const response = await this.post('/auth/login', credentials);
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
            Utils.storage.set(CONFIG.USER_KEY, response.data.user);
        }
        return response;
    }
    
    async register(userData) {
        const response = await this.post('/auth/register', userData);
        // Don't automatically log in user after registration
        // User should login manually after registration
        return response;
    }
    
    async logout() {
        try {
            await this.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearToken();
        }
    }
    
    async getCurrentUser() {
        return this.get('/auth/me');
    }
    
    // ===== STUDENT ENDPOINTS =====
    async getStudentDashboard() {
        return this.get('/students/dashboard');
    }
    
    async getStudentProfile() {
        return this.get('/students/profile');
    }
    
    async updateStudentProfile(data) {
        return this.put('/students/profile', data);
    }
    
    async getAllStudents(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/students${queryString ? '?' + queryString : ''}`);
    }
    
    async getAllStudentsUnpaginated() {
        return this.get('/students?all=true');
    }
    
    async getStudentById(id) {
        return this.get(`/students/${id}`);
    }
    
    async updateStudent(id, data) {
        return this.put(`/students/${id}`, data);
    }
    
    async createStudent(data) {
        return this.post('/students', data);
    }
    
    async deleteStudent(id) {
        return this.delete(`/students/${id}`);
    }
    
    // ===== MENTOR ENDPOINTS =====
    async getMentorDashboard() {
        return this.get('/mentors/dashboard');
    }
    
    async getMentorStudents(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/mentors/students${queryString ? '?' + queryString : ''}`);
    }
    
    async getMentorStudent(id) {
        return this.get(`/mentors/student/${id}`);
    }
    
    async addStudentAttendance(studentId, data) {
        return this.post(`/students/${studentId}/attendance`, data);
    }
    
    async addStudentBlackmark(studentId, data) {
        return this.post(`/mentors/student/${studentId}/blackmark`, data);
    }
    
    // ===== ACADEMICS ENDPOINTS =====
    async getStudentAcademics(studentId) {
        return this.get(`/academics/student/${studentId}`);
    }
    
    async addSubject(data) {
        return this.post('/academics/subject', data);
    }
    
    async removeSubject(studentId, subjectId) {
        return this.delete(`/academics/subject/${studentId}/${subjectId}`);
    }
    
    async getAcademicOverview() {
        return this.get('/academics/overview');
    }
    
    // ===== NOTIFICATIONS ENDPOINTS =====
    async getNotifications() {
        return this.get('/notifications');
    }
    
    async createNotification(data) {
        return this.post('/notifications', data);
    }
    
    async markNotificationRead(id) {
        return this.put(`/notifications/${id}/read`);
    }
    
    async markAllNotificationsRead() {
        return this.put('/notifications/read-all');
    }
    
    async deleteNotification(id) {
        return this.delete(`/notifications/${id}`);
    }
    
    // ===== AI FEEDBACK ENDPOINTS =====
    async saveFeedback(studentId, data) {
        return this.post(`/ai/feedback/${studentId}`, data);
    }
    
    async getFeedback(studentId) {
        return this.get(`/ai/feedback/${studentId}`);
    }
    
    async getRecentFeedback() {
        return this.get('/ai/recent-feedback');
    }
    
    async getFeedbackHistory(studentId) {
        return this.get(`/ai/feedback-history/${studentId}`);
    }
    
    // ===== MESSAGES ENDPOINTS =====
    async getConversations() {
        return this.get('/messages/conversations');
    }
    
    async getMessages(userId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/messages/${userId}${queryString ? '?' + queryString : ''}`);
    }
    
    async sendMessage(data) {
        return this.post('/messages', data);
    }
    
    async markMessageRead(id) {
        return this.put(`/messages/${id}/read`);
    }
    
    async deleteMessage(id) {
        return this.delete(`/messages/${id}`);
    }
    
    async searchMessages(query, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/messages/search/${encodeURIComponent(query)}${queryString ? '?' + queryString : ''}`);
    }
}

// Create global API instance
const API = new ApiService();

// Make API globally available
window.API = API;
