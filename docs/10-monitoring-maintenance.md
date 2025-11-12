# Chapter 10: Monitoring & Maintenance

**Keeping Your Server Healthy**

In this final chapter, you'll learn how to maintain your hosting platform long-term. Monitoring, updates, backups, and troubleshooting—everything you need to keep your server running smoothly.

---

## 📖 What You'll Learn

- System monitoring and metrics
- Log management
- Automated updates
- Backup strategies
- Performance optimization
- Disaster recovery
- Troubleshooting methodology

---

## 📊 System Monitoring

### What to Monitor

**The Four Golden Signals:**
1. **Latency**: How long requests take
2. **Traffic**: Number of requests
3. **Errors**: Failed requests
4. **Saturation**: Resource utilization

### Basic System Metrics

#### Check Disk Space

```bash
# Human-readable format
df -h

# Watch specific directory
du -sh /var/log
du -sh ~/mywebclass_hosting
```

**Warning signs:**
- Usage > 80%: Start cleaning up
- Usage > 90%: Critical, immediate action needed

#### Check Memory Usage

```bash
# Current memory
free -h

# Detailed memory info
cat /proc/meminfo

# Find memory-hungry processes
ps aux --sort=-%mem | head -10
```

#### Check CPU Usage

```bash
# Real-time CPU usage
top

# Or htop (more user-friendly)
sudo apt install htop -y
htop
```

**Press 'q' to quit**

#### Check Load Average

```bash
uptime
```

Output:
```
10:30:15 up 5 days, 3:24, 1 user, load average: 0.15, 0.10, 0.08
```

**Understanding load average:**
- Three numbers: 1-min, 5-min, 15-min average
- **< 1.0**: System healthy
- **1.0-2.0**: Getting busy
- **> 2.0**: Overloaded (for 1-CPU system)

---

## 📝 Log Management

### Important Log Locations

```bash
# System logs
/var/log/syslog          # General system messages
/var/log/auth.log        # Authentication attempts
/var/log/kern.log        # Kernel messages

# Application logs
/var/log/fail2ban.log    # Fail2Ban activity
/var/log/ufw.log         # Firewall logs
~/mywebclass_hosting/caddy/logs/  # Caddy logs

# Docker logs
sudo docker logs CONTAINER_NAME
```

### Viewing Logs

```bash
# Last 50 lines
tail -50 /var/log/syslog

# Follow in real-time
tail -f /var/log/syslog

# Search logs
grep "error" /var/log/syslog

# View with timestamps
sudo journalctl -u docker -f
```

### Log Rotation

Logs can fill your disk! Set up automatic rotation:

```bash
# Check current rotation config
cat /etc/logrotate.conf

# Custom rotation for your apps
sudo nano /etc/logrotate.d/myapps
```

Add:
```
/home/*/mywebclass_hosting/caddy/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

**What this does:**
- **daily**: Rotate logs daily
- **rotate 7**: Keep 7 days of logs
- **compress**: Gzip old logs
- **delaycompress**: Wait one rotation before compressing
- **missingok**: Don't error if log file missing
- **notifempty**: Don't rotate empty logs

### Cleaning Up Old Logs

```bash
# Find large log files
sudo find /var/log -type f -size +100M

# Clean up Docker logs
sudo docker system prune --volumes

# Clean journal logs older than 7 days
sudo journalctl --vacuum-time=7d
```

---

## 🔄 Automated Updates

### System Updates

#### Manual Updates

```bash
# Update package list
sudo apt update

# Upgrade packages
sudo apt upgrade -y

# Distribution upgrade (major updates)
sudo apt dist-upgrade -y

# Remove unused packages
sudo apt autoremove -y
```

#### Automated Security Updates

Install unattended-upgrades:

```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

Check configuration:
```bash
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

Ensure these lines are uncommented:
```
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
};

Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Mail "your-email@example.com";
```

### Docker Updates

```bash
# Update Docker engine
sudo apt update && sudo apt upgrade docker-ce -y

# Update images
cd ~/mywebclass_hosting/caddy
sudo docker compose pull

# Restart with new images
sudo docker compose up -d
```

### Application Updates

```bash
# Pull latest code
cd ~/mywebclass_hosting
git pull origin master

# Rebuild and restart
cd caddy
sudo docker compose build
sudo docker compose up -d
```

---

## 💾 Backup Strategies

### What to Back Up

**Critical data:**
1. Application code and configurations
2. Databases
3. SSL certificates (automatic with Caddy, but good to backup)
4. Environment variables
5. User data

**Don't need to backup:**
- Docker images (can be rebuilt)
- System packages (can be reinstalled)
- Temporary files

### Backup Script

Create a backup script:

```bash
nano ~/backup.sh
```

```bash
#!/bin/bash

# Backup script for hosting platform
BACKUP_DIR="/home/$(whoami)/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_$DATE"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup application code
echo "Backing up application code..."
tar -czf "$BACKUP_DIR/${BACKUP_NAME}_code.tar.gz" \
    --exclude='node_modules' \
    --exclude='*.log' \
    ~/mywebclass_hosting

