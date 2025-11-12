# Chapter 5: Intrusion Prevention with Fail2Ban

**Automatically Blocking Attackers**

In this chapter, you'll learn about Fail2Ban—a powerful tool that monitors your logs and automatically bans IP addresses showing malicious behavior. Think of it as an intelligent security guard that never sleeps.

---

## 📖 What You'll Learn

- What Fail2Ban is and how it works
- Understanding brute-force attacks
- Installing and configuring Fail2Ban
- Setting up SSH protection (jails)
- Monitoring ban activity
- Troubleshooting and unbanning IPs

---

## 🛡️ What is Fail2Ban?

**Fail2Ban** is an intrusion prevention system that monitors log files and bans IPs showing malicious behavior.

### The Security Guard Analogy

Imagine your server is a building:
- **Firewall (UFW)**: Locked doors—only authorized doors open
- **SSH**: The main entrance with a keypad
- **Fail2Ban**: Security guard watching the camera feeds

The security guard (Fail2Ban):
1. Watches people trying to enter (monitors logs)
2. Notices someone trying wrong passwords repeatedly (detects patterns)
3. Calls the police and blacklists them (bans the IP)
4. Automatically removes the ban after a timeout (releases after time served)

### How Fail2Ban Works

```
1. Monitor logs (/var/log/auth.log)
   ↓
2. Detect failures (wrong passwords)
   ↓
3. Count attempts from same IP
   ↓
4. If threshold exceeded → Ban IP
   ↓
5. Add firewall rule to block IP
   ↓
6. After ban time → Unban automatically
```

---

## 🎯 Why You Need Fail2Ban

### The Threat: Brute-Force Attacks

**Brute-force attack**: Trying many passwords until one works.

**Real statistics:**
- Average server receives 100+ SSH login attempts per day
- Bots try common usernames (root, admin, ubuntu, user)
- Bots try common passwords (123456, password, admin)
- Attacks are automated and constant

### Without Fail2Ban

```
Attacker tries: root / password123 ❌
Attacker tries: root / admin ❌
Attacker tries: root / 12345 ❌
... (continues forever)
```

Your server just sits there taking the abuse.

### With Fail2Ban

```
Attacker tries: root / password123 ❌ (attempt 1)
Attacker tries: root / admin ❌ (attempt 2)
Attacker tries: root / 12345 ❌ (attempt 3)
BANNED! 🚫
```

After 3 failed attempts (configurable), the IP is blocked for 10 minutes (configurable).

---

## 📦 Installing Fail2Ban

### Step 1: Install

```bash
sudo apt update
sudo apt install fail2ban -y
```

### Step 2: Verify Installation

```bash
# Check if service is running
sudo systemctl status fail2ban
```

Should show:
```
● fail2ban.service - Fail2Ban Service
   Active: active (running)
```

---

## ⚙️ Configuring Fail2Ban

### Understanding Configuration Files

Fail2Ban uses two types of config files:

