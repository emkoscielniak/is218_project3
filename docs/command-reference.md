# Command Reference

**Quick Lookup for All Commands Used in This Guide**

Organized by category for easy reference. Use `Ctrl+F` to search.

---

## 🔑 SSH Commands

### Connection
```bash
# Connect to server
ssh username@server_ip

# Connect with specific key
ssh -i ~/.ssh/keyfile username@server_ip

# Connect to specific port
ssh -p 2222 username@server_ip

# Copy files to server
scp file.txt username@server_ip:~/

# Copy files from server
scp username@server_ip:~/file.txt ./

# Copy directories
scp -r directory/ username@server_ip:~/
```

### Key Management
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# View public key
cat ~/.ssh/id_ed25519.pub

# Copy key to server (from local machine)
ssh-copy-id username@server_ip

# Set correct permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Configuration
```bash
# Edit SSH server config
sudo nano /etc/ssh/sshd_config

# Test SSH config
sudo sshd -t

# Restart SSH service
sudo systemctl restart sshd

# Check SSH status
sudo systemctl status sshd
```

---

## 👤 User Management

### Creating Users
```bash
# Add new user
sudo adduser username

# Add user to group
sudo usermod -aG groupname username

# Switch to another user
su - username

# Check current user
whoami

# Check user groups
groups username

# List all users
cat /etc/passwd
```

### Sudo
```bash
# Run command as root
sudo command

# Switch to root
sudo -i

# Run command as another user
sudo -u username command

# Edit sudoers file
sudo visudo
```

---

## 🔥 Firewall (UFW)

### Basic Operations
```bash
# Enable firewall
sudo ufw enable

# Disable firewall
sudo ufw disable

# Check status
sudo ufw status

# Detailed status
sudo ufw status verbose

# Numbered rules
sudo ufw status numbered
```

### Managing Rules
```bash
# Allow port
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow service by name
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Allow from specific IP
sudo ufw allow from 192.168.1.100

# Allow IP to specific port
sudo ufw allow from 192.168.1.100 to any port 22

# Deny port
sudo ufw deny 23/tcp

# Delete rule by number
sudo ufw delete 3

# Delete rule by specification
sudo ufw delete allow 80/tcp

# Reset firewall
sudo ufw reset
```

### Default Policies
```bash
# Default deny incoming
sudo ufw default deny incoming

# Default allow outgoing
sudo ufw default allow outgoing
```

---

## 🛡️ Fail2Ban

### Status Commands
```bash
# Check service status
sudo systemctl status fail2ban

# View active jails
sudo fail2ban-client status

# Check specific jail
sudo fail2ban-client status sshd

# View Fail2Ban logs
sudo tail -f /var/log/fail2ban.log
```

### Managing Bans
```bash
# Ban an IP manually
sudo fail2ban-client set sshd banip 192.168.1.100

# Unban an IP
sudo fail2ban-client set sshd unbanip 192.168.1.100

# Unban all IPs
sudo fail2ban-client unban --all
```

### Configuration
```bash
# Edit local config
sudo nano /etc/fail2ban/jail.local

# Test configuration
sudo fail2ban-client -t

# Restart service
sudo systemctl restart fail2ban

# Reload configuration
sudo fail2ban-client reload
```

---

## 🔍 Security Scanning

### rkhunter
```bash
# Update database
sudo rkhunter --update

# Update file properties
sudo rkhunter --propupd

# Run scan
sudo rkhunter --check

# Run without pausing
sudo rkhunter --check --skip-keypress

# View warnings only
sudo rkhunter --check --report-warnings-only

# View log
sudo cat /var/log/rkhunter.log
```

### chkrootkit
```bash
# Run scan
sudo chkrootkit

# Save output to file
sudo chkrootkit > ~/chkrootkit-$(date +%Y%m%d).log
```

---

## 🐳 Docker Commands

### Container Management
```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Start container
docker start container_name

# Stop container
docker stop container_name

# Restart container
docker restart container_name

# Remove container
docker rm container_name

# Remove running container (force)
docker rm -f container_name

# Run container
docker run -d --name myapp nginx

# Run interactive container
docker run -it ubuntu bash

# Execute command in running container
docker exec -it container_name bash

# View container logs
docker logs container_name

# Follow logs
docker logs -f container_name

# View last 100 lines
docker logs --tail 100 container_name
```

