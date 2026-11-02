# EM2S CMU

## Kubernetes deployment

Kubernetes runs the original combined Spring Boot API and one PostgreSQL
database. All API routes (`/api/auth`, `/api/employees`, `/api/leaves`,
`/api/payrolls`, and the related resources) are served by `cmu-springboot`
on port 9090. The database is exposed inside the cluster as `postgres:5432`.

Deploy to the local Docker Desktop cluster from PowerShell:

```powershell
.\scripts\deploy-kubernetes.ps1
```

The script builds `cmu-springboot:local`, applies the ConfigMap, Secret,
PostgreSQL, application, and Ingress manifests, and waits for both Deployments
to become ready. It refuses to run unless the current Kubernetes context is
`docker-desktop`.

To access the API from the host, run this in a terminal:

```powershell
kubectl port-forward service/cmu-springboot 9090:9090
```

The Angular development server proxies `/api` to `localhost:9090`, so open
`http://localhost:4200/dashboard` without adding `apiMode=microservices`.

The PostgreSQL Deployment uses the existing `postgres-pvc`. The deployment
script preserves the password from an existing `cmu-springboot-secret`; it
does not delete database PVCs or database data. The older microservice
Deployments and Services are removed by the script, but their database
Deployments and PVCs are intentionally left untouched.

## Local credentials

The deployment script stores generated credentials in the Git-ignored
`.env.deploy` file. Keep this file private. Optional
`BOOTSTRAP_ADMIN_USERNAME`, `BOOTSTRAP_ADMIN_EMAIL`, and
`BOOTSTRAP_ADMIN_PASSWORD` values can be set there when provisioning an
administrator.
