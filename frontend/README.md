# EduPulse Academy — Institutional Frontend Web Platform

EduPulse Academy is an enterprise-grade Student Information & Academic Performance Management Platform built upon a distributed Service-Oriented Architecture (SOA) with Spring Boot microservices, Spring Cloud Gateway, Netflix Eureka, and a PostgreSQL database (`soa_hack`).

The frontend is a light-themed Single-Page Application (SPA) developed with **React + Vite**, **Vanilla CSS & TailwindCSS design tokens**, **Lucide Icons**, and **Recharts**.

---

## 🏛️ System Architecture & Services Map

| Service Name | Port | Base URL / Path | Architectural Function |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | `5173` | `http://localhost:5173` | React 18 + Vite SPA client interface |
| **API Gateway** | `8080` | `http://localhost:8080` | Edge router, CORS gateway & JWT forwarder |
| **Eureka Server** | `8761` | `http://localhost:8761` | Dynamic microservice discovery registry |
| **Auth Service** | `8081` | `http://localhost:8081` | JWT token issuer & role authorization provider |
| **Student Service** | `8082` | `http://localhost:8082` | Student demographics, profiles & Saga orchestrator |
| **Attendance Service** | `8083` | `http://localhost:8083` | Daily attendance engine & percentage calculator |
| **Result Service** | `8084` | `http://localhost:8084` | Grading calculation, transcripts & GPA engine |
| **SOAP Student Lookup**| `8085` | `http://localhost:8085` | Legacy SOAP 1.1 WSDL endpoint (`/ws`) |
| **PostgreSQL Database** | `5433` | `localhost:5433/soa_hack`| Schemas: `auth`, `student`, `attendance`, `result` |

---

## 🎨 Design System Palette (Phase 2 Light Theme)

- **Background:** `#F5F7FB` (`--color-bg-base`)
- **Main Surfaces:** `#FFFFFF` (`--color-surface`)
- **Primary Blue:** `#3157D5` (`--color-primary`)
- **Secondary Indigo:** `#6574CD` (`--color-secondary`)
- **Main Text:** `#172033` (`--color-text-primary`)
- **Secondary Text:** `#69758A` (`--color-text-secondary`)
- **Borders & Dividers:** `#E4E9F2` (`--color-border`)
- **Success / Present:** `#16865C` (`--color-success`)
- **Warning / Pending:** `#D78B18` (`--color-warning`)
- **Error / Absent:** `#D64545` (`--color-error`)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **Java**: OpenJDK 17 or 21
- **Maven**: 3.8+
- **PostgreSQL**: Port 5433, Database `soa_hack`, User `postgres`

### 2. Environment Variables
Create a `.env` file in the `frontend` root:
```env
VITE_API_BASE_URL=http://localhost:8080
```
An example configuration is provided in `.env.example`.

### 3. Installation & Development Server
```powershell
cd frontend
npm install
npm run dev
```
The application will launch on `http://localhost:5173`.

### 4. Production Build & Preview
```powershell
npm run build
npm run preview
```

---

## 🔐 Verified Demo Credentials

The platform features one-click demo login selectors on the login page:

| Role | Username | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Central Admin** | `admin` | `Admin123` | Full access: `/admin`, `/students`, `/attendance`, `/results`, `/users`, `/services`, `/soap-lookup` |
| **Faculty Instructor** | `faculty1` | `Password@123` | Classroom access: `/faculty`, `/attendance`, `/results`, `/students`, `/soap-lookup` |
| **Student Scholar** | `STU1001` | `Student@123` | Personal academic access: `/student`, `/student/profile`, `/student/attendance`, `/student/results`, `/soap-lookup` |

---

## 🧪 Integration Testing & Verification

A comprehensive automated verification script is provided at the repository root:
```powershell
powershell -ExecutionPolicy Bypass -File .\test-fullstack-integration.ps1
```

This script verifies:
1. All 4 Gateway health endpoints (`/api/{auth,students,attendance,results}/health`)
2. Role-based JWT authentication (`ROLE_ADMIN`, `ROLE_FACULTY`, `ROLE_STUDENT`, 401 on bad credentials)
3. Student CRUD operations with verification directly in PostgreSQL (`soa_hack`)
4. Daily attendance logging and percentage calculation
5. Academic result recording with automatic UGC 10-point GPA calculation
6. Legacy SOAP 1.1 WSDL query execution through API Gateway (`POST /ws`)
7. Saga distributed transaction orchestrator with rollback compensation simulation

---

## 🔗 Key Administrative Links

- **Application Web Portal:** [http://localhost:5173](http://localhost:5173)
- **Spring Cloud Gateway:** [http://localhost:8080](http://localhost:8080)
- **Interactive Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Netflix Eureka Dashboard:** [http://localhost:8761](http://localhost:8761)
- **SOAP WSDL Definition:** [http://localhost:8080/ws/students.wsdl](http://localhost:8080/ws/students.wsdl)
