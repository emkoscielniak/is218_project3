## Live Demo

- Static site: https://www.emkoscielniak.com
- API docs: https://api.emkoscielniak.com/docs
- pgAdmin: https://db.emkoscielniak.com

🚀 Deployment Guide for IS218 Project

This document explains how this project is deployed to a DigitalOcean droplet using GitHub Actions, Docker Compose, and Caddy as a reverse proxy. It includes all necessary configuration, secrets, and deployment logic.

📦 1. Server Preparation (DigitalOcean Droplet)

A non-root user was created to handle deployments:

sudo adduser deploy
sudo usermod -aG docker deploy


SSH keys were configured to allow passwordless GitHub Actions deployments:

SSH host: emkoscielniak.com

SSH user: deploy

SSH key: stored as a GitHub Actions secret named SSH_PRIVATE_KEY

The key was added to the server:

sudo mkdir -p /home/deploy/.ssh
sudo nano /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys

🔐 2. GitHub Secrets Configuration

The following secrets must exist in GitHub → Settings → Secrets and Variables → Actions:

Secret Name	Description
SSH_HOST	The server domain (ex: emkoscielniak.com)
SSH_USER	The deploy user (deploy)
SSH_PRIVATE_KEY	The private key corresponding to the authorized key on the server
DOCKERHUB_USERNAME	(Optional) For Docker image pushes
DOCKERHUB_TOKEN	(Optional) Docker Hub access token
🤖 3. Deployment Workflow (deploy.yml)

GitHub Actions automatically connects to the server and deploys the newest version of the project.

.github/workflows/deploy.yml
name: Deploy to Droplet

on:
  push:
    branches: [ "main" ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Decode SSH Key
      run: |
        echo "${{ secrets.SSH_PRIVATE_KEY }}" | base64 -d > private_key
        chmod 600 private_key

    - name: Deploy to Droplet
      run: |
        ssh -o StrictHostKeyChecking=no -i private_key ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} << 'EOF'
          cd ~/is218_project3
          git pull
          cd infrastructure
          docker compose down
          docker compose up -d --build
        EOF

🌐 4. Reverse Proxy Configuration (Caddyfile)

The Caddy server manages HTTPS certificates and routing.

/infrastructure/Caddyfile
{
    email eak43@njit.edu
    admin off
}

www.emkoscielniak.com {
    reverse_proxy static-site:80
    encode gzip

    header {
        X-Frame-Options "DENY"
        X-Content-Type-Options "nosniff"
    }
}

api.emkoscielniak.com {
    reverse_proxy backend-app:8000
    encode gzip

    header {
        X-Frame-Options "DENY"
        X-Content-Type-Options "nosniff"
    }
}

db.emkoscielniak.com {
    reverse_proxy pgadmin:80
    encode gzip

    header {
        X-Frame-Options "DENY"
        X-Content-Type-Options "nosniff"
    }
}

🐳 5. Docker Compose Structure

The system runs three main services:

static-site (HTML frontend)

backend-app (FastAPI app)

pgadmin + postgres (database)

Each service is declared under infrastructure/docker-compose.yml.

💻 6. Backend Service Deployment

The backend lives in:

projects/backend/


Key files include:

Dockerfile

docker-compose.yml

FastAPI application code

Container name: backend-app
Exposed port: 8000

🔄 7. End-to-End Deployment Flow

Here is how updates go live:

You push to main

GitHub Actions runs deploy.yml

It:

SSHs into the droplet

Pulls the latest changes

Rebuilds docker images

Restarts the stack with docker compose up -d --build

Caddy proxies updated services automatically

No manual deployment required.

🧪 8. Verifying Deployment
Frontend:

https://www.emkoscielniak.com

Backend API:

https://api.emkoscielniak.com/docs

Database (secured):

https://db.emkoscielniak.com

📁 9. Project Structure Overview
is218_project3/
│
├── infrastructure/
│   ├── Caddyfile
│   ├── docker-compose.yml
│   └── ...
│
├── projects/
│   ├── static-site/
│   │   └── html/index.html
│   │
│   └── backend/
│       ├── Dockerfile
│       ├── app/
│       └── docker-compose.yml
│
└── .github/workflows/deploy.yml

🎉 10. Notes

Deployment triggers are automatic.

This setup demonstrates industry-standard DevOps for containerized apps.

All steps follow IS218 project requirements.
