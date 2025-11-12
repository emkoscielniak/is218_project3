# 🚀 MyWebClass Hosting Platform

**Master Production Web Hosting from Zero to Deployment**

A complete, hands-on guide to building and securing your own public web server. This isn't just theory—you'll build a real production system that employers will be impressed by in interviews.

---

## 📚 Complete Step-by-Step Guide

This repository is organized like a textbook, with each chapter teaching you a critical skill. Follow them in order to build your production hosting platform from scratch.

### 🔰 Part 1: Foundation & Security (Chapters 1-6)

**Learn the fundamentals of server security and system administration**

1. **[Server Setup](docs/01-server-setup.md)** - Get your first VPS running
   - Choosing a VPS provider
   - Initial SSH connection
   - Understanding your server

2. **[User Management](docs/02-user-management.md)** - Create your admin account securely  
   - Why you shouldn't use root
   - Creating secure user accounts
   - SSH key authentication

3. **[SSH Hardening](docs/03-ssh-hardening.md)** - Lock down remote access
   - Disabling root login
   - Key-only authentication
   - Security best practices

4. **[Firewall Configuration](docs/04-firewall-setup.md)** - Control network traffic
   - Understanding firewalls
   - UFW setup and configuration
   - Opening necessary ports

5. **[Intrusion Prevention](docs/05-fail2ban.md)** - Stop attackers automatically
   - What is Fail2Ban
   - Monitoring failed logins
   - Automated IP banning

6. **[Rootkit Detection](docs/06-rootkit-detection.md)** - Monitor system integrity
   - Understanding rootkits
   - Security scanning tools
   - Automated monitoring

### 🚀 Part 2: Deployment & Applications (Chapters 7-10)

**Build and deploy production-ready web applications**

7. **[Docker Installation](docs/07-docker-installation.md)** - Modern containerization
   - What is Docker
   - Installation and setup
   - Docker security

8. **[Reverse Proxy with Caddy](docs/08-reverse-proxy-caddy.md)** - Automatic HTTPS
   - Understanding reverse proxies
   - Caddy configuration
   - Automatic SSL certificates

9. **[Deploying Applications](docs/09-deploying-applications.md)** - Go live
   - Using project templates
   - Domain configuration
   - Production deployment

10. **[Monitoring & Maintenance](docs/10-monitoring-maintenance.md)** - Keep it running
    - Log management
    - System updates
    - Backup strategies

### 📖 Appendices

- **[Troubleshooting Guide](docs/troubleshooting.md)** - Solutions to common problems
- **[Command Reference](docs/command-reference.md)** - Quick command lookup
- **[Additional Resources](docs/resources.md)** - Continue learning

---

## 🎯 What You'll Build

## 🎯 What You'll Build

By completing this guide, you'll have:

- ✅ **Secure Linux Server** - Hardened against common attacks
- ✅ **Automatic HTTPS** - Free SSL certificates that renew automatically
- ✅ **Production Docker Setup** - Industry-standard containerization
- ✅ **Live Web Applications** - Real sites accessible to anyone
- ✅ **Portfolio Project** - Impressive talking point for interviews
- ✅ **Practical Skills** - System administration, security, DevOps

## 🎓 What You'll Learn

**Security & System Administration:**
- Linux server management and hardening
- SSH security and key-based authentication  
- Firewall configuration (UFW)
- Intrusion detection and prevention (Fail2Ban)
- Rootkit detection and system monitoring
- Security best practices

**Modern DevOps:**

**Modern DevOps:**
- Docker and containerization
- Docker Compose for multi-container apps
- Reverse proxy architecture with Caddy
- Automatic SSL/TLS with Let's Encrypt
- Zero-downtime deployments
- Infrastructure as code

**Web Development & Deployment:**
- Domain and DNS configuration
- Static site hosting
- Node.js and Python application deployment
- Environment variable management
- Log monitoring and debugging
- Production troubleshooting

---

## 🚦 Getting Started

