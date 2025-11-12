# Chapter 9: Deploying Applications

**Going Live with Your First App**

In this chapter, you'll deploy real applications to your hosting platform. We'll cover static sites, Node.js apps, Python Flask, and React applications—everything you need to host your projects.

---

## 📖 What You'll Learn

- Using the provided project templates
- Deploying different types of applications
- Configuring domains and routing
- Managing environment variables
- Troubleshooting deployments
- Best practices for production

---

## 🎯 What We're Building

By the end of this chapter, you'll have deployed:
1. **Static Website** - HTML/CSS/JS
2. **Node.js Application** - Backend API or full-stack app
3. **Python Flask App** - Python web application
4. **React Application** - Modern frontend SPA

All running simultaneously on your server with SSL!

---

## 📁 Available Templates

Your repository includes ready-to-use templates:

```
mywebclass_hosting/
├── templates/
│   ├── static-site/        # HTML/CSS/JS website
│   ├── nodejs-app/         # Node.js/Express application
│   ├── python-flask/       # Python Flask application
│   └── react-app/          # React frontend
└── examples/
    └── main-site/          # Working example (already deployed)
```

---

## 🌐 Project 1: Static Website

### What is a Static Site?

**Static site**: HTML, CSS, and JavaScript files served directly to browsers.

**Use cases:**
- Personal portfolios
- Documentation sites
- Landing pages
- Blogs (with static generators)

### Step 1: Prepare Your Site

Navigate to templates:
```bash
cd ~/mywebclass_hosting/templates/static-site
ls
```

You'll see example files:
```
index.html
style.css
script.js
images/
```

**Option A: Use the template**
```bash
# Edit the example files
nano index.html
```

**Option B: Copy your own site**
```bash
# From your local machine
scp -r ./my-website/* username@YOUR_SERVER_IP:~/mywebclass_hosting/templates/static-site/
```

### Step 2: Create Docker Configuration

Create `docker-compose.yml` in your project directory:

```bash
cd ~/mywebclass_hosting/templates/static-site
nano docker-compose.yml
```

Add:
```yaml
version: '3.8'

services:
  my-static-site:
    image: nginx:alpine
    container_name: my-static-site
    restart: unless-stopped
    volumes:
      - ./:/usr/share/nginx/html:ro
    networks:
      - web

networks:
  web:
    external: true
```

**What this does:**
- Uses nginx to serve static files
- Mounts your site files into the container
- Connects to the external `web` network (for Caddy)
- Automatically restarts if crashed

### Step 3: Update Caddyfile

Add your site to Caddy configuration:

```bash
cd ~/mywebclass_hosting/caddy
nano Caddyfile
```

Add a new site block:
```caddyfile
# My static site
mysite.yourdomain.com {
    reverse_proxy my-static-site:80
    encode gzip
    
    # Cache static assets
    header /assets/* Cache-Control "public, max-age=31536000"
}
```

### Step 4: Deploy

```bash
# Start your site
cd ~/mywebclass_hosting/templates/static-site
sudo docker compose up -d

# Reload Caddy to pick up new configuration
cd ~/mywebclass_hosting/caddy
sudo docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

### Step 5: Test

Visit: `https://mysite.yourdomain.com`

🎉 **Your static site is live with HTTPS!**

---

## ⚛️ Project 2: Node.js Application

### What is Node.js?

**Node.js**: JavaScript runtime for building server-side applications.

**Use cases:**
- REST APIs
- Real-time applications (chat, games)
- Full-stack web applications
- Microservices

### Step 1: Prepare Your Application

```bash
cd ~/mywebclass_hosting/templates/nodejs-app
```

The template includes:
```
├── server.js           # Main application
├── package.json        # Dependencies
├── Dockerfile          # Container build instructions
└── .dockerignore       # Files to exclude from image
```

### Step 2: Review the Example App

```bash
cat server.js
```

Example Express server:
```javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Node.js!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Step 3: Create Dockerfile

```bash
nano Dockerfile
```

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Run as non-root user
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "server.js"]
```

