# Setup for FerretDB(MongoDB) locally through k8s

## Store our own data searches so we aren't reliant on third-party data

This guides through how to set up a FerretDB service locally.
I chose (FerretDB)[https://github.com/FerretDB/FerretDB] here dues to some [concerns](https://caffeinedev.medium.com/trying-out-ferretdb-9d02e1a28881) about MpngoDB of late, and simply trying it out.

## 1. Set Up Kubernetes locally (with Docker)

### MacOS (M1)

- We want to install Docker Desktop and Kubernetes.
  - We can install MiniKube for a local Kubernetes cluster:

```
brew install docker
brew install minikube
```

- With minikube installed, we start minikube in Docker:

```
minikube start --driver=docker -alsologtostderr
```

(Thank you [Sophie Kwon] (https://medium.com/@seohee.sophie.kwon/how-to-run-a-minikube-on-apple-silicon-m1-8373c248d669) on Medium for solving this for Mac M1s)

## 2. PostgreSQL Deployment and Service

- Create a file named postgres-deployment.yaml for the PostgreSQL deployment and service, setting username and password:

```
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  type: ClusterIP
  selector:
    app: postgres
  ports:
    - port: 5432
      targetPort: 5432
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
## 3. spec:
  selector:
    matchLabels:
      app: postgres
  replicas: 1
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:13
          env:
            - name: POSTGRES_DB
              value: ferretdb
            - name: POSTGRES_USER
              value: ferretuser
            - name: POSTGRES_PASSWORD
              value: ferretpassword
          ports:
            - containerPort: 5432
          volumeMounts:
            - mountPath: /var/lib/postgresql/data
              name: postgres-storage
      volumes:
        - name: postgres-storage
          persistentVolumeClaim:
            claimName: postgres-pvc
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

Check: to persist data using persistent volumes
If you want to ensure data persists across pod restarts, make sure your PostgreSQL deployment uses PersistentVolumeClaims

And set up inside our k8s:

```
kubectl apply -f postgres-deployment.yaml
```

## 3. FerretDB Deployment and Service

- Create a file named ferretdb-deployment.yaml for the FerretDB deployment and service, setting up username and password:

```
apiVersion: v1
kind: Service
metadata:
  name: ferretdb
spec:
  type: ClusterIP
  selector:
    app: ferretdb
  ports:
    - port: 27017
      targetPort: 27017
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ferretdb
spec:
  selector:
    matchLabels:
      app: ferretdb
  replicas: 1
  template:
    metadata:
      labels:
        app: ferretdb
    spec:
      containers:
        - name: ferretdb
          image: ferretdb/ferretdb:latest
          env:
            - name: FERRETDB_POSTGRESQL_URL
              value: postgres://ferretuser:ferretpassword@postgres:5432/ferretdb
          ports:
            - containerPort: 27017
```

And set up inside our k8s:

```
kubectl apply -f ferretdb-deployment.yaml
```

## 4. Verify the Setup

- **Check the Pods**: Ensure both PostgreSQL and FerretDB pods are running.

```
kubectl get pods
```

- **Check the Services**: Ensure the services are created and running.

```
kubectl get services
```

- **Connect to FerretDB**: You can port-forward the FerretDB service to your local machine to connect to it.

```
kubectl port-forward svc/ferretdb 27017:27017
```

This should You should connect to FerretDB on mongodb://localhost:27017 using a MongoDB client or application.

### TODO: fill FerretDB with some data
