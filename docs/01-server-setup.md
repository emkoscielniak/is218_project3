# Chapter 1: Server Setup

**Getting Your First VPS Running**

In this chapter, you'll learn how to get your own Virtual Private Server (VPS) up and running. This is where your journey to becoming a system administrator begins.

---

## 📖 What You'll Learn

- What a VPS is and why you need one
- Choosing the right VPS provider
- Creating your first server
- Making your first SSH connection
- Understanding your server environment

---

## 🤔 What is a VPS?

A **Virtual Private Server (VPS)** is your own computer in the cloud. Unlike shared hosting where you share resources with others, a VPS gives you:

- **Full control** - You have root access to do anything
- **Dedicated resources** - Guaranteed CPU, RAM, and storage
- **Public IP address** - Your server is accessible from anywhere
- **Real-world experience** - Same as managing servers at tech companies

Think of it as renting a computer that runs 24/7 in a data center, and you control it entirely through the command line.

---

## 🏢 Choosing a VPS Provider

Here are recommended providers for students (ordered by ease of use):

### DigitalOcean (Recommended for Beginners)
- **Cost**: $6/month for basic droplet
- **Pros**: Clean interface, excellent documentation, student credits available
- **Free Credits**: GitHub Student Pack gives $200 credit
- **Sign up**: https://digitalocean.com

### Linode (Now Akamai)
- **Cost**: $5/month for basic Linode
- **Pros**: Strong performance, good support
- **Free Credits**: $100 credit for new accounts
- **Sign up**: https://linode.com

### Vultr
- **Cost**: $6/month for basic instance
- **Pros**: Many datacenter locations, good performance
- **Free Credits**: Often have promotions
- **Sign up**: https://vultr.com

### Other Options
- **AWS Lightsail** - $5/month (good if you want AWS experience)
- **Hetzner** - €4/month (cheapest, but EU-based)
- **Oracle Cloud** - Free tier available (but more complex)

**💡 Recommendation**: Start with DigitalOcean if you have student credits. Otherwise, any of the above work great.

---

## 🚀 Creating Your Server

### Step 1: Sign Up and Add Payment

1. Create an account with your chosen provider
2. Verify your email
3. Add a payment method (or use student credits)

### Step 2: Create a New Server

For DigitalOcean (similar for others):

1. **Click "Create Droplet"** (or "Create Instance" on other platforms)

2. **Choose an Image**:
   - Select **Ubuntu 24.04 LTS** (Long Term Support)
   - Why Ubuntu? Most popular, best documentation, enterprise-standard

3. **Choose a Plan**:
   - **Basic** shared CPU is fine to start
   - **$6/month** plan: 1GB RAM, 25GB SSD, 1 CPU
   - You can upgrade later if needed

4. **Choose a Datacenter**:
   - Pick the closest to your location (lower latency)
   - New York, San Francisco, London, etc.

5. **Authentication**:
   - Choose **SSH Key** (not password!)
   - Click "New SSH Key"
   
   **If you have a GitHub SSH key:**
   ```bash
   # On your local computer, display your public key:
   cat ~/.ssh/id_rsa.pub
   # OR if you use ed25519:
   cat ~/.ssh/id_ed25519.pub
   ```
   
   Copy the output and paste it into the SSH Key field.
   
   **If you DON'T have an SSH key yet:**
   ```bash
   # Generate one on your local computer:
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # Press Enter to accept defaults
   # Then display it:
   cat ~/.ssh/id_ed25519.pub
   ```

6. **Choose a hostname**:
   - Something descriptive like: `mywebclass-prod`

7. **Click "Create Droplet"**

⏱️ Wait 60 seconds for your server to boot up.

---

## 🔌 Your First SSH Connection

### What is SSH?

**SSH (Secure Shell)** is how you securely connect to and control your server remotely. All communication is encrypted.

### Step 1: Get Your Server's IP Address

After your server is created, you'll see its **IP address**. It looks like:
```
159.89.123.45
```

