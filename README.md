# EduPulse Academy — Service-Oriented Student Information & Academic Performance Platform
> **PS031 SOA Project** | Spring Boot Microservices, Service Discovery, Dynamic Gateway Routing, PostgreSQL Persistence, JWT Security, Apache Kafka & Isolated SOAP Interoperability.

---

## 1. Architectural Overview & Topology

EduPulse Academy decouples academic lifecycle workflows into autonomous, independently scalable Spring Boot microservices registered with Netflix Eureka, unified under Spring Cloud Gateway, and backed by PostgreSQL database `soa_hack` using logical schema-per-service isolation.

```text
                                  +-----------------------+
                                  | React Frontend (:5173)|
                                  +-----------+-----------+
                                              |
                                              v (HTTP REST)
                                  +-----------------------+
                                  |  API Gateway (:8080)  |
                                  +-----------+-----------+
                                              |
         +------------------------------------+-----------------------------------+
         | (lb://AUTH-SERVICE)                | (lb://STUDENT-SERVICE)            | (lb://ATTENDANCE-SERVICE)
         v                                    v                                   v
+------------------+                 +------------------+                +--------------------+
|  Auth Service    |                 |  Student Service |                | Attendance Service |
|      (:8081)     |                 |  (:8082, :8086)  |                |      (:8083)       |
+--------+---------+                 +--------+---------+                +---------+----------+
         |                                    |                                    |
         |                                    |                                    | (DiscoveryClient)
         |                                    +------------------------------------+
         |                                    |
         |                                    | (DiscoveryClient)
         |                                    v
         |                           +------------------+
         +-------------------------->|  Result Service  |
                                     |      (:8084)     |
                                     +--------+---------+
                                              |
       +--------------------------------------+------------------------------------+
       |                                      |                                    |
       v                                      v                                    v
+------------------+                 +------------------+                 +--------------------+
|  Eureka Server   |                 | PostgreSQL DB    |                 | SOAP Student Lookup|
|      (:8761)     |                 | (:5433, soa_hack)|                 |      (:8085)       |
+------------------+                 +------------------+                 +--------------------+
```

---

## 2. Microservices Directory & Port Map

| Component | Directory | Port | Protocol | Eureka ID | Primary Responsibility |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **Eureka Server** | `backend/eureka_server` | `8761` | HTTP | `EUREKA-SERVER` | Centralized Service Registry & Heartbeat Tracking |
| **API Gateway** | `backend/api-gateway` | `8080` | HTTP | `API-GATEWAY` | Reverse Proxy, Dynamic Routing (`lb://`), CORS Web Filter |
| **Auth Service** | `backend/auth_service` | `8081` | HTTP | `AUTH-SERVICE` | BCrypt User Authentication & HMAC-SHA256 JWT Issuance |
| **Student Service**| `backend/student-service`| `8082` | HTTP | `STUDENT-SERVICE` | Student Lifecycle CRUD & Multi-Step Orchestrator |
| **Attendance Service**| `backend/attendance-service`| `8083` | HTTP | `ATTENDANCE-SERVICE`| Attendance Tracking with DiscoveryClient Student Validation |
| **Result Service** | `backend/result-service` | `8084` | HTTP | `RESULT-SERVICE` | Grading Engine, GPA Computation, Transcripts |
| **SOAP Lookup** | `backend/soap-student-lookup`| `8085` | SOAP/XML| `SOAP-STUDENT-LOOKUP`| Isolated Spring-WS WSDL/XSD SOA Interoperability Demo |
| **Kafka Broker** | Root (`docker-compose-kafka.yml`)| `9092` | TCP | — | Event Streaming (KRaft Mode, Kafka UI on :8090) |

---

## 3. Database Architecture — `soa_hack`

All microservices persist their domain models in the PostgreSQL database **`soa_hack`** on port **`5433`** with strict logical schema separation:

```sql
soa_hack/
├── auth.users              -- User credentials, BCrypt hashes, roles (ROLE_ADMIN, ROLE_FACULTY)
├── student.students        -- Student profiles, demographics, admission year, department
├── attendance.attendance   -- Daily attendance logs, subject codes, status, timestamps
└── result.results          -- Subject grades, marks obtained, percentage, credits
```

- **Connection URL**: `jdbc:postgresql://localhost:5433/soa_hack?currentSchema=<schema_name>,public`
- **Zero Cross-Schema SQL Joins**: Complete service autonomy maintained via APIs and domain events.

---

## 4. Quick Startup Instructions

### Prerequisites
- **Java 21 (JDK 21)**
- **PostgreSQL 16+** running on port `5433` with database `soa_hack` and password `Aditya@2234` (configurable via `application.properties` or environment variables)
- **Apache Maven 3.9+**

### Step 1: Start Eureka Discovery Server
```powershell
cd backend/eureka_server
mvn spring-boot:run
```
*Wait until Eureka starts on `http://localhost:8761`.*

### Step 2: Start Auth Service
```powershell
cd backend/auth_service
mvn spring-boot:run
```

