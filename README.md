Live url: [click](https://placementconnect.netlify.app/)

# Placement Portal

A full-stack MERN-based placement portal built to streamline student-company-admin interactions for job applications, interviews, and recruitment workflows.

## Overview

This project allows:
- Students to register, log in, apply for jobs, upload resumes, and join interview sessions.
- Companies to post jobs, manage recruitment activities, and conduct real-time interviews.
- Admins to oversee platform operations, approve or manage users, and receive registration notifications.

## Tech Stack

- Frontend: React (Vite), Tailwind CSS (via CDN)
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Authentication: JWT and bcryptjs
- File Uploads: Multer
- Email Service: Brevo

## Key Features

- Role-based access control for Students, Companies, and Admins
- Secure authentication with JWT and hashed passwords
- Forgot password flow with OTP verification via Brevo
- Admin registration protected by a secret key
- Automatic filtering of expired jobs with persistence for applied applications
- Resume upload support using Multer
- Real-time video interviews powered by Jitsi Meet
- Automated email alerts sent to admins for new company registrations

## Project Structure

```bash
frontend/
  src/
  public/
  package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register a new user (Student/Company/Admin) |
| POST | `/api/login` | Authenticate a user |
| POST | `/api/forgot-password` | Send OTP for password reset |
| POST | `/api/verify-otp` | Verify the OTP |
| PUT | `/api/reset-password` | Set a new password |
| GET | `/api/jobs` | Fetch all valid jobs |

## Getting Started

### Prerequisites

- Node.js
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install frontend dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the backend and add the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
BREVO_API_KEY=your_brevo_api_key
ADMIN_SECRET_KEY=your_admin_secret_key
```

## Deployment

- Frontend: Add your Render URL here later
- Backend: Add your Render URL here