// ===== ADMIN DASHBOARD MODULE =====

class AdminDashboardManager {
    constructor() {
        this.currentSection = 'overview';
        this.studentsData = [];
        this.bindEvents();
    }
    
    bindEvents() {
        // Navigation event listeners
        document.addEventListener('click', (e) => {
            if (e.target.matches('#admin-dashboard .nav-item[data-section]') || e.target.closest('#admin-dashboard .nav-item[data-section]')) {
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
        // Remove active class from all nav items in admin dashboard
        document.querySelectorAll('#admin-dashboard .nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to clicked item
        activeItem.classList.add('active');
    }
    
    async loadSection(section) {
        const content = Utils.dom.$('#admin-content');
        if (!content) return;
        
        this.currentSection = section;
        
        try {
            content.innerHTML = '<div class="loading">Loading...</div>';
            
            switch (section) {
                case 'overview':
                    await this.loadOverviewSection();
                    break;
                case 'students':
                    await this.loadStudentsSection();
                    break;
                case 'attendance-mgmt':
                    await this.loadAttendanceManagementSection();
                    break;
                case 'marks-entry':
                    await this.loadMarksEntrySection();
                    break;
                case 'blackmarks-mgmt':
                    await this.loadBlackmarksManagementSection();
                    break;
                case 'notifications-mgmt':
                    await this.loadNotificationsManagementSection();
                    break;
                case 'messages-mgmt':
                    await this.loadMessagesManagementSection();
                    break;
                case 'settings-mgmt':
                    await this.loadSettingsManagementSection();
                    break;
                default:
                    content.innerHTML = '<div class="error">Section not found</div>';
            }
        } catch (error) {
            console.error('Error loading section:', error);
            content.innerHTML = '<div class="error">Error loading content</div>';
        }
    }
    
    async loadOverviewSection() {
        const content = Utils.dom.$('#admin-content');
        
        content.innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-tachometer-alt"></i>
                        Dashboard Overview
                    </h2>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value" id="total-students">0</div>
                        <div class="stat-label">Total Students</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value text-warning" id="low-attendance">0</div>
                        <div class="stat-label">Low Attendance</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value text-error" id="low-cgpa">0</div>
                        <div class="stat-label">Low CGPA</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value text-error" id="blackmarks-count">0</div>
                        <div class="stat-label">Students with Blackmarks</div>
                    </div>
                </div>
                
                <div class="card-grid">
                    <div class="info-card">
                        <div class="card-header">
                            <i class="fas fa-chart-line"></i>
                            <h3>Quick Actions</h3>
                        </div>
                        <div class="card-content">
                            <button class="btn btn-primary mb-0" onclick="AdminDashboard.loadSection('students')">
                                <i class="fas fa-users"></i>
                                Manage Students
                            </button>
                            <button class="btn btn-secondary mb-0" onclick="AdminDashboard.loadSection('marks-entry')">
                                <i class="fas fa-edit"></i>
                                Enter Marks
                            </button>
                            <button class="btn btn-secondary mb-0" onclick="AdminDashboard.loadSection('attendance-mgmt')">
                                <i class="fas fa-calendar-alt"></i>
                                Record Attendance
                            </button>
                        </div>
                    </div>
                    
                    <div class="info-card">
                        <div class="card-header">
                            <i class="fas fa-bell"></i>
                            <h3>Recent Alerts</h3>
                        </div>
                        <div class="card-content">
                            <div id="recent-alerts">
                                <div class="loading">Loading alerts...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        try {
            const response = await API.getMentorDashboard();
            if (response.success) {
                this.renderOverviewStats(response.data);
            }
        } catch (error) {
            console.error('Error loading overview:', error);
        }
    }
    
    renderOverviewStats(data) {
        Utils.dom.$('#total-students').textContent = data.statistics?.totalStudents || 0;
        Utils.dom.$('#low-attendance').textContent = data.alerts?.lowAttendance || 0;
        Utils.dom.$('#low-cgpa').textContent = data.alerts?.lowCGPA || 0;
        Utils.dom.$('#blackmarks-count').textContent = data.alerts?.blackmarks || 0;
        
        const alertsContainer = Utils.dom.$('#recent-alerts');
        if (data.recentActivities && data.recentActivities.length > 0) {
            alertsContainer.innerHTML = data.recentActivities.map(activity => `
                <div class="alert-item">
                    <i class="fas fa-info-circle"></i>
                    <span>${activity.message}</span>
                    <small>${new Date(activity.date).toLocaleDateString()}</small>
                </div>
            `).join('');
        } else {
            alertsContainer.innerHTML = '<p class="text-muted">No recent alerts</p>';
        }
    }
    
    async loadStudentsSection() {
        const content = Utils.dom.$('#admin-content');
        
        content.innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-users"></i>
                        Student Management
                    </h2>
                    <button class="btn btn-primary" onclick="AdminDashboard.addNewStudent()">
                        <i class="fas fa-user-plus"></i>
                        Add New Student
                    </button>
                </div>
                
                <div class="form-group">
                    <input type="text" id="student-search" placeholder="Search by email or registration number..." 
                           onkeyup="AdminDashboard.searchStudents(this.value)">
                </div>
                
                <div id="students-list">
                    <div class="loading">Loading students...</div>
                </div>
            </div>
        `;
        
        try {
            const response = await API.getAllStudents();
            if (response.success) {
                this.studentsData = response.data.students;
                this.renderStudentsList(this.studentsData);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error loading students:', error);
            Utils.dom.$('#students-list').innerHTML = `
                <div class="error-card">
                    <div class="card-header">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Error Loading Students</h3>
                    </div>
                    <div class="card-content">
                        ${error.message || 'Failed to load students data'}
                    </div>
                </div>
            `;
        }
    }
    
    renderStudentsList(students) {
        const studentsList = Utils.dom.$('#students-list');
        
        if (!students || students.length === 0) {
            studentsList.innerHTML = `
                <div class="info-card">
                    <div class="card-header">
                        <i class="fas fa-info-circle"></i>
                        <h3>No Students Found</h3>
                    </div>
                    <div class="card-content">
                        No students match your search criteria.
                    </div>
                </div>
            `;
            return;
        }
        
        studentsList.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Reg No</th>
                        <th>Email</th>
                        <th>CGPA</th>
                        <th>Attendance</th>
                        <th>Blackmarks</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${students.map(student => `
                        <tr>
                            <td>${student.name}</td>
                            <td>${student.regNo}</td>
                            <td>${student.email}</td>
                            <td><span class="badge ${this.getCGPABadgeClass(student.cgpa)}">${student.cgpa}</span></td>
                            <td><span class="badge ${this.getAttendanceBadgeClass(student.attendance)}">${student.attendance}%</span></td>
                            <td><span class="badge ${student.blackmarks > 0 ? 'badge-error' : 'badge-success'}">${student.blackmarks}</span></td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="AdminDashboard.viewStudent('${student.id}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-secondary" onclick="AdminDashboard.editStudent('${student.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    getCGPABadgeClass(cgpa) {
        if (cgpa >= 8) return 'badge-success';
        if (cgpa >= 6) return 'badge-warning';
        return 'badge-error';
    }
    
    getAttendanceBadgeClass(attendance) {
        if (attendance >= 90) return 'badge-success';
        if (attendance >= 75) return 'badge-info';
        if (attendance >= 60) return 'badge-warning';
        return 'badge-error';
    }
    
    async loadAttendanceManagementSection() {
        const content = Utils.dom.$('#admin-content');
        
        content.innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-calendar-alt"></i>
                        Attendance Management
                    </h2>
                </div>
                
                <div class="form-section">
                    <h3 class="form-section-title">Record Attendance</h3>
                    <form id="attendance-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="student-select">Select Student</label>
                                <select id="student-select" required>
                                    <option value="">Choose a student...</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="attendance-month">Month</label>
                                <select id="attendance-month" required>
                                    <option value="">Select month...</option>
                                    <option value="January">January</option>
                                    <option value="February">February</option>
                                    <option value="March">March</option>
                                    <option value="April">April</option>
                                    <option value="May">May</option>
                                    <option value="June">June</option>
                                    <option value="July">July</option>
                                    <option value="August">August</option>
                                    <option value="September">September</option>
                                    <option value="October">October</option>
                                    <option value="November">November</option>
                                    <option value="December">December</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="attendance-year">Year</label>
                                <select id="attendance-year" required>
                                    <option value="">Select year...</option>
                                    <option value="2024">2024</option>
                                    <option value="2025">2025</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="days-present">Days Present</label>
                                <input type="number" id="days-present" min="0" max="31" required>
                            </div>
                            <div class="form-group">
                                <label for="total-days">Total Days</label>
                                <input type="number" id="total-days" min="1" max="31" required>
                            </div>
                            <div class="form-group">
                                <label>Percentage</label>
                                <div class="form-display" id="attendance-percentage">0%</div>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i>
                            Record Attendance
                        </button>
                    </form>
                </div>
            </div>
        `;
        
        // Load students for dropdown
        await this.loadStudentDropdowns();
        
        // Add event listeners for percentage calculation
        const daysPresent = Utils.dom.$('#days-present');
        const totalDays = Utils.dom.$('#total-days');
        const percentageDisplay = Utils.dom.$('#attendance-percentage');
        
        [daysPresent, totalDays].forEach(input => {
            input.addEventListener('input', () => {
                const present = parseInt(daysPresent.value) || 0;
                const total = parseInt(totalDays.value) || 0;
                const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
                percentageDisplay.textContent = percentage + '%';
            });
        });
        
        // Add form submission handler
        const attendanceForm = Utils.dom.$('#attendance-form');
        attendanceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAttendanceSubmission();
        });
    }
    
    async loadMarksEntrySection() {
        const content = Utils.dom.$('#admin-content');
        
        content.innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-edit"></i>
                        Marks Entry
                    </h2>
                </div>
                
                <div class="form-section">
                    <h3 class="form-section-title">Add Subject & Marks</h3>
                    <form id="marks-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="marks-student-select">Select Student</label>
                                <select id="marks-student-select" required>
                                    <option value="">Choose a student...</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="subject-name">Subject Name</label>
                                <input type="text" id="subject-name" placeholder="e.g., Mathematics" required>
                            </div>
                            <div class="form-group">
                                <label for="subject-marks">Marks (0-100)</label>
                                <input type="number" id="subject-marks" min="0" max="100" required>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-plus"></i>
                            Add Subject & Marks
                        </button>
                    </form>
                </div>
                
                <div id="student-subjects">
                    <div class="info-card">
                        <div class="card-header">
                            <i class="fas fa-info-circle"></i>
                            <h3>Select a Student</h3>
                        </div>
                        <div class="card-content">
                            Select a student from the dropdown above to view and manage their subjects.
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Load students for dropdown
        await this.loadStudentDropdowns();
        
        // Add form submission handler
        const marksForm = Utils.dom.$('#marks-form');
        marksForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleMarksSubmission();
        });
        
        // Add student selection handler
        const studentSelect = Utils.dom.$('#marks-student-select');
        studentSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadStudentSubjects(e.target.value);
            }
        });
    }
    
    async loadBlackmarksManagementSection() {
        const content = Utils.dom.$('#admin-content');
        
        content.innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-flag"></i>
                        Blackmarks Management
                    </h2>
                </div>
                
                <div class="form-section">
                    <h3 class="form-section-title">Assign Blackmark</h3>
                    <form id="blackmark-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="blackmark-student-select">Select Student</label>
                                <select id="blackmark-student-select" required>
                                    <option value="">Choose a student...</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="blackmark-severity">Severity</label>
                                <select id="blackmark-severity" required>
                                    <option value="">Select severity...</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="blackmark-reason">Reason</label>
                            <textarea id="blackmark-reason" rows="3" placeholder="Describe the reason for this blackmark..." required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-flag"></i>
                            Assign Blackmark
                        </button>
                    </form>
                </div>
            </div>
        `;
        
        // Load students for dropdown
        await this.loadStudentDropdowns();
        
        // Add form submission handler
        const blackmarkForm = Utils.dom.$('#blackmark-form');
        blackmarkForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleBlackmarkSubmission();
        });
    }
    
    async loadNotificationsManagementSection() {
        const content = Utils.dom.$('#admin-content');
        
        content.innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-bell"></i>
                        Notifications Management
                    </h2>
                    <button class="btn btn-primary" onclick="AdminDashboard.showCreateNotificationForm()">
                        <i class="fas fa-plus"></i>
                        Create Notification
                    </button>
                </div>
                
                <div id="create-notification-form" class="form-section" style="display: none;">
                    <h3 class="form-section-title">Create New Notification</h3>
                    <form id="new-notification-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="notification-title">Title</label>
                                <input type="text" id="notification-title" required>
                            </div>
                            <div class="form-group">
                                <label for="notification-type">Type</label>
                                <select id="notification-type" required>
                                    <option value="info">Info</option>
                                    <option value="warning">Warning</option>
                                    <option value="success">Success</option>
                                    <option value="error">Error</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="notification-message">Message</label>
                            <textarea id="notification-message" rows="3" required></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="notification-recipients">Recipients</label>
                                <select id="notification-recipients" multiple>
                                    <option value="all">All Users</option>
                                    <option value="students">All Students</option>
                                    <option value="admins">All Admins</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-send"></i>
                                Send Notification
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="AdminDashboard.hideCreateNotificationForm()">
                                <i class="fas fa-times"></i>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
                
                <div id="notifications-list">
                    <h3>Recent Notifications</h3>
                    <div id="notifications-container">
                        <div class="loading">Loading notifications...</div>
                    </div>
                </div>
                
                <div class="info-card mt-4">
                    <div class="card-header">
                        <i class="fas fa-info-circle"></i>
                        <h3>System Activity Notifications</h3>
                    </div>
                    <div class="card-content">
                        <p>All system activities are automatically notified to admins:</p>
                        <ul>
                            <li>New student registrations</li>
                            <li>Attendance records added</li>
                            <li>Marks entries</li>
                            <li>Blackmarks assigned</li>
                            <li>Profile updates</li>
                            <li>Login activities</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        // Load existing notifications
        await this.loadNotifications();
        
        // Add form submission handler
        const notificationForm = Utils.dom.$('#new-notification-form');
        notificationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleNotificationSubmission();
        });
    }
    