### Step 3: Start Student Service
```powershell
cd backend/student-service
mvn spring-boot:run
```

### Step 4: Start Attendance Service
```powershell
cd backend/attendance-service
mvn spring-boot:run
```

### Step 5: Start Result Service
```powershell
cd backend/result-service
mvn spring-boot:run
```

### Step 6: Start API Gateway
```powershell
cd backend/api-gateway
mvn spring-boot:run
```

### Step 6a: Run Additional Load-Balanced Instances

Start a second process for each scalable service from the repository root. Each process keeps the same Eureka application name and derives a unique instance ID from its port:

```powershell
cd backend/student-service
mvn spring-boot:run "-Dspring-boot.run.arguments=--server.port=8086"

cd backend/attendance-service
mvn spring-boot:run "-Dspring-boot.run.arguments=--server.port=8087"

cd backend/result-service
mvn spring-boot:run "-Dspring-boot.run.arguments=--server.port=8088"
```

The primary instances remain on ports `8082`, `8083`, and `8084`. Attendance and Result call Student Service through the logical Eureka name `student-service`; Spring Cloud LoadBalancer selects a registered instance for each request.

### Step 7 (Optional): Start SOAP Demo & Kafka
```powershell
# SOAP Student Lookup Demo
cd backend/soap-student-lookup
mvn spring-boot:run

# Apache Kafka with KRaft (Optional Docker Compose)
docker compose -f docker-compose-kafka.yml up -d
```

---

## 5. Automated Testing & Verification

The project includes **78 passing automated unit, integration, persistence, and contract tests**:

```powershell
# Run tests across each module
cd backend/eureka_server && mvn test
cd backend/auth_service && mvn test
cd backend/student-service && mvn test
cd backend/attendance-service && mvn test
cd backend/result-service && mvn test
cd backend/api-gateway && mvn test
cd backend/soap-student-lookup && mvn test
```

### Test Suite Summary
- **Eureka Server**: 1 test passing (Registry context).
- **Auth Service**: 18 tests passing (BCrypt hashing, JWT generation, invalid credentials, public endpoints, role enforcement).
- **Student Service**: 16 tests passing (Student CRUD, bean validations, duplicate checks, orchestration compensation).
- **Attendance Service**: 13 tests passing (Attendance recording, student validation via discovery, percentages, event publication).
- **Result Service**: 23 tests passing (Mark calculations, grade point scale O-F, semester transcripts, event publication).
- **API Gateway**: 5 tests passing (Route predicates, header forwarding, CORS filters).
- **SOAP Lookup**: 2 tests passing (WSDL generation, SOAP XML endpoint payload).
- **JaCoCo Code Coverage**: HTML reports generated in each service under `target/site/jacoco/index.html`.

---

## 6. API Documentation (Swagger & SOAP WSDL)

- **Auth Service OpenAPI**: `http://localhost:8081/swagger-ui.html` | `/v3/api-docs`
- **Student Service OpenAPI**: `http://localhost:8082/swagger-ui.html` | `/v3/api-docs`
- **Attendance Service OpenAPI**: `http://localhost:8083/swagger-ui.html` | `/v3/api-docs`
- **Result Service OpenAPI**: `http://localhost:8084/swagger-ui.html` | `/v3/api-docs`
- **SOAP WSDL Contract**: `http://localhost:8085/ws/students.wsdl`
- **Gateway Entrypoint**: `http://localhost:8080`
- **HTTP Request Collection**: Test collection available in `edupulse-api-tests.http`.

### 6a. Load-Balancing Verification

1. Open `http://localhost:8761` and confirm two instances appear under `STUDENT-SERVICE`, `ATTENDANCE-SERVICE`, and `RESULT-SERVICE`.
2. Send repeated requests through the Gateway, for example:

   ```powershell
   1..10 | ForEach-Object {
       curl.exe -s -D - http://localhost:8080/api/students/1 -o NUL |
           Select-String "X-Instance-Port"
   }
   ```

3. Confirm that `X-Instance-Port` reports both ports for the relevant service. Gateway logs also include the resolved target URI.
4. Stop one secondary process and wait for Eureka to evict it. Requests should continue through the remaining healthy instance.
5. If no instance is selected, verify the Eureka URL, application name, port, and service health before restarting the Gateway to refresh its registry cache.

---

## 7. Advanced SOA Capabilities

1. **Multi-Step Orchestration (`EnrollmentWorkflowCoordinator`)**:
   - Manages enrollment and course eligibility workflows.
   - Automatically executes compensating transactions (rollback) upon downstream step failure.
   - Endpoint: `POST /api/students/orchestration/enroll`.
2. **Event-Driven Choreography (Apache Kafka)**:
   - Publishes `StudentCreatedEvent`, `AttendanceRecordedEvent`, and `ResultPublishedEvent`.
   - Fail-safe design ensures database operations never block if Kafka is offline.
3. **Round-Robin Load Balancing**:
   - Supports multiple instances (e.g. running instance 2 of Student Service on `:8086`).
   - Verified via Spring Cloud LoadBalancer routing requests evenly between instances.
