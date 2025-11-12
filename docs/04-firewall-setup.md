# Chapter 4: Firewall Configuration

**Controlling Network Traffic with UFW**

In this chapter, you'll learn about firewalls and how to set up UFW (Uncomplicated Firewall) to protect your server. A firewall is your server's bouncer—it decides what traffic gets in and what gets blocked.

---

## 📖 What You'll Learn

- What a firewall is and how it protects you
- Understanding ports and network traffic
- Installing and configuring UFW
- Opening only necessary ports
- Understanding default deny policies
- Monitoring firewall activity

---

## 🔥 What is a Firewall?

A **firewall** is a security system that monitors and controls network traffic based on predetermined rules.

### The Bouncer Analogy

Imagine your server is a nightclub:
- **Firewall = Bouncer** at the door
- **Ports = Doors** to different rooms
- **IP addresses = People** trying to get in
- **Rules = Guest list** and dress code

The bouncer (firewall) checks everyone:
- "Are you on the guest list?" (allowed IP)
- "Which room are you trying to enter?" (port number)
- "Do you have the right credentials?" (protocol)

### Why You Need a Firewall

**Without a firewall:**
- All ports are open to the internet
- Attackers can probe for vulnerabilities
- Services can be discovered and exploited
- No control over who accesses what

**With a firewall:**
- ✅ Only allowed ports are accessible
- ✅ Everything else is blocked by default
- ✅ You control exactly what's exposed
- ✅ Logs suspicious connection attempts

**Real stat:** Servers without firewalls receive thousands of probes per day from bots scanning for vulnerabilities.

---

## 🚪 Understanding Ports

### What is a Port?

A **port** is a virtual communication endpoint. Think of your server's IP address as a building address, and ports as apartment numbers.

```
Server IP: 159.89.123.45    (The building)
Port 22:   SSH              (Apartment 22 - secure entrance)
Port 80:   HTTP             (Apartment 80 - website lobby)
Port 443:  HTTPS            (Apartment 443 - secure website)
Port 3306: MySQL            (Apartment 3306 - database office)
```

### Common Ports

| Port  | Service | Purpose |
|-------|---------|---------|
| 22    | SSH     | Remote server access |
| 80    | HTTP    | Website (unencrypted) |
| 443   | HTTPS   | Website (encrypted) |
| 25    | SMTP    | Email sending |
| 3306  | MySQL   | Database |
| 5432  | PostgreSQL | Database |
| 6379  | Redis   | Cache |
| 8080  | Alt HTTP | Alternative web server |

### Port Ranges

- **0-1023**: Well-known ports (system services)
- **1024-49151**: Registered ports (applications)
- **49152-65535**: Dynamic/private ports

---

## 🛠️ Installing UFW

**UFW (Uncomplicated Firewall)** is Ubuntu's user-friendly firewall interface.

### Check if UFW is Installed

```bash
sudo ufw status
```

If not installed:
```bash
sudo apt update
sudo apt install ufw -y
```

### Why UFW?

Other options:
- **iptables**: Powerful but complex (UFW is a frontend for this)
- **firewalld**: RedHat/CentOS default
- **nftables**: Modern replacement for iptables

**UFW is perfect for beginners:**
- Simple commands
- Good defaults
- Hard to lock yourself out
- Well documented

---

## ⚙️ Configuring UFW

### Step 1: Set Default Policies

**Critical first step** - set defaults BEFORE enabling:

```bash
# Deny all incoming traffic by default
sudo ufw default deny incoming

# Allow all outgoing traffic by default
sudo ufw default allow outgoing
```

**What this means:**
- **Incoming**: Block everything unless explicitly allowed (secure default)
- **Outgoing**: Allow your server to initiate connections (apt updates, etc.)

This is the **principle of least privilege**—deny by default, allow only what's needed.

### Step 2: Allow SSH (Critical!)

**⚠️ MUST DO BEFORE ENABLING UFW!**

```bash
sudo ufw allow ssh
```

Or explicitly by port:
```bash
sudo ufw allow 22/tcp
```

**Why this is critical:**
- SSH (port 22) is how you connect to your server
- If you enable UFW without allowing SSH, you'll be locked out
- Always allow SSH first!

**If you changed SSH to a different port** (from Chapter 3):
```bash
sudo ufw allow 2222/tcp
```

### Step 3: Allow HTTP and HTTPS

For web servers, allow:

```bash
# Allow HTTP (port 80)
sudo ufw allow http
# Or: sudo ufw allow 80/tcp

# Allow HTTPS (port 443)
sudo ufw allow https
# Or: sudo ufw allow 443/tcp
```

**Why both?**
- Port 80 (HTTP): Initial connections and redirects
- Port 443 (HTTPS): Secure, encrypted traffic
- Most web servers redirect 80 → 443 automatically

