# Smart Appointment and Clinic Workflow System with Live Queue Tracking

Production-ready MERN stack clinic workflow platform with JWT authentication, smart slot booking, emergency-priority queue handling, Socket.io live updates, dashboards, Docker deployment, and Jenkins CI/CD.

## 1. Full Folder Structure

```text
python/
├── backend/
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       │   ├── db.js
│       │   └── socket.js
│       ├── controllers/
│       │   ├── adminController.js
│       │   ├── authController.js
│       │   ├── doctorController.js
│       │   └── patientController.js
│       ├── middlewares/
│       │   ├── authMiddleware.js
│       │   └── errorMiddleware.js
│       ├── models/
│       │   ├── Appointment.js
│       │   └── User.js
│       ├── routes/
│       │   ├── adminRoutes.js
│       │   ├── authRoutes.js
│       │   ├── doctorRoutes.js
│       │   └── patientRoutes.js
│       ├── services/
│       │   └── appointmentService.js
│       └── utils/
│           ├── generateToken.js
│           ├── queue.js
│           └── seedAdmin.js
├── frontend/
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile
│   ├── index.html
│   ├── nginx.conf
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       ├── api/
│       │   └── axios.js
│       ├── components/
│       │   ├── AppointmentTable.jsx
│       │   ├── DoctorCard.jsx
│       │   ├── LoadingSpinner.jsx
│       │   ├── QueuePanel.jsx
│       │   └── StatCard.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── hooks/
│       │   └── useQueueSocket.js
│       ├── layouts/
│       │   └── DashboardLayout.jsx
│       ├── pages/
│       │   ├── AdminDashboard.jsx
│       │   ├── DoctorDashboard.jsx
│       │   ├── LoginPage.jsx
│       │   ├── PatientDashboard.jsx
│       │   └── RegisterPage.jsx
│       ├── routes/
│       │   └── ProtectedRoute.jsx
│       └── utils/
│           └── formatters.js
├── docker-compose.yml
├── Jenkinsfile
└── README.md
```

## 2. Backend Overview

- Express + MongoDB + Mongoose
- JWT authentication with `patient`, `doctor`, and `admin` roles
- Smart slot booking using fixed 15-minute intervals
- Double-booking prevention per doctor, date, and slot
- Emergency patients prioritized in the queue
- Socket.io queue rooms using `queue:{doctorId}:{date}`
- Admin analytics for patient volume, peak hours, waiting time, and doctor performance

## 3. Frontend Overview

- React + Vite + Tailwind CSS
- Role-based protected routing
- Patient dashboard for booking and live queue tracking
- Doctor dashboard for queue management and next-patient actions
- Admin dashboard with Chart.js analytics and doctor management
- Toast notifications for booking success and turn alerts

## 4. Socket.io Integration

- Backend starts Socket.io inside `backend/src/server.js`
- Patients and doctors join queue rooms using `frontend/src/hooks/useQueueSocket.js`
- Queue changes emit `queue:update` events from `backend/src/utils/queue.js`
- Doctor queue movement and patient booking both trigger live broadcasts

## 5. Environment Files

### Backend `.env`

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/clinic_workflow
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d
ADMIN_NAME=System Admin
ADMIN_EMAIL=admin@clinic.com
ADMIN_PASSWORD=Admin@123
```

### Frontend `.env`

Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 6. Local Setup Instructions

1. Install Node.js 20+, npm, and MongoDB.
2. Create `backend/.env` and `frontend/.env` from the example files.
3. Install backend dependencies:

```bash
cd backend
npm install
```

4. Seed the admin account:

```bash
npm run seed:admin
```

If you run locally outside Docker, use `localhost` in `MONGO_URI`.
If you run with Docker Compose, the compose file already injects `mongodb://mongo:27017/clinic_workflow` for the backend container.

5. Start the backend:

```bash
npm run dev
```

6. In a second terminal, install and start the frontend:

```bash
cd frontend
npm install
npm run dev
```

7. Open `http://localhost:5173`.
8. Log in with the seeded admin account.
9. Add doctors from the admin dashboard.
10. Register patients from the frontend registration page and begin booking appointments.

## 7. Docker Setup Instructions

1. From the project root run:

```bash
docker compose up --build -d
```

2. Seed the admin user inside the backend container:

```bash
docker compose exec backend npm run seed:admin
```

3. Open:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000/api/health`

## 8. Jenkins CI/CD Notes

The included `Jenkinsfile` runs:

1. Clone repo
2. Install backend/frontend dependencies
3. Build frontend
4. Run backend smoke check
5. Build Docker images
6. Deploy containers with Docker Compose

## 9. Sample Workflow

1. Admin logs in and creates doctors.
2. Patient registers, selects a doctor, chooses a fixed slot, and optionally flags an emergency.
3. Appointment is saved with token number and queued based on emergency priority.
4. Patient dashboard listens for live queue updates.
5. Doctor clicks `Next Patient` to move the queue forward.
6. All subscribed clients see updated queue state instantly.