    async loadMessagesManagementSection() {
        const content = Utils.dom.$('#admin-content');
        
        content.innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-envelope"></i>
                        Messages Management
                    </h2>
                </div>
                
                <div class="info-card">
                    <div class="card-header">
                        <i class="fas fa-comments"></i>
                        <h3>Student Communication</h3>
                    </div>
                    <div class="card-content">
                        <p>Search for students and start conversations for academic support and guidance.</p>
                        <div class="form-group">
                            <input type="text" placeholder="Search student by name or registration number...">
                        </div>
                        <p class="text-muted">Messaging system will be available soon.</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    async loadSettingsManagementSection() {
        const content = Utils.dom.$('#admin-content');
        
        content.innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-cog"></i>
                        System Settings
                    </h2>
                </div>
                
                <div class="card-grid">
                    <div class="info-card">
                        <div class="card-header">
                            <i class="fas fa-percentage"></i>
                            <h3>Threshold Settings</h3>
                        </div>
                        <div class="card-content">
                            <div class="form-group">
                                <label>Attendance Threshold (%)</label>
                                <input type="number" value="75" min="0" max="100">
                            </div>
                            <div class="form-group">
                                <label>CGPA Threshold</label>
                                <input type="number" value="6.0" min="0" max="10" step="0.1">
                            </div>
                            <button class="btn btn-primary">
                                <i class="fas fa-save"></i>
                                Save Settings
                            </button>
                        </div>
                    </div>
                    
                    <div class="info-card">
                        <div class="card-header">
                            <i class="fas fa-database"></i>
                            <h3>Data Management</h3>
                        </div>
                        <div class="card-content">
                            <p>Export student data and generate reports.</p>
                            <button class="btn btn-secondary">
                                <i class="fas fa-download"></i>
                                Export Student Data
                            </button>
                            <button class="btn btn-secondary">
                                <i class="fas fa-chart-bar"></i>
                                Generate Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Utility methods
    async loadStudentDropdowns() {
        try {
            const response = await API.getAllStudents();
            if (response.success) {
                const students = response.data.students;
                
                // Update all student dropdowns
                const dropdowns = [
                    '#student-select',
                    '#marks-student-select', 
                    '#blackmark-student-select'
                ];
                
                dropdowns.forEach(selector => {
                    const dropdown = Utils.dom.$(selector);
                    if (dropdown) {
                        // Clear existing options except the first one
                        dropdown.innerHTML = '<option value="">Choose a student...</option>';
                        
                        // Add student options
                        students.forEach(student => {
                            const option = document.createElement('option');
                            option.value = student._id;
                            option.textContent = `${student.name} (${student.regNo})`;
                            dropdown.appendChild(option);
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error loading students for dropdowns:', error);
        }
    }
    
    searchStudents(query) {
        if (!this.studentsData) return;
        
        const filtered = this.studentsData.filter(student => 
            student.name.toLowerCase().includes(query.toLowerCase()) ||
            student.regNo.toLowerCase().includes(query.toLowerCase()) ||
            student.email.toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderStudentsList(filtered);
    }
    
    async addNewStudent() {
        // Show add student modal/form
        const modalHtml = `
            <div class="modal" id="add-student-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Add New Student</h3>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    <form id="add-student-form">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" name="password" minlength="6" required>
                        </div>
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" name="personalInfo.name" required>
                        </div>
                        <div class="form-group">
                            <label>Registration Number</label>
                            <input type="text" name="personalInfo.regNo" required>
                        </div>
                        <div class="form-group">
                            <label>Mobile Number</label>
                            <input type="tel" name="contactInfo.mobile" required>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Create Student</button>
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const form = Utils.dom.$('#add-student-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAddStudent(form);
        });
    }
    
    async viewStudent(studentId) {
        try {
            const response = await API.getStudentById(studentId);
            if (response.success) {
                this.showStudentDetailsModal(response.data);
            }
        } catch (error) {
            Toast.show('Error loading student details', 'error');
        }
    }
    
    async editStudent(studentId) {
        try {
            const response = await API.getStudentById(studentId);
            if (response.success) {
                this.showEditStudentModal(response.data);
            }
        } catch (error) {
            Toast.show('Error loading student details', 'error');
        }
    }
    
    async handleAttendanceSubmission() {
        const form = Utils.dom.$('#attendance-form');
        const formData = new FormData(form);
        
        const data = {
            month: formData.get('attendance-month'),
            year: parseInt(formData.get('attendance-year')),
            daysPresent: parseInt(formData.get('days-present')),
            totalDays: parseInt(formData.get('total-days'))
        };
        
        const studentId = Utils.dom.$('#student-select').value;
        const studentName = Utils.dom.$('#student-select option:checked').textContent;
        
        try {
            const response = await API.addStudentAttendance(studentId, data);
            if (response.success) {
                Toast.show('Attendance recorded successfully', 'success');
                form.reset();
                
                // Notify admins about attendance record
                const percentage = Math.round((data.daysPresent / data.totalDays) * 100);
                await this.notifyAdmins(
                    'Attendance Recorded',
                    `Attendance recorded for ${studentName}: ${percentage}% (${data.daysPresent}/${data.totalDays} days) for ${data.month} ${data.year}`,
                    percentage < 75 ? 'warning' : 'info',
                    'attendance'
                );
            }
        } catch (error) {
            Toast.show('Error recording attendance: ' + error.message, 'error');
        }
    }
    
    async handleMarksSubmission() {
        const studentId = Utils.dom.$('#marks-student-select').value;
        const subjectName = Utils.dom.$('#subject-name').value;
        const marks = parseFloat(Utils.dom.$('#subject-marks').value);
        const studentName = Utils.dom.$('#marks-student-select option:checked').textContent;
        
        try {
            const response = await API.addSubject({
                studentId,
                subjectName,
                marks
            });
            
            if (response.success) {
                Toast.show('Subject marks added successfully', 'success');
                Utils.dom.$('#marks-form').reset();
                this.loadStudentSubjects(studentId);
                
                // Notify admins about marks entry
                await this.notifyAdmins(
                    'Marks Added',
                    `Marks added for ${studentName}: ${subjectName} - ${marks}/100`,
                    marks < 40 ? 'warning' : 'success',
                    'academic'
                );
            }
        } catch (error) {
            Toast.show('Error adding subject: ' + error.message, 'error');
        }
    }
    
    async handleBlackmarkSubmission() {
        const studentId = Utils.dom.$('#blackmark-student-select').value;
        const reason = Utils.dom.$('#blackmark-reason').value;
        const severity = Utils.dom.$('#blackmark-severity').value;
        const studentName = Utils.dom.$('#blackmark-student-select option:checked').textContent;
        
        try {
            const response = await API.addStudentBlackmark(studentId, {
                reason,
                severity
            });
            
            if (response.success) {
                Toast.show('Blackmark assigned successfully', 'success');
                Utils.dom.$('#blackmark-form').reset();
                
                // Notify admins about blackmark assignment
                await this.notifyAdmins(
                    'Blackmark Assigned',
                    `${severity} severity blackmark assigned to ${studentName}: ${reason}`,
                    severity === 'High' ? 'error' : severity === 'Medium' ? 'warning' : 'info',
                    'blackmark'
                );
            }
        } catch (error) {
            Toast.show('Error assigning blackmark: ' + error.message, 'error');
        }
    }
    
    async loadStudentSubjects(studentId) {
        try {
            const response = await API.getStudentAcademics(studentId);
            if (response.success) {
                this.renderStudentSubjects(response.data);
            }
        } catch (error) {
            console.error('Error loading student subjects:', error);
        }
    }
    
    renderStudentSubjects(data) {
        const container = Utils.dom.$('#student-subjects');
        const subjects = data.academics.subjects || [];
        
        if (subjects.length === 0) {
            container.innerHTML = `
                <div class="info-card">
                    <div class="card-header">
                        <i class="fas fa-info-circle"></i>
                        <h3>No Subjects</h3>
                    </div>
                    <div class="card-content">
                        No subjects found for ${data.studentInfo.name}.
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="info-card">
                <div class="card-header">
                    <i class="fas fa-book"></i>
                    <h3>${data.studentInfo.name} - Subjects</h3>
                </div>
                <div class="card-content">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Marks</th>
                                <th>Added Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${subjects.map(subject => `
                                <tr>
                                    <td>${subject.name}</td>
                                    <td>${subject.marks}</td>
                                    <td>${new Date(subject.addedAt).toLocaleDateString()}</td>
                                    <td>
                                        <button class="btn btn-sm btn-error" onclick="AdminDashboard.removeSubject('${data.studentInfo._id}', '${subject._id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="mt-3">
                        <p><strong>Total Marks:</strong> ${data.academics.totalMarks}</p>
                        <p><strong>Average:</strong> ${data.academics.averagePercentage}%</p>
                        <p><strong>CGPA:</strong> ${data.academics.cgpa}</p>
            </div>
        `;
    }
    
    async deleteStudent(studentId) {
        if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
            try {
                const response = await API.deleteStudent(studentId);
                if (response.success) {
                    Toast.show('Student deleted successfully', 'success');
                    // Reload the students list to reflect the deletion
                    await this.loadStudentsManagementSection();
                }
            } catch (error) {
                Toast.show('Error deleting student: ' + error.message, 'error');
            }
        }
    }
    
    showCreateNotificationForm() {
        Utils.dom.show('#create-notification-form');
    }
    
    hideCreateNotificationForm() {
        Utils.dom.hide('#create-notification-form');
    }
    
    async loadNotifications() {
        try {
            const response = await API.getNotifications();
            if (response.success) {
                this.renderNotifications(response.data.notifications);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            Utils.dom.$('#notifications-container').innerHTML = `
                <div class="error-message">Error loading notifications</div>
            `;
        }
    }
    
    renderNotifications(notifications) {
        const container = Utils.dom.$('#notifications-container');
        
        if (!notifications || notifications.length === 0) {
            container.innerHTML = `
                <div class="info-message">No notifications found</div>
            `;
            return;
        }
        
        container.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.type}">
                <div class="notification-header">
                    <h4>${notification.title}</h4>
                    <span class="notification-time">${new Date(notification.createdAt).toLocaleString()}</span>
                </div>
                <p>${notification.message}</p>
                <div class="notification-actions">
                    <button class="btn btn-sm btn-error" onclick="AdminDashboard.deleteNotification('${notification._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    async handleNotificationSubmission() {
        const title = Utils.dom.$('#notification-title').value;
        const message = Utils.dom.$('#notification-message').value;
        const type = Utils.dom.$('#notification-type').value;
        const recipients = Array.from(Utils.dom.$('#notification-recipients').selectedOptions).map(option => option.value);
        
        try {
            // Get recipient user IDs based on selection
            let recipientIds = [];
            
            if (recipients.includes('all') || recipients.includes('students')) {
                const studentsResponse = await API.getAllStudents();
                if (studentsResponse.success) {
                    recipientIds = [...recipientIds, ...studentsResponse.data.students.map(s => s.userId)];
                }
            }
            
            if (recipients.includes('all') || recipients.includes('admins')) {
                // Add logic to get admin IDs if needed
                // For now, we'll send to current admin
                const currentUser = JSON.parse(localStorage.getItem('smart_mentor_user'));
                recipientIds.push(currentUser.id);
            }
            
            const response = await API.createNotification({
                title,
                message,
                type,
                recipients: recipientIds
            });
            
            if (response.success) {
                Toast.show('Notification sent successfully', 'success');
                Utils.dom.$('#new-notification-form').reset();
                this.hideCreateNotificationForm();
                this.loadNotifications();
            }
        } catch (error) {
            Toast.show('Error sending notification: ' + error.message, 'error');
        }
    }
    
    async deleteNotification(notificationId) {
        if (confirm('Are you sure you want to delete this notification?')) {
            try {
                const response = await API.deleteNotification(notificationId);
                if (response.success) {
                    Toast.show('Notification deleted successfully', 'success');
                    this.loadNotifications();
                }
            } catch (error) {
                Toast.show('Error deleting notification: ' + error.message, 'error');
            }
        }
    }
    
    // Auto-notification methods for system activities
    async notifyAdmins(title, message, type = 'info', category = 'system') {
        try {
            // Get all admin users
            const admins = await this.getAdminUsers();
            
            if (admins.length > 0) {
                await API.createNotification({
                    title,
                    message,
                    type,
                    recipients: admins.map(admin => admin._id)
                });
            }
        } catch (error) {
            console.error('Error sending admin notification:', error);
        }
    }
    
    async getAdminUsers() {
        try {
            // This would need to be implemented in the backend
            // For now, return current user as admin
            const currentUser = JSON.parse(localStorage.getItem('smart_mentor_user'));
            return [{ _id: currentUser.id, email: currentUser.email }];
        } catch (error) {
            console.error('Error getting admin users:', error);
            return [];
        }
    }
}

// Create global instance
const AdminDashboard = new AdminDashboardManager();

// Make globally available
window.AdminDashboard = AdminDashboard;