1. **`.conf` files**: Default configurations (don't edit these!)
2. **`.local` files**: Your customizations (override defaults)

**Important:** Always create `.local` files, never edit `.conf` files (they get overwritten on updates).

### Main Configuration Files

- `/etc/fail2ban/fail2ban.conf` - Main daemon settings
- `/etc/fail2ban/jail.conf` - Jail (protection) settings
- `/etc/fail2ban/jail.local` - Your custom jail settings (create this)

### Step 1: Create Local Configuration

```bash
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

Now we'll edit the local version:

```bash
sudo nano /etc/fail2ban/jail.local
```

### Step 2: Configure Default Settings

Find the `[DEFAULT]` section (near the top) and update these values:

```ini
[DEFAULT]

# Ban time (in seconds)
bantime  = 10m

# Find time window (in seconds)
findtime  = 10m

# Maximum retry attempts
maxretry = 3

# Backend for log monitoring
backend = systemd
```

**What these mean:**

- **bantime**: How long to ban an IP (10m = 10 minutes)
  - Production might use: `1h`, `1d`, or even `permanent`
  - Students can use `10m` for easier testing

- **findtime**: Time window to count failures (10 minutes)
  - If 3 failures happen within 10 minutes → ban
  - If spread out over longer → no ban

- **maxretry**: Failed attempts before ban (3 attempts)
  - Lower = more strict (2)
  - Higher = more lenient (5)

- **backend**: How to read logs
  - `systemd` for Ubuntu 16.04+ (modern)
  - `auto` to let Fail2Ban decide

### Step 3: Configure SSH Jail

Find the `[sshd]` section and update it:

```ini
[sshd]

# Enable SSH protection
enabled = true

# Port to monitor (change if you changed SSH port)
port    = ssh

# Log file to monitor
logpath = %(sshd_log)s

# Backend (use systemd)
backend = systemd

# Max attempts before ban
maxretry = 3

# Ban time (can override default)
bantime = 1h
```

**If you changed your SSH port** (from Chapter 3):
```ini
port = 2222
```

Or for multiple ports:
```ini
port = ssh,2222
```

### Step 4: Add Email Notifications (Optional)

If you want to be notified of bans:

In the `[DEFAULT]` section:

```ini
# Email settings
destemail = your-email@example.com
sender = fail2ban@yourdomain.com
action = %(action_mwl)s
```

**Actions available:**
- `action_`: Just ban (no email)
- `action_mw`: Ban + email with log info
- `action_mwl`: Ban + email with log + whois info (recommended)

**Note:** You need a working mail server for this (covered in advanced topics).

### Step 5: Save Configuration

- Press `Ctrl + X`
- Press `Y` to save
- Press `Enter` to confirm

---

## 🚀 Starting Fail2Ban

### Restart Service with New Configuration

```bash
sudo systemctl restart fail2ban
```

### Enable on Boot

```bash
sudo systemctl enable fail2ban
```

### Check Status

```bash
sudo systemctl status fail2ban
```

Should show:
```
● fail2ban.service - Fail2Ban Service
   Loaded: loaded (/lib/systemd/system/fail2ban.service; enabled)
   Active: active (running)
```

---

## 🔍 Monitoring Fail2Ban

### Check Active Jails

```bash
sudo fail2ban-client status
```

Output:
```
Status
|- Number of jail:      1
`- Jail list:   sshd
```

### Check Specific Jail Status

```bash
sudo fail2ban-client status sshd
```

Output:
```
Status for the jail: sshd
|- Filter
|  |- Currently failed: 0
|  |- Total failed:     12
|  `- File list:        /var/log/auth.log
`- Actions
   |- Currently banned: 1
   |- Total banned:     3
   `- Banned IP list:   192.0.2.50
```

**Understanding the output:**
- **Currently failed**: Active failures being tracked
- **Total failed**: All detected failures since start
- **Currently banned**: IPs banned right now
- **Total banned**: All bans (including expired)
- **Banned IP list**: Currently blocked IPs

### View Fail2Ban Logs

```bash
# Recent activity
sudo tail -50 /var/log/fail2ban.log

# Watch in real-time
sudo tail -f /var/log/fail2ban.log

# Search for bans
sudo grep "Ban" /var/log/fail2ban.log
```

### View Banned IPs

```bash
# Using fail2ban-client
sudo fail2ban-client status sshd

# Or check iptables directly
sudo iptables -L f2b-sshd -n
```

---

## 🧪 Testing Fail2Ban

**⚠️ Warning:** Don't test from an IP you need! You might ban yourself.

### Safe Testing Method

Use a VPS or VPN with a different IP to test.

From the test machine:
```bash
# Try to SSH with wrong password (3 times)
ssh wronguser@YOUR_SERVER_IP
# Enter wrong password
# Try again... banned after 3 attempts!
```

On your server, check:
```bash
sudo fail2ban-client status sshd
```

You should see the test IP in "Banned IP list".

### Testing from Localhost (Safe)

You can't ban localhost, so you can safely test:

```bash
# Generate fake failures
sudo fail2ban-client set sshd banip 192.0.2.1

# Check it's banned
sudo fail2ban-client status sshd

# Unban
sudo fail2ban-client set sshd unbanip 192.0.2.1
```

---

## 🔓 Unbanning IPs

### Unban a Specific IP

```bash
sudo fail2ban-client set sshd unbanip 192.0.2.50
```

Replace `192.0.2.50` with the actual IP.

### Unban All IPs in a Jail

```bash
sudo fail2ban-client unban --all
```

### Check if IP is Banned

```bash
sudo fail2ban-client status sshd | grep "Banned IP list"
```

---

## 🎯 Advanced Configuration

### Whitelist IPs (Never Ban)

To never ban certain IPs (your home/office):

In `/etc/fail2ban/jail.local` under `[DEFAULT]`:

```ini
# Whitelist IP addresses
ignoreip = 127.0.0.1/8 ::1 YOUR_HOME_IP

# Example:
ignoreip = 127.0.0.1/8 ::1 203.0.113.50 198.51.100.0/24
```

**What this means:**
- `127.0.0.1/8`: Localhost (always whitelist)
- `::1`: IPv6 localhost
- `203.0.113.50`: Your home IP
- `198.51.100.0/24`: Your office network (entire subnet)

### Permanent Bans

For repeat offenders, ban permanently:

```ini
[sshd]
bantime = -1
```

The `-1` means "never unban".

**Or create a separate "recidive" jail** that bans repeat offenders:

```ini
[recidive]
enabled = true
filter = recidive
logpath = /var/log/fail2ban.log
action = %(action_mwl)s
bantime = 1w
findtime = 1d
maxretry = 3
```

This bans for 1 week anyone who gets banned 3 times in 1 day.

### Country-Based Blocking (Advanced)

Block entire countries using GeoIP:

```bash
# Install GeoIP
sudo apt install geoip-bin geoip-database -y

# Create custom action
sudo nano /etc/fail2ban/action.d/iptables-geoip.conf
```

(Content requires additional setup - see resources for guides)

---

## 📊 Understanding Fail2Ban Actions

### How Bans Work

When Fail2Ban bans an IP, it adds an iptables rule:

```bash
# View Fail2Ban iptables chains
sudo iptables -L -n | grep f2b
```

You'll see chains like `f2b-sshd` with banned IPs.

### Ban Process

```
1. Fail2Ban detects failure in log
   ↓
2. Adds to internal ban list
   ↓
3. Executes action: iptables -I f2b-sshd -s IP -j REJECT
   ↓
4. Waits for ban time
   ↓
5. Executes unban: iptables -D f2b-sshd -s IP -j REJECT
```

---

## 🎓 Best Practices

### Do's ✅

- **Whitelist your IPs**: Add your home/office to `ignoreip`
- **Monitor logs**: Check Fail2Ban activity regularly
- **Tune settings**: Adjust `maxretry` and `bantime` based on your needs
- **Enable for critical services**: SSH is most important
- **Keep updated**: `sudo apt update && sudo apt upgrade fail2ban`

### Don'ts ❌

- **Don't set bantime too low**: 1 minute is too short to be effective
- **Don't set maxretry to 1**: One typo and you're banned
- **Don't forget to whitelist yourself**: Or you might lock yourself out
- **Don't disable logs**: You need logs to see what's happening
- **Don't ban localhost**: Always in `ignoreip` by default

### Recommended Settings

**Development/Learning:**
```ini
bantime = 10m
findtime = 10m
maxretry = 3
```

**Production:**
```ini
bantime = 1h
findtime = 10m
maxretry = 3
```

**High Security:**
```ini
bantime = 1d
findtime = 1h
maxretry = 2
```

---

## ✅ Verification Checklist

Before moving to the next chapter, verify:

- [ ] Fail2Ban is installed and running
- [ ] SSH jail is enabled
- [ ] Configuration file is created (`jail.local`)
- [ ] Your IP is whitelisted in `ignoreip`
- [ ] You can check jail status
- [ ] You can view banned IPs
- [ ] You understand how to unban IPs
- [ ] Service starts on boot

### Quick Test

```bash
# Should show running
sudo systemctl status fail2ban

# Should show sshd jail
sudo fail2ban-client status

# Should show SSH jail details
sudo fail2ban-client status sshd

# Should show your config
sudo cat /etc/fail2ban/jail.local | grep -A 5 "\[sshd\]"
```

---

## 🎯 What You Accomplished

✅ Installed Fail2Ban intrusion prevention system  
✅ Configured SSH protection (jail)  
✅ Set up automatic IP banning for brute-force attempts  
✅ Learned to monitor and manage bans  
✅ Whitelisted your own IPs  

**Real-world impact:** Your server now actively defends itself against attacks. Bots that try to brute-force SSH get blocked after 3 attempts!

---

## 🔍 Real-World Example

After running Fail2Ban for a week, check what it caught:

```bash
# Total bans
sudo fail2ban-client status sshd | grep "Total banned"

# Recent bans
sudo grep "Ban" /var/log/fail2ban.log | tail -20

# Countries attacking you (if you have GeoIP)
sudo grep "Ban" /var/log/fail2ban.log | grep -oP '\d+\.\d+\.\d+\.\d+' | head -20 | xargs -I{} geoiplookup {}
```

You'll likely see:
- Dozens or hundreds of banned IPs
- Attack attempts from around the world
- Common usernames tried: root, admin, test, ubuntu

**This is normal!** The internet is hostile. Your protection is working.

---

## ❓ Troubleshooting

**Problem: Fail2Ban not starting**

```bash
# Check configuration syntax
sudo fail2ban-client -t

# View error logs
sudo journalctl -u fail2ban -n 50

# Check file permissions
ls -la /etc/fail2ban/jail.local
```

**Problem: SSH jail not working**

```bash
# Verify jail is enabled
sudo fail2ban-client status | grep sshd

# Check SSH jail configuration
sudo fail2ban-client get sshd logpath

# Manually test filter
sudo fail2ban-regex /var/log/auth.log /etc/fail2ban/filter.d/sshd.conf
```

**Problem: Banned myself!**

```bash
# From VPS console (not SSH):
sudo fail2ban-client set sshd unbanip YOUR_IP

# Or disable Fail2Ban temporarily:
sudo systemctl stop fail2ban

# Fix configuration, then restart:
sudo systemctl start fail2ban
```

**Problem: Not seeing any bans**

This might actually be good! If you hardened SSH properly (Chapter 3), attackers can't even try passwords.

Check if attempts are happening:
```bash
sudo grep "Failed password" /var/log/auth.log
```

If you see none, your SSH hardening is working so well that bots can't even try!

---

## 📚 Additional Resources

- [Fail2Ban Official Documentation](https://www.fail2ban.org/)
- [Fail2Ban GitHub](https://github.com/fail2ban/fail2ban)
- [DigitalOcean Fail2Ban Guide](https://www.digitalocean.com/community/tutorials/how-to-protect-ssh-with-fail2ban-on-ubuntu)
- [Fail2Ban Filter Guide](https://www.fail2ban.org/wiki/index.php/MANUAL_0_8#Filters)

---

## 🔗 Next Steps

➡️ **[Chapter 6: Rootkit Detection](06-rootkit-detection.md)** - Monitor system integrity

---

[⬅️ Previous: Firewall Setup](04-firewall-setup.md) | [Back to Main Guide](../README.md) | [Next: Rootkit Detection ➡️](06-rootkit-detection.md)
