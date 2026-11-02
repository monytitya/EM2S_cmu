$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $root '.env.deploy'
$k8sSecretPath = Join-Path $env:TEMP "cmu-springboot-k8s-secret-$([guid]::NewGuid().ToString('N')).env"

function New-UrlSafeSecret {
    param([int]$ByteCount)

    $bytes = New-Object byte[] $ByteCount
    $generator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $generator.GetBytes($bytes)
    }
    finally {
        $generator.Dispose()
    }
    return [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}

if (-not (Test-Path -LiteralPath $envPath)) {
    $jwtSecret = New-UrlSafeSecret -ByteCount 32
    $jwtSecret = $jwtSecret.Replace('-', '+').Replace('_', '/') + '='
    $envLines = @(
        "POSTGRES_PASSWORD=$(New-UrlSafeSecret -ByteCount 32)"
        "JWT_SECRET=$jwtSecret"
        'BOOTSTRAP_ADMIN_USERNAME='
        'BOOTSTRAP_ADMIN_EMAIL='
        'BOOTSTRAP_ADMIN_PASSWORD='
    )
    [System.IO.File]::WriteAllLines($envPath, $envLines, [System.Text.UTF8Encoding]::new($false))
    Write-Output 'Generated local deployment credentials in .env.deploy.'
}

$values = @{}
Get-Content -LiteralPath $envPath | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.*)$') {
        $values[$matches[1].Trim()] = $matches[2].Trim()
    }
}

foreach ($key in @('POSTGRES_PASSWORD', 'JWT_SECRET')) {
    if (-not $values.ContainsKey($key) -or [string]::IsNullOrWhiteSpace($values[$key])) {
        throw "The $key value is missing from .env.deploy."
    }
}

try {
    $context = (& kubectl config current-context).Trim()
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to read the current Kubernetes context.'
    }
    if ($context -ne 'docker-desktop') {
        throw "Refusing to deploy to Kubernetes context '$context'; this script is for the local docker-desktop cluster."
    }

    & docker build --tag cmu-springboot:local $root
    if ($LASTEXITCODE -ne 0) {
        throw 'Docker image build failed.'
    }

    $databasePassword = $values['POSTGRES_PASSWORD']
    $existingSecretJson = & kubectl get secret cmu-springboot-secret --ignore-not-found -o json
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to inspect the existing Kubernetes Secret.'
    }
    if (-not [string]::IsNullOrWhiteSpace(($existingSecretJson -join ''))) {
        $existingSecret = ($existingSecretJson -join "`n") | ConvertFrom-Json
        if ($existingSecret.data.POSTGRES_PASSWORD) {
            $databasePassword = [System.Text.Encoding]::UTF8.GetString(
                [Convert]::FromBase64String($existingSecret.data.POSTGRES_PASSWORD)
            )
        }
    }

    $secretLines = @(
        'SPRING_DATASOURCE_USERNAME=postgres'
        "SPRING_DATASOURCE_PASSWORD=$databasePassword"
        "POSTGRES_PASSWORD=$databasePassword"
        "JWT_SECRET=$($values['JWT_SECRET'])"
        "BOOTSTRAP_ADMIN_USERNAME=$($values['BOOTSTRAP_ADMIN_USERNAME'])"
        "BOOTSTRAP_ADMIN_EMAIL=$($values['BOOTSTRAP_ADMIN_EMAIL'])"
        "BOOTSTRAP_ADMIN_PASSWORD=$($values['BOOTSTRAP_ADMIN_PASSWORD'])"
    )
    [System.IO.File]::WriteAllLines($k8sSecretPath, $secretLines, [System.Text.UTF8Encoding]::new($false))

    $secretManifest = & kubectl create secret generic cmu-springboot-secret "--from-env-file=$k8sSecretPath" --dry-run=client -o yaml
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to generate the Kubernetes Secret manifest.'
    }
    $secretManifest | & kubectl apply -f -
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to apply the Kubernetes Secret.'
    }

    & kubectl apply -f (Join-Path $root 'k8s\configmap.yaml') -f (Join-Path $root 'k8s\postgres.yaml') -f (Join-Path $root 'k8s\deployment.yaml') -f (Join-Path $root 'k8s\ingress.yaml')
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to apply the Kubernetes application manifests.'
    }

    foreach ($deployment in @('postgres', 'cmu-springboot')) {
        & kubectl rollout status "deployment/$deployment" --timeout=10m
        if ($LASTEXITCODE -ne 0) {
            throw "Kubernetes deployment '$deployment' did not become ready."
        }
    }

    & kubectl delete deployment auth-service employee-service leave-service payroll-service --ignore-not-found=true
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to remove the old microservice application Deployments.'
    }
    & kubectl delete service auth-service employee-service leave-service payroll-service --ignore-not-found=true
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to remove the old microservice Services.'
    }

    Write-Output 'The combined cmu-springboot application and PostgreSQL are ready.'
    Write-Output 'Database PVCs were not deleted. Use kubectl port-forward service/cmu-springboot 9090:9090 to access the API.'
}
finally {
    if (Test-Path -LiteralPath $k8sSecretPath) {
        Remove-Item -LiteralPath $k8sSecretPath -Force
    }
}