**Prerequisites:**
- Basic command line knowledge
- A domain name (optional but recommended)
- $5-10/month for a VPS (DigitalOcean, Linode, etc.)
- Your GitHub SSH key

**Start Here:**
1. Begin with [Chapter 1: Server Setup](docs/01-server-setup.md)
2. Follow each chapter in order
3. Don't skip chapters—each builds on the previous one
4. Test everything as you go

---

```
hosting/
├── caddy/                  # Reverse proxy configuration
│   ├── Caddyfile          # Main routing configuration
│   ├── docker-compose.yml # Caddy container setup
│   └── data/              # SSL certificates & config
├── templates/             # Student project templates
│   ├── static-site/       # HTML/CSS/JS websites
│   ├── nodejs-app/        # Node.js applications
│   ├── python-flask/      # Python web apps
│   └── react-app/         # React applications
├── examples/              # Working example projects
├── docs/                  # Detailed documentation
│   ├── getting-started.md # Quick setup guide
│   ├── deployment.md      # How to deploy apps
│   ├── ssl-setup.md       # SSL certificate management
│   ├── troubleshooting.md # Common issues & solutions
│   └── advanced.md        # Advanced configurations
├── scripts/               # Utility scripts
│   ├── setup.sh           # Initial server setup
│   ├── deploy.sh          # Application deployment
│   └── ssl-check.sh       # SSL certificate monitoring
└── README.md              # This file
```

## ⚡ Quick Start

### 1. Clone Repository
```bash
git clone git@github.com:kaw393939/mywebclass_hosting.git
cd mywebclass_hosting
```

### 2. Initial Setup
```bash
./scripts/setup.sh
```

### 3. Deploy Your First Site
```bash
# Copy a template
cp -r templates/static-site/ my-website/
cd my-website/
# Edit your content
./deploy.sh
```

### 4. Configure Domain
Add your domain to `caddy/Caddyfile`:
```
yourdomain.com {
    reverse_proxy my-website:80
}
```

### 5. Start Services
```bash
cd caddy/
docker compose up -d
```

🎉 **Your website is now live with automatic HTTPS!**

## 🛡️ Security Features

- ✅ **Automatic SSL** - Let's Encrypt certificates
- ✅ **Firewall Protection** - UFW configured
- ✅ **SSH Security** - Key-based authentication
- ✅ **Container Isolation** - Docker security
- ✅ **Monitoring** - System health checks
- ✅ **Auto-Updates** - Security patches

## 🎓 Learning Paths

### **Beginner Level**
1. Deploy a static HTML website
2. Configure custom domain
3. Understand SSL certificates
4. Basic Docker commands

### **Intermediate Level**  
1. Deploy Node.js/Python applications
2. Database integration
3. Environment variables
4. Multiple applications

### **Advanced Level**
1. Load balancing multiple instances
2. CI/CD with GitHub Actions  
3. Monitoring and logging
4. Performance optimization

## 📖 Documentation

- [📋 Getting Started Guide](docs/getting-started.md)
- [🚀 Deployment Guide](docs/deployment.md)
- [🔒 SSL Setup](docs/ssl-setup.md)
- [🔧 Troubleshooting](docs/troubleshooting.md)
- [⚙️ Advanced Configuration](docs/advanced.md)

## 💡 Example Projects

- **Portfolio Website** - Showcase your projects
- **Blog Platform** - Share your thoughts
- **API Service** - Build REST APIs
- **Real-time Chat** - WebSocket applications
- **E-commerce Site** - Online store

## 🤝 Contributing

This is an educational platform - students are encouraged to:
- Submit improvements via Pull Requests
- Share example projects
- Report issues and suggest features
- Help fellow students in discussions

## 📝 License

MIT License - Free for educational and commercial use

## 🆘 Support

- **GitHub Issues** - Bug reports and questions
- **Discussions** - Community help and sharing
- **Wiki** - Additional tutorials and guides

---

**Built for CS Education | Maintained by Professor Williams**

*Empowering students to learn modern web hosting and DevOps practices*