### Step 4: Review Rules Before Enabling

Check what you've configured:

```bash
sudo ufw show added
```

You should see:
```
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
```

**Double-check:** Is SSH allowed? If not, add it now!

### Step 5: Enable UFW

Now you can safely enable the firewall:

```bash
sudo ufw enable
```

You'll see:
```
Command may disrupt existing ssh connections. Proceed with operation (y|n)? y
Firewall is active and enabled on system startup
```

Type `y` and press Enter.

**What just happened:**
- Firewall is now active
- Rules are in effect
- UFW will start automatically on boot

---

## ✅ Verifying Your Firewall

### Check Status

```bash
sudo ufw status verbose
```

Output:
```
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere
80/tcp                     ALLOW IN    Anywhere
443/tcp                    ALLOW IN    Anywhere
22/tcp (v6)                ALLOW IN    Anywhere (v6)
80/tcp (v6)                ALLOW IN    Anywhere (v6)
443/tcp (v6)                ALLOW IN    Anywhere (v6)
```

**Understanding the output:**
- **Status: active** - Firewall is running
- **Logging: on** - Recording blocked attempts
- **Default: deny (incoming)** - Block everything not explicitly allowed
- **Rules**: Shows what's allowed (SSH, HTTP, HTTPS)
- **v6**: IPv6 versions of the rules

### Test Your Firewall

#### Test 1: Can you still SSH?

Your current connection should work (existing connections remain).

Open a new terminal and connect:
```bash
ssh yourusername@YOUR_SERVER_IP
```

✅ Should work - SSH is allowed.

#### Test 2: Are other ports blocked?

Try connecting to a random port that shouldn't be open:

```bash
# From your local machine
telnet YOUR_SERVER_IP 3306
```

Should timeout or be refused - that's good! Port 3306 (MySQL) is blocked.

---

## 🎯 Common Firewall Rules

### Application Profiles

UFW comes with predefined application profiles:

```bash
# List available applications
sudo ufw app list
```

Common applications:
```bash
# Allow specific applications
sudo ufw allow 'Nginx Full'       # Nginx (HTTP + HTTPS)
sudo ufw allow 'Apache Full'      # Apache (HTTP + HTTPS)
sudo ufw allow 'OpenSSH'          # SSH
```

### Port Ranges

Allow a range of ports:
```bash
sudo ufw allow 6000:6007/tcp
```

### Specific IP Addresses

Allow connections from a specific IP only:

```bash
# Allow SSH from your office/home IP only
sudo ufw allow from 203.0.113.50 to any port 22

# Allow MySQL from application server only
sudo ufw allow from 10.0.0.5 to any port 3306
```

### Deny Specific Connections

```bash
# Block a specific IP
sudo ufw deny from 203.0.113.100

# Block a specific port
sudo ufw deny 23/tcp  # Telnet (insecure)
```

---

## 📊 Managing Firewall Rules

### List All Rules (Numbered)

```bash
sudo ufw status numbered
```

Output:
```
     To                         Action      From
     --                         ------      ----
[ 1] 22/tcp                     ALLOW IN    Anywhere
[ 2] 80/tcp                     ALLOW IN    Anywhere
[ 3] 443/tcp                    ALLOW IN    Anywhere
```

### Delete a Rule

By number:
```bash
sudo ufw delete 3
```

By specification:
```bash
sudo ufw delete allow 443/tcp
```

### Disable UFW (Temporary)

```bash
sudo ufw disable
```

**Warning:** This removes all firewall protection!

### Reset UFW (Nuclear Option)

Reset to default state (removes all rules):
```bash
sudo ufw reset
```

You'll need to reconfigure everything.

---

## 📝 Firewall Logging

### Enable Logging

```bash
sudo ufw logging on
```

Log levels:
- `low`: Logged traffic (default)
- `medium`: More detail
- `high`: Everything (can fill disk!)
- `full`: Maximum verbosity

### View Firewall Logs

```bash
# Recent firewall activity
sudo tail -50 /var/log/ufw.log

# Watch logs in real-time
sudo tail -f /var/log/ufw.log

# Search for blocked connections
sudo grep "BLOCK" /var/log/ufw.log
```

### Understanding Log Entries

```
[UFW BLOCK] IN=eth0 OUT= SRC=192.0.2.1 DST=YOUR_IP PROTO=TCP DPT=23
```

Breaking it down:
- **UFW BLOCK**: Connection was blocked
- **IN=eth0**: Incoming on network interface eth0
- **SRC=192.0.2.1**: Source IP trying to connect
- **DST=YOUR_IP**: Your server's IP
- **PROTO=TCP**: TCP protocol
- **DPT=23**: Destination port (23 = Telnet)

