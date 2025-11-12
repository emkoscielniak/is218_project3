# Chapter 6: Rootkit Detection

**Monitoring System Integrity**

In this chapter, you'll learn about rootkits and malware, and how to detect them using security scanning tools. This is your last line of defense—detecting if something malicious has already gotten in.

---

## 📖 What You'll Learn

- What rootkits and malware are
- How systems get compromised
- Installing rkhunter and chkrootkit
- Running security scans
- Understanding scan results
- Setting up automated monitoring

---

## 🦠 What are Rootkits?

### Definition

A **rootkit** is malware designed to hide its presence while maintaining privileged access to a computer system.

**Key characteristics:**
- **Hidden**: Doesn't show up in normal process lists
- **Persistent**: Survives reboots
- **Privileged**: Has root/admin access
- **Stealthy**: Modifies system tools to hide itself

### The Infection Analogy

Think of your server as a house:
- **Firewall**: Locked doors and windows
- **SSH Hardening**: High-quality locks
- **Fail2Ban**: Security cameras catching burglars
- **Rootkit**: Burglar already inside, hiding in the walls

Rootkits are what you're looking for AFTER someone might have broken in.

### How Do Systems Get Compromised?

Common attack vectors:
1. **Unpatched vulnerabilities**: Old software with known exploits
2. **Weak passwords**: Brute-forced or guessed
3. **Malicious software**: Installing untrusted packages
4. **Supply chain attacks**: Compromised dependencies
5. **Social engineering**: Tricked into running malicious commands

---

## 🎯 Detection vs. Prevention

### Security Layers

```
1. Prevention (Chapters 1-5)
   - Firewall, SSH hardening, Fail2Ban
   - GOAL: Keep attackers out
   
2. Detection (This Chapter)
   - Rootkit scanners, integrity checks
   - GOAL: Find if someone got in

3. Response (Your Responsibility)
   - Backup, restore, investigate
   - GOAL: Recover from compromise
```

**Important:** Detection tools don't prevent attacks—they find them after the fact.

---

## 🛠️ Installing Security Scanners

We'll install two complementary tools:

### 1. rkhunter (Rootkit Hunter)

**What it does:**
- Scans for known rootkits
- Checks system binaries for modifications
- Detects hidden files and processes
- Validates file permissions

```bash
sudo apt update
sudo apt install rkhunter -y
```

### 2. chkrootkit

**What it does:**
- Detects known rootkit signatures
- Checks for suspicious kernel modules
- Finds hidden network interfaces
- Identifies suspicious files

```bash
sudo apt install chkrootkit -y
```

### Why Two Tools?

Different tools detect different things:
- **rkhunter**: More comprehensive, checks file integrity
- **chkrootkit**: Faster, finds known signatures

Using both increases detection chances (like a second medical opinion).

---

## 🔍 Using rkhunter

### Initial Setup

Update the rkhunter database:

```bash
sudo rkhunter --update
```

**Create a baseline** of your clean system:

```bash
sudo rkhunter --propupd
```

**What this does:**
- Records current state of system files
- Creates fingerprints of binaries
- Establishes "known good" baseline
- Future scans compare against this

**Important:** Run this on a CLEAN system (right after setup, before installing applications).

### Running Your First Scan

```bash
sudo rkhunter --check --skip-keypress
```

**Command breakdown:**
- `--check`: Run a full scan
- `--skip-keypress`: Don't wait for Enter key (automated)

**First run will take 2-3 minutes.**

### Understanding Scan Output

You'll see lots of output. Key sections:

#### System Checks
```
Checking system commands...
  /usr/bin/lwp-request                      [ OK ]
  /usr/bin/GET                              [ OK ]
  /usr/bin/whois                            [ OK ]
```

**OK** = File matches known good version.

#### Rootkit Detection
```
Checking for rootkits...
  55808 Trojan - Variant A                 [ Not found ]
  ADM Worm                                 [ Not found ]
  AjaKit Rootkit                           [ Not found ]
```

**Not found** = Good! No known rootkits detected.

#### Warnings (Common False Positives)

```
Warning: The SSH configuration option 'PermitRootLogin' has not been set.
Warning: Found enabled xinetd service: rsync
```

**These are often OK!** We'll learn to interpret them.

### Viewing the Report

Full report location:
```bash
sudo cat /var/log/rkhunter.log
```

Summary only:
```bash
sudo rkhunter --check --report-warnings-only
```

---

## 🔍 Using chkrootkit

### Running a Scan

