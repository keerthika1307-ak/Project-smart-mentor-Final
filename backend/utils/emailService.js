const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter configuration error:', error);
  } else {
    console.log('📧 Email service is ready to send messages');
  }
});

/**
 * Send attendance notification email to student
 * @param {Object} studentData - Student information
 * @param {Object} attendanceData - Attendance record
 * @returns {Promise} - Email send result
 */
const sendAttendanceNotification = async (studentData, attendanceData) => {
  try {
    const { name, regNo } = studentData.personalInfo;
    const { email } = studentData.userId;
    const { month, year, daysPresent, totalDays, percentage } = attendanceData;

    // Calculate overall attendance
    const overallAttendance = studentData.attendance.length > 0
      ? studentData.attendance.reduce((sum, att) => sum + att.percentage, 0) / studentData.attendance.length
      : percentage;

    // Determine attendance status and styling
    let statusColor = '#28a745'; // Green for good attendance
    let statusText = 'Good';
    let statusIcon = '✅';
    
    if (percentage < 75) {
      statusColor = '#dc3545'; // Red for poor attendance
      statusText = 'Needs Improvement';
      statusIcon = '⚠️';
    } else if (percentage < 85) {
      statusColor = '#ffc107'; // Yellow for average attendance
      statusText = 'Average';
      statusIcon = '⚡';
    }

    const emailHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Attendance Update - Smart Mentor</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                background: white;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #007bff;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #007bff;
                margin: 0;
                font-size: 28px;
            }
            .header p {
                color: #6c757d;
                margin: 5px 0 0 0;
                font-size: 16px;
            }
            .student-info {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 25px;
            }
            .student-info h3 {
                margin-top: 0;
                color: #495057;
                font-size: 18px;
            }
            .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 8px 0;
                border-bottom: 1px solid #e9ecef;
            }
            .info-row:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            .info-label {
                font-weight: 600;
                color: #495057;
            }
            .info-value {
                color: #6c757d;
            }
            .attendance-card {
                background: linear-gradient(135deg, ${statusColor}15, ${statusColor}05);
                border: 2px solid ${statusColor};
                border-radius: 10px;
                padding: 25px;
                margin: 25px 0;
                text-align: center;
            }
            .attendance-status {
                font-size: 24px;
                font-weight: bold;
                color: ${statusColor};
                margin-bottom: 15px;
            }
            .attendance-percentage {
                font-size: 48px;
                font-weight: bold;
                color: ${statusColor};
                margin: 15px 0;
            }
            .attendance-details {
                display: flex;
                justify-content: space-around;
                margin-top: 20px;
                flex-wrap: wrap;
            }
            .detail-item {
                text-align: center;
                margin: 10px;
            }
            .detail-number {
                font-size: 24px;
                font-weight: bold;
                color: #495057;
            }
            .detail-label {
                font-size: 14px;
                color: #6c757d;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .overall-stats {
                background: #e3f2fd;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
            }
            .overall-stats h4 {
                margin-top: 0;
                color: #1976d2;
                text-align: center;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
                color: #6c757d;
                font-size: 14px;
            }
            .footer a {
                color: #007bff;
                text-decoration: none;
            }
            .tips {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
            }
            .tips h4 {
                color: #856404;
                margin-top: 0;
            }
            .tips ul {
                color: #856404;
                margin: 0;
                padding-left: 20px;
            }
            @media (max-width: 600px) {
                .attendance-details {
                    flex-direction: column;
                }
                .detail-item {
                    margin: 5px 0;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📚 Smart Mentor</h1>
                <p>Attendance Update Notification</p>
            </div>

            <div class="student-info">
                <h3>👨‍🎓 Student Information</h3>
                <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Registration No:</span>
                    <span class="info-value">${regNo}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${email}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Period:</span>
                    <span class="info-value">${month} ${year}</span>
                </div>
            </div>

            <div class="attendance-card">
                <div class="attendance-status">
                    ${statusIcon} Attendance Status: ${statusText}
                </div>
                <div class="attendance-percentage">${percentage.toFixed(1)}%</div>
                
                <div class="attendance-details">
                    <div class="detail-item">
                        <div class="detail-number">${daysPresent}</div>
                        <div class="detail-label">Days Present</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-number">${totalDays - daysPresent}</div>
                        <div class="detail-label">Days Absent</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-number">${totalDays}</div>
                        <div class="detail-label">Total Days</div>
                    </div>
                </div>
            </div>

            <div class="overall-stats">
                <h4>📊 Overall Attendance Statistics</h4>
                <div class="info-row">
                    <span class="info-label">Overall Attendance:</span>
                    <span class="info-value" style="font-weight: bold; color: ${overallAttendance >= 75 ? '#28a745' : '#dc3545'};">
                        ${overallAttendance.toFixed(1)}%
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Total Records:</span>
                    <span class="info-value">${studentData.attendance.length} month(s)</span>
                </div>
            </div>

            ${percentage < 75 ? `
            <div class="tips">
                <h4>💡 Tips to Improve Attendance</h4>
                <ul>
                    <li>Set daily reminders for classes</li>
                    <li>Plan your schedule in advance</li>
                    <li>Communicate with mentors about any issues</li>
                    <li>Maintain a consistent daily routine</li>
                    <li>Track your attendance regularly</li>
                </ul>
            </div>
            ` : ''}

            <div class="footer">
                <p>This is an automated notification from Smart Mentor System.</p>
                <p>For any queries, please contact your mentor or visit the <a href="#">student portal</a>.</p>
                <p><strong>Stay disciplined, stay successful! 🎯</strong></p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: `"Smart Mentor System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `📊 Attendance Update - ${month} ${year} | ${name}`,
      html: emailHTML,
      text: `
        Smart Mentor - Attendance Update
        
        Dear ${name},
        
        Your attendance for ${month} ${year} has been updated:
        
        Days Present: ${daysPresent}
        Total Days: ${totalDays}
        Attendance Percentage: ${percentage.toFixed(1)}%
        Overall Attendance: ${overallAttendance.toFixed(1)}%
        
        ${percentage < 75 ? 'Please improve your attendance to maintain academic discipline.' : 'Keep up the good work!'}
        
        Best regards,
        Smart Mentor Team
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`📧 Attendance email sent to ${email}:`, result.messageId);
    return result;

  } catch (error) {
    console.error('Error sending attendance email:', error);
    throw error;
  }
};