### Image Management
```bash
# List images
docker images

# Pull image
docker pull nginx:latest

# Build image
docker build -t myapp:v1 .

# Remove image
docker rmi image_name

# Tag image
docker tag myapp:v1 myapp:latest

# Push to registry
docker push myapp:v1
```

### System Management
```bash
# View Docker info
docker info

# Check disk usage
docker system df

# Clean up unused resources
docker system prune

# Clean up everything (DANGEROUS)
docker system prune -a --volumes

# View resource usage
docker stats

# Inspect container
docker inspect container_name

# View container processes
docker top container_name
```

### Networks
```bash
# List networks
docker network ls

# Create network
docker network create mynetwork

# Inspect network
docker network inspect mynetwork

# Connect container to network
docker network connect mynetwork container_name

# Disconnect from network
docker network disconnect mynetwork container_name
```

### Volumes
```bash
# List volumes
docker volume ls

# Create volume
docker volume create myvolume

# Inspect volume
docker volume inspect myvolume

# Remove volume
docker volume rm myvolume

# Remove unused volumes
docker volume prune
```

---

## 📦 Docker Compose

### Basic Operations
```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View running services
docker compose ps

# View logs
docker compose logs

# Follow logs
docker compose logs -f

# Logs for specific service
docker compose logs app

# Restart services
docker compose restart

# Rebuild and start
docker compose up -d --build
```

### Service Management
```bash
# Start specific service
docker compose start app

# Stop specific service
docker compose stop app

# Restart specific service
docker compose restart app

# Scale service
docker compose up -d --scale app=3

# Execute command in service
docker compose exec app bash

# Run one-off command
docker compose run app python manage.py migrate
```

### Configuration
```bash
# Validate compose file
docker compose config

# View resolved configuration
docker compose config --services

# Pull all images
docker compose pull

# Build services
docker compose build

# Build without cache
docker compose build --no-cache
```

---

## 📝 File Operations

### Viewing Files
```bash
# Display file contents
cat file.txt

# View with pagination
less file.txt
more file.txt

# First 10 lines
head file.txt

# Last 10 lines
tail file.txt

# Last 50 lines
tail -50 file.txt

# Follow file updates
tail -f file.txt
```

### Editing Files
```bash
# Edit with nano
nano file.txt

# Edit with vim
vim file.txt

# Find and replace in file
sed -i 's/old/new/g' file.txt
```

### File Management
```bash
# Copy file
cp source.txt destination.txt

# Copy directory
cp -r source_dir/ dest_dir/

# Move/rename file
mv oldname.txt newname.txt

# Remove file
rm file.txt

# Remove directory
rm -r directory/

# Create directory
mkdir directory

# Create nested directories
mkdir -p parent/child/grandchild

# Change ownership
sudo chown user:group file.txt

# Change permissions
chmod 644 file.txt
chmod 755 script.sh
```

### Searching
```bash
# Find files by name
find /path -name "filename"

# Find files by size
find /path -size +100M

# Search in files
grep "search term" file.txt

# Recursive search
grep -r "search term" /path/

# Case-insensitive search
grep -i "search term" file.txt

# Search with line numbers
grep -n "search term" file.txt
```

---

## 💾 System Administration

### Package Management
```bash
# Update package list
sudo apt update

# Upgrade packages
sudo apt upgrade -y

# Full upgrade
sudo apt dist-upgrade -y

# Install package
sudo apt install package_name -y

# Remove package
sudo apt remove package_name

# Remove with config files
sudo apt purge package_name

# Clean up
sudo apt autoremove -y
sudo apt autoclean
```

### System Information
```bash
# OS version
lsb_release -a
cat /etc/os-release

# Kernel version
uname -r
uname -a

# System uptime
uptime

# Current date/time
date

# Hostname
hostname

# IP address
hostname -I
ip addr show
```

### Resource Monitoring
```bash
# Disk usage
df -h

# Directory size
du -sh /path/

# Memory usage
free -h

# CPU usage
top
htop

# Process list
ps aux

# Kill process
kill PID
kill -9 PID  # Force kill

# Find process by name
pgrep process_name
ps aux | grep process_name
```

### Service Management
```bash
# Start service
sudo systemctl start service_name

# Stop service
sudo systemctl stop service_name

# Restart service
sudo systemctl restart service_name

# Reload service
sudo systemctl reload service_name

# Enable on boot
sudo systemctl enable service_name

# Disable on boot
sudo systemctl disable service_name

# Check status
sudo systemctl status service_name

# View service logs
sudo journalctl -u service_name

# Follow service logs
sudo journalctl -u service_name -f
```

