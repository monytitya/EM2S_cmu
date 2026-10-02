# EM2S CMU

## Service layout

The application can run as four independently scalable Spring Boot services:

| Service profile | Routes | Database |
| --- | --- | --- |
| `auth-service` | `/api/auth`, `/api/users`, `/api/roles` | `authdb` |
| `employee-service` | `/api/employees`, `/api/departments`, `/api/positions` | `employeedb` |
| `leave-service` | `/api/leaves`, `/api/leave-types` | `leavedb` |
| `payroll-service` | `/api/payrolls`, `/api/salaries` | `payrolldb` |

The services currently build from the same Spring Boot image, with a profile
selecting which API controllers are enabled. They have separate deployments,
service endpoints, and PostgreSQL instances. The existing default profile
continues to run the original combined API for compatibility.

## Run locally with Docker Compose

Set `JWT_SECRET` to a base64-encoded random value of at least 32 bytes before
starting the services. To enable administrator operations, also set
`BOOTSTRAP_ADMIN_USERNAME`, `BOOTSTRAP_ADMIN_EMAIL`, and
`BOOTSTRAP_ADMIN_PASSWORD`. If these bootstrap values are omitted, no
administrator account is created by the `auth-service`.

```powershell
$env:JWT_SECRET = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$env:BOOTSTRAP_ADMIN_USERNAME = "admin"
$env:BOOTSTRAP_ADMIN_EMAIL = "admin@example.com"
$env:BOOTSTRAP_ADMIN_PASSWORD = Read-Host "Bootstrap admin password"
docker compose up --build
```

The services are available on ports 9090–9093 (identity, employees, leave, and
payroll, respectively). The Angular app routes local API requests to those
ports; when hosted behind the Kubernetes Ingress it uses the same host and
path-based routing.

## Deploy to Kubernetes

Replace the development values in `k8s/secret.yaml` before applying it. In
particular, `JWT_SECRET` must be a base64-encoded random value of at least 32
bytes, and the PostgreSQL credentials should be changed. Set the three
`BOOTSTRAP_ADMIN_*` values to provision the initial administrator account.
Build the `cmu-springboot:local` image and make it available to the Kubernetes
cluster, then apply the ConfigMap, Secret, database, service, and Ingress
manifests:

```powershell
kubectl apply -f k8s/configmap.yaml -f k8s/secret.yaml -f k8s/postgres.yaml -f k8s/deployment.yaml -f k8s/ingress.yaml
```

The new databases start empty. Back up and migrate existing PostgreSQL records
into their owning service database before switching a production deployment
over to these routes.