---

## 🎓 Firewall Best Practices

### Security Principles

1. **Default Deny**: Block everything, allow only what's needed
2. **Least Privilege**: Open minimum ports required
3. **Regular Review**: Audit rules periodically
4. **Document Changes**: Know why each rule exists
5. **Test Changes**: Verify before and after modifications

### Common Mistakes to Avoid

❌ **Don't lock yourself out:**
- Always allow SSH before enabling firewall
- Test with a second connection
- Know how to access via console

❌ **Don't leave dangerous ports open:**
- Database ports (3306, 5432) should only allow specific IPs
- Admin interfaces should be firewalled or VPN-only
- Development ports shouldn't be public

❌ **Don't ignore logs:**
- Blocked attempts show attack patterns
- Helps identify security issues
- Useful for troubleshooting

✅ **Do this instead:**
- Document every rule you add
- Use specific IPs when possible
- Remove rules you no longer need
- Keep logging enabled

---

## 🧪 Practical Examples

### Example 1: Basic Web Server

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

### Example 2: Web Server + MySQL (Restricted)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
# Allow MySQL only from app server
sudo ufw allow from 10.0.0.5 to any port 3306
sudo ufw enable
```

### Example 3: SSH from Specific IP Only

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
# Only allow SSH from your home/office
sudo ufw allow from YOUR_HOME_IP to any port 22
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

---

## ✅ Verification Checklist

Before moving to the next chapter, verify:

- [ ] UFW is installed and enabled
- [ ] Default policies are set (deny incoming, allow outgoing)
- [ ] SSH is allowed (port 22 or your custom port)
- [ ] HTTP and HTTPS are allowed (ports 80, 443)
- [ ] You can still SSH into your server
- [ ] Firewall starts on boot
- [ ] You understand how to add/remove rules
- [ ] Logging is enabled

### Quick Test

```bash
# Should show "active"
sudo ufw status

# Should show your rules
sudo ufw status verbose

# Should still work
ssh yourusername@YOUR_SERVER_IP
```

---

## 🎯 What You Accomplished

✅ Installed and configured UFW firewall  
✅ Set secure default policies (deny by default)  
✅ Opened only necessary ports (SSH, HTTP, HTTPS)  
✅ Learned to manage firewall rules  
✅ Enabled logging for security monitoring  

**Real-world impact:** You've dramatically reduced your attack surface. Automated scanners can only see your essential services now.

---

## 🔍 Monitoring Your Firewall

### Check for Attack Attempts

```bash
# Count blocked attempts today
sudo grep "$(date +'%b %e')" /var/log/ufw.log | grep BLOCK | wc -l

# Show unique IPs trying to connect
sudo grep BLOCK /var/log/ufw.log | grep -oP 'SRC=\K[\d.]+' | sort | uniq -c | sort -rn | head -10

# Monitor in real-time
sudo tail -f /var/log/ufw.log | grep BLOCK
```

You'll likely see hundreds or thousands of blocked probes. This is normal and shows your firewall is working!

---

## ❓ Troubleshooting

**Problem: Can't enable UFW (inactive)**

```bash
# Check if service is running
sudo systemctl status ufw

# Start service
sudo systemctl start ufw

# Enable on boot
sudo systemctl enable ufw
```

**Problem: Locked out after enabling UFW**

- Use your VPS provider's web console
- Disable firewall: `sudo ufw disable`
- Add SSH rule: `sudo ufw allow 22/tcp`
- Re-enable: `sudo ufw enable`

**Problem: Port is allowed but service not accessible**

Check if service is actually running:
```bash
# Check if web server is listening on port 80
sudo netstat -tlnp | grep :80

# Or with ss
sudo ss -tlnp | grep :80
```

**Problem: Too many blocked attempts in logs**

This is normal! The internet is full of scanning bots. Your firewall is doing its job.

To reduce log noise, you can set logging to low:
```bash
sudo ufw logging low
```

---

## 📚 Additional Resources

- [UFW Ubuntu Documentation](https://help.ubuntu.com/community/UFW)
- [DigitalOcean UFW Guide](https://www.digitalocean.com/community/tutorials/ufw-essentials-common-firewall-rules-and-commands)
- [Firewall Concepts](https://en.wikipedia.org/wiki/Firewall_(computing))
- [Port Number Registry](https://www.iana.org/assignments/service-names-port-numbers/)

---

## 🔗 Next Steps

➡️ **[Chapter 5: Intrusion Prevention with Fail2Ban](05-fail2ban.md)** - Automatically block attackers

---

[⬅️ Previous: SSH Hardening](03-ssh-hardening.md) | [Back to Main Guide](../README.md) | [Next: Fail2Ban ➡️](05-fail2ban.md)
