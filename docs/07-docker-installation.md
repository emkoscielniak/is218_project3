# Chapter 7: Docker Installation

**Modern Container Platform Setup**

In this chapter, you'll learn about Docker and containerization—the modern way to deploy applications. Docker is industry-standard technology used by companies worldwide.

---

## 📖 What You'll Learn

- What Docker is and why it matters
- Understanding containers vs. virtual machines
- Installing Docker and Docker Compose
- Configuring Docker security
- Testing your Docker installation
- Best practices for Docker usage

---

## 🐳 What is Docker?

### Definition

**Docker** is a platform for developing, shipping, and running applications in containers.

**Container**: A lightweight, standalone, executable package that includes everything needed to run an application—code, runtime, libraries, and dependencies.

### The Shipping Container Analogy

Think of Docker like shipping containers:

**Before Containers (Old Way):**
- Each cargo shipment unique
- Different handling for each type
- Slow, complex logistics
- High breakage rate

**With Containers (Docker Way):**
- Standard container size
- Same handling everywhere
- Fast, simple logistics
- Protected cargo

**In software:**
- "It works on my machine" → "It works everywhere"
- Same environment (dev, staging, production)
- Easy deployment and scaling
- Isolated applications

---

## 🆚 Containers vs. Virtual Machines

### Virtual Machines

```
┌─────────────────────────────────┐
│     Application A    App B       │
├─────────────────────────────────┤
│     Guest OS         Guest OS    │
├─────────────────────────────────┤
│        Hypervisor                │
├─────────────────────────────────┤
│        Host OS                   │
├─────────────────────────────────┤
│        Hardware                  │
└─────────────────────────────────┘
```

- Heavy (GBs of disk space)
- Slow to start (minutes)
- Full OS per application
- High resource usage

### Containers (Docker)

```
┌─────────────────────────────────┐
│   App A      App B      App C    │
├─────────────────────────────────┤
│          Docker Engine           │
├─────────────────────────────────┤
│          Host OS                 │
├─────────────────────────────────┤
│          Hardware                │
└─────────────────────────────────┘
```

- Lightweight (MBs of disk space)
- Fast to start (seconds)
- Shared OS kernel
- Efficient resource usage

**Key Difference:** Containers share the host OS but are isolated from each other.

---

## 🎯 Why Use Docker?

### For Students

1. **Industry Standard**: Every tech company uses containers
2. **Portfolio Projects**: Impressive on resumes
3. **Easy Deployment**: Package once, run anywhere
4. **Version Control**: Application environments in code
5. **No "Works on My Machine"**: Consistent everywhere

### For Production

1. **Isolation**: Apps don't interfere with each other
2. **Security**: Contained environments limit damage
3. **Scalability**: Easy to add more containers
4. **Portability**: Move between cloud providers easily
5. **Efficiency**: Better resource utilization

---

## 📦 Installing Docker

### Step 1: Remove Old Versions (if any)

```bash
sudo apt remove docker docker-engine docker.io containerd runc
```

It's OK if this says "package not found"—means nothing to remove.

### Step 2: Update and Install Prerequisites

```bash
sudo apt update
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```

**What these are:**
- `ca-certificates`: SSL certificate validation
- `curl`: Download files
- `gnupg`: Cryptographic signing verification
- `lsb-release`: Distribution information

### Step 3: Add Docker's Official GPG Key

```bash
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```

**What this does:**
- Downloads Docker's public key
- Verifies package authenticity
- Prevents malicious packages

### Step 4: Set Up Docker Repository

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

This tells apt where to download Docker from.

### Step 5: Install Docker Engine

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

**Packages installed:**
- `docker-ce`: Docker Community Edition (engine)
- `docker-ce-cli`: Command-line interface
- `containerd.io`: Container runtime
- `docker-buildx-plugin`: Advanced build features
- `docker-compose-plugin`: Multi-container applications

⏱️ This takes 2-3 minutes.

### Step 6: Verify Installation

```bash
sudo docker --version
```

Should show something like:
```
Docker version 24.0.7, build afdd53b
```

---