### Step 4: Create docker-compose.yml

```yaml
version: '3.8'

services:
  my-nodejs-app:
    build: .
    container_name: my-nodejs-app
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
    networks:
      - web
      - internal

networks:
  web:
    external: true
  internal:
    external: true
```

### Step 5: Add to Caddyfile

```caddyfile
# Node.js API
api.yourdomain.com {
    reverse_proxy my-nodejs-app:3000
    encode gzip
}
```

### Step 6: Build and Deploy

```bash
# Build the image
sudo docker compose build

# Start the container
sudo docker compose up -d

# Check logs
sudo docker compose logs -f my-nodejs-app

# Reload Caddy
cd ~/mywebclass_hosting/caddy
sudo docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

### Step 7: Test

```bash
# Test locally
curl https://api.yourdomain.com

# Response:
# {"message":"Hello from Node.js!"}
```

---

## 🐍 Project 3: Python Flask Application

### What is Flask?

**Flask**: Lightweight Python web framework.

**Use cases:**
- REST APIs
- Web applications
- Data science dashboards
- Backend services

### Step 1: Prepare Application

```bash
cd ~/mywebclass_hosting/templates/python-flask
```

Template includes:
```
├── app.py              # Flask application
├── requirements.txt    # Python dependencies
├── Dockerfile          # Container instructions
└── .dockerignore
```

### Step 2: Review Flask App

```bash
cat app.py
```

```python
from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/')
def hello():
    return jsonify(message='Hello from Flask!')

@app.route('/health')
def health():
    return jsonify(status='healthy')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
```

### Step 3: Create Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Run as non-root
RUN useradd -m appuser
USER appuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/health')"

# Run with gunicorn (production server)
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "app:app"]
```

### Step 4: Update requirements.txt

```txt
Flask==3.0.0
gunicorn==21.2.0
```

### Step 5: Create docker-compose.yml

```yaml
version: '3.8'

services:
  my-flask-app:
    build: .
    container_name: my-flask-app
    restart: unless-stopped
    environment:
      - FLASK_ENV=production
      - PORT=5000
    networks:
      - web
      - internal

networks:
  web:
    external: true
  internal:
    external: true
```

### Step 6: Add to Caddyfile

```caddyfile
# Flask application
flask.yourdomain.com {
    reverse_proxy my-flask-app:5000
    encode gzip
}
```

### Step 7: Deploy

```bash
sudo docker compose build
sudo docker compose up -d
sudo docker compose logs -f my-flask-app

# Reload Caddy
cd ~/mywebclass_hosting/caddy
sudo docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

---

## ⚛️ Project 4: React Application

### What is React?

**React**: JavaScript library for building user interfaces.

**Use cases:**
- Single Page Applications (SPAs)
- Interactive dashboards
- Progressive Web Apps (PWAs)
- Modern frontends

### Step 1: Build React App Locally

On your **local machine** (not server):

```bash
# Create new React app (if you don't have one)
npx create-react-app my-react-app
cd my-react-app

