# Troubleshooting Guide

**Common Problems and Solutions**

This appendix provides quick solutions to common problems you might encounter. Organized by category for quick reference.

---

## 🔑 SSH Connection Issues

### Can't Connect to Server

**Problem:** `ssh: connect to host X.X.X.X port 22: Connection refused`

**Solutions:**
```bash
# 1. Check if SSH is running (from VPS console)
sudo systemctl status sshd

# 2. Start SSH if stopped
sudo systemctl start sshd

# 3. Check firewall
sudo ufw status | grep 22

# 4. Allow SSH in firewall
sudo ufw allow 22/tcp
```

### Permission Denied (publickey)

**Problem:** Can't log in with SSH key

**Solutions:**
```bash
# On server, check authorized_keys
cat ~/.ssh/authorized_keys

# Fix permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# Verify correct user
whoami

# On local machine, verify key location
ls -la ~/.ssh/

# Specify key explicitly
ssh -i ~/.ssh/id_ed25519 username@server_ip
```

### Too Many Authentication Failures

**Problem:** Multiple SSH keys cause failures

**Solution:** Create SSH config on local machine:
```bash
nano ~/.ssh/config
```

Add:
```
Host myserver
    HostName YOUR_SERVER_IP
    User yourusername
    IdentityFile ~/.ssh/specific_key
    IdentitiesOnly yes
```

Connect with: `ssh myserver`

---

## 🐳 Docker Issues

### Permission Denied When Running Docker

**Problem:** `permission denied while trying to connect to Docker daemon socket`

**Solution:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in, or:
newgrp docker

# Verify
groups | grep docker
```

### Container Won't Start

**Problem:** Container exits immediately after starting

**Diagnose:**
```bash
# Check logs
sudo docker compose logs container-name

# Check container status
sudo docker compose ps

# Inspect container
sudo docker inspect container-name
```

**Common causes:**
- Syntax error in application code
- Missing environment variables
- Port already in use
- Insufficient resources

### Can't Pull Images

**Problem:** `Error response from daemon: Get https://registry-1.docker.io/v2/: net/http: request canceled`

**Solutions:**
```bash
# Check internet connection
ping -c 3 google.com

# Check DNS
cat /etc/resolv.conf

# Restart Docker
sudo systemctl restart docker

# Check Docker Hub status
curl https://status.docker.com
```

### Out of Disk Space

**Problem:** Docker consuming too much disk

**Solutions:**
```bash
# Check Docker disk usage
sudo docker system df

# Remove unused containers
sudo docker container prune

# Remove unused images
sudo docker image prune -a

# Remove unused volumes (CAREFUL!)
sudo docker volume prune

# Nuclear option - remove everything
sudo docker system prune -a --volumes
```

---

## 🌐 Web/Caddy Issues

### 502 Bad Gateway

**Problem:** Caddy shows "502 Bad Gateway"

**Cause:** Backend container not responding

**Solutions:**
```bash
# 1. Check if backend container is running
sudo docker compose ps

# 2. Check backend logs
sudo docker compose logs backend-container

# 3. Verify backend is listening
sudo docker compose exec backend-container netstat -tlnp

# 4. Check network connectivity
sudo docker network inspect web

# 5. Restart backend
sudo docker compose restart backend-container
```

### Can't Get SSL Certificate

**Problem:** Let's Encrypt certificate not obtained

**Requirements check:**
```bash
# 1. Domain points to server
dig yourdomain.com +short
# Should show your server IP

# 2. Ports 80 and 443 are open
sudo ufw status | grep -E "80|443"

# 3. No other service using ports
sudo netstat -tlnp | grep ':80\|:443'

# 4. Caddy is running
sudo docker compose ps caddy
```

**View Caddy logs:**
```bash
sudo docker compose logs caddy | grep -i error
```

