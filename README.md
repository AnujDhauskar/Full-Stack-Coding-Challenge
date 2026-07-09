# 🏪 Store Rating Platform

A full-stack **Store Rating Platform** built using the **MERN Stack** with **MySQL** as the database. The application implements **JWT Authentication**, **Role-Based Access Control (RBAC)**, and separate dashboards for **Admin**, **Normal Users**, and **Store Owners**.

This project was developed as part of a **Full Stack Developer Coding Challenge**.

<img width="970" height="795" alt="image" src="https://github.com/user-attachments/assets/9d590f8d-3ed9-4005-8499-1d924acb567b" />

<img width="670" height="896" alt="image" src="https://github.com/user-attachments/assets/dfaea212-8ee3-4b59-b9f4-1451915ec23b" />


<img width="1637" height="723" alt="image" src="https://github.com/user-attachments/assets/a05d176a-7a33-48b9-9fdb-9cbb393a2f6d" />

<img width="1575" height="791" alt="image" src="https://github.com/user-attachments/assets/d3302161-3ffa-4453-861f-8e7cadd74b78" />



---

## 🚀 Features

### 🔐 Authentication & Authorization

- JWT Authentication
- Secure Password Hashing using bcrypt
- Role-Based Access Control (RBAC)
- Protected Routes
- Persistent Login Sessions

---

## 👥 User Roles

### 👨‍💼 Admin

- Secure Login
- Dashboard Overview
- Add New Users
- Add New Stores
- View All Users
- View All Stores
- View Total Users
- View Total Stores
- View Total Ratings
- Filter Users
- Filter Stores
- View Store Ratings
- Logout

---

### 👤 Normal User

- User Registration
- Secure Login
- Update Password
- Browse All Stores
- Search Stores
- View Average Ratings
- Submit Rating (1-5)
- Update Submitted Rating
- Logout

---

### 🏬 Store Owner

- Secure Login
- Update Password
- View Dashboard
- View Average Store Rating
- View Users Who Rated Store
- Logout

---

## 📊 Dashboard Features

### Admin Dashboard

- Total Users
- Total Stores
- Total Ratings
- User Management
- Store Management
- Advanced Filtering

### User Dashboard

- Browse Stores
- Search Stores
- Submit Ratings
- Update Ratings

### Store Owner Dashboard

- Average Rating
- Users Who Rated Store
- Rating Analytics

---

# 🛠 Tech Stack

## Frontend

- React.js
- React Router DOM
- Axios
- CSS / Tailwind CSS *(if used)*
- Context API / Redux *(if used)*

---

## Backend

- Node.js
- Express.js
- JWT Authentication
- bcrypt
- REST APIs

---

## Database

- MySQL
- MySQL Workbench

---

## Authentication

- JSON Web Tokens (JWT)
- Password Encryption (bcrypt)
- Role-Based Authorization
- Protected APIs

---

# 📂 Project Structure

```
Store-Rating-Platform/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── Components/
│   │   ├── Pages/
│   │   ├── Layout/
│   │   ├── Services/
│   │   ├── Hooks/
│   │   ├── Utils/
│   │   └── App.jsx
│
├── backend/
│   ├── Controllers/
│   ├── Routes/
│   ├── Middleware/
│   ├── Models/
│   ├── Config/
│   ├── Utils/
│   ├── Database/
│   └── server.js
│
└── README.md
```

---

# ⚙️ Installation

## 1. Clone Repository

```bash
git clone https://github.com/your-username/store-rating-platform.git
```

```bash
cd store-rating-platform
```

---

## 2. Backend Setup

```bash
cd backend
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=store_rating

JWT_SECRET=your_jwt_secret
```

Start Backend

```bash
npm run dev
```

---

## 3. Frontend Setup

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Start React App

```bash
npm run dev
```

---

# 🗄 Database

The project uses **MySQL** with **MySQL Workbench**.

Typical tables include:

- Users
- Stores
- Ratings

Relationships

```
User
   │
   ├──── submits ───► Rating ◄──── belongs to ─── Store
```

---

# 🔑 API Highlights

## Authentication

- POST /register
- POST /login
- PUT /change-password

---

## Admin

- Add User
- Add Store
- Get Users
- Get Stores
- Dashboard Statistics

---

## User

- Get Stores
- Submit Rating
- Update Rating

---

## Store Owner

- View Ratings
- View Average Rating

---

# ✅ Form Validations

### Name

- Minimum 20 characters
- Maximum 60 characters

### Address

- Maximum 400 characters

### Password

- 8–16 characters
- At least one uppercase letter
- At least one special character

### Email

- Standard email validation

---

# 🔒 Security Features

- JWT Authentication
- Password Hashing using bcrypt
- Protected Routes
- Role-Based Authorization
- Secure API Access
- Input Validation

---

# 📈 Future Improvements

- Email Verification
- Forgot Password
- Profile Images
- Pagination
- Dark Mode
- Admin Analytics Charts
- Notifications
- Docker Deployment
- CI/CD Pipeline
- Unit & Integration Testing

---

# 📸 Screenshots

Add screenshots of:

- Login Page
- Register Page
- Admin Dashboard
- User Dashboard
- Store Owner Dashboard
- Store Listing
- Rating Page

---

# 👨‍💻 Author

**Anuj Dhauskar**

Full Stack Developer | MERN Stack | DevOps | AI Integration

GitHub:https://github.com/AnujDhauskar

LinkedIn: https://www.linkedin.com/in/anuj-dhauskar/

---

# ⭐ If you found this project useful, don't forget to give it a star!