```bash
sudo chkrootkit
```

Output shows:
```
ROOTDIR is `/`
Checking `amd`... not found
Checking `basename`... not infected
Checking `biff`... not found
Checking `chfn`... not infected
Checking `chsh`... not infected
```

**Interpretations:**
- **not found**: Tool not installed (normal)
- **not infected**: Checked and clean
- **INFECTED**: Potential problem (investigate!)

### Common chkrootkit Output

```
Checking `bindshell`... not infected
Checking `lkm`... chk_lkm: nothing deleted
Checking `rexedcs`... not found
Checking `sniffer`... lo: not promisc and no packet sniffer sockets
```

All good! Nothing suspicious found.

---

## 📊 Understanding Scan Results

### Clean System Indicators

✅ **Good signs:**
- Most checks show "OK" or "not infected"
- No critical warnings
- System behaves normally
- Logs look normal

### Warning Signs

⚠️ **Investigate these:**
- Files marked as "changed" (but verify legitimate updates first)
- Unknown processes
- Suspicious network connections
- Modified system binaries
- Unexpected warnings

🚨 **Critical alerts:**
- "INFECTED" status
- Known rootkit signatures found
- System binaries replaced
- Hidden processes or files

### Common False Positives

**1. System updates**
```
Warning: /usr/bin/curl has changed
```

**Solution:** Did you run `apt upgrade`? Legitimate updates change files.

**2. Configuration warnings**
```
Warning: SSH configuration not optimal
```

**Solution:** You may have configured SSH differently (this is OK if intentional).

**3. Suspicious files that are actually OK**
```
Warning: Found file '/dev/shm/pulse-shm-*'
```

**Solution:** Many legitimate applications use `/dev/shm`. Research before panicking.

### When to Worry

**Act immediately if you see:**
1. Files explicitly marked "INFECTED"
2. Known rootkit names detected
3. System binaries replaced with unknown versions
4. Hidden processes you didn't create
5. Network connections to suspicious IPs

---

## 🔄 Automated Monitoring

### Daily Automated Scans

Create a cron job for daily scans:

```bash
sudo crontab -e
```

Add these lines:
```
# rkhunter scan daily at 3 AM
0 3 * * * /usr/bin/rkhunter --cronjob --update --quiet

# chkrootkit scan daily at 4 AM  
0 4 * * * /usr/sbin/chkrootkit | mail -s "chkrootkit Daily Report" your-email@example.com
```

**What this does:**
- **3 AM**: rkhunter updates and runs scan
- **4 AM**: chkrootkit runs and emails results

**Note:** Email requires mail server (advanced topic).

### Weekly Summary

Get weekly rkhunter reports:

```bash
sudo crontab -e
```

Add:
```
# Weekly rkhunter report on Sundays at 2 AM
0 2 * * 0 /usr/bin/rkhunter --cronjob --report-warnings-only | mail -s "Weekly rkhunter Report" your-email@example.com
```

---

## 🛠️ Maintaining Your Scans

### After System Updates

Always update rkhunter's baseline after legitimate system updates:

```bash
# After apt upgrade
sudo apt upgrade -y

# Update rkhunter baseline
sudo rkhunter --propupd
```

**Why?** Updates change files legitimately. Update the baseline to avoid false positives.

### Regular Maintenance

```bash
# Update rkhunter signatures
sudo rkhunter --update

# Re-run baseline after updates
sudo rkhunter --propupd

# Check for warnings
sudo rkhunter --check --report-warnings-only
```

---

## 🧪 Testing Detection (Advanced)

**⚠️ WARNING: Do NOT do this on production systems!**

For educational purposes only, on a test VM:

### Create a Test "Suspicious" File

```bash
# Create a hidden file in /dev
sudo touch /dev/.test-hidden-file

# Run rkhunter
sudo rkhunter --check --skip-keypress
```

rkhunter might flag this as suspicious (hidden file in /dev).

**Remove it immediately:**
```bash
sudo rm /dev/.test-hidden-file
```

---

## 🎓 Best Practices

### Do's ✅

- **Run scans regularly**: At least weekly manually, daily automated
- **Update before scanning**: `rkhunter --update`
- **Update baseline after system updates**: `rkhunter --propupd`
- **Investigate warnings**: Don't ignore alerts
- **Keep scanners updated**: `apt upgrade rkhunter chkrootkit`
- **Document false positives**: Note why certain warnings are OK

### Don'ts ❌

