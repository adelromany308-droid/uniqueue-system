# UniQueue — Smart Queue Management System

UniQueue is a university queue-management application with separate experiences for students, staff, and administrators. Students can book and follow queue tokens, while staff and admins manage services and queue activity.

## Features

- Role-based registration, sign-in, and protected pages
- Service listings and queue-token booking
- Student, staff, and admin dashboards
- Live queue updates with Socket.IO
- Feedback and service management APIs
- MongoDB data models and Express REST endpoints

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React, Vite, React Router, Axios, Tailwind CSS |
| Backend | Node.js, Express, Mongoose |
| Data and live updates | MongoDB, Socket.IO |
| Authentication | JWT, bcrypt |

## Project structure

- **uniqueue/frontend** — React application
- **uniqueue/backend** — Express API and Socket.IO server

## Run locally

You need Node.js and a MongoDB instance.

1. Configure the backend environment in **uniqueue/backend/.env**:

   ~~~env
   MONGODB_URI=mongodb://127.0.0.1:27017/uniqueue
   JWT_SECRET=replace-with-a-long-random-secret
   FRONTEND_URL=http://localhost:3000
   PORT=5000
   ~~~

2. In one terminal, install and start the backend:

   ~~~bash
   cd uniqueue/backend
   npm install
   npm run dev
   ~~~

3. In a second terminal, install and start the frontend:

   ~~~bash
   cd uniqueue/frontend
   npm install
   npm run dev
   ~~~

The Vite app runs on port **3000** and proxies API requests to the backend on port **5000**. The frontend also supports **VITE_API_URL** when you need a different API base URL.

## Repository

[Browse the source code](https://github.com/adelromany308-droid/uniqueue-system)