## 👤 Configuring Docker for Your User

### Why This Matters

Right now, only root can run Docker commands. You need `sudo docker ...` every time.

**Better:** Add your user to the docker group.

### Add User to Docker Group

```bash
sudo usermod -aG docker $USER
```

**What this does:**
- `-aG`: Add to group
- `docker`: The group name
- `$USER`: Your username

### Activate Group Membership

**Option 1: Log out and back in** (recommended)

```bash
exit
# SSH back in
ssh yourusername@YOUR_SERVER_IP
```

**Option 2: Refresh group membership** (current session only)

```bash
newgrp docker
```

### Verify Group Membership

```bash
groups
```

Should show `docker` in the list:
```
yourusername sudo docker
```

---

## 🧪 Testing Docker

### Test 1: Hello World

```bash
docker run hello-world
```

**What happens:**
1. Docker looks for `hello-world` image locally (doesn't find it)
2. Downloads image from Docker Hub
3. Creates a container
4. Runs it
5. Prints a message
6. Exits

Output:
```
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
...
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

✅ **Success!** Docker is working.

### Test 2: Run Interactive Container

```bash
docker run -it ubuntu bash
```

**What this does:**
- `run`: Create and start container
- `-it`: Interactive terminal
- `ubuntu`: Ubuntu image
- `bash`: Command to run

You're now inside an Ubuntu container!

```
root@abc123def456:/#
```

Try commands:
```bash
# Check OS
cat /etc/os-release

# Check processes
ps aux

# Exit container
exit
```

### Test 3: Run Web Server

```bash
docker run -d -p 8080:80 nginx
```

**Flags explained:**
- `-d`: Detached (background)
- `-p 8080:80`: Port mapping (host:container)
- `nginx`: Nginx web server image

**Visit in browser:** `http://YOUR_SERVER_IP:8080`

You should see: "Welcome to nginx!"

### Test 4: Docker Compose

```bash
docker compose version
```

Should show:
```
Docker Compose version v2.23.0
```

✅ **Docker Compose is ready!**

---

## 🔒 Docker Security Configuration

### 1. Enable Docker Daemon Logging

Edit Docker daemon config:

```bash
sudo nano /etc/docker/daemon.json
```

Add:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "live-restore": true
}
```

**What this does:**
- **log-driver**: How logs are stored
- **max-size**: Max log file size (10MB)
- **max-file**: Keep 3 log files
- **live-restore**: Containers survive Docker daemon restarts

Save and restart Docker:
```bash
sudo systemctl restart docker
```

### 2. Limit Resources (Prevent DoS)

When running containers, limit resources:

```bash
# Example: Limit CPU and memory
docker run -d \
  --cpus="1.0" \
  --memory="512m" \
  --restart unless-stopped \
  nginx
```

### 3. Use Official Images Only

**Do's ✅:**
- Use official images: `nginx`, `ubuntu`, `node`, `python`
- Check image source on Docker Hub
- Verify image signatures

**Don'ts ❌:**
- Download random images
- Use `latest` tag in production (use version numbers)
- Run untrusted containers

### 4. Regular Updates

```bash
# Update Docker
sudo apt update && sudo apt upgrade docker-ce -y

# Pull latest images
docker pull nginx:latest
docker pull ubuntu:latest
```

---

## 📊 Docker Commands Reference

### Container Management

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Start a container
docker start CONTAINER_ID

# Stop a container
docker stop CONTAINER_ID

# Remove a container
docker rm CONTAINER_ID

# View container logs
docker logs CONTAINER_ID

# Execute command in running container
docker exec -it CONTAINER_ID bash
```

### Image Management

```bash
# List images
docker images

# Pull an image
docker pull IMAGE_NAME

# Remove an image
docker rmi IMAGE_NAME

# Build an image
docker build -t my-app .
```

### System Management

```bash
# View Docker info
docker info

# Check disk usage
docker system df

# Clean up unused resources
docker system prune

# Clean everything (careful!)
docker system prune -a --volumes
```

---

## 🎓 Docker Best Practices

### Do's ✅

