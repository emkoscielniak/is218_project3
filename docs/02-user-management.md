# Chapter 2: User Management

**Creating Your Secure Admin Account**

In this chapter, you'll learn why using the root account is dangerous and how to create a secure administrative user account. This is one of the most important security practices in system administration.

---

## 📖 What You'll Learn

- Why you should never use root for regular work
- How to create a new user account
- What sudo is and how to use it properly
- How to set up SSH key authentication for your new user
- How to test your new account

---

## 🚨 The Root Problem

Right now, you're logged in as **root**. This is the superuser account with unlimited power over your system.

### Why Root is Dangerous

**Imagine you accidentally type:**
```bash
rm -rf / home/user/oldfiles    # DISASTER!
```

Notice the space after `/`? As root, this would:
- Delete your entire system
- No warning, no undo
- Server destroyed in seconds

**Or consider security:**
- If someone cracks root's password, they own your entire system
- Malware running as root can do anything
- No audit trail to see who did what

### The Professional Way

System administrators use:
1. **Regular user accounts** for daily work
2. **sudo** for administrative tasks (requires your password each time)
3. **Root** only in emergencies (if ever)

This is standard practice at:
- Google, Amazon, Microsoft
- Every security-conscious organization
- Every professional Linux environment

**Let's set this up properly!**

---

## 👤 Creating Your Admin User

### Step 1: Choose a Username

Pick a username that's:
- All lowercase
- No spaces
- Professional (your name or initials)

Examples: `john`, `jsmith`, `johndoe`

### Step 2: Create the User

While logged in as root, run:

```bash
adduser yourusername
```

Replace `yourusername` with your chosen name. For example:
```bash
adduser john
```

You'll be prompted for information:

```
Enter new UNIX password: [type a strong password]
Retype new UNIX password: [type it again]
Full Name []: John Smith
Room Number []: [press Enter to skip]
Work Phone []: [press Enter to skip]
Home Phone []: [press Enter to skip]
Other []: [press Enter to skip]
Is the information correct? [Y/n] Y
```

**💡 Password Tips:**
- At least 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Not a dictionary word
- Store it in a password manager!

### What Just Happened?

The `adduser` command:
- Created a new user account
- Created a home directory at `/home/yourusername`
- Set up a secure password
- Added an entry to `/etc/passwd`

Verify it worked:
```bash
# Check the user exists
id john

# Output shows:
# uid=1000(john) gid=1000(john) groups=1000(john)
```

---

## 🔧 Granting Sudo Privileges

Your new user exists, but it can't do administrative tasks yet. Let's fix that.

### What is Sudo?

**sudo** means "superuser do" - it lets regular users run specific commands as root.

Benefits:
- ✅ Each command requires your password (prevents accidents)
- ✅ Every sudo command is logged (audit trail)
- ✅ Can revoke access without changing passwords
- ✅ Industry standard practice

### Add User to Sudo Group

```bash
usermod -aG sudo yourusername
```

Replace `yourusername` with your actual username:
```bash
usermod -aG sudo john
```

**Breaking down this command:**
- `usermod`: Modify a user account
- `-aG`: Add to a group
- `sudo`: The group that grants sudo privileges
- `john`: The user to modify

### Verify Sudo Access

Check that your user is in the sudo group:

```bash
groups john
```

Output should include `sudo`:
```
john : john sudo
```

✅ Perfect! Your user now has administrative privileges.

---

## 🔑 Setting Up SSH Key Authentication

Now let's set up SSH key authentication so you can log in as your new user.

### Understanding SSH Keys

Remember that SSH key you used to create the server? We're going to reuse it (probably the same one you use for GitHub).

**Why reuse your GitHub key?**
- ✅ You already have it
- ✅ Already secured on your machine
- ✅ One less key to manage
- ✅ Same key for code and servers (convenient)

### Step 1: Switch to Your New User

```bash
su - yourusername
```

For example:
```bash
su - john
```

**Notice your prompt changed:**
```
john@mywebclass-prod:~$
```

You're now logged in as your new user! (But still through the root SSH connection)

### Step 2: Create SSH Directory

```bash
mkdir -p ~/.ssh
```

The `~/.ssh` directory is where SSH stores all configuration and keys.

### Step 3: Set Correct Permissions

SSH is very strict about permissions for security:

```bash
chmod 700 ~/.ssh
```

This means:
- `7`: Owner (you) can read, write, execute
- `0`: Group can't do anything
- `0`: Others can't do anything

### Step 4: Add Your Public Key

Now we need to add your public key to the authorized_keys file.

**On your LOCAL computer** (not the server), display your public key:

```bash
# If you have an RSA key:
cat ~/.ssh/id_rsa.pub

# Or if you have an ed25519 key:
cat ~/.ssh/id_ed25519.pub

# Or find it in your GitHub settings:
# https://github.com/settings/keys
```

