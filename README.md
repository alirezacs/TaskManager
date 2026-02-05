# TaskManager (Full-Stack)

A full-stack task manager application built with a **Node.js (Express)** backend and a **Next.js** frontend.  
This project demonstrates clean full-stack architecture, RESTful APIs, and real-world frontend–backend integration.

## Tech Stack
- Backend: Node.js, Express
- Frontend: Next.js (React)
- Authentication: JWT
- Database: MongoDB

## Features
- User authentication (Register / Login)
- Create, edit, and delete tasks
- Task status management (To Do / Done)
- REST API integration
- Responsive user interface

## Project Structure
/backend - Node.js REST API
/frontend - Next.js web application


## Environment Variables
Each part of the project uses its own environment variables.

- Backend: `/backend/.env.example`
- Frontend: `/frontend/.env.example`

Create `.env` files based on these examples before running the project.

## Setup

### Backend
```bash
cd backend
npm install
npm run dev
