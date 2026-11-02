# EM2S CMU

## Service layout

The application can run as four independently scalable Spring Boot services:

| Service profile | Routes | Database |
| --- | --- | --- |
| `auth-service` | `/api/auth`, `/api/users`, `/api/roles` | `authdb` |
| `employee-service` | `/api/employees`, `/api/departments`, `/api/positions` | `employeedb` |
| `leave-service` | `/api/leaves`, `/api/leave-types` | `leavedb` |
| `payroll-service` | `/api/payrolls`, `/api/salaries` | `payrolldb` |

The services build from the same Spring Boot image, with a profile selecting
which API controllers are enabled. Each service has a separate deployment,
service endpoint, and PostgreSQL instance. The existing default profile
continues to run the original combined API for compatibility.

## Local credentials

The deployment uses a strong PostgreSQL password and a base64-encoded random
`JWT_SECRET` of at least 32 bytes. The Kubernetes deployment script generates
both and stores them in `.env.deploy`, which is ignored by Git. Keep this file
private. Optional `BOOTSTRAP_ADMIN_USERNAME`, `BOOTSTRAP_ADMIN_EMAIL`, and
`BOOTSTRAP_ADMIN_PASSWORD` values can provision an initial administrator;
without them, the `auth-service` does not create one.

## Run locally with Docker Compose

```powershell
docker compose --env-file .env.deploy up --build -d
```

Services are available on ports 9090–9093 (identity, employees, leave, and
payroll). The four PostgreSQL databases bind to localhost only on ports
55432–55435 (authentication, employees, leave, and payroll). Port 5433 is not
used because it may already be occupied. Docker Compose and Kubernetes share
Docker Desktop resources; on this machine's current 4 GB allocation, run only
one stack at a time.

By default, the Angular development server proxies `/api` requests to the
combined Spring Boot API on port 9090. To use the separate services, open the
frontend with `?apiMode=microservices` in its URL.

## Deploy to local Kubernetes

```powershell
.\scripts\deploy-kubernetes.ps1
```

The script builds the local image, generates a Kubernetes Secret from
`.env.deploy`, applies the manifests, and waits for each deployment to become
ready. It refuses to run unless the current context is `docker-desktop`.
Services run one replica each for a local development cluster. The new
microservices replace the older `cmu-springboot` application deployment; its
existing `postgres` deployment and data are left untouched. The microservices
use separate PostgreSQL databases, which start empty.

Use port forwarding to access the APIs and databases from the host:

```powershell
kubectl port-forward service/auth-service 19090:9090
kubectl port-forward service/employee-service 19091:9090
kubectl port-forward service/leave-service 19092:9090
kubectl port-forward service/payroll-service 19093:9090
kubectl port-forward service/postgres-auth 55432:5432
kubectl port-forward service/postgres-employee 55433:5432
kubectl port-forward service/postgres-leave 55434:5432
kubectl port-forward service/postgres-payroll 55435:5432
```

Each command needs its own terminal. For PostgreSQL, connect to `localhost`
with username `postgres`, the password in `.env.deploy`, and the database
matching the forwarded service (`authdb`, `employeedb`, `leavedb`, or
`payrolldb`). Back up and migrate existing data before switching a production
deployment to these new databases.
