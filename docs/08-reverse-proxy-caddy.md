# Chapter 8: Reverse Proxy with Caddy

**Automatic HTTPS and Traffic Routing**

In this chapter, you'll set up Caddy—a modern web server with automatic SSL certificates. This is the heart of your hosting platform, handling all incoming web traffic.

---

## 📖 What You'll Learn

- What a reverse proxy is and why you need one
- How SSL/TLS certificates work
- Installing and configuring Caddy
- Setting up automatic HTTPS with Let's Encrypt
- Routing traffic to different applications
- Monitoring and troubleshooting

---

## 🔄 What is a Reverse Proxy?

### Definition

A **reverse proxy** sits in front of your web applications and forwards client requests to the appropriate backend server.

### The Hotel Concierge Analogy

Think of a reverse proxy like a hotel concierge:

**Without Reverse Proxy:**
- Guests go directly to rooms
- Need to know room numbers
- No security checkpoint
- Guests see internal layout

**With Reverse Proxy (Concierge):**
- All guests go to front desk first
- Concierge directs to correct room
- Security checkpoint
- Guests don't see internal layout

**In web terms:**
```
Internet → Caddy (Reverse Proxy) → App 1
                                  → App 2
                                  → App 3
```

### Why Use a Reverse Proxy?

1. **SSL Termination**: Handle HTTPS in one place
2. **Load Balancing**: Distribute traffic across servers
3. **Security**: Hide backend server details
4. **Caching**: Speed up responses
5. **Routing**: Send requests to correct app
6. **Compression**: Reduce bandwidth

---

## 🆚 Reverse Proxy vs. Web Server

### Traditional Web Server

```
nginx/Apache → Serves static files directly
```

**Use for:** Simple static websites

### Reverse Proxy

```
Caddy/nginx → Routes to → Node.js app
                        → Python app
                        → Static site
```

**Use for:** Multiple applications, microservices, modern architectures

---

## 🔒 Understanding SSL/TLS

### What is SSL/TLS?

**SSL/TLS** encrypts communication between browsers and servers.

**Without SSL (HTTP):**
```
Browser → "password123" → Server
         (anyone can read this!)
```

**With SSL (HTTPS):**
```
Browser → "EncRyPt3d_D@t@" → Server
         (encrypted, secure)
```

### Let's Encrypt

**Let's Encrypt** provides free SSL certificates:
- ✅ Free forever
- ✅ Automated renewal
- ✅ Trusted by all browsers
- ✅ Industry standard

**Caddy handles this automatically!**

---

## 🐳 Why Caddy?

### Caddy vs. Alternatives

**Nginx:**
- ✅ Fast, powerful
- ❌ Complex configuration
- ❌ Manual SSL setup
- ❌ Harder for beginners

**Apache:**
- ✅ Mature, widely used
- ❌ Verbose configuration
- ❌ Manual SSL setup
- ❌ Complex syntax

**Caddy:**
- ✅ Automatic HTTPS
- ✅ Simple configuration
- ✅ Modern and fast
- ✅ Perfect for learning
- ❌ Newer (less documentation than nginx)

**For students: Caddy is ideal!**

---

## 📦 Setting Up Caddy with Docker

### Step 1: Clone the Repository

```bash
cd ~
git clone https://github.com/kaw393939/mywebclass_hosting.git
cd mywebclass_hosting
```

If you created this earlier, just pull updates:
```bash
cd ~/mywebclass_hosting
git pull origin master
```

### Step 2: Understand the Structure

```
mywebclass_hosting/
├── caddy/
│   ├── Caddyfile           # Main configuration
│   ├── docker-compose.yml  # Container setup
│   ├── data/               # SSL certificates
│   └── config/             # Caddy config cache
└── examples/
    └── main-site/          # Example website
```

### Step 3: Update Domain Configuration

Edit the Caddyfile for YOUR domain:

```bash
cd ~/mywebclass_hosting/caddy
nano Caddyfile
```

**Change these lines:**
```
# OLD:
www.mywebclass.org, mywebclass.org {
    ...
}

# NEW (your domain):
www.yourdomain.com, yourdomain.com {
    reverse_proxy main-site:80
    ...
}
```

**If you don't have a domain yet**, use your server IP for testing:
```
http://YOUR_SERVER_IP {
    reverse_proxy main-site:80
    encode gzip
}
```

**Note:** Can't get Let's Encrypt SSL with IP addresses only!

Save and exit (Ctrl+X, Y, Enter).

### Step 4: Start Caddy

```bash
cd ~/mywebclass_hosting/caddy
sudo docker compose up -d
```

