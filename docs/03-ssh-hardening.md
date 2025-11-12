# Chapter 3: SSH Hardening

**Locking Down Remote Access**

In this chapter, you'll learn how to secure SSH—your gateway to the server. SSH hardening is one of the most critical security measures because SSH is the main way attackers try to break into servers.

---

## 📖 What You'll Learn

- Why SSH hardening matters
- How to disable root login
- How to disable password authentication
- How to configure SSH security settings
- How to test your hardened configuration safely
- Best practices for SSH security

---

## 🎯 The Goal: Defense in Depth

Right now, your server is vulnerable:
- Root login is enabled (attractive target)
- Password authentication is allowed (brute-force attacks)
- Default SSH port 22 (constantly scanned by bots)

**After this chapter:**
- ✅ Only your user can log in
- ✅ Only with SSH keys (no passwords)
- ✅ Root login completely disabled
- ✅ Failed attempts logged and monitored

This is called **defense in depth**—multiple layers of security.

---

## 🚨 Before You Start: Critical Safety Check

**⚠️ WARNING: These changes can lock you out if done incorrectly!**

### Safety Checklist

Before making ANY changes, verify:

- [ ] You can SSH into the server as your regular user
- [ ] Your user has sudo privileges
- [ ] You have at least TWO terminal windows open to the server
- [ ] You know your server's IP address
- [ ] You have access to your VPS provider's web console (emergency backup)

**Pro tip:** Keep one terminal logged in as root and one as your user until everything is tested!

---

## 🔧 Step 1: Backup the SSH Configuration

Always backup before modifying critical system files:

```bash
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
```

If anything goes wrong, you can restore:
```bash
sudo cp /etc/ssh/sshd_config.backup /etc/ssh/sshd_config
```

---

## 📝 Step 2: Edit SSH Configuration

Open the SSH daemon configuration file:

```bash
sudo nano /etc/ssh/sshd_config
```

This file controls how the SSH server behaves.

### Understanding the File

You'll see many lines, some starting with `#` (commented out). Lines without `#` are active settings.

### Key Settings to Change

#### 2.1: Disable Root Login

Find the line:
```
#PermitRootLogin yes
```

Change it to:
```
PermitRootLogin no
```

**What this does:**
- Prevents anyone from logging in as root via SSH
- Even with the correct password or key, root login fails
- Forces use of regular user accounts

**Why this matters:**
- Attackers always try root first
- If root is disabled, they must guess BOTH username AND password
- Significantly reduces attack surface

#### 2.2: Disable Password Authentication

Find the line:
```
#PasswordAuthentication yes
```

Change it to:
```
PasswordAuthentication no
```

**What this does:**
- Only SSH keys can be used to log in
- Passwords won't work at all
- Eliminates brute-force password attacks