# Backup Docker volumes
echo "Backing up Docker volumes..."
sudo docker run --rm \
    -v caddy_data:/data \
    -v "$BACKUP_DIR":/backup \
    alpine tar czf /backup/${BACKUP_NAME}_volumes.tar.gz /data

# Backup databases (if you have any)
# Example for PostgreSQL:
# sudo docker exec postgres pg_dumpall -U postgres > "$BACKUP_DIR/${BACKUP_NAME}_db.sql"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -type f -mtime +7 -delete

echo "Backup completed: $BACKUP_NAME"
```

Make it executable:
```bash
chmod +x ~/backup.sh
```

### Automated Daily Backups

```bash
sudo crontab -e
```

Add:
```
# Daily backup at 2 AM
0 2 * * * /home/yourusername/backup.sh >> /home/yourusername/backup.log 2>&1
```

### Backup to Remote Location

Use rsync to copy to another server:

```bash
# In backup.sh, add:
rsync -avz "$BACKUP_DIR/" username@backup-server:/backups/mywebclass/
```

Or use cloud storage:
```bash
# Install AWS CLI
sudo apt install awscli -y

# Configure
aws configure

# In backup.sh, add:
aws s3 sync "$BACKUP_DIR/" s3://your-bucket/backups/
```

---

## ⚡ Performance Optimization

### Docker Optimization

```bash
# Limit container resources
# In docker-compose.yml:
services:
  my-app:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### Caddy Optimization

```caddyfile
# In Caddyfile:
yourdomain.com {
    # Enable HTTP/2
    # (automatically enabled)
    
    # Compression
    encode zstd gzip
    
    # Cache static files
    header /static/* Cache-Control "public, max-age=31536000, immutable"
    
    # Limit request body size
    request_body {
        max_size 10MB
    }
}
```

### System Optimization

```bash
# Disable unnecessary services
sudo systemctl disable bluetooth
sudo systemctl disable cups

# Adjust swappiness (for systems with enough RAM)
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## 🔍 Monitoring Tools

### Basic Monitoring

```bash
# Create monitoring script
nano ~/monitor.sh
```

```bash
#!/bin/bash

echo "=== System Status Report ==="
echo "Generated: $(date)"
echo ""

echo "=== Disk Usage ==="
df -h | grep -E '^/dev/'
echo ""

echo "=== Memory Usage ==="
free -h
echo ""

echo "=== Load Average ==="
uptime
echo ""

echo "=== Docker Containers ==="
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "=== Failed Login Attempts (Last 24h) ==="
sudo journalctl --since "24 hours ago" | grep "Failed password" | wc -l
echo ""

echo "=== Fail2Ban Status ==="
sudo fail2ban-client status sshd | grep "Currently banned"
echo ""
```

Make executable:
```bash
chmod +x ~/monitor.sh
```

Run daily:
```bash
sudo crontab -e
# Add:
0 9 * * * /home/yourusername/monitor.sh | mail -s "Daily Server Report" your-email@example.com
```

### Advanced Monitoring (Optional)

For production systems, consider:

**Prometheus + Grafana:**
- Real-time metrics
- Beautiful dashboards
- Alerting

**Setup guide** (advanced):
```bash
# Install node_exporter for system metrics
# Install cadvisor for Docker metrics
# Configure Prometheus
# Set up Grafana dashboards
```

---

## 🆘 Troubleshooting Methodology

### The OODA Loop

**Observe → Orient → Decide → Act**

1. **Observe**: Gather symptoms and data
2. **Orient**: Understand the problem context
3. **Decide**: Choose a solution approach
4. **Act**: Implement the fix

### Common Issues and Solutions

#### Issue: Server Running Slow

**Diagnose:**
```bash
# Check CPU
top

# Check memory
free -h

# Check disk I/O
iostat -x 1

# Check disk space
df -h

# Check load average
uptime
```

**Solutions:**
- High CPU: Find process with `top`, investigate/restart
- Low memory: Increase swap or add RAM
- Disk full: Clean logs, remove unused Docker images
- High load: Scale resources or optimize applications

#### Issue: Can't Access Website

**Diagnose:**
```bash
# 1. Is Caddy running?
sudo docker compose ps

# 2. Are ports open?
sudo netstat -tlnp | grep ':80\|:443'

# 3. Firewall blocking?
sudo ufw status

# 4. DNS correct?
dig yourdomain.com

# 5. SSL certificate valid?
curl -vI https://yourdomain.com
```

**Solutions:**
- Start Caddy if stopped
- Open ports in firewall
- Fix DNS records
- Regenerate SSL certificate

#### Issue: Application Container Crashing

**Diagnose:**
```bash
# Check container status
sudo docker compose ps

# View logs
sudo docker compose logs my-app