Copy this IP address.

### Step 2: Connect via SSH

On your **local computer** (Mac/Linux/Windows with WSL), open a terminal:

```bash
ssh root@YOUR_SERVER_IP
```

Replace `YOUR_SERVER_IP` with your actual IP. For example:
```bash
ssh root@159.89.123.45
```

### Step 3: First Login

The first time you connect, you'll see a message like:
```
The authenticity of host '159.89.123.45' can't be established.
ED25519 key fingerprint is SHA256:xxxxxxxxxxxxxxxxxxxxx
Are you sure you want to continue connecting (yes/no)?
```

Type `yes` and press Enter.

**🎉 You're in!** You should now see a prompt like:
```
root@mywebclass-prod:~#
```

This means you're now controlling your server in the cloud!

---

## 🔍 Understanding Your Environment

Now that you're connected, let's explore what you have:

### Check Your Operating System
```bash
cat /etc/os-release
```

You should see Ubuntu 24.04 (or similar).

### Check System Resources
```bash
# View CPU and memory
free -h
```

Output explains:
- `total`: Total RAM available
- `used`: Currently in use
- `available`: Free for new programs

### Check Disk Space
```bash
df -h
```

Shows your storage usage:
- `/dev/vda1` or similar: Your main disk
- `Size`: Total space (usually 25GB)
- `Used`: How much you've used
- `Avail`: What's left

### Check Network Configuration
```bash
ip addr show
```

You'll see your:
- **Public IP**: The address the world sees
- **Private IP**: Internal network address (if applicable)

### Update Your System

**Always update first!** This installs security patches:

```bash
apt update && apt upgrade -y
```

This command:
- `apt update`: Downloads package lists
- `apt upgrade -y`: Installs all updates (the `-y` auto-confirms)

⏱️ This might take 2-3 minutes the first time.

---

## ✅ Verification Checklist

Before moving to the next chapter, verify:

- [ ] You can SSH into your server
- [ ] You see the Ubuntu welcome message
- [ ] You've run system updates
- [ ] You understand your server's IP address
- [ ] You can run basic commands (ls, pwd, whoami)

### Test Your Knowledge

Try these commands to explore:

```bash
# Where am I?
pwd

# What's my username?
whoami

# What processes are running?
top
# Press 'q' to quit

# Check internet connectivity
ping -c 3 google.com
```

---

## 🎯 What You Accomplished

✅ You now have your own server in the cloud!  
✅ You can connect to it securely via SSH  
✅ You understand basic system navigation  
✅ Your system is updated with latest security patches

**This is a big deal!** Many developers never get this hands-on experience. You're already ahead of the curve.

---

## 🚨 Important Security Note

Right now, you're logged in as **root** (the most powerful user). This is like having admin access to everything with no safety net.

**In the next chapter**, we'll create a regular user account with sudo privileges. This is a critical security practice that prevents accidental system damage and limits attack surface.

**Never use root for regular work in production!**

---

## 🔗 Next Steps

➡️ **[Chapter 2: User Management](02-user-management.md)** - Create your secure admin account

---

## 📚 Additional Resources

- [DigitalOcean Community Tutorials](https://www.digitalocean.com/community/tutorials)
- [Understanding SSH Keys](https://www.ssh.com/academy/ssh/key)
- [Linux Journey - Command Line Basics](https://linuxjourney.com/)
- [Ubuntu Server Guide](https://ubuntu.com/server/docs)

---

## ❓ Troubleshooting

**Problem: "Permission denied (publickey)"**
- Your SSH key isn't configured properly
- Solution: Check that you added the correct public key to your VPS provider

**Problem: "Connection refused"**
- Server might still be booting
- Solution: Wait 1-2 minutes and try again

**Problem: "Connection timed out"**
- Firewall or network issue
- Solution: Check your VPS provider's console/firewall settings

---

[⬅️ Back to Main Guide](../README.md) | [Next Chapter: User Management ➡️](02-user-management.md)
