# EduPulse

EduPulse is a student management platform organized as a React frontend and a Spring Boot microservices backend. The frontend communicates with the backend through the API gateway, while Eureka provides service discovery.

## Repository Structure

```text
SOA P/
├── backend/
│   ├── api-gateway/        # Gateway and request routing
│   ├── auth_service/       # Authentication and JWT authorization
│   ├── student-service/    # Student records and enrolment
│   ├── attendance-service/ # Attendance data and summaries
│   ├── result-service/     # Results, transcripts, and GPA data
│   └── eureka_server/      # Service registry
└── frontend/               # React and Vite web application
```

## Technology Stack

- **Frontend:** React 18, Vite, React Router, Axios, Tailwind CSS, Recharts, Framer Motion
- **Backend:** Java 21, Spring Boot, Spring Cloud Gateway, Spring Cloud Netflix Eureka
- **Data and security:** PostgreSQL, Spring Data JPA, Spring Security, JWT
- **Build tools:** Maven Wrapper for each backend service and npm for the frontend

## Services

| Component | Port | Purpose |
| --- | ---: | --- |
| Eureka Server | 8761 | Service registration and discovery |
| API Gateway | 8080 | Single backend entry point and routing |
| Auth Service | 8081 | Login, authentication, and JWT verification |
| Student Service | 8082 | Student information and enrolment |
| Attendance Service | 8083 | Attendance records and summaries |
| Result Service | 8084 | Results, transcripts, and GPA computation |
| Frontend | 5173 | Web user interface during Vite development |

Frontend API requests are routed through `http://localhost:8080` using paths such as `/api/auth`, `/api/students`, `/api/attendance`, and `/api/results`.

## Prerequisites

Install the following before running the project:

- Java 21
- Node.js and npm
- PostgreSQL

Create the databases expected by the services:

- `auth_db`
- `student_db`
- `attendance_db`
- `result_db`

The current local configuration uses PostgreSQL on `localhost:5432` with username `postgres`. Review each service's `src/main/resources/application.properties` before running in another environment. Do not use development credentials or JWT secrets in production.

## Running the Backend

Start Eureka first, then start the remaining services. Open a separate terminal for each service:

```powershell
cd backend/eureka_server
.\mvnw.cmd spring-boot:run
```

```powershell
cd backend/auth_service
.\mvnw.cmd spring-boot:run
```

```powershell
cd backend/student-service
.\mvnw.cmd spring-boot:run
```

```powershell
cd backend/attendance-service
.\mvnw.cmd spring-boot:run
```

```powershell
cd backend/result-service
.\mvnw.cmd spring-boot:run
```

```powershell
cd backend/api-gateway
.\mvnw.cmd spring-boot:run
```

The Eureka dashboard is available at `http://localhost:8761`. The gateway is available at `http://localhost:8080`.

To build an individual service without starting it:

```powershell
cd backend/<service-directory>
.\mvnw.cmd clean package
```

## Running the Frontend

```powershell
cd frontend
npm install
npm run dev
```

Vite normally serves the application at `http://localhost:5173`.

Available npm scripts:

- `npm run dev` starts the development server.
- `npm run build` creates a production build in `frontend/dist`.
- `npm run preview` previews the production build locally.

## Configuration and Git

The root `.gitignore` covers generated Maven output, Node dependencies, Vite builds, IDE metadata, logs, and local environment files across both projects. Keep passwords, JWT secrets, and other machine-specific settings out of committed files; use environment-specific configuration for shared or production deployments.
