# 🧠 Smart Mentor Note

**Smart Mentor Note** is an intelligent student–mentor management system designed to bridge communication gaps, streamline student tracking, and enhance academic guidance using AI-powered insights and digital automation.

---

## 🚀 Project Overview

Smart Mentor Note provides a **centralized platform** for mentors and mentees to interact, monitor academic progress, and receive automated feedback.
The system tracks performance, attendance, backlogs, and achievements while offering AI-generated feedback, alerts, and credit-based evaluations.

---

## 🎯 Key Features

### 👨‍🏫 Mentor Dashboard

* View assigned mentees and their profiles
* Track attendance, CGPA, and backlog status
* Provide feedback and credit-based evaluations
* AI-generated personalized feedback for mentees

### 🎓 Mentee Dashboard

* Track semester-wise scores, CGPA, and attendance
* Receive automated performance insights
* Upload certificates for credit scoring
* Get backlog alerts and academic guidance

### 📚 Admin Dashboard

* Manage mentors, mentees, and system roles
* Upload materials like syllabus, timetable, and notes
* Monitor student performance across departments
* Manage notifications and announcements

### ⚙️ Additional Modules

* **Blood Alert System:** Instantly notifies matching donors within the institution.
* **AI Feedback Generator:** Uses AI to produce personalized mentor remarks.
* **Credit-Based Tracking:** Calculates academic and activity credits.
* **Resource Uploads:** Syllabus, timetable, and study resources.
* **Notifications & Reminders:** Smart alerts for attendance, exams, and deadlines.
* **Live Chat System:** Secure real-time communication between mentors and mentees.

---

## 🧩 System Architecture

```
Frontend (React / HTML / CSS / JS)
        ↓
Backend (Node.js + Express.js)
        ↓
Database (MongoDB)
        ↓
AI Layer (Python / OpenAI API for feedback generation)
        ↓
Hosting (AWS EC2 / Render / Vercel)
```

---

## 🗄️ Database Schema (MongoDB)

**Collections:**

* `users` → Stores mentor/mentee/admin info (role-based access)
* `performance` → CGPA, attendance, backlog, and scores
* `feedback` → AI-generated and manual mentor feedback
* `resources` → Uploaded syllabus, timetable, and materials
* `credits` → Certificate and activity-based credit system
* `notifications` → System alerts and reminders

---

## 🧠 Tech Stack

| Layer              | Technology                    |
| ------------------ | ----------------------------- |
| Frontend           | HTML, CSS, JavaScript / React |
| Backend            | Node.js, Express.js           |
| Database           | MongoDB                       |
| Authentication     | JWT (JSON Web Tokens)         |
| Cloud & Deployment | AWS EC2 / Render              |
| Email Service      | Nodemailer API                |
| AI Integration     | OpenAI API                    |
| Version Control    | Git & GitHub                  |

---

## 🔐 Authentication Flow

1. Role-based login (Admin / Mentor / Mentee)
2. JWT token authentication for secure API calls
3. Password hashing with bcrypt
4. Session management and logout

---

## 📬 Email Notifications

* Mentor–mentee onboarding emails
* Attendance/CGPA alert mails
* Password recovery using **Nodemailer API**

---

## 🧪 Testing

* Postman for API testing
* Unit testing for routes and data validation
* Manual testing for dashboard functionality and login roles

---

## 🧭 Future Enhancements

* AI-powered prediction of academic performance trends
* Integration with LMS (Learning Management Systems)
* Mobile app version for instant access
* Smart reminders through WhatsApp or Telegram bot
* Cloud-based backup and analytics dashboard

---

## 💡 How to Run the Project

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/smart-mentor-note.git
   cd smart-mentor-note
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file and add:

   ```
   PORT=5000
   MONGO_URI=your_mongodb_url
   JWT_SECRET=your_secret_key
   EMAIL_USER=your_email
   EMAIL_PASS=your_password
   OPENAI_API_KEY=your_openai_key
   ```

4. **Run the backend**

   ```bash
   npm start
   ```

5. **Run the frontend** (if React or separate setup)

   ```bash
   npm run dev
   ```

6. **Access the app**

   ```
   http://localhost:5000
   ```

---

## 📜 License

This project is developed for academic and learning purposes.
Feel free to fork and enhance it with proper credits.

---

> 💬 “Smart mentoring is not about data — it’s about empowering growth through insight.”

---

**Made with ❤️ by Team Smart Mentor Note**