### Log Management
```bash
# View system log
sudo tail -f /var/log/syslog

# View authentication log
sudo tail -f /var/log/auth.log

# View kernel log
dmesg

# View journal logs
sudo journalctl

# Recent logs
sudo journalctl -n 50

# Logs since boot
sudo journalctl -b

# Logs for specific unit
sudo journalctl -u docker

# Clean old logs
sudo journalctl --vacuum-time=7d
```

### Network Commands
```bash
# Test connectivity
ping google.com

# DNS lookup
dig domain.com
nslookup domain.com
host domain.com

# Show network interfaces
ip addr show
ifconfig

# Show routing table
ip route
route -n

# Show listening ports
sudo netstat -tlnp
sudo ss -tlnp

# Show active connections
netstat -ant
ss -ant

# Download file
wget https://example.com/file
curl -O https://example.com/file

# Test HTTP endpoint
curl -I https://example.com
```

---

## 🔧 Cron Jobs

```bash
# Edit user crontab
crontab -e

# Edit root crontab
sudo crontab -e

# List user crontab
crontab -l

# Remove crontab
crontab -r

# Crontab format:
# m h  dom mon dow   command
# * * * * * /path/to/script.sh

# Examples:
# Daily at 2 AM
0 2 * * * /path/to/backup.sh

# Every 15 minutes
*/15 * * * * /path/to/check.sh

# Weekly on Sunday at 3 AM
0 3 * * 0 /path/to/weekly.sh

# Monthly on 1st at midnight
0 0 1 * * /path/to/monthly.sh
```

---

## 🌐 Caddy Commands

```bash
# Validate Caddyfile
caddy validate --config /path/to/Caddyfile

# Reload configuration
caddy reload --config /path/to/Caddyfile

# Format Caddyfile
caddy fmt --overwrite /path/to/Caddyfile

# Start Caddy
caddy run --config /path/to/Caddyfile

# Run in background
caddy start --config /path/to/Caddyfile

# Stop Caddy
caddy stop

# View Caddy version
caddy version

# List modules
caddy list-modules

# Generate password hash
caddy hash-password --plaintext 'password'
```

### In Docker
```bash
# Reload Caddy in container
sudo docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile

# View Caddy logs
sudo docker compose logs caddy

# Validate config
sudo docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile
```

---

## 🔐 SSL/TLS Commands

```bash
# Check certificate expiration
echo | openssl s_client -servername domain.com -connect domain.com:443 2>/dev/null | openssl x509 -noout -dates

# View certificate details
echo | openssl s_client -servername domain.com -connect domain.com:443 2>/dev/null | openssl x509 -noout -text

# Test SSL connection
openssl s_client -connect domain.com:443

# Generate self-signed certificate (testing only)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout key.pem -out cert.pem
```

---

## 📊 Performance & Debugging

```bash
# I/O statistics
iostat -x 1

# Network statistics
netstat -s
ss -s

# Disk I/O
iotop

# Process tree
pstree

# Open files
lsof

# Files opened by process
lsof -p PID

# Processes using file
lsof /path/to/file

# System calls
strace command

# Library calls
ltrace command
```

---

## 💡 Quick Troubleshooting

```bash
# Check all running services
sudo systemctl list-units --type=service --state=running

# Check failed services
sudo systemctl --failed

# Check listening ports
sudo ss -tlnp

# Check disk inodes
df -i

# Check memory details
cat /proc/meminfo

# Check CPU info
lscpu
cat /proc/cpuinfo

# Check system messages
dmesg | tail -50

# Check last logins
last -n 20

# Check current users
who
w
```

---

## 📝 Git Commands (Quick Reference)

```bash
# Clone repository
git clone https://github.com/user/repo.git

# Check status
git status

# Add files
git add .
git add file.txt

# Commit changes
git commit -m "Commit message"

# Push to remote
git push origin master

# Pull from remote
git pull origin master

# View log
git log --oneline

# Create branch
git checkout -b new-branch

# Switch branch
git checkout branch-name
```

---

[⬅️ Back to Troubleshooting](troubleshooting.md) | [Back to Main Guide](../README.md) | [Resources ➡️](resources.md)