**What happens:**
1. Downloads Caddy image
2. Downloads nginx image (for example site)
3. Creates Docker networks
4. Starts containers
5. Caddy requests SSL certificate
6. Certificate is obtained and installed

⏱️ First run takes 1-2 minutes.

### Step 5: Verify It's Running

```bash
sudo docker compose ps
```

Should show:
```
NAME        STATUS      PORTS
caddy       Up          0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
main-site   Up          80/tcp
```

---

## ✅ Testing Your Setup

### Test 1: Local Connection

```bash
curl -I http://localhost
```

Should return:
```
HTTP/1.1 200 OK
...
```

### Test 2: External Connection (HTTP)

From your **local machine**:
```bash
curl -I http://YOUR_SERVER_IP
```

Or visit in browser: `http://YOUR_SERVER_IP`

You should see the example website!

### Test 3: HTTPS (if you have a domain)

Visit: `https://www.yourdomain.com`

**First visit:** Caddy is getting the certificate (may take 30 seconds)

**Subsequent visits:** Instant! Certificate is cached.

Check certificate in browser:
- Click padlock icon
- View certificate
- Issuer should be "Let's Encrypt Authority"

---

## 📝 Understanding the Caddyfile

Let's break down the configuration:

```caddyfile
# Global options (must be first!)
{
    # Email for Let's Encrypt notifications
    email admin@yourdomain.com
    
    # Default domain for SNI
    default_sni www.yourdomain.com
}

# Main website configuration
www.yourdomain.com, yourdomain.com {
    # Route traffic to backend container
    reverse_proxy main-site:80
    
    # Security headers
    header {
        X-Frame-Options "DENY"
        X-Content-Type-Options "nosniff"
        X-XSS-Protection "1; mode=block"
        Strict-Transport-Security "max-age=31536000"
    }
    
    # Enable compression
    encode gzip
    
    # Logging
    log {
        output file /var/log/caddy/access.log
    }
}
```

**Key sections:**

**1. Global block `{}`**
- Configuration that applies to all sites
- Email for certificate expiration notifications
- Must be first in the file

**2. Site block `domain {}`**
- Configuration for specific domain
- Automatic HTTPS for this domain
- Routes and settings

**3. reverse_proxy**
- Forwards traffic to backend
- `main-site:80` = container name : port
- Docker handles DNS resolution

**4. Security headers**
- `X-Frame-Options`: Prevent clickjacking
- `X-Content-Type-Options`: Prevent MIME sniffing
- `Strict-Transport-Security`: Force HTTPS

---

## 🔧 Adding More Sites

### Add a Subdomain

Edit Caddyfile:
```bash
nano ~/mywebclass_hosting/caddy/Caddyfile
```

Add new site block:
```caddyfile
# API subdomain
api.yourdomain.com {
    reverse_proxy api-service:3000
    encode gzip
}
```

Reload Caddy:
```bash
sudo docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

### Add Student Sites

```caddyfile
# Student 1
student1.yourdomain.com {
    reverse_proxy student1-app:80
    encode gzip
}

# Student 2
student2.yourdomain.com {
    reverse_proxy student2-app:8080
    encode gzip
}
```

Each student gets their own subdomain!

---

## 📊 Monitoring Caddy

### View Logs

```bash
# Access logs
sudo docker compose logs caddy

# Follow logs in real-time
sudo docker compose logs -f caddy

# Last 50 lines
sudo docker compose logs caddy --tail 50
```

### Check SSL Certificate Info

```bash
# From inside container
sudo docker compose exec caddy caddy list-modules

# Check certificate details
sudo ls -lah ~/mywebclass_hosting/caddy/data/caddy/certificates/
```

### View Running Configuration

```bash
sudo docker compose exec caddy caddy adapt --config /etc/caddy/Caddyfile --pretty
```

Shows the JSON configuration Caddy is actually using.

---

## 🔄 Common Operations

### Reload Configuration

After editing Caddyfile:
```bash
sudo docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

**Note:** Reload is **graceful**—no downtime!

### Restart Caddy

```bash
sudo docker compose restart caddy
```

### Stop Everything

```bash
sudo docker compose down
```

### Start Everything

```bash
sudo docker compose up -d
```

### View Container Stats

```bash
sudo docker stats
```

Shows CPU, memory, network usage in real-time.

---

## 🎓 Best Practices

### Security

✅ **Do's:**
- Always use HTTPS in production
- Keep Caddy updated
- Use security headers
- Log access for monitoring
- Limit container resources

❌ **Don'ts:**
- Don't expose backend ports directly
- Don't use self-signed certs in production
- Don't ignore certificate expiration warnings
- Don't run Caddy as root (containers handle this)

### Performance