- **Use official images** as base
- **Tag images** with versions (not `latest`)
- **Limit resources** for containers
- **Use .dockerignore** files
- **Run as non-root** in containers when possible
- **Keep images small** (alpine variants)
- **Use Docker Compose** for multi-container apps
- **Back up volumes** regularly

### Don'ts ❌

- **Don't run as root** unless necessary
- **Don't store secrets** in images
- **Don't use `latest` tag** in production
- **Don't ignore security updates**
- **Don't mix dev/prod** configurations
- **Don't commit sensitive data** to images

---

## 🧹 Maintenance Commands

### Clean Up Stopped Containers

```bash
docker container prune
```

### Clean Up Unused Images

```bash
docker image prune
```

### Clean Up Everything (Nuclear Option)

```bash
# WARNING: Removes all stopped containers, unused networks, dangling images
docker system prune -a

# Add volumes too (CAREFUL!)
docker system prune -a --volumes
```

### Check Disk Usage

```bash
docker system df
```

Output:
```
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          5         2         1.2GB     800MB (66%)
Containers      3         1         50MB      25MB (50%)
Local Volumes   2         1         100MB     50MB (50%)
```

---

## ✅ Verification Checklist

Before moving to the next chapter, verify:

- [ ] Docker is installed and running
- [ ] Docker Compose is installed
- [ ] Your user is in docker group
- [ ] You can run `docker ps` without sudo
- [ ] Hello World container ran successfully
- [ ] You can access nginx test on port 8080
- [ ] Docker daemon config is set
- [ ] You understand basic Docker commands

### Quick Test

```bash
# Check Docker status
sudo systemctl status docker

# Run without sudo
docker ps

# Test Docker Compose
docker compose version

# Check group membership
groups | grep docker
```

---

## 🎯 What You Accomplished

✅ Installed Docker Community Edition  
✅ Installed Docker Compose  
✅ Configured Docker for your user  
✅ Tested Docker with multiple containers  
✅ Configured Docker security settings  
✅ Learned essential Docker commands  

**Industry skills acquired:** You now know containerization—a core technology in modern software development!

---

## 🔍 Understanding What You Built

```
┌─────────────────────────────────────┐
│         Your Server                  │
├─────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐           │
│  │ Nginx   │  │ App     │  Docker   │
│  │Container│  │Container│ Containers│
│  └─────────┘  └─────────┘           │
├─────────────────────────────────────┤
│        Docker Engine                 │
├─────────────────────────────────────┤
│        Ubuntu 24.04                  │
└─────────────────────────────────────┘
```

Each container is isolated but can communicate with others through Docker networks.

---

## ❓ Troubleshooting

**Problem: "Permission denied" when running docker commands**

```bash
# Check group membership
groups

# If docker not in list, add yourself
sudo usermod -aG docker $USER

# Log out and back in
exit
```

**Problem: Docker service not starting**

```bash
# Check status
sudo systemctl status docker

# View logs
sudo journalctl -u docker -n 50

# Restart service
sudo systemctl restart docker
```

**Problem: Can't pull images (network error)**

```bash
# Check internet
ping -c 3 google.com

# Check DNS
cat /etc/resolv.conf

# Test Docker Hub connectivity
curl https://hub.docker.com
```

**Problem: Disk space issues**

```bash
# Check disk usage
df -h

# Check Docker usage
docker system df

# Clean up
docker system prune -a
```

---

## 📚 Additional Resources

- [Docker Official Documentation](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/) - Official image repository
- [Docker Getting Started](https://docs.docker.com/get-started/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Play with Docker](https://labs.play-with-docker.com/) - Free online sandbox

---

## 🔗 Next Steps

➡️ **[Chapter 8: Reverse Proxy with Caddy](08-reverse-proxy-caddy.md)** - Set up automatic HTTPS

Now that you have Docker, we'll deploy Caddy to handle web traffic and SSL certificates!

---

[⬅️ Previous: Rootkit Detection](06-rootkit-detection.md) | [Back to Main Guide](../README.md) | [Next: Caddy Setup ➡️](08-reverse-proxy-caddy.md)