**Why this matters:**
- Passwords can be guessed (even strong ones, given enough time)
- SSH keys are cryptographically secure (can't be brute-forced)
- Bots constantly try common passwords on port 22

#### 2.3: Disable Empty Passwords

Find:
```
#PermitEmptyPasswords no
```

Make sure it says:
```
PermitEmptyPasswords no
```

This prevents accounts with no password from logging in (security best practice).

#### 2.4: Disable Challenge-Response Authentication

Find:
```
#ChallengeResponseAuthentication yes
```

Change to:
```
ChallengeResponseAuthentication no
```

This disables keyboard-interactive authentication (another password method).

#### 2.5: Enable Public Key Authentication

Find:
```
#PubkeyAuthentication yes
```

Make sure it says (uncommented):
```
PubkeyAuthentication yes
```

This explicitly enables SSH key authentication.

#### 2.6: Reduce Login Grace Time

Find:
```
#LoginGraceTime 2m
```

Change to:
```
LoginGraceTime 30s
```

**What this does:**
- Limits time for completing authentication to 30 seconds
- Reduces resource consumption from connection attempts
- Makes automated attacks less effective

#### 2.7: Limit Authentication Attempts

Find:
```
#MaxAuthTries 6
```

Change to:
```
MaxAuthTries 3
```

**What this does:**
- Allows only 3 authentication attempts per connection
- Slows down brute-force attacks
- Disconnects after 3 failures

### Your Complete Configuration

After all changes, these lines should be in your `sshd_config` (they might be in different places in the file):

```
# Authentication
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
PermitEmptyPasswords no
ChallengeResponseAuthentication no

# Connection limits
LoginGraceTime 30s
MaxAuthTries 3
```

### Save Your Changes

- Press `Ctrl + X` to exit
- Press `Y` to save
- Press `Enter` to confirm

---

## ✅ Step 3: Test Configuration Syntax

Before restarting SSH, verify your configuration is valid:

```bash
sudo sshd -t
```

**If successful:** No output (silence is golden!)

**If there's an error:**
```
/etc/ssh/sshd_config line 42: Bad configuration option: TypoHere
```

Fix the error and test again. Common mistakes:
- Misspelled option names
- Missing spaces after option names
- Incorrect yes/no values

---

## 🔄 Step 4: Reload SSH Service

**⚠️ CRITICAL: Do NOT close your current SSH session!**

Open a new terminal and keep your current one connected.

Reload the SSH service:

```bash
sudo systemctl reload sshd
```

Or on some systems:
```bash
sudo service sshd reload
```

**Why reload instead of restart?**
- `reload`: Keeps existing connections alive
- `restart`: Drops all connections (including yours!)

Check the service status:
```bash
sudo systemctl status sshd
```

Should show:
```
● ssh.service - OpenBSD Secure Shell server
   Active: active (running)
```

---

## 🧪 Step 5: Test Your Configuration

**Keep your existing session open!** Open a NEW terminal window on your local machine.

### Test 1: Can You Still Log In?

```bash
ssh yourusername@YOUR_SERVER_IP
```

✅ **Should work:** You log in successfully with your SSH key.

### Test 2: Is Root Disabled?

```bash
ssh root@YOUR_SERVER_IP
```

✅ **Should fail with:**
```
Permission denied (publickey).
```

Perfect! Root login is blocked.

### Test 3: Are Passwords Disabled?

Try to log in with password (this should fail):

```bash
ssh -o PubkeyAuthentication=no yourusername@YOUR_SERVER_IP
```

✅ **Should fail with:**
```
Permission denied (publickey).
```

Great! Password authentication is disabled.

---

## 🎯 Step 6: Close Your Root Session

If all tests passed, you can now safely close your root SSH session.

**Why?**
- You've verified your user account works
- Root login is properly disabled
- You have a safe, working configuration

From now on, always log in as your regular user and use `sudo` for administrative tasks.

---

## 🔐 Optional: Change SSH Port

**Advanced (Optional):** Changing the default SSH port 22 reduces automated bot attacks.

**Pros:**
- Less noise in logs (fewer bot attempts)
- Security through obscurity (minor benefit)

**Cons:**
- You must remember the custom port
- Must update firewall rules
- Still not a replacement for real security

**If you want to change the port:**

```bash
sudo nano /etc/ssh/sshd_config
```

Find:
```
#Port 22
```

Change to (choose any port 1024-65535):
```
Port 2222
```

Update firewall (we'll cover this in detail in Chapter 4):
```bash
sudo ufw allow 2222/tcp
sudo ufw delete allow 22/tcp
```

Reload SSH:
```bash
sudo systemctl reload sshd
```

Connect using:
```bash
ssh -p 2222 yourusername@YOUR_SERVER_IP
```

**Recommendation for students:** Keep port 22 for simplicity unless you're comfortable with the extra complexity.

---

## 📊 Understanding What You Built

```
┌─────────────────────────────────────────┐
│         Internet (The Wild West)         │
│  Bots trying: root/admin/ubuntu          │
│  Trying passwords: 123456, password      │
└──────────────┬──────────────────────────┘
               │
               ▼
     ┌──────────────────┐
     │   SSH Hardening   │
     ├──────────────────┤
     │ ✅ Root disabled  │
     │ ✅ Keys only      │
     │ ✅ Limited tries  │
     └────────┬─────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│           Your Server (Safe!)            │
│  Only your user can connect              │
│  Only with the correct SSH key           │
└─────────────────────────────────────────┘
```

---

## 📝 Configuration Reference

Here's a complete hardened SSH configuration section:

```bash
# Port and listening
Port 22
AddressFamily any
ListenAddress 0.0.0.0

# Authentication
PermitRootLogin no
PubkeyAuthentication yes
PasswordAuthentication no
PermitEmptyPasswords no
ChallengeResponseAuthentication no

# Connection limits
LoginGraceTime 30s
MaxAuthTries 3
MaxSessions 10

# Security
X11Forwarding no
PrintMotd no
AcceptEnv LANG LC_*
```

---

## ✅ Verification Checklist

Before moving to the next chapter, verify:

- [ ] You can log in as your regular user
- [ ] Root login is disabled (ssh root@ fails)
- [ ] Password authentication is disabled
- [ ] SSH configuration test passed (sudo sshd -t)
- [ ] SSH service is running
- [ ] You closed your root session
- [ ] You backed up your configuration

---

## 🎯 What You Accomplished

✅ Disabled root login (major security improvement)  
✅ Enforced SSH key authentication only  
✅ Reduced attack surface significantly  
✅ Configured proper security settings  
✅ Tested everything safely  

**Real-world impact:** You've blocked >99% of automated SSH attacks!

---

## 🎓 Best Practices

### Do's ✅

- **Always test** changes in a new terminal before closing old ones
- **Keep backups** of working configurations
- **Use strong SSH keys** (ed25519 or RSA 4096)
- **Regularly review** SSH logs for suspicious activity
- **Document** any custom changes you make

### Don'ts ❌

- **Never close** your last SSH session without testing
- **Never disable** SSH key authentication
- **Never use** weak passwords (they're disabled now anyway!)
- **Never skip** the syntax test (sudo sshd -t)
- **Never forget** to update your SSH client config if you change ports

---

## 🔍 Monitoring SSH Access

Check who's currently connected:
```bash
who
```

View recent logins:
```bash
last -n 20
```

Check failed login attempts:
```bash
sudo grep "Failed password" /var/log/auth.log | tail -20
```

View all SSH-related logs:
```bash
sudo grep "sshd" /var/log/auth.log | tail -50
```

---

## ❓ Troubleshooting

**Problem: "Permission denied (publickey)"**

Solution checklist:
```bash
# 1. Check your authorized_keys file
cat ~/.ssh/authorized_keys

# 2. Check permissions
ls -la ~/.ssh
ls -la ~/.ssh/authorized_keys

# 3. Fix permissions if needed
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# 4. Check SSH server logs
sudo tail -50 /var/log/auth.log
```

**Problem: Locked out completely**

If you can't log in:
1. Use your VPS provider's web console (emergency access)
2. Log in as root through the console
3. Restore backup: `cp /etc/ssh/sshd_config.backup /etc/ssh/sshd_config`
4. Reload SSH: `systemctl reload sshd`
5. Fix the issue and try again

**Problem: "Connection refused"**

```bash
# Check if SSH is running
sudo systemctl status sshd

# Restart if needed
sudo systemctl restart sshd
```

**Problem: Too many authentication failures**

If you have multiple SSH keys, SSH tries them all. Limit this:

On your **local machine**, edit `~/.ssh/config`:
```bash
Host YOUR_SERVER_IP
    IdentityFile ~/.ssh/your_specific_key
    IdentitiesOnly yes
```

---

## 📚 Additional Reading

- [Mozilla SSH Guidelines](https://infosec.mozilla.org/guidelines/openssh)
- [SSH Security Best Practices](https://www.ssh.com/academy/ssh/security)
- [Understanding SSH Keys](https://www.ssh.com/academy/ssh/key)
- [OpenSSH Manual](https://man.openbsd.org/sshd_config)

---

## 🔗 Next Steps

➡️ **[Chapter 4: Firewall Configuration](04-firewall-setup.md)** - Control network traffic with UFW

---

[⬅️ Previous: User Management](02-user-management.md) | [Back to Main Guide](../README.md) | [Next: Firewall Setup ➡️](04-firewall-setup.md)
