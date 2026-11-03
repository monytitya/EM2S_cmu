# Humaniq Workforce Suite

This website is a full-stack human resources and operations dashboard for managing employees, departments, payroll, salaries, and leave records. It combines a Spring Boot backend with an Angular frontend so staff can handle daily workforce tasks from one interface.

## Project overview

The application includes:

- Employee management
- Department and position management
- Salary records and compensation data
- Payroll tracking
- Leave requests and leave categories
- Admin user and role management
- JWT-based login and account profile editing
- Dashboard summary metrics for organization health

## Tech stack

- Backend: Java 17, Spring Boot, Spring Security, PostgreSQL
- Frontend: Angular 22, TypeScript
- API docs: Swagger UI
- Deployment: Docker and Kubernetes support are included

## Project structure

- `src/` - Spring Boot backend source code
- `Frontend/` - Angular frontend application
- `k8s/` - Kubernetes deployment files
- `docker-compose.yml` - multi-service local container setup
- `pom.xml` - Maven configuration for the backend
- `Frontend/package.json` - npm scripts for the frontend

## Prerequisites

Before running the website locally, make sure you have:

- Java 17 or newer
- Maven or the included `mvnw` script
- Node.js 18 or newer
- npm
- PostgreSQL 16 or Docker installed
- Git

## Environment setup

Create or update the root `.env` file with the database and JWT settings. Example:

```env
APP_PORT=9090
DB_PORT=5432

SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/postgres
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
JWT_SECRET=change-this-to-a-long-random-secret
BOOTSTRAP_ADMIN_USERNAME=admin
BOOTSTRAP_ADMIN_EMAIL=admin@company.com
BOOTSTRAP_ADMIN_PASSWORD=Admin123
```

If you are using the Docker-based setup, also configure `.env.deploy` with the required PostgreSQL and app secrets.

## Database setup

You can run the app with a local PostgreSQL database or with Docker.

### Option 1: Local PostgreSQL

1. Install PostgreSQL.
2. Create a database named `postgres`.
3. Make sure the username and password match your `.env` values.

### Option 2: Docker Compose

From the project root:

```bash
docker compose up -d
```

This starts the application and database services defined in `docker-compose.yml`.

## Starting the backend

From the project root:

```bash
./mvnw clean spring-boot:run
```

On Windows PowerShell:

```powershell
./mvnw.cmd clean spring-boot:run
```

The backend runs on:

- API: http://localhost:9090
- Swagger UI: http://localhost:9090/swagger-ui.html

## Starting the frontend

Open a new terminal and run:

```bash
cd Frontend
npm install
npm start
```

Then open the website in your browser:

- Frontend: http://localhost:4200
- Login page: http://localhost:4200/login

The Angular app is configured to connect to the backend API and uses the backend on port 9090.

## First time using the website

### Create an account

1. Open http://localhost:4200/login
2. Click "Create an account"
3. Enter a username, email, password, and role
4. Submit the form

### Log in

1. Go to the login page
2. Enter your username and password
3. After login, the dashboard opens automatically

If you configured a bootstrap admin account in `.env`, you can use that first.

## Main website pages

After login, the left sidebar gives access to the main sections.

### Dashboard

The dashboard shows:

- Total employee count
- Department summary
- Payroll coverage
- Leave totals
- Team overview and average salary

This page is the main home screen and gives a quick view of your workforce.

### Employees

Use the Employees page to:

- Add a new employee record
- Update personal details
- Upload a profile photo
- View employee information in the directory

Each employee record can include:

- Employee code
- First and last name
- Gender
- Department ID
- Position ID
- Date of birth
- Phone
- Address
- Photo

### Positions

This page manages job titles and organizational roles.

Fields may include:

- Position name
- Title
- Code
- Minimum salary
- Maximum salary
- Manager ID

### Departments

Use the Departments page to manage business units and teams.

Typical information includes:

- Department name
- Department code
- Title
- Manager ID
- Salary range information

### Salaries

The Salaries page stores employee compensation details such as:

- Basic salary
- Allowances
- Deduction percentage
- Effective date

### Payroll

This section displays payroll information, including:

- Employee ID
- Pay period start and end
- Gross pay
- Net pay
- Tax amount
- Payment status
- Payment date

### Leave management

The Leave page tracks:

- Employee name
- Leave type
- Start date
- End date
- Total leave days
- Approver information

The Leave Types page lets you configure categories such as annual leave, sick leave, and other company policies.

### Admin users and roles

The Users and Roles pages help manage system access.

- View user accounts
- Check active and inactive status
- Review assigned roles
- Update account profile information

### Profile settings

Click the account profile widget in the sidebar to:

- Update username
- Update email
- Change password
- Review current role

## Typical workflow

A common usage flow is:

1. Register an admin or login to an existing account.
2. Add departments and positions.
3. Create employee profiles.
4. Add salary details.
5. Review payroll information.
6. Track leave requests and leave types.
7. Monitor the dashboard for staffing and payroll insights.

## Production build

### Build the backend

```bash
./mvnw clean package
```

### Build the frontend

```bash
cd Frontend
npm run build
```

The frontend production files are generated in the `Frontend/dist` folder.

## Docker and Kubernetes

You can also run the application in a containerized environment.

### Docker

```bash
docker build -t cmu-springboot .
```

### Kubernetes

From PowerShell:

```powershell
./scripts/deploy-kubernetes.ps1
```

Then open the app through the configured local Kubernetes route or use port-forwarding if needed.

## Troubleshooting

### Backend not connecting to database

Check:

- PostgreSQL is running
- `SPRING_DATASOURCE_URL` is correct
- username and password match the database
- the database exists

### Frontend cannot reach backend

Check:

- Spring Boot backend is running on port 9090
- no other app is using the same port
- CORS or API path configuration is correct

### Login fails

Confirm:

- username and password are correct
- the account was created successfully
- JWT secret is configured properly

### Port conflicts

If port 9090 or 4200 is already in use, update the environment variables or run the frontend on another local port.

## Useful links

- Frontend: http://localhost:4200
- Backend API: http://localhost:9090
- Swagger UI: http://localhost:9090/swagger-ui.html

## Summary

This website is designed for employee and workforce administration. It gives you a simple interface to manage staff records, payroll, compensation, leave, and access control from a single system.