# Build for production
npm run build
```

This creates a `build/` directory with optimized static files.

### Step 2: Upload to Server

```bash
# From local machine, upload build files
scp -r build/* username@YOUR_SERVER_IP:~/mywebclass_hosting/templates/react-app/
```

### Step 3: Create docker-compose.yml on Server

```bash
cd ~/mywebclass_hosting/templates/react-app
nano docker-compose.yml
```

```yaml
version: '3.8'

services:
  my-react-app:
    image: nginx:alpine
    container_name: my-react-app
    restart: unless-stopped
    volumes:
      - ./:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    networks:
      - web

networks:
  web:
    external: true
```

### Step 4: Create nginx.conf for SPA Routing

```bash
nano nginx.conf
```

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA routing - send all requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Step 5: Add to Caddyfile

```caddyfile
# React app
app.yourdomain.com {
    reverse_proxy my-react-app:80
    encode gzip
}
```

### Step 6: Deploy

```bash
sudo docker compose up -d

# Reload Caddy
cd ~/mywebclass_hosting/caddy
sudo docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

---

## 🔐 Managing Environment Variables

### Using .env Files

Create `.env` file in your project:

```bash
cd ~/mywebclass_hosting/templates/nodejs-app
nano .env
```

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db:5432/myapp
API_KEY=your_secret_key_here
PORT=3000
```

**Important: Add to .gitignore!**
```bash
echo ".env" >> .gitignore
```

### Using in docker-compose.yml

```yaml
services:
  my-app:
    build: .
    env_file:
      - .env
    environment:
      - ADDITIONAL_VAR=value
```

### Secrets Management (Production)

For production, use Docker secrets or external secret managers:

```yaml
services:
  my-app:
    build: .
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

---

## 🔍 Monitoring Your Applications

### View Logs

```bash
# Real-time logs
sudo docker compose logs -f my-nodejs-app

# Last 100 lines
sudo docker compose logs --tail 100 my-flask-app

# All services
sudo docker compose logs -f
```

### Check Resource Usage

```bash
# All containers
sudo docker stats

# Specific container
sudo docker stats my-nodejs-app
```

### Health Checks

```bash
# Check if container is healthy
sudo docker ps

# STATUS column shows health
# "healthy" = good
# "unhealthy" = problem
```

---

## 🎓 Best Practices

### Development vs. Production

**Development:**
```yaml
services:
  app:
    build: .
    volumes:
      - ./:/app  # Live code reload
    environment:
      - DEBUG=true
```

**Production:**
```yaml
services:
  app:
    image: my-app:v1.0.0  # Versioned image
    restart: unless-stopped
    environment:
      - DEBUG=false
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

### Security Checklist

- [ ] Run containers as non-root user
- [ ] Use `.dockerignore` to exclude sensitive files
- [ ] Don't commit `.env` files to git
- [ ] Use specific image tags (not `latest`)
- [ ] Implement health checks
- [ ] Limit container resources
- [ ] Keep images updated
- [ ] Scan for vulnerabilities

### Performance Tips

```yaml
# Use multi-stage builds
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/server.js"]
```

---

## ✅ Verification Checklist

- [ ] At least one application deployed successfully
- [ ] HTTPS working for your app
- [ ] Health checks passing
- [ ] Logs are accessible
- [ ] Environment variables configured
- [ ] Containers restart automatically
- [ ] Domain routing works correctly

---

## 🎯 What You Accomplished

✅ Deployed multiple types of applications  
✅ Configured domain routing for each app  
✅ Implemented health checks and monitoring  
✅ Set up environment variable management  
✅ Applied production best practices  

**You now have a fully functional hosting platform!**

---

## ❓ Troubleshooting

**Problem: Container exits immediately**

```bash
# Check logs
sudo docker compose logs my-app

# Common causes:
# - Syntax error in code
# - Missing dependencies
# - Port already in use
```

**Problem: 502 Bad Gateway**

```bash
# Container not running
sudo docker compose ps

# Start container
sudo docker compose up -d

# Check if app is listening on correct port
sudo docker compose exec my-app netstat -tlnp
```

**Problem: Can't connect to database**

```bash
# Verify containers are on same network
sudo docker network inspect internal

# Check database is running
sudo docker compose ps

# Test connection from app container
sudo docker compose exec my-app ping database-container
```

---

## 📚 Additional Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
- [Docker Compose File Reference](https://docs.docker.com/compose/compose-file/)
- [Twelve-Factor App](https://12factor.net/)

---

## 🔗 Next Steps

➡️ **[Chapter 10: Monitoring & Maintenance](10-monitoring-maintenance.md)** - Keep your server healthy

---

[⬅️ Previous: Caddy Setup](08-reverse-proxy-caddy.md) | [Back to Main Guide](../README.md) | [Next: Monitoring ➡️](10-monitoring-maintenance.md)