/**
 * Send bulk attendance notifications to multiple students
 * @param {Array} studentsData - Array of student data with attendance
 * @returns {Promise} - Results of all email sends
 */
const sendBulkAttendanceNotifications = async (studentsData) => {
  try {
    const emailPromises = studentsData.map(({ student, attendance }) => 
      sendAttendanceNotification(student, attendance)
    );
    
    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    console.log(`📊 Bulk attendance emails: ${successful} sent, ${failed} failed`);
    
    return {
      successful,
      failed,
      results
    };
  } catch (error) {
    console.error('Error sending bulk attendance emails:', error);
    throw error;
  }
};

/**
 * Send blackmark notification email to student
 * @param {Object} studentData - Student information
 * @param {Object} blackmarkData - Blackmark details
 * @param {Object} mentorData - Mentor information
 * @returns {Promise} - Email send result
 */
const sendBlackmarkNotification = async (studentData, blackmarkData, mentorData) => {
  try {
    console.log('📧 [EmailService] Starting blackmark notification...');
    console.log('📧 [EmailService] Student data:', {
      name: studentData.personalInfo.name,
      email: studentData.userId.email
    });
    console.log('📧 [EmailService] Blackmark data:', blackmarkData);
    console.log('📧 [EmailService] Mentor data:', { email: mentorData.email });
    
    const { name, regNo } = studentData.personalInfo;
    const { email } = studentData.userId;
    const { reason, severity, assignedDate } = blackmarkData;
    const mentorName = mentorData.email.split('@')[0] || 'Your Mentor';
    
    console.log('📧 [EmailService] Extracted data:', {
      studentName: name,
      studentEmail: email,
      mentorName: mentorName,
      reason: reason,
      severity: severity
    });

    // Determine severity styling
    let severityColor = '#ffc107'; // Yellow for Low
    let severityIcon = '⚠️';
    let severityMessage = 'Please be mindful of your behavior and academic conduct.';
    
    if (severity === 'High') {
      severityColor = '#dc3545'; // Red for High
      severityIcon = '🚨';
      severityMessage = 'This is a serious matter. Please schedule a meeting with your mentor immediately.';
    } else if (severity === 'Medium') {
      severityColor = '#fd7e14'; // Orange for Medium
      severityIcon = '⚡';
      severityMessage = 'Please take corrective action to avoid further disciplinary measures.';
    }

    const emailHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Blackmark Notification - Smart Mentor</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                background: white;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid ${severityColor};
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: ${severityColor};
                margin: 0;
                font-size: 28px;
            }
            .header p {
                color: #6c757d;
                margin: 5px 0 0 0;
                font-size: 16px;
            }
            .alert-banner {
                background: linear-gradient(135deg, ${severityColor}15, ${severityColor}05);
                border: 2px solid ${severityColor};
                border-radius: 10px;
                padding: 25px;
                margin: 25px 0;
                text-align: center;
            }
            .severity-status {
                font-size: 24px;
                font-weight: bold;
                color: ${severityColor};
                margin-bottom: 15px;
            }
            .blackmark-reason {
                font-size: 18px;
                font-weight: 600;
                color: #495057;
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid ${severityColor};
            }
            .student-info {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 25px;
            }
            .student-info h3 {
                margin-top: 0;
                color: #495057;
                font-size: 18px;
            }
            .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 8px 0;
                border-bottom: 1px solid #e9ecef;
            }
            .info-row:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            .info-label {
                font-weight: 600;
                color: #495057;
            }
            .info-value {
                color: #6c757d;
            }
            .mentor-info {
                background: #e3f2fd;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
            }
            .mentor-info h4 {
                margin-top: 0;
                color: #1976d2;
                text-align: center;
            }
            .next-steps {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
            }
            .next-steps h4 {
                color: #856404;
                margin-top: 0;
            }
            .next-steps ul {
                color: #856404;
                margin: 0;
                padding-left: 20px;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
                color: #6c757d;
                font-size: 14px;
            }
            .footer a {
                color: #007bff;
                text-decoration: none;
            }
            .important-note {
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                font-weight: 500;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📚 Smart Mentor</h1>
                <p>Disciplinary Notification</p>
            </div>

            <div class="alert-banner">
                <div class="severity-status">
                    ${severityIcon} ${severity} Severity Blackmark Assigned
                </div>
                <p style="margin: 0; color: #6c757d; font-size: 16px;">
                    Your mentor has notified a blackmark about you
                </p>
            </div>

            <div class="student-info">
                <h3>👨‍🎓 Student Information</h3>
                <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Registration No:</span>
                    <span class="info-value">${regNo}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${email}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Date Assigned:</span>
                    <span class="info-value">${new Date(assignedDate).toLocaleDateString()}</span>
                </div>
            </div>

            <div class="blackmark-reason">
                <strong>Reason:</strong> ${reason}
            </div>

            <div class="mentor-info">
                <h4>👨‍🏫 Assigned By</h4>
                <div class="info-row">
                    <span class="info-label">Mentor:</span>
                    <span class="info-value">${mentorName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Severity Level:</span>
                    <span class="info-value" style="color: ${severityColor}; font-weight: bold;">${severity}</span>
                </div>
            </div>

            <div class="important-note">
                <strong>Important:</strong> ${severityMessage}
            </div>

            <div class="next-steps">
                <h4>📋 Next Steps</h4>
                <ul>
                    <li>Review the reason for this blackmark carefully</li>
                    <li>Reflect on your behavior and academic conduct</li>
                    <li>Schedule a meeting with your mentor to discuss</li>
                    <li>Take corrective measures to avoid future incidents</li>
                    <li>Focus on maintaining disciplinary standards</li>
                </ul>
            </div>

            <div class="footer">
                <p>This is an automated notification from Smart Mentor System.</p>
                <p>For any queries, please contact your mentor immediately.</p>
                <p><strong>Maintain discipline, achieve excellence! 🎯</strong></p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: `"Smart Mentor System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🚨 Blackmark Notification - ${severity} Severity | ${name}`,
      html: emailHTML,
      text: `
        Smart Mentor - Blackmark Notification
        
        Dear ${name},
        
        Your mentor has assigned a ${severity} severity blackmark to you.
        
        Reason: ${reason}
        Assigned by: ${mentorName}
        Date: ${new Date(assignedDate).toLocaleDateString()}
        
        ${severityMessage}
        
        Please contact your mentor to discuss this matter and take appropriate corrective action.
        
        Best regards,
        Smart Mentor Team
      `
    };

    console.log('📧 [EmailService] Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`📧 [EmailService] Blackmark email sent successfully!`);
    console.log(`📧 [EmailService] Message ID: ${result.messageId}`);
    console.log(`📧 [EmailService] Response: ${result.response}`);
    return result;

  } catch (error) {
    console.error('Error sending blackmark email:', error);
    throw error;
  }
};

module.exports = {
  sendAttendanceNotification,
  sendBulkAttendanceNotifications,
  sendBlackmarkNotification,
  transporter
};
