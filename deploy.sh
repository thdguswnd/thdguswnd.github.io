#!/usr/bin/env bash
set -euo pipefail

# ===== 설정 (필요시 EMAIL / PG_PW 만 수정) =====
RG=wedding-test-rg; LOC=koreacentral; SUF=$RANDOM
ACR=weddingacr$SUF; AKS=wedding-aks; PG=wedding-pg-$SUF
PG_ADMIN=wedadmin; PG_PW='ChangeMe!2026Wedding'; PG_DB=wedding
NS=wedding; TAG=v1; EMAIL=hyeonjoong@lgcns.com
echo "ACR=$ACR / PG=$PG"

echo "== [0/8] 리소스 프로바이더 등록 (최초 1회, 수 분 소요) =="
for prov in Microsoft.ContainerRegistry Microsoft.ContainerService Microsoft.DBforPostgreSQL Microsoft.Network Microsoft.Compute Microsoft.ManagedIdentity Microsoft.OperationalInsights; do
  echo "  등록: $prov"
  az provider register --namespace "$prov" --wait
done

echo "== [1/8] 소스 준비 =="
chmod -R u+rwx ~/wedding 2>/dev/null || true
rm -rf ~/wedding
mkdir -p ~/wedding/sm-be ~/wedding/sm-fe
tar --no-same-permissions -xzf ~/sm-be.tgz -C ~/wedding/sm-be
tar --no-same-permissions -xzf ~/sm-fe.tgz -C ~/wedding/sm-fe
cd ~/wedding
ls sm-be/Dockerfile sm-fe/Dockerfile

echo "== [2/8] RG + ACR + 이미지 빌드 =="
az group create -n "$RG" -l "$LOC" -o none
az acr create -g "$RG" -n "$ACR" --sku Basic --admin-enabled true -o none
az acr build -r "$ACR" -t wedding/sm-be:$TAG ./sm-be
az acr build -r "$ACR" -t wedding/sm-fe:$TAG ./sm-fe

echo "== [3/8] AKS =="
az aks create -g "$RG" -n "$AKS" --node-count 1 --node-vm-size Standard_B2ms --generate-ssh-keys -o none
az aks get-credentials -g "$RG" -n "$AKS" --overwrite-existing
kubectl get ns "$NS" >/dev/null 2>&1 || kubectl create namespace "$NS"

echo "== [4/8] PostgreSQL =="
az postgres flexible-server create -g "$RG" -n "$PG" -l "$LOC" \
  --tier Burstable --sku-name Standard_B1ms --version 16 --storage-size 32 \
  --admin-user "$PG_ADMIN" --admin-password "$PG_PW" --public-access all --yes -o none
az postgres flexible-server db create -g "$RG" -s "$PG" -d "$PG_DB" -o none

echo "== [5/8] 시크릿 =="
ACR_USER=$(az acr credential show -n "$ACR" --query username -o tsv)
ACR_PW=$(az acr credential show -n "$ACR" --query 'passwords[0].value' -o tsv)
kubectl -n "$NS" delete secret acr-cred sm-be-secrets >/dev/null 2>&1 || true
kubectl -n "$NS" create secret docker-registry acr-cred \
  --docker-server="$ACR.azurecr.io" --docker-username="$ACR_USER" --docker-password="$ACR_PW"
kubectl -n "$NS" create secret generic sm-be-secrets \
  --from-literal=db-url="jdbc:postgresql://$PG.postgres.database.azure.com:5432/$PG_DB?sslmode=require" \
  --from-literal=db-username="$PG_ADMIN" --from-literal=db-password="$PG_PW" \
  --from-literal=blob-container="gallery" --from-literal=storage-account="dummy" \
  --from-literal=instagram-token="dummy"

echo "== [6/8] ingress-nginx + cert-manager =="
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx >/dev/null 2>&1 || true
helm repo add jetstack https://charts.jetstack.io >/dev/null 2>&1 || true
helm repo update >/dev/null
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx -n ingress-nginx --create-namespace --wait --timeout 10m
helm upgrade --install cert-manager jetstack/cert-manager -n cert-manager --create-namespace --set crds.enabled=true --wait --timeout 10m