Copy the entire output. It looks like:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBx... your_email@example.com
```

**Back on your SERVER** (as your new user), create the authorized_keys file:

```bash
nano ~/.ssh/authorized_keys
```

This opens a text editor. Paste your public key, then:
- Press `Ctrl + X` to exit
- Press `Y` to save
- Press `Enter` to confirm

### Step 5: Set Authorized Keys Permissions

```bash
chmod 600 ~/.ssh/authorized_keys
```

This makes the file readable and writable only by you.

### Step 6: Verify File Contents

```bash
cat ~/.ssh/authorized_keys
```

You should see your public key displayed.

---

## ✅ Testing Your New User Account

Time to test! Let's make sure you can log in as your new user.

### Step 1: Get Your Server IP

```bash
hostname -I
```

Make note of the first IP address shown.

### Step 2: Open a NEW Terminal Window

**Important:** Keep your current root session open! Don't close it yet.

### Step 3: SSH as Your New User

In the **new terminal on your LOCAL machine**:

```bash
ssh yourusername@YOUR_SERVER_IP
```

For example:
```bash
ssh john@159.89.123.45
```

🎉 **If it works, you should be logged in as your new user!**

### Step 4: Test Sudo Access

Now that you're logged in as your new user, test sudo:

```bash
sudo whoami
```

You'll be prompted for YOUR password (the one you set for your user, not root).

Output should be:
```
root
```

This confirms:
- ✅ You can log in via SSH as your new user
- ✅ Your SSH key works
- ✅ You have sudo privileges

**Success!** You now have a properly configured admin account.

---

## 🔍 Understanding What You Built

Let's understand the security model:

```
┌─────────────────────────────────────┐
│          Your Local Computer         │
│  (Has your private SSH key)          │
└─────────────┬───────────────────────┘
              │ SSH Connection
              │ (Encrypted)
              ▼
┌─────────────────────────────────────┐
│            Your Server               │
├─────────────────────────────────────┤
│  john (your user)                    │
│  - Has your public key               │
│  - Member of sudo group              │
│  - Can elevate with password         │
├─────────────────────────────────────┤
│  root (emergency only)               │
│  - Will be disabled in Chapter 3     │
└─────────────────────────────────────┘
```

**Key Points:**
1. **Private key** stays on your laptop (never leaves)
2. **Public key** is on the server (can be shared safely)
3. **SSH** uses cryptography to prove you have the private key
4. **sudo** requires your password for administrative tasks

---

## 🎓 Best Practices

### Do's ✅

- **Always** use your regular user account
- **Use sudo** for administrative commands
- **Keep** your private key secure (never share it)
- **Use** strong, unique passwords
- **Store** passwords in a password manager

### Don'ts ❌

- **Never** run applications as root
- **Never** share your private SSH key
- **Never** use the same password everywhere
- **Never** disable sudo password prompts
- **Never** `chmod 777` anything (we'll explain permissions more later)

---

## 📝 Quick Command Reference

```bash
# Create a new user
adduser username

# Add user to sudo group  
usermod -aG sudo username

# Switch to another user
su - username

# Run a command as root
sudo command

# Check who you are
whoami

# Check your groups
groups

# View sudo privileges
sudo -l
```

---

## ✅ Verification Checklist

Before moving to the next chapter, verify:

- [ ] You created a new user account
- [ ] Your user has sudo privileges
- [ ] You added your SSH public key
- [ ] You can SSH into the server as your new user
- [ ] You can run `sudo whoami` successfully
- [ ] You understand why not to use root

---

## 🎯 What You Accomplished

✅ Created a secure administrative user account  
✅ Set up SSH key authentication  
✅ Granted sudo privileges properly  
✅ Tested login and administrative access  
✅ Followed professional security practices  

**You're building this the right way!** This is exactly how real production servers are configured.

---

## 🚨 Important: Keep Root Access for Now

Don't close your root session yet! In the next chapter, we'll disable root login as a security measure. But we want to make sure your new user works perfectly first.

**Good practice:** Always have a backup way to access your server before making security changes.

---

## 🔗 Next Steps

➡️ **[Chapter 3: SSH Hardening](03-ssh-hardening.md)** - Lock down remote access

---

## ❓ Troubleshooting

**Problem: "Permission denied (publickey)" when trying to SSH as new user**

Solution:
```bash
# On server as your user, check authorized_keys
cat ~/.ssh/authorized_keys

# Verify permissions
ls -la ~/.ssh
# Should show: drwx------ for .ssh directory

ls -la ~/.ssh/authorized_keys  
# Should show: -rw------- for authorized_keys file

# Fix permissions if needed
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

**Problem: "Username is not in the sudoers file"**

Solution:
```bash
# As root, add user to sudo group again
usermod -aG sudo username

# Verify
groups username
```

**Problem: Sudo asking for password but won't accept it**

- Make sure you're using YOUR user's password (not root's)
- Password won't show as you type (this is normal)
- Try logging out and back in

**Problem: "su: Authentication failure" when switching users**

- You might have typed the password wrong
- Try switching from root: `su - username`

---

[⬅️ Previous: Server Setup](01-server-setup.md) | [Back to Main Guide](../README.md) | [Next: SSH Hardening ➡️](03-ssh-hardening.md)