✅ **Optimizations:**
- Enable compression (`encode gzip`)
- Use HTTP/2 (Caddy does this automatically)
- Cache static assets
- Use CDN for static files (advanced)

### Maintenance

```bash
# Weekly: Check logs
sudo docker compose logs caddy --tail 100

# Monthly: Update images
sudo docker compose pull
sudo docker compose up -d

# Quarterly: Review configuration
sudo cat ~/mywebclass_hosting/caddy/Caddyfile
```

---

## 🧪 Advanced Configurations

### Basic Authentication

Protect an admin area:

```caddyfile
admin.yourdomain.com {
    basicauth {
        admin $2a$14$hashed_password_here
    }
    reverse_proxy admin-panel:8080
}
```

Generate password hash:
```bash
sudo docker compose exec caddy caddy hash-password --plaintext 'your_password'
```

### Load Balancing

Balance traffic across multiple backend servers:

```caddyfile
app.yourdomain.com {
    reverse_proxy backend1:80 backend2:80 backend3:80 {
        lb_policy round_robin
        health_check /health
    }
}
```

### Custom Error Pages

```caddyfile
yourdomain.com {
    reverse_proxy app:80
    
    handle_errors {
        rewrite * /error-{http.error.status_code}.html
        file_server
    }
}
```

---

## ✅ Verification Checklist

Before moving to the next chapter, verify:

- [ ] Caddy is running in Docker
- [ ] You can access your site via HTTP
- [ ] SSL certificate is obtained (if using domain)
- [ ] HTTPS works (if using domain)
- [ ] Security headers are present
- [ ] You can reload configuration
- [ ] Logs are accessible
- [ ] You understand the Caddyfile structure

### Quick Test

```bash
# Check running
sudo docker compose ps

# Test HTTP
curl -I http://YOUR_SERVER_IP

# Test HTTPS (with domain)
curl -I https://www.yourdomain.com

# Check certificate
sudo docker compose exec caddy ls /data/caddy/certificates/
```

---

## 🎯 What You Accomplished

✅ Deployed Caddy reverse proxy with Docker  
✅ Configured automatic HTTPS with Let's Encrypt  
✅ Set up traffic routing to applications  
✅ Enabled security headers and compression  
✅ Learned to manage and monitor Caddy  

**Major milestone:** You now have a production-grade web hosting platform with automatic SSL!

---

## 🔍 How It All Works Together

```
Internet
   │
   ↓
┌─────────────────────────────────┐
│  Firewall (UFW)                  │
│  Ports 80, 443 open              │
└──────────┬──────────────────────┘
           ↓
┌─────────────────────────────────┐
│  Caddy (Reverse Proxy)           │
│  - Obtains SSL certificate       │
│  - Terminates HTTPS              │
│  - Routes traffic                │
└──────────┬──────────────────────┘
           ↓
┌─────────────────────────────────┐
│  Docker Internal Network         │
│  ┌────────┐  ┌────────┐         │
│  │ App 1  │  │ App 2  │         │
│  │  :80   │  │ :3000  │         │
│  └────────┘  └────────┘         │
└─────────────────────────────────┘
```

---

## ❓ Troubleshooting

**Problem: Can't get SSL certificate**

Check:
```bash
# 1. Domain points to server
dig yourdomain.com

# 2. Ports are open
sudo ufw status | grep "80\|443"

# 3. Caddy logs
sudo docker compose logs caddy | grep -i error
```

**Problem: Certificate not renewing**

Let's Encrypt certificates last 90 days. Caddy renews automatically.

Check renewal:
```bash
# View certificate expiration
sudo docker compose exec caddy caddy list-modules
```

**Problem: 502 Bad Gateway**

Backend container not running:
```bash
# Check all containers
sudo docker compose ps

# Check logs
sudo docker compose logs main-site
```

**Problem: Configuration not reloading**

```bash
# Test configuration syntax
sudo docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile

# Force reload
sudo docker compose restart caddy
```

---

## 📚 Additional Resources

- [Caddy Official Documentation](https://caddyserver.com/docs/)
- [Caddyfile Syntax](https://caddyserver.com/docs/caddyfile)
- [Let's Encrypt How It Works](https://letsencrypt.org/how-it-works/)
- [HTTP/2 Explained](https://developers.google.com/web/fundamentals/performance/http2)

---

## 🔗 Next Steps

➡️ **[Chapter 9: Deploying Applications](09-deploying-applications.md)** - Deploy your first real application

---

[⬅️ Previous: Docker Installation](07-docker-installation.md) | [Back to Main Guide](../README.md) | [Next: Deploying Apps ➡️](09-deploying-applications.md)