# Check health check
sudo docker inspect my-app | grep -A 10 Health
```

**Solutions:**
- Fix code errors (check logs)
- Increase memory limits
- Check environment variables
- Verify dependencies are available

---

## 📋 Maintenance Schedule

### Daily
- [ ] Check disk space (`df -h`)
- [ ] Review error logs
- [ ] Check container status

### Weekly
- [ ] Review monitoring reports
- [ ] Check backup success
- [ ] Review Fail2Ban banned IPs
- [ ] Update Docker images

### Monthly
- [ ] System updates (`apt update && apt upgrade`)
- [ ] Security scan (`rkhunter`, `chkrootkit`)
- [ ] Review and rotate logs
- [ ] Test backup restore

### Quarterly
- [ ] Disaster recovery drill
- [ ] Security audit
- [ ] Performance review
- [ ] Capacity planning

---

## 🚨 Disaster Recovery

### Scenario: Complete Server Failure

**Recovery steps:**

1. **Create new server** (same as Chapter 1)

2. **Restore from backup:**
```bash
# Copy backup to new server
scp username@backup-server:/backups/latest.tar.gz ~/

# Extract
tar -xzf latest.tar.gz

# Restore Docker volumes
sudo docker volume create caddy_data
sudo docker run --rm \
    -v caddy_data:/data \
    -v ~/backup_volumes.tar.gz:/backup.tar.gz \
    alpine sh -c "cd / && tar xzf /backup.tar.gz"

# Start services
cd ~/mywebclass_hosting/caddy
sudo docker compose up -d
```

3. **Verify everything works**

4. **Update DNS if IP changed**

### Scenario: Compromised Server

**Response:**

1. **Isolate server**: Block all traffic
```bash
sudo ufw default deny incoming
sudo ufw default deny outgoing
```

2. **Document everything**: Take screenshots, save logs

3. **Don't trust the system**: Restore from known-good backup

4. **Investigate**: How did breach occur?

5. **Patch vulnerability**: Fix the security hole

6. **Monitor closely**: Watch for re-infection

---

## ✅ Final Checklist

Congratulations! If you can check all these, you've built a production-grade hosting platform:

### Security
- [ ] No root SSH login
- [ ] SSH key-only authentication
- [ ] Firewall configured (UFW)
- [ ] Intrusion prevention (Fail2Ban)
- [ ] Rootkit scanning (rkhunter, chkrootkit)
- [ ] Regular security updates

### Infrastructure
- [ ] Docker installed and working
- [ ] Caddy reverse proxy running
- [ ] Automatic SSL certificates
- [ ] Multiple applications deployed
- [ ] Health checks configured

### Operations
- [ ] Monitoring in place
- [ ] Logs being collected and rotated
- [ ] Automated backups
- [ ] Maintenance schedule defined
- [ ] Disaster recovery plan

### Documentation
- [ ] Configuration documented
- [ ] Procedures written down
- [ ] Troubleshooting guide ready
- [ ] Emergency contacts noted

---

## 🎯 What You Accomplished

✅ Built a complete monitoring system  
✅ Implemented automated backups  
✅ Set up performance optimization  
✅ Created maintenance procedures  
✅ Established disaster recovery plan  

**🎓 Congratulations!** You've completed the entire hosting platform guide. You now have:
- Production-grade security
- Automated deployment pipeline
- Professional monitoring and maintenance
- Real-world DevOps experience

**This is resume-worthy work!**

---

## 🚀 What's Next?

### Continue Learning

1. **Advanced Topics:**
   - Kubernetes orchestration
   - CI/CD pipelines
   - Infrastructure as Code (Terraform)
   - Advanced monitoring (Prometheus, Grafana)

2. **Scale Your Platform:**
   - Load balancing
   - Database replication
   - Multi-server setup
   - CDN integration

3. **Specialize:**
   - DevOps engineering
   - Site Reliability Engineering (SRE)
   - Cloud architecture
   - Security engineering

### Share Your Work

- **GitHub**: Push your configuration to GitHub
- **Blog**: Write about what you learned
- **Resume**: Add this project with metrics
- **Portfolio**: Include in your portfolio site
- **LinkedIn**: Share your achievement

---

## 📚 Additional Resources

- [The Site Reliability Workbook](https://sre.google/workbook/table-of-contents/)
- [Linux Performance Tools](http://www.brendangregg.com/linuxperf.html)
- [Docker Security](https://docs.docker.com/engine/security/)
- [DevOps Roadmap](https://roadmap.sh/devops)

---

## 🎊 Congratulations!

You've completed all 10 chapters and built a professional hosting platform from scratch. You now have:

- **Security expertise**: Multi-layered defense
- **DevOps skills**: Modern deployment practices
- **System administration**: Server management
- **Practical experience**: Real production system

**Share your success! Tag @mywebclass on social media with your project!**

---

[⬅️ Previous: Deploying Applications](09-deploying-applications.md) | [Back to Main Guide](../README.md) | [Troubleshooting Guide ➡️](troubleshooting.md)