- **Don't ignore "INFECTED" alerts**: Investigate immediately
- **Don't modify scanner configs** without understanding them
- **Don't rely solely on scanners**: They're one tool, not a silver bullet
- **Don't panic at warnings**: Many are false positives
- **Don't skip baseline updates**: Leads to constant false alerts

### Response Plan

If you find actual malware:

1. **Disconnect from internet** (prevent data exfiltration)
   ```bash
   sudo ufw deny out from any to any
   ```

2. **Document everything** (screenshot alerts, save logs)

3. **Don't trust the system** (it may be compromised)

4. **Restore from backup** (safest option)

5. **Investigate the breach** (how did they get in?)

6. **Patch the vulnerability** (prevent recurrence)

7. **Monitor closely** (watch for re-infection)

---

## ✅ Verification Checklist

Before moving to the next chapter, verify:

- [ ] rkhunter is installed
- [ ] chkrootkit is installed
- [ ] rkhunter database is updated
- [ ] rkhunter baseline is created
- [ ] You've run both scanners successfully
- [ ] You understand scan output
- [ ] You know how to update baselines
- [ ] Automated scans are configured (optional)

### Quick Test

```bash
# rkhunter version and status
sudo rkhunter --version

# Quick rkhunter check
sudo rkhunter --check --report-warnings-only --skip-keypress

# chkrootkit quick scan
sudo chkrootkit | grep -v "not infected" | grep -v "not found"
```

---

## 🎯 What You Accomplished

✅ Installed rootkit detection tools (rkhunter & chkrootkit)  
✅ Created system baseline for integrity checking  
✅ Ran security scans successfully  
✅ Learned to interpret scan results  
✅ Set up automated monitoring (optional)  

**Security milestone:** You now have comprehensive protection—prevention (firewall, SSH, Fail2Ban) AND detection (rootkit scanners).

---

## 🔍 Reading Logs

### rkhunter Logs

```bash
# Full log
sudo cat /var/log/rkhunter.log

# Recent warnings
sudo grep "Warning" /var/log/rkhunter.log | tail -20

# Scan summary
sudo grep "System checks" /var/log/rkhunter.log | tail -10
```

### chkrootkit Logs

chkrootkit doesn't keep logs by default. Save output manually:

```bash
sudo chkrootkit > ~/chkrootkit-$(date +%Y%m%d).log
```

---

## 📊 Security Posture Summary

After completing Chapters 1-6, your server has:

**Preventive Controls:**
- ✅ Secure user management (no root login)
- ✅ SSH hardening (keys only, no passwords)
- ✅ Firewall (UFW blocking unwanted traffic)
- ✅ Intrusion prevention (Fail2Ban blocking attackers)

**Detective Controls:**
- ✅ Rootkit detection (rkhunter)
- ✅ Malware scanning (chkrootkit)
- ✅ Log monitoring
- ✅ Integrity checking

**This is production-grade security!** Many companies don't have this level of protection.

---

## ❓ Troubleshooting

**Problem: rkhunter reports many warnings after update**

```bash
# Update the baseline
sudo rkhunter --propupd

# Re-run scan
sudo rkhunter --check --skip-keypress
```

**Problem: chkrootkit shows false positives**

Research the specific warning. Common false positives:
- `/dev/shm` files (normal for many apps)
- Port 22 listed in netstat (that's SSH!)
- Legitimate system processes

**Problem: Can't update rkhunter database**

```bash
# Check internet connection
ping -c 3 google.com

# Try manual update
sudo rkhunter --update

# Check rkhunter config
sudo nano /etc/rkhunter.conf
```

**Problem: Scans taking too long**

```bash
# Skip slower checks for daily scans
sudo rkhunter --check --skip-keypress --enable-tests 1-5

# Full scan weekly only
```

---

## 📚 Additional Resources

- [rkhunter Official Site](http://rkhunter.sourceforge.net/)
- [chkrootkit Home](http://www.chkrootkit.org/)
- [Linux Rootkit Detection](https://www.tecmint.com/scan-linux-for-malware-and-rootkits/)
- [Rootkit Analysis](https://www.sans.org/reading-room/whitepapers/malicious/rootkits-attacks-33325)

---

## 🔗 Next Steps

➡️ **[Chapter 7: Docker Installation](07-docker-installation.md)** - Set up containerization platform

You've completed the security foundation! Now we'll start building the hosting platform itself.

---

[⬅️ Previous: Fail2Ban](05-fail2ban.md) | [Back to Main Guide](../README.md) | [Next: Docker Installation ➡️](07-docker-installation.md)
