# Web-Based Vehicle Rental System

**SE2030 – Software Engineering | Year 2, Semester 1, 2026**
**Group ID:** 2026-Y2-S1-MLB-B9G1-06

A responsive, role-based web application for managing multi-branch vehicle rentals — bookings,
fleet, maintenance, promotions, contracts, and branch operations from one shared platform.

## Team & Assigned Modules

| IT Number | Name | Assigned Major Function | Branch |
|---|---|---|---|
| IT25101555 | Sumanawansha D.G.S.S | Vehicle & Fleet Management | `feature/vehicle-fleet` |
| IT25101154 | Harshani W.N | Booking & Reservation Management | `feature/booking-reservation` |
| IT25102369 | Sanjula S.V.D.U | Rental Agreement & Contract Management | `feature/rental-agreement` |
| IT25103055 | Kasthurisingha K.H.M.W.G | Vehicle Maintenance & Inspection | `feature/maintenance-inspection` |
| IT25103367 | Victor K.K.A.S | Promotions & Discount Management | `feature/promotions-discount` |
| IT25100298 | Kumara A.R.D.V.T.R | Location & Branch Management | `feature/branch-location` |

## Tech Stack

- **Language:** Java 17
- **Framework:** Spring Boot 3 (Spring MVC, Spring Data JPA, Spring Security)
- **Templating:** Thymeleaf + Bootstrap 5
- **Database:** MySQL (dev), H2 (local/tests)
- **Build tool:** Maven
- **Version control:** Git / GitHub (trunk: `main`, integration: `develop`, work: `feature/*`)

## Project Structure

```
vehicle-rental-system/
├── src/main/java/com/sliit/vehiclerental/
│   ├── fleet/           # Vehicle & Fleet Management
│   ├── booking/         # Booking & Reservation Management
│   ├── agreement/       # Rental Agreement & Contract Management
│   ├── maintenance/     # Vehicle Maintenance & Inspection
│   ├── promotion/       # Promotions & Discount Management
│   ├── branch/          # Location & Branch Management
│   ├── user/            # Auth, roles, profiles (shared)
│   ├── common/          # Shared entities, exceptions, utils
│   └── config/          # Security, app configuration
├── src/main/resources/
│   ├── templates/       # Thymeleaf views
│   ├── static/          # CSS/JS
│   └── application.properties
├── docs/                 # Proposal, design doc, diagrams, sprint logs
└── .github/              # Issue templates, PR template
```

Each module package (`fleet`, `booking`, etc.) follows the same internal layout:
`controller/`, `service/`, `repository/`, `model/`, `dto/`.

## Getting Started

1. Install: Java 17+, Maven, MySQL 8+
2. Clone the repo and create a MySQL database named `vehicle_rental_db`
3. Copy `src/main/resources/application.properties.example` to `application.properties`
   and set your local DB username/password
4. Run: `mvn spring-boot:run`
5. Visit `http://localhost:8080`

## Branching Workflow

- `main` — always demo-ready
- `develop` — integration branch, all feature branches merge here first
- `feature/<module-name>` — one per major function/owner
- Open a Pull Request into `develop`; at least one teammate reviews before merging.

## Documentation

See `/docs` for the Proposal Report, Design Document, UML diagrams, and sprint logs.
