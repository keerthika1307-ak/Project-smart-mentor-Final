// ===== STUDENT DASHBOARD MODULE =====

class StudentDashboardManager {
    constructor() {
        this.currentSection = 'profile';
        this.studentData = null;
        this.bindEvents();
    }
    
    bindEvents() {
        // Navigation event listeners
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-item[data-section]') || e.target.closest('.nav-item[data-section]')) {
                e.preventDefault();
                const navItem = e.target.matches('.nav-item[data-section]') 
                    ? e.target 
                    : e.target.closest('.nav-item[data-section]');
                
                const section = navItem.getAttribute('data-section');
                this.loadSection(section);
                this.setActiveNav(navItem);
            }
        });
    }
    
    setActiveNav(activeItem) {
        // Remove active class from all nav items
        document.querySelectorAll('#student-dashboard .nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to clicked item
        activeItem.classList.add('active');
    }
    
    async loadSection(section) {
        const content = Utils.dom.$('#student-content');
        if (!content) return;
        
        this.currentSection = section;
        
        try {
            content.innerHTML = '<div class="loading">Loading...</div>';
            
            switch (section) {
                case 'profile':
                    await this.loadProfileSection();
                    break;
                case 'academics':
                    await this.loadAcademicsSection();
                    break;
                case 'attendance':
                    await this.loadAttendanceSection();
                    break;
                case 'blackmarks':
                    await this.loadBlackmarksSection();
                    break;
                case 'ai-feedback':
                    await this.loadAIFeedbackSection();
                    break;
                case 'messages':
                    await this.loadMessagesSection();
                    break;
                case 'settings':
                    await this.loadSettingsSection();
                    break;
                default:
                    content.innerHTML = '<div class="error">Section not found</div>';
            }
        } catch (error) {
            console.error('Error loading section:', error);
            content.innerHTML = '<div class="error">Error loading content</div>';
        }
    }
    
    async loadProfileSection() {
        const content = Utils.dom.$('#student-content');
        
        content.innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-user"></i>
                        Student Profile
                    </h2>
                    <button class="btn btn-primary" onclick="StudentDashboard.editProfile()">
                        <i class="fas fa-edit"></i>
                        Edit Profile
                    </button>
                </div>
                
                <div id="profile-content">
                    <div class="loading">Loading profile...</div>
                </div>
            </div>
        `;
        
        try {
            const response = await API.getStudentDashboard();
            if (response.success) {
                this.studentData = response.data;
                this.renderProfile();
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            Utils.dom.$('#profile-content').innerHTML = '<div class="error">Error loading profile</div>';
        }
    }
    
    renderProfile() {
        const profileContent = Utils.dom.$('#profile-content');
        const data = this.studentData;
        
        profileContent.innerHTML = `
            <div class="form-section">
                <h3 class="form-section-title">Personal Information</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>Full Name</label>
                        <div class="form-display">${data.personalInfo?.name || 'Not provided'}</div>
                    </div>
                    <div class="form-group">
                        <label>Registration Number</label>
                        <div class="form-display">${data.personalInfo?.regNo || 'Not provided'}</div>
                    </div>
                    <div class="form-group">
                        <label>Date of Birth</label>
                        <div class="form-display">${data.personalInfo?.dateOfBirth || 'Not provided'}</div>
                    </div>
                    <div class="form-group">
                        <label>Blood Group</label>
                        <div class="form-display">${data.personalInfo?.bloodGroup || 'Not provided'}</div>
                    </div>
                    <div class="form-group">
                        <label>Gender</label>
                        <div class="form-display">${data.personalInfo?.gender || 'Not provided'}</div>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h3 class="form-section-title">Contact Information</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>Mobile Number</label>
                        <div class="form-display">${data.contactInfo?.mobile || 'Not provided'}</div>
                    </div>
                    <div class="form-group">
                        <label>Address</label>
                        <div class="form-display">${data.contactInfo?.address || 'Not provided'}</div>
                    </div>
                    <div class="form-group">
                        <label>Aadhar Number</label>
                        <div class="form-display">${data.contactInfo?.aadharNo || 'Not provided'}</div>
                    </div>
                    <div class="form-group">
                        <label>ABC ID</label>
                        <div class="form-display">${data.contactInfo?.abcId || 'Not provided'}</div>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h3 class="form-section-title">Parent Information</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>Father's Name</label>
                        <div class="form-display">${data.parentInfo?.fatherName || 'Not provided'}</div>
                    </div>
                    <div class="form-group">
                        <label>Mother's Name</label>
                        <div class="form-display">${data.parentInfo?.motherName || 'Not provided'}</div>
                    </div>
                    <div class="form-group">
                        <label>Guardian's Name</label>
                        <div class="form-display">${data.parentInfo?.guardianName || 'Not provided'}</div>
                    </div>
                    <div class="form-group">
                        <label>Annual Income</label>
                        <div class="form-display">${data.parentInfo?.annualIncome ? '₹' + data.parentInfo.annualIncome : 'Not provided'}</div>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h3 class="form-section-title">Bank Information</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>Bank Branch</label>
                        <div class="form-display">${data.bankInfo?.branch || 'Not provided'}</div>
                    </div>
                    <div class="form-group">
                        <label>Account Number</label>
                        <div class="form-display">${data.bankInfo?.accountNo || 'Not provided'}</div>
                    </div>
                    <div class="form-group">
                        <label>IFSC Code</label>
                        <div class="form-display">${data.bankInfo?.ifscCode || 'Not provided'}</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async loadAcademicsSection() {
        const content = Utils.dom.$('#student-content');
        
        content.innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-book"></i>
                        Academic Performance
                    </h2>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value" id="total-subjects">0</div>
                        <div class="stat-label">Total Subjects</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="avg-percentage">0%</div>
                        <div class="stat-label">Average Percentage</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="current-cgpa">0.0</div>
                        <div class="stat-label">Current CGPA</div>
                    </div>
                </div>
                
                <div id="subjects-list">
                    <div class="loading">Loading subjects...</div>
                </div>
            </div>
        `;
        
        try {
            const response = await API.getStudentDashboard();
            if (response.success) {
                this.renderAcademics(response.data.academics);
            }
        } catch (error) {
            console.error('Error loading academics:', error);
        }
    }
    
    renderAcademics(academics) {
        Utils.dom.$('#total-subjects').textContent = academics.subjectCount || 0;
        Utils.dom.$('#avg-percentage').textContent = Math.round(academics.averagePercentage || 0) + '%';
        Utils.dom.$('#current-cgpa').textContent = (academics.cgpa || 0).toFixed(1);
        
        const subjectsList = Utils.dom.$('#subjects-list');
        
        if (!academics.subjects || academics.subjects.length === 0) {
            subjectsList.innerHTML = `
                <div class="info-card">
                    <div class="card-header">
                        <i class="fas fa-info-circle"></i>
                        <h3>No Subjects Added</h3>
                    </div>
                    <div class="card-content">
                        Your mentor hasn't added any subjects yet. Please contact your mentor to add subjects and marks.
                    </div>
                </div>
            `;
            return;
        }
        
        subjectsList.innerHTML = `
            <h3>Subject-wise Performance</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Marks</th>
                        <th>Grade</th>
                        <th>Date Added</th>
                    </tr>
                </thead>
                <tbody>
                    ${academics.subjects.map(subject => `
                        <tr>
                            <td>${subject.name}</td>
                            <td>${subject.marks}/100</td>
                            <td><span class="badge ${this.getGradeBadgeClass(subject.marks)}">${this.getGrade(subject.marks)}</span></td>
                            <td>${new Date(subject.addedAt).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    getGrade(marks) {
        if (marks >= 90) return 'A+';
        if (marks >= 80) return 'A';
        if (marks >= 70) return 'B+';
        if (marks >= 60) return 'B';
        if (marks >= 50) return 'C';
        return 'F';
    }
    
    getGradeBadgeClass(marks) {
        if (marks >= 80) return 'badge-success';
        if (marks >= 60) return 'badge-warning';
        return 'badge-error';
    }
    
    async loadAttendanceSection() {
        const content = Utils.dom.$('#student-content');
        
        content.innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-calendar-check"></i>
                        Attendance Record
                    </h2>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value" id="overall-attendance">0%</div>
                        <div class="stat-label">Overall Attendance</div>
                    </div>
                </div>
                
                <div id="attendance-history">
                    <div class="loading">Loading attendance...</div>
                </div>
            </div>
        `;
        
        try {
            const response = await API.getStudentDashboard();
            if (response.success) {
                this.renderAttendance(response.data.attendance);
            }
        } catch (error) {
            console.error('Error loading attendance:', error);
        }
    }
    
    renderAttendance(attendance) {
        Utils.dom.$('#overall-attendance').textContent = Math.round(attendance.overall || 0) + '%';
        
        const attendanceHistory = Utils.dom.$('#attendance-history');
        
        if (!attendance.history || attendance.history.length === 0) {
            attendanceHistory.innerHTML = `
                <div class="info-card">
                    <div class="card-header">
                        <i class="fas fa-info-circle"></i>
                        <h3>No Attendance Records</h3>
                    </div>
                    <div class="card-content">
                        Your mentor hasn't recorded any attendance yet.
                    </div>
                </div>
            `;
            return;
        }
        
        attendanceHistory.innerHTML = `
            <h3>Monthly Attendance History</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Year</th>
                        <th>Days Present</th>
                        <th>Total Days</th>
                        <th>Percentage</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${attendance.history.map(record => `
                        <tr>
                            <td>${record.month}</td>
                            <td>${record.year}</td>
                            <td>${record.daysPresent}</td>
                            <td>${record.totalDays}</td>
                            <td>${record.percentage}%</td>
                            <td><span class="badge ${this.getAttendanceBadgeClass(record.percentage)}">${this.getAttendanceStatus(record.percentage)}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    getAttendanceStatus(percentage) {
        if (percentage >= 90) return 'Excellent';
        if (percentage >= 75) return 'Good';
        if (percentage >= 60) return 'Average';
        return 'Poor';
    }
    
    getAttendanceBadgeClass(percentage) {
        if (percentage >= 90) return 'badge-success';
        if (percentage >= 75) return 'badge-info';
        if (percentage >= 60) return 'badge-warning';
        return 'badge-error';
    }
    
    async loadBlackmarksSection() {
        const content = Utils.dom.$('#student-content');
        
        content.innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-exclamation-triangle"></i>
                        Blackmarks Record
                    </h2>
                </div>
                
                <div id="blackmarks-content">
                    <div class="loading">Loading blackmarks...</div>
                </div>
            </div>
        `;
        
        try {
            const response = await API.getStudentDashboard();
            if (response.success) {
                this.renderBlackmarks(response.data.blackmarks);
            }
        } catch (error) {
            console.error('Error loading blackmarks:', error);
        }
    }
    
    renderBlackmarks(blackmarks) {
        const blackmarksContent = Utils.dom.$('#blackmarks-content');
        
        if (!blackmarks.recent || blackmarks.recent.length === 0) {
            blackmarksContent.innerHTML = `
                <div class="info-card">
                    <div class="card-header">
                        <i class="fas fa-check-circle"></i>
                        <h3>No Blackmarks</h3>
                    </div>
                    <div class="card-content">
                        Great! You have no blackmarks. Keep up the good behavior!
                    </div>
                </div>
            `;
            return;
        }
        
        blackmarksContent.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value text-error">${blackmarks.total}</div>
                    <div class="stat-label">Total Blackmarks</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value text-error">${blackmarks.highSeverity}</div>
                    <div class="stat-label">High Severity</div>
                </div>
            </div>
            
            <h3>Recent Blackmarks</h3>
            <div class="card-grid">
                ${blackmarks.recent.map(blackmark => `
                    <div class="info-card">
                        <div class="card-header">
                            <i class="fas fa-flag"></i>
                            <h3>Blackmark - ${blackmark.severity}</h3>
                        </div>
                        <div class="card-content">
                            <p><strong>Reason:</strong> ${blackmark.reason}</p>
                            <p><strong>Date:</strong> ${new Date(blackmark.assignedAt).toLocaleDateString()}</p>
                            <span class="badge ${this.getSeverityBadgeClass(blackmark.severity)}">${blackmark.severity} Severity</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    getSeverityBadgeClass(severity) {
        switch (severity.toLowerCase()) {
            case 'high': return 'badge-error';
            case 'medium': return 'badge-warning';
            case 'low': return 'badge-info';
            default: return 'badge-info';
        }
    }
    
    async loadAIFeedbackSection() {
        const content = Utils.dom.$('#student-content');
        
        content.innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-robot"></i>
                        AI Feedback & Recommendations
                    </h2>
                    <button class="btn btn-primary" onclick="StudentDashboard.generateFeedback()">
                        <i class="fas fa-sync"></i>
                        Generate New Feedback
                    </button>
                </div>
                
                <div id="ai-feedback-content">
                    <div class="loading">Loading AI feedback...</div>
                </div>
            </div>
        `;
        
        try {
            const response = await API.getStudentDashboard();
            if (response.success) {
                this.renderAIFeedback(response.data.aiFeedback);
            }
        } catch (error) {
            console.error('Error loading AI feedback:', error);
        }
    }
    
    renderAIFeedback(aiFeedback) {
        const feedbackContent = Utils.dom.$('#ai-feedback-content');
        
        if (!aiFeedback.lastFeedback) {
            feedbackContent.innerHTML = `
                <div class="info-card">
                    <div class="card-header">
                        <i class="fas fa-robot"></i>
                        <h3>No AI Feedback Available</h3>
                    </div>
                    <div class="card-content">
                        Click "Generate New Feedback" to get personalized recommendations based on your academic performance.
                    </div>
                </div>
            `;
            return;
        }
        
        feedbackContent.innerHTML = `
            <div class="info-card">
                <div class="card-header">
                    <i class="fas fa-robot"></i>
                    <h3>Personalized AI Feedback</h3>
                </div>
                <div class="card-content">
                    <p>${aiFeedback.lastFeedback}</p>
                    <small class="text-muted">
                        Last updated: ${new Date(aiFeedback.lastUpdated).toLocaleString()}
                    </small>
                </div>
            </div>
        `;
    }
    
    async loadMessagesSection() {
        const content = Utils.dom.$('#student-content');
        
        content.innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-comments"></i>
                        Messages
                    </h2>
                </div>
                
                <div class="info-card">
                    <div class="card-header">
                        <i class="fas fa-info-circle"></i>
                        <h3>Messaging System</h3>
                    </div>
                    <div class="card-content">
                        Chat with your mentors for academic discussions and support. This feature will be available soon.
                    </div>
                </div>
            </div>
        `;
    }
    
    async loadSettingsSection() {
        const content = Utils.dom.$('#student-content');
        
        content.innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-cog"></i>
                        Account Settings
                    </h2>
                </div>
                
                <div class="info-card">
                    <div class="card-header">
                        <i class="fas fa-user-cog"></i>
                        <h3>Account Management</h3>
                    </div>
                    <div class="card-content">
                        <p>Manage your account settings, change password, and update preferences.</p>
                        <div class="mt-lg">
                            <button class="btn btn-secondary">
                                <i class="fas fa-key"></i>
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    editProfile() {
        Toast.show('Profile editing feature coming soon!', 'info');
    }
    
    generateFeedback() {
        Toast.show('Generating AI feedback...', 'info');
        // Implementation for AI feedback generation
    }
}

// Create global instance
const StudentDashboard = new StudentDashboardManager();

// Make globally available
window.StudentDashboard = StudentDashboard;