echo "== [7/8] LoadBalancer IP 대기 =="
IP=""
while [ -z "$IP" ]; do
  IP=$(kubectl -n ingress-nginx get svc ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || true)
  [ -z "$IP" ] && { echo "  ...IP 대기중"; sleep 10; }
done
HOST=$IP.nip.io
echo "HOST=$HOST"

echo "== [8/8] 앱 배포 =="
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata: { name: sm-be, namespace: $NS, labels: { app: sm-be } }
spec:
  replicas: 1
  selector: { matchLabels: { app: sm-be } }
  template:
    metadata: { labels: { app: sm-be } }
    spec:
      imagePullSecrets: [ { name: acr-cred } ]
      containers:
      - name: sm-be
        image: $ACR.azurecr.io/wedding/sm-be:$TAG
        ports: [ { containerPort: 7080 } ]
        env:
        - { name: SPRING_PROFILES_ACTIVE, value: "azure" }
        - { name: WEDDING_INSTAGRAM_MOCK, value: "true" }
        - { name: DB_URL,               valueFrom: { secretKeyRef: { name: sm-be-secrets, key: db-url } } }
        - { name: DB_USERNAME,          valueFrom: { secretKeyRef: { name: sm-be-secrets, key: db-username } } }
        - { name: DB_PASSWORD,          valueFrom: { secretKeyRef: { name: sm-be-secrets, key: db-password } } }
        - { name: AZURE_BLOB_CONTAINER,  valueFrom: { secretKeyRef: { name: sm-be-secrets, key: blob-container } } }
        - { name: AZURE_STORAGE_ACCOUNT, valueFrom: { secretKeyRef: { name: sm-be-secrets, key: storage-account } } }
        - { name: INSTAGRAM_TOKEN,      valueFrom: { secretKeyRef: { name: sm-be-secrets, key: instagram-token } } }
        readinessProbe: { httpGet: { path: /actuator/health/readiness, port: 7080 }, initialDelaySeconds: 25, periodSeconds: 10 }
        livenessProbe:  { httpGet: { path: /actuator/health/liveness,  port: 7080 }, initialDelaySeconds: 40, periodSeconds: 15 }
---
apiVersion: v1
kind: Service
metadata: { name: sm-be, namespace: $NS }
spec: { selector: { app: sm-be }, ports: [ { port: 80, targetPort: 7080 } ] }
---
apiVersion: apps/v1
kind: Deployment
metadata: { name: sm-fe, namespace: $NS, labels: { app: sm-fe } }
spec:
  replicas: 1
  selector: { matchLabels: { app: sm-fe } }
  template:
    metadata: { labels: { app: sm-fe } }
    spec:
      imagePullSecrets: [ { name: acr-cred } ]
      containers:
      - name: sm-fe
        image: $ACR.azurecr.io/wedding/sm-fe:$TAG
        ports: [ { containerPort: 80 } ]
        readinessProbe: { httpGet: { path: /, port: 80 }, initialDelaySeconds: 5, periodSeconds: 10 }
---
apiVersion: v1
kind: Service
metadata: { name: sm-fe, namespace: $NS }
spec: { selector: { app: sm-fe }, ports: [ { port: 80, targetPort: 80 } ] }
---
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata: { name: letsencrypt-prod }
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: $EMAIL
    privateKeySecretRef: { name: letsencrypt-prod }
    solvers: [ { http01: { ingress: { class: nginx } } } ]
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata: { name: wedding-ingress, namespace: $NS, annotations: { cert-manager.io/cluster-issuer: "letsencrypt-prod" } }
spec:
  ingressClassName: nginx
  tls: [ { hosts: [ "$HOST" ], secretName: wedding-tls } ]
  rules:
  - host: $HOST
    http:
      paths:
      - { path: /api, pathType: Prefix, backend: { service: { name: sm-be, port: { number: 80 } } } }
      - { path: /,    pathType: Prefix, backend: { service: { name: sm-fe, port: { number: 80 } } } }
EOF

kubectl -n "$NS" rollout status deploy/sm-be --timeout=240s
kubectl -n "$NS" rollout status deploy/sm-fe --timeout=180s

echo ""
echo "##################################################"
echo "  배포 완료. 접속 주소:  https://$HOST"
echo "  인증서 발급 1~2분:  kubectl -n $NS get certificate"
echo "  정리(과금정지):  az group delete -n $RG --yes --no-wait"
echo "##################################################"