**Common issues:**
- Domain not pointing to server yet (DNS propagation takes time)
- Firewall blocking ports 80/443
- Another service already using the ports
- Too many certificate requests (Let's Encrypt rate limit)

### Certificate Renewal Failed

**Problem:** SSL certificate expired

**Solutions:**
```bash
# Check certificate status
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates

# Force renewal (if needed)
sudo docker compose exec caddy caddy reload --force

# Check Caddy logs
sudo docker compose logs caddy | grep -i renew
```

### Configuration Won't Reload

**Problem:** `caddy reload` shows errors

**Solutions:**
```bash
# Test configuration syntax
sudo docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile

# View specific error
sudo docker compose logs caddy --tail 50

# Common issues:
# - Missing comma between domains
# - Invalid directive
# - Wrong indentation
```

---

## 🔥 Firewall Issues

### Locked Out After Enabling UFW

**Problem:** Can't SSH after `ufw enable`

**Recovery (from VPS console):**
```bash
# 1. Allow SSH
sudo ufw allow 22/tcp

# 2. Or disable UFW temporarily
sudo ufw disable

# 3. Add correct rules
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 4. Re-enable
sudo ufw enable
```

### Can't Access Service After Opening Port

**Problem:** Port open in UFW but service not accessible

**Check:**
```bash
# 1. Verify port is actually open
sudo ufw status | grep PORT_NUMBER

# 2. Verify service is listening
sudo netstat -tlnp | grep :PORT_NUMBER

# 3. Check if Docker exposes the port
sudo docker compose ps

# 4. Check Docker port mapping
sudo docker port container-name
```

---

## 🛡️ Fail2Ban Issues

### Banned My Own IP

**Problem:** Accidentally banned yourself

**Solution:**
```bash
# From VPS console or different IP:
sudo fail2ban-client set sshd unbanip YOUR_IP

# Whitelist your IP permanently
sudo nano /etc/fail2ban/jail.local
# Add to [DEFAULT]:
ignoreip = 127.0.0.1/8 ::1 YOUR_IP

# Restart Fail2Ban
sudo systemctl restart fail2ban
```

### Fail2Ban Not Banning

**Problem:** No bans happening despite attacks

**Diagnose:**
```bash
# Check if Fail2Ban is running
sudo systemctl status fail2ban

# Check SSH jail status
sudo fail2ban-client status sshd

# Test filter
sudo fail2ban-regex /var/log/auth.log /etc/fail2ban/filter.d/sshd.conf

# Check recent failures
sudo grep "Failed password" /var/log/auth.log | tail -20
```

**Common causes:**
- Jail not enabled
- Filter not matching log format
- Backend not set correctly
- Log file path wrong

---

## 💾 Disk Space Issues

### Out of Disk Space

**Problem:** `df -h` shows 100% usage

**Find what's using space:**
```bash
# Find largest directories
sudo du -sh /* | sort -rh | head -10

# Find largest files
sudo find / -type f -size +100M -exec ls -lh {} \;

# Check Docker usage
sudo docker system df
```

**Clean up:**
```bash
# Clean apt cache
sudo apt clean
sudo apt autoclean
sudo apt autoremove

# Clean logs
sudo journalctl --vacuum-time=7d

# Clean Docker
sudo docker system prune -a

# Find and remove large log files
sudo find /var/log -type f -size +100M
```

---

## 🧠 Memory Issues

### Out of Memory

**Problem:** System running slowly, OOM killer active

**Check:**
```bash
# View memory usage
free -h

# Find memory hogs
ps aux --sort=-%mem | head -10

# Check OOM killer logs
sudo dmesg | grep -i "out of memory"
```

**Solutions:**
```bash
# Add swap (if none exists)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Limit Docker container memory
# In docker-compose.yml:
deploy:
  resources:
    limits:
      memory: 512M
```

---

## 🔐 Security Scan False Positives

### rkhunter Warnings After Update

**Problem:** Many warnings after system update

**Solution:**
```bash
# Update rkhunter database
sudo rkhunter --update

# Update file properties
sudo rkhunter --propupd

# Re-run scan
sudo rkhunter --check --skip-keypress
```

### chkrootkit False Positives

**Problem:** chkrootkit reports suspicious files

**Common false positives:**
```bash
# /dev/shm files - normal for many apps
# Checking `suspect files'... /usr/lib/libpam.so - usually fine
# sniffer - if you're not running packet capture, ignore
```

**Research before acting:**
- Google the specific warning
- Check if it's a known false positive
- Verify the file with: `ls -la FILE` and `file FILE`

---

## 🌍 Network/DNS Issues

### Domain Not Resolving

**Problem:** Domain doesn't point to server

**Check:**
```bash
# Query DNS
dig yourdomain.com

# Check what IPs it resolves to
nslookup yourdomain.com

# Check from different server
host yourdomain.com 8.8.8.8
```

**Solutions:**
- Wait for DNS propagation (can take up to 48 hours)
- Verify DNS records in domain registrar
- Check nameservers are correct
- Use `dig @8.8.8.8 yourdomain.com` to query Google's DNS

### Can't Connect to External Services

**Problem:** Container can't reach external APIs/databases

**Check:**
```bash
# From container
sudo docker compose exec container-name ping -c 3 google.com

# Check DNS resolution
sudo docker compose exec container-name nslookup google.com

# Check if firewall blocks outgoing
sudo ufw status
```

---

## 📝 Application-Specific Issues

### Node.js App Crashing

**Common causes:**
```bash
# Check logs
sudo docker compose logs node-app

# Common issues:
# - Missing dependencies: npm install
# - Port already in use: change port or stop other service
# - Environment variables missing: check .env file
# - Syntax errors: check Node.js error message
```

### Python App Not Starting

**Common causes:**
```bash
# Check logs
sudo docker compose logs python-app

# Common issues:
# - Missing dependencies: pip install -r requirements.txt
# - Python version mismatch: check Dockerfile
# - Module not found: check PYTHONPATH
# - Database connection failed: verify DB running
```

### Database Connection Failed

**Problem:** App can't connect to database

**Check:**
```bash
# Verify database container is running
sudo docker compose ps

# Check if database is ready
sudo docker compose logs database | grep "ready"

# Test connection from app container
sudo docker compose exec app ping database

# Verify connection string
# Format: postgresql://user:pass@host:5432/dbname
```

---

## 🔄 Update Issues

### Broken After System Update

**Problem:** Something broke after `apt upgrade`

**Recovery:**
```bash
# Check which packages were updated
grep "upgrade" /var/log/dpkg.log

# Revert specific package
sudo apt install package-name=OLD_VERSION

# Or restore from backup
# See Chapter 10 for backup procedures
```

### Docker Compose Version Mismatch

**Problem:** `docker-compose` vs `docker compose` plugin

**Solution:**
```bash
# Check which version you have
docker compose version  # Plugin (newer)
docker-compose version  # Standalone (older)

# Install plugin if needed
sudo apt install docker-compose-plugin

# Or use standalone
sudo apt install docker-compose
```

---

## 🆘 Emergency Recovery

### Can't Login At All

**From VPS Console:**
```bash
# 1. Reset password
sudo passwd yourusername

# 2. Fix SSH config if needed
sudo nano /etc/ssh/sshd_config
# Temporarily enable password auth:
PasswordAuthentication yes

sudo systemctl restart sshd
```

### System Won't Boot

**From VPS console/rescue mode:**
```bash
# Check disk space
df -h

# Check system logs
sudo journalctl -xb

# Check for filesystem errors
sudo fsck -y /dev/vda1
```

### Complete Disaster - Restore from Backup

**See Chapter 10 for full disaster recovery procedures**

```bash
# Quick restore steps:
# 1. Create new server
# 2. Copy backup to new server
# 3. Extract backup
# 4. Restore Docker volumes
# 5. Start services
# 6. Verify functionality
```

---

## 📞 Getting Help

### Before Asking for Help

**Gather information:**
```bash
# System info
uname -a
lsb_release -a

# Docker info
sudo docker version
sudo docker compose version

# Error logs
sudo journalctl -xe
sudo docker compose logs
```

### Where to Get Help

1. **Documentation**: Re-read relevant chapter
2. **Logs**: Always check logs first
3. **Search**: Google the exact error message
4. **Stack Overflow**: Search for similar issues
5. **GitHub Issues**: Check repository issues
6. **Community**: Discord, Slack, Reddit

### How to Ask Good Questions

**Bad question:**
> "It doesn't work help!"

**Good question:**
> "I'm trying to deploy a Node.js app with Docker Compose. When I run `docker compose up`, the container exits immediately. The logs show: [exact error]. I've tried [steps taken]. My docker-compose.yml is [paste config]. System: Ubuntu 24.04, Docker 24.0.7."

**Include:**
- What you're trying to do
- Exact error messages
- Steps you've tried
- Relevant configuration
- System information

---

## 🔧 Debugging Tools

### Essential Commands

```bash
# System status
uptime
free -h
df -h
top

# Network
ping
dig
netstat -tlnp
ss -tlnp
curl -I

# Processes
ps aux
pstree
lsof

# Docker
docker ps
docker logs
docker inspect
docker stats
docker system df

# Logs
tail -f /var/log/syslog
journalctl -f
sudo docker compose logs -f
```

### Quick Diagnostics Script

```bash
#!/bin/bash
# save as ~/diagnose.sh

echo "=== SYSTEM STATUS ==="
uptime
echo ""

echo "=== DISK SPACE ==="
df -h | grep -v tmpfs
echo ""

echo "=== MEMORY ==="
free -h
echo ""

echo "=== DOCKER ==="
sudo docker ps
echo ""

echo "=== FIREWALL ==="
sudo ufw status
echo ""

echo "=== RECENT ERRORS ==="
sudo journalctl -p err -n 10 --no-pager
```

Run with: `bash ~/diagnose.sh`

---

## ✅ Prevention is Better Than Cure

**Best practices to avoid issues:**

1. ✅ **Test before deploying**: Use staging environment
2. ✅ **Read logs regularly**: Catch issues early
3. ✅ **Keep backups**: Daily automated backups
4. ✅ **Document changes**: Know what you changed
5. ✅ **Monitor resources**: Watch disk, memory, CPU
6. ✅ **Update regularly**: Security patches matter
7. ✅ **Use version control**: Git for all configs
8. ✅ **Have a rollback plan**: Know how to undo changes

---

[⬅️ Back to Chapter 10](10-monitoring-maintenance.md) | [Back to Main Guide](../README.md) | [Command Reference ➡️](command-reference.md)
