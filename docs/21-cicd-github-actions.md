# Chapter 21: CI/CD with GitHub Actions

[← Previous: Chapter 20 - Operations and Monitoring](20-operations-monitoring.md)

---

## Learning Objectives

By the end of this chapter, you will be able to:

1. **Understand CI/CD Concepts**
   - Explain continuous integration and continuous deployment
   - Identify benefits of automation
   - Recognize deployment risks and mitigation strategies

2. **Work with GitHub Actions**
   - Create workflow files
   - Configure triggers and events
   - Use jobs, steps, and actions
   - Understand GitHub-hosted vs self-hosted runners

3. **Automate Testing**
   - Set up automated test runs
   - Implement test reporting
   - Use test results to gate deployments

4. **Implement Automated Deployment**
   - Deploy on successful builds
   - Use GitHub Secrets for sensitive data
   - Configure deployment environments
   - Implement rollback strategies

5. **Monitor and Debug Workflows**
   - Read workflow logs
   - Troubleshoot failed workflows
   - Optimize workflow performance

**Time Requirement:** 90-120 minutes

**Prerequisites:**
- Completed Chapter 5 (Git setup)
- Active GitHub repository
- Working server with SSH access
- Applications from Chapters 16-19 deployed

---

## What is CI/CD?

### The Problem: Manual Deployments

**Before CI/CD:**
```
Developer:
1. Write code
2. Test locally (maybe)
3. Manually SSH to server
4. Pull latest code
5. Manually restart services
6. Hope nothing breaks
7. Stay up all night if it does
```

**Problems:**
- ❌ Human error (forgot to restart service)
- ❌ Inconsistent process (different each time)
- ❌ No testing before deployment
- ❌ Broken deployments at 2 AM
- ❌ Fear of deploying (weeks between releases)
- ❌ No audit trail

### The Solution: Automated CI/CD

**With CI/CD:**
```
Developer:
1. Write code
2. Commit to Git
3. Push to GitHub
4. Automation handles:
   - Run tests
   - Build application
   - Deploy to server
   - Verify deployment
   - Notify team
5. Go home at 5 PM
```

**Benefits:**
- ✅ Consistent, repeatable process
- ✅ Automated testing catches bugs
- ✅ Fast, frequent deployments
- ✅ Reduced deployment risk
- ✅ Complete audit trail
- ✅ Confidence to deploy anytime

### Real-World Analogy

**Manual Deployment = Making Coffee by Hand:**
- Grind beans manually
- Heat water on stove
- Pour by hand
- Time consuming
- Inconsistent results
- Easy to mess up

**CI/CD = Automatic Coffee Maker:**
- Press one button
- Consistent results every time
- Fast and reliable
- Same quality each brew
- Can run while you sleep

---

## CI vs CD vs CD

### Three Related Concepts

**1. Continuous Integration (CI)**
```
Developer commits code
        ↓
Automatically run tests
        ↓
Report test results
```

**Purpose:** Catch bugs early, ensure code quality

**2. Continuous Delivery (CD)**
```
Tests pass
        ↓
Automatically build application
        ↓
Create deployment package
        ↓
Ready to deploy (manual button)
```

**Purpose:** Always have deployment-ready code

**3. Continuous Deployment (CD)**
```
Tests pass
        ↓
Automatically build
        ↓
Automatically deploy to production
        ↓
Live on server
```

**Purpose:** Fully automated releases

### What We'll Build

We'll implement **Continuous Deployment** with GitHub Actions:

```
Push to GitHub
        ↓
Run automated tests
        ↓
Build application (if needed)
        ↓
Deploy to server automatically
        ↓
Verify deployment
        ↓
Notify on success/failure
```

---

## GitHub Actions Overview

### What Are GitHub Actions?

**GitHub Actions** = GitHub's built-in automation platform

Think of it like **hiring a robot assistant** that:
- Works 24/7
- Never makes mistakes
- Follows instructions exactly
- Costs nothing for public repos

### Key Concepts

**1. Workflow**
- A YAML file defining automation
- Lives in `.github/workflows/` directory
- Triggered by events (push, pull request, schedule)

**2. Event**
- Something that triggers a workflow
- Examples: push, pull_request, schedule, manual

**3. Job**
- A set of steps that run on same runner
- Can run in parallel or sequence

**4. Step**
- Individual task within a job
- Runs commands or uses actions

**5. Action**
- Reusable automation unit
- Like a pre-built function
- Can use community actions

**6. Runner**
- Server that runs your workflows
- GitHub-hosted (free, managed by GitHub)
- Self-hosted (your own server)

### Workflow Structure

```yaml
name: Workflow Name                 # Human-readable name

on: [push, pull_request]           # Events that trigger

jobs:                              # Define jobs
  job-name:                        # Job identifier
    runs-on: ubuntu-latest         # Runner type
    
    steps:                         # Steps in job
      - name: Step Name            # Step name
        uses: actions/checkout@v3  # Use action
        
      - name: Another Step
        run: echo "Hello World"    # Run command
```

---

## Your First Workflow

### Create Workflow File

**Step 1:** Create workflow directory in your repository

```bash
# On your LOCAL computer (not server)
cd ~/Code/mywebclass_hosting  # Your repo
mkdir -p .github/workflows
```

**Step 2:** Create a simple test workflow

```bash
nano .github/workflows/test.yml
```

**Step 3:** Add this basic workflow

```yaml
name: Test Workflow

# Run on every push to any branch
on: [push]

jobs:
  test:
    # Use GitHub's Ubuntu runner
    runs-on: ubuntu-latest
    
    steps:
      # Step 1: Get the code
      - name: Checkout code
        uses: actions/checkout@v4
      
      # Step 2: Show system info
      - name: Show system info
        run: |
          echo "Runner OS: ${{ runner.os }}"
          echo "Repository: ${{ github.repository }}"
          echo "Branch: ${{ github.ref_name }}"
          whoami
          pwd
          ls -la
      
      # Step 3: Simple test
      - name: Run simple test
        run: echo "Test passed! ✅"
```

**Step 4:** Commit and push

```bash
git add .github/workflows/test.yml
git commit -m "Add first GitHub Actions workflow"
git push origin master
```

### View Workflow Run

**Step 1:** Go to your GitHub repository

**Step 2:** Click "Actions" tab

**Step 3:** See your workflow running!

```
Test Workflow
  ├── test
      ├── ✅ Checkout code
      ├── ✅ Show system info
      └── ✅ Run simple test
```

**Step 4:** Click on a step to see logs

```
Runner OS: Linux
Repository: username/mywebclass_hosting
Branch: master
runner:runner
/home/runner/work/mywebclass_hosting/mywebclass_hosting
total 48
drwxr-xr-x  7 runner runner 4096 Dec 15 10:30 .
drwxr-xr-x  3 runner runner 4096 Dec 15 10:30 ..
drwxr-xr-x  8 runner runner 4096 Dec 15 10:30 .git
...
```

**Congratulations!** You just ran your first GitHub Action! 🎉

### What Just Happened?

1. You pushed code to GitHub
2. GitHub detected the workflow file
3. GitHub spun up a fresh Ubuntu server
4. Ran your steps
5. Showed you the results
6. Destroyed the server

**All automatically!**

---

## Deploy Static Site Workflow

### Real-World Example

Let's automate deployment of a static website (like from Chapter 16).

**What this workflow will do:**
1. Trigger on push to `master` branch
2. Run tests (if any)
3. SSH to your server
4. Pull latest code
5. Deploy to web root
6. Notify on success/failure

### Set Up Server SSH Key

**Step 1:** Generate deployment SSH key (on your LOCAL computer)

```bash
# Different key for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# No passphrase (Actions can't enter passwords)
# Just press Enter when prompted
```

**Step 2:** Add public key to server

```bash
# Show public key
cat ~/.ssh/github_actions_deploy.pub

# Copy output, then SSH to server
ssh youruser@your-server-ip

# Add to authorized_keys
nano ~/.ssh/authorized_keys
# Paste public key on new line
# Save (Ctrl+O, Enter, Ctrl+X)

# Test from your computer
ssh -i ~/.ssh/github_actions_deploy youruser@your-server-ip
# Should connect without password
exit
```

### Add Secrets to GitHub

**Step 1:** Go to your GitHub repository

**Step 2:** Click **Settings** > **Secrets and variables** > **Actions**

**Step 3:** Click **New repository secret**

**Step 4:** Add these secrets:

**Secret 1: SSH_PRIVATE_KEY**
```bash
# On your local computer
cat ~/.ssh/github_actions_deploy
# Copy entire output including:
# -----BEGIN OPENSSH PRIVATE KEY-----
# ...key content...
# -----END OPENSSH PRIVATE KEY-----
```
- Name: `SSH_PRIVATE_KEY`
- Value: Paste entire private key
- Click "Add secret"

**Secret 2: SERVER_HOST**
- Name: `SERVER_HOST`
- Value: Your server IP (e.g., `123.45.67.89`)
- Click "Add secret"

**Secret 3: SERVER_USER**
- Name: `SERVER_USER`
- Value: Your username (e.g., `webadmin`)
- Click "Add secret"

**Why secrets?**
- 🔒 Never exposed in logs
- 🔒 Not visible in workflow files
- 🔒 Only accessible during workflow runs
- 🔒 Encrypted at rest

### Create Deploy Workflow

**Create:** `.github/workflows/deploy-static.yml`

```yaml
name: Deploy Static Site

# Only run on pushes to master branch
on:
  push:
    branches:
      - master
    paths:
      - 'static-site/**'  # Only if static-site files change

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      # Get the code
      - name: Checkout code
        uses: actions/checkout@v4
      
      # Set up SSH
      - name: Set up SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H ${{ secrets.SERVER_HOST }} >> ~/.ssh/known_hosts
      
      # Deploy to server
      - name: Deploy to server
        run: |
          ssh -i ~/.ssh/deploy_key ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} << 'EOF'
            set -e
            echo "Starting deployment..."
            
            # Navigate to project
            cd ~/mywebclass_hosting
            
            # Pull latest changes
            git pull origin master
            
            # Copy static files to web root
            sudo cp -r static-site/* /var/www/mywebsite/
            
            # Set permissions
            sudo chown -R www-data:www-data /var/www/mywebsite
            sudo chmod -R 755 /var/www/mywebsite
            
            echo "Deployment completed successfully! ✅"
          EOF
      
      # Verify deployment
      - name: Verify deployment
        run: |
          # Check if site is responding
          status_code=$(curl -s -o /dev/null -w "%{http_code}" http://${{ secrets.SERVER_HOST }})
          
          if [ $status_code -eq 200 ]; then
            echo "✅ Site is responding (HTTP $status_code)"
          else
            echo "❌ Site returned HTTP $status_code"
            exit 1
          fi
      
      # Cleanup
      - name: Cleanup
        if: always()
        run: rm -f ~/.ssh/deploy_key
```

### Test the Workflow

**Step 1:** Make a change to your static site

```bash
cd ~/Code/mywebclass_hosting
echo "<h2>Deployed by GitHub Actions!</h2>" >> static-site/index.html
```

**Step 2:** Commit and push

```bash
git add static-site/index.html
git commit -m "Test automated deployment"
git push origin master
```

**Step 3:** Watch on GitHub Actions tab

You'll see:
1. ✅ Checkout code
2. ✅ Set up SSH
3. ✅ Deploy to server
4. ✅ Verify deployment
5. ✅ Cleanup

**Step 4:** Check your website

Visit `http://your-server-ip` - you should see your changes!

**That's automated deployment! 🚀**

---

## Deploy Backend Application

### Node.js/Express Deployment

More complex workflow for backend applications with dependencies.

**Create:** `.github/workflows/deploy-backend.yml`

```yaml
name: Deploy Backend

on:
  push:
    branches:
      - master
    paths:
      - 'backend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        working-directory: ./backend
        run: npm ci
      
      - name: Run tests
        working-directory: ./backend
        run: npm test
      
      - name: Run linter
        working-directory: ./backend
        run: npm run lint

  deploy:
    runs-on: ubuntu-latest
    needs: test  # Only deploy if tests pass
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H ${{ secrets.SERVER_HOST }} >> ~/.ssh/known_hosts
      
      - name: Deploy to server
        run: |
          ssh -i ~/.ssh/deploy_key ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} << 'EOF'
            set -e
            echo "🚀 Starting backend deployment..."
            
            # Navigate to project
            cd ~/mywebclass_hosting/backend
            
            # Pull latest code
            git pull origin master
            
            # Install dependencies (production only)
            npm ci --only=production
            
            # Run database migrations (if any)
            npm run migrate
            
            # Restart the service
            sudo systemctl restart backend
            
            # Wait for service to start
            sleep 5
            
            # Check service status
            if sudo systemctl is-active --quiet backend; then
              echo "✅ Backend service is running"
            else
              echo "❌ Backend service failed to start"
              sudo journalctl -u backend -n 50
              exit 1
            fi
            
            echo "✅ Deployment completed successfully!"
          EOF
      
      - name: Health check
        run: |
          # Wait for app to be ready
          sleep 10
          
          # Check health endpoint
          status_code=$(curl -s -o /dev/null -w "%{http_code}" http://${{ secrets.SERVER_HOST }}:3000/health)
          
          if [ $status_code -eq 200 ]; then
            echo "✅ Health check passed (HTTP $status_code)"
          else
            echo "❌ Health check failed (HTTP $status_code)"
            exit 1
          fi
      
      - name: Cleanup
        if: always()
        run: rm -f ~/.ssh/deploy_key
```

### Key Differences from Static Deployment

**1. Multiple Jobs**
```yaml
jobs:
  test:    # Run first
    ...
  
  deploy:  # Run only if test passes
    needs: test
    ...
```

**2. Testing Before Deployment**
```yaml
- name: Run tests
  run: npm test
  
- name: Run linter
  run: npm run lint
```

**3. Service Management**
```bash
sudo systemctl restart backend
sudo systemctl is-active backend
```

**4. Health Checks**
```bash
curl http://server:3000/health
```

---

## Deploy Docker Application

### Docker Deployment Workflow

For applications running in Docker containers.

**Create:** `.github/workflows/deploy-docker.yml`

```yaml
name: Deploy Docker App

on:
  push:
    branches:
      - master
    paths:
      - 'docker-app/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to Docker Hub (optional)
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build Docker image
        working-directory: ./docker-app
        run: |
          docker build -t myapp:${{ github.sha }} .
          docker tag myapp:${{ github.sha }} myapp:latest
      
      - name: Test Docker image
        run: |
          # Start container
          docker run -d --name test-container -p 8080:80 myapp:latest
          
          # Wait for startup
          sleep 5
          
          # Test
          status_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080)
          
          # Cleanup
          docker stop test-container
          docker rm test-container
          
          if [ $status_code -ne 200 ]; then
            echo "❌ Docker image test failed"
            exit 1
          fi
          
          echo "✅ Docker image test passed"
      
      - name: Set up SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H ${{ secrets.SERVER_HOST }} >> ~/.ssh/known_hosts
      
      - name: Save and transfer Docker image
        run: |
          # Save image to tar
          docker save myapp:latest | gzip > myapp.tar.gz
          
          # Transfer to server
          scp -i ~/.ssh/deploy_key myapp.tar.gz \
            ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }}:~/
      
      - name: Deploy on server
        run: |
          ssh -i ~/.ssh/deploy_key ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} << 'EOF'
            set -e
            echo "🚀 Deploying Docker container..."
            
            # Load image
            docker load < ~/myapp.tar.gz
            
            # Stop and remove old container (if exists)
            docker stop myapp || true
            docker rm myapp || true
            
            # Start new container
            docker run -d \
              --name myapp \
              --restart unless-stopped \
              -p 3000:3000 \
              -e NODE_ENV=production \
              myapp:latest
            
            # Cleanup
            rm ~/myapp.tar.gz
            
            # Wait for container
            sleep 5
            
            # Verify container is running
            if docker ps | grep -q myapp; then
              echo "✅ Container is running"
            else
              echo "❌ Container failed to start"
              docker logs myapp
              exit 1
            fi
          EOF
      
      - name: Cleanup
        if: always()
        run: |
          rm -f ~/.ssh/deploy_key
          rm -f myapp.tar.gz
```

### Alternative: Docker Compose

If using Docker Compose:

```yaml
- name: Deploy with Docker Compose
  run: |
    ssh -i ~/.ssh/deploy_key ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} << 'EOF'
      set -e
      cd ~/mywebclass_hosting/docker-app
      
      # Pull latest code
      git pull origin master
      
      # Pull/build images
      docker compose pull
      docker compose build
      
      # Deploy with zero-downtime
      docker compose up -d --remove-orphans
      
      # Cleanup old images
      docker image prune -f
      
      echo "✅ Deployed with Docker Compose"
    EOF
```

---

## Environment-Specific Deployments

### Deploy to Staging, Then Production

**Create:** `.github/workflows/deploy-staged.yml`

```yaml
name: Staged Deployment

on:
  push:
    branches:
      - develop     # Deploy to staging
      - master      # Deploy to production

jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging  # Uses staging secrets
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Deploy to staging
        run: |
          # Deploy to staging server
          echo "Deploying to staging..."
          # ... deployment steps ...
  
  deploy-production:
    if: github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    environment: production  # Requires approval
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Deploy to production
        run: |
          # Deploy to production server
          echo "Deploying to production..."
          # ... deployment steps ...
```

### Set Up GitHub Environments

**Step 1:** Go to repository **Settings** > **Environments**

**Step 2:** Create "staging" environment
- Click "New environment"
- Name: `staging`
- Add staging-specific secrets:
  - `SERVER_HOST`: Staging server IP
  - `SERVER_USER`: Staging user
  - `SSH_PRIVATE_KEY`: Staging SSH key

**Step 3:** Create "production" environment
- Click "New environment"
- Name: `production`
- Enable "Required reviewers"
- Add yourself as reviewer
- Add production-specific secrets:
  - `SERVER_HOST`: Production server IP
  - `SERVER_USER`: Production user
  - `SSH_PRIVATE_KEY`: Production SSH key

**Now:**
- Pushes to `develop` → Auto-deploy to staging
- Pushes to `master` → Wait for approval → Deploy to production

---

## Self-Hosted Runners

### Why Self-Hosted?

**GitHub-Hosted Runners:**
- ✅ Free (2,000 minutes/month for private repos)
- ✅ Managed by GitHub
- ✅ Fresh environment each run
- ❌ No access to private networks
- ❌ Limited to 6 hours per job

**Self-Hosted Runners:**
- ✅ Run on your own servers
- ✅ Access to private networks
- ✅ No time limits
- ✅ Custom software/tools
- ❌ You manage updates
- ❌ Security responsibility

### Set Up Self-Hosted Runner

**Step 1:** Go to repository **Settings** > **Actions** > **Runners**

**Step 2:** Click "New self-hosted runner"

**Step 3:** Choose Linux x64

**Step 4:** Follow the instructions on your server:

```bash
# SSH to your server
ssh youruser@your-server-ip

# Create directory
mkdir actions-runner && cd actions-runner

# Download runner
curl -o actions-runner-linux-x64-2.311.0.tar.gz \
  -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Extract
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# Configure (follow prompts)
./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO \
  --token YOUR_TOKEN

# Enter runner name: my-server-runner
# Enter labels: self-hosted,Linux,X64
# Press Enter for defaults on remaining prompts
```

**Step 5:** Install as service

```bash
# Install service
sudo ./svc.sh install

# Start service
sudo ./svc.sh start

# Check status
sudo ./svc.sh status
```

**Step 6:** Verify on GitHub

Go to **Settings** > **Actions** > **Runners** - you should see your runner with green "Idle" status.

### Use Self-Hosted Runner

Update your workflow:

```yaml
jobs:
  deploy:
    runs-on: self-hosted  # Use your runner instead of ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      # No SSH needed - already on server!
      - name: Deploy
        run: |
          cd ~/mywebclass_hosting
          git pull origin master
          # ... rest of deployment ...
```

**Benefits:**
- No SSH setup needed
- Faster (no file transfers)
- Access to local resources
- Can run longer jobs

**Security Note:** Only use self-hosted runners for trusted code (your own repos, not public projects).

---

## Advanced Patterns

### Matrix Strategy (Test Multiple Versions)

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16, 18, 20]  # Test on 3 versions
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      
      - name: Install and test
        run: |
          npm ci
          npm test
```

This creates **3 parallel jobs** testing Node.js 16, 18, and 20.

### Caching Dependencies

Speed up workflows by caching `node_modules`:

```yaml
steps:
  - name: Checkout code
    uses: actions/checkout@v4
  
  - name: Set up Node.js
    uses: actions/setup-node@v4
    with:
      node-version: '20'
      cache: 'npm'  # Cache npm dependencies
  
  - name: Install dependencies
    run: npm ci
```

### Conditional Steps

```yaml
steps:
  - name: Deploy to production
    if: github.ref == 'refs/heads/master'  # Only on master
    run: ./deploy.sh
  
  - name: Notify on failure
    if: failure()  # Only if previous steps failed
    run: |
      curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
        -d '{"text": "Deployment failed!"}'
```

### Manual Workflow Trigger

```yaml
name: Manual Deploy

on:
  workflow_dispatch:  # Manual trigger
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        type: choice
        options:
          - staging
          - production

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Deploy to ${{ github.event.inputs.environment }}
        run: |
          echo "Deploying to ${{ github.event.inputs.environment }}"
          # ... deployment steps ...
```

Now you can manually trigger from GitHub Actions tab with environment selection!

### Schedule Workflows

Run workflows on a schedule (like cron):

```yaml
name: Nightly Build

on:
  schedule:
    - cron: '0 2 * * *'  # Every day at 2 AM UTC

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      # ... build steps ...
```

Cron syntax:
```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-6, Sunday=0)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

Examples:
- `0 * * * *` - Every hour
- `*/15 * * * *` - Every 15 minutes
- `0 0 * * 0` - Every Sunday at midnight

---

## Monitoring and Notifications

### Slack Notifications

**Step 1:** Create Slack webhook
1. Go to https://api.slack.com/apps
2. Create new app
3. Enable "Incoming Webhooks"
4. Create webhook for your channel
5. Copy webhook URL

**Step 2:** Add to GitHub Secrets
- Name: `SLACK_WEBHOOK`
- Value: Your webhook URL

**Step 3:** Add notification steps

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      # ... deployment steps ...
      
      - name: Notify success
        if: success()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-Type: application/json' \
            -d '{
              "text": "✅ Deployment succeeded!",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Deployment Successful* ✅\n*Repository:* ${{ github.repository }}\n*Branch:* ${{ github.ref_name }}\n*Commit:* ${{ github.sha }}\n*Author:* ${{ github.actor }}"
                  }
                }
              ]
            }'
      
      - name: Notify failure
        if: failure()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-Type: application/json' \
            -d '{
              "text": "❌ Deployment failed!",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Deployment Failed* ❌\n*Repository:* ${{ github.repository }}\n*Branch:* ${{ github.ref_name }}\n*Commit:* ${{ github.sha }}\n*Author:* ${{ github.actor }}\n<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Logs>"
                  }
                }
              ]
            }'
```

### Discord Notifications

Similar to Slack:

```bash
curl -X POST ${{ secrets.DISCORD_WEBHOOK }} \
  -H 'Content-Type: application/json' \
  -d '{
    "content": "✅ Deployment succeeded!",
    "embeds": [{
      "title": "Deployment Status",
      "description": "Successfully deployed to production",
      "color": 5763719,
      "fields": [
        {"name": "Repository", "value": "${{ github.repository }}", "inline": true},
        {"name": "Branch", "value": "${{ github.ref_name }}", "inline": true},
        {"name": "Author", "value": "${{ github.actor }}", "inline": true}
      ]
    }]
  }'
```

### Email Notifications

GitHub sends email by default for failed workflows. To customize:

```yaml
- name: Send email on failure
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: 'Deployment Failed: ${{ github.repository }}'
    body: |
      Deployment failed!
      
      Repository: ${{ github.repository }}
      Branch: ${{ github.ref_name }}
      Commit: ${{ github.sha }}
      Author: ${{ github.actor }}
      
      View logs: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
    to: team@example.com
    from: github-actions@example.com
```

---

## Rollback Strategies

### Automatic Rollback on Health Check Failure

```yaml
- name: Deploy new version
  id: deploy
  run: |
    # Save current version
    ssh ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} \
      "docker tag myapp:latest myapp:backup"
    
    # Deploy new version
    # ... deployment steps ...

- name: Health check
  id: health_check
  run: |
    # Check health endpoint
    for i in {1..10}; do
      status_code=$(curl -s -o /dev/null -w "%{http_code}" http://${{ secrets.SERVER_HOST }}/health)
      if [ $status_code -eq 200 ]; then
        echo "✅ Health check passed"
        exit 0
      fi
      echo "Attempt $i failed, retrying..."
      sleep 5
    done
    echo "❌ Health check failed after 10 attempts"
    exit 1

- name: Rollback on failure
  if: failure() && steps.deploy.outcome == 'success'
  run: |
    echo "⚠️ Rolling back to previous version..."
    ssh ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} << 'EOF'
      docker stop myapp
      docker rm myapp
      docker run -d --name myapp -p 3000:3000 myapp:backup
    EOF
    echo "✅ Rollback completed"
```

### Manual Rollback Workflow

```yaml
name: Manual Rollback

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to (commit SHA or tag)'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    
    steps:
      - name: Rollback to ${{ github.event.inputs.version }}
        run: |
          ssh ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} << 'EOF'
            cd ~/mywebclass_hosting
            git fetch origin
            git checkout ${{ github.event.inputs.version }}
            docker compose up -d --build
          EOF
```

### Blue-Green Deployment

Run two versions simultaneously, switch traffic:

```yaml
- name: Deploy to green environment
  run: |
    ssh ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} << 'EOF'
      # Start green version on port 3001
      docker run -d --name myapp-green -p 3001:3000 myapp:latest
      
      # Wait for startup
      sleep 10
      
      # Health check green
      if curl -f http://localhost:3001/health; then
        echo "✅ Green environment healthy"
        
        # Switch Caddy to green
        sudo sed -i 's/:3000/:3001/' /etc/caddy/Caddyfile
        sudo systemctl reload caddy
        
        # Wait for traffic to drain
        sleep 30
        
        # Stop blue
        docker stop myapp-blue || true
        docker rm myapp-blue || true
        
        # Rename green to blue
        docker rename myapp-green myapp-blue
        
        echo "✅ Blue-green switch completed"
      else
        echo "❌ Green environment unhealthy, keeping blue"
        docker stop myapp-green
        docker rm myapp-green
        exit 1
      fi
    EOF
```

---

## Troubleshooting

### Common Issues

**Issue 1: Permission Denied (SSH)**

```
Error: Permission denied (publickey)
```

**Solutions:**
```bash
# Verify SSH key in GitHub Secrets
# Check key has no passphrase
# Verify key added to server authorized_keys

# Test SSH manually
ssh -i ~/.ssh/github_actions_deploy user@server
```

**Issue 2: Host Key Verification Failed**

```
Error: Host key verification failed
```

**Solution:**
```yaml
- name: Set up SSH
  run: |
    mkdir -p ~/.ssh
    ssh-keyscan -H ${{ secrets.SERVER_HOST }} >> ~/.ssh/known_hosts
```

**Issue 3: Docker Permission Denied**

```
Error: Got permission denied while trying to connect to Docker daemon
```

**Solution:**
```bash
# On server, add user to docker group
sudo usermod -aG docker youruser

# Logout and login for changes to take effect
```

**Issue 4: Secrets Not Available**

```
Error: secrets.SSH_PRIVATE_KEY: unexpected value
```

**Solution:**
- Verify secret name matches exactly (case-sensitive)
- Ensure secret is added to correct repository
- Check environment-specific secrets if using environments

**Issue 5: Workflow Not Triggering**

**Causes:**
- Workflow file has syntax errors
- Path filter doesn't match changed files
- Branch name doesn't match trigger

**Debug:**
```yaml
# Add debug step
- name: Debug info
  run: |
    echo "Event: ${{ github.event_name }}"
    echo "Ref: ${{ github.ref }}"
    echo "Branch: ${{ github.ref_name }}"
```

**Issue 6: Timeout Issues**

```
Error: The job running on runner has exceeded the maximum execution time
```

**Solution:**
```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 30  # Increase timeout (default: 360)
```

**Issue 7: Out of Disk Space**

```
Error: No space left on device
```

**Solution:**
```yaml
# Add cleanup step
- name: Free disk space
  run: |
    sudo rm -rf /usr/local/lib/android
    sudo rm -rf /usr/share/dotnet
    df -h
```

### Debugging Workflows

**Enable Debug Logging:**

1. Go to repository **Settings** > **Secrets**
2. Add secret:
   - Name: `ACTIONS_STEP_DEBUG`
   - Value: `true`
3. Re-run workflow - you'll see detailed logs

**Add Debug Steps:**

```yaml
- name: Debug environment
  run: |
    echo "Runner OS: ${{ runner.os }}"
    echo "Runner temp: ${{ runner.temp }}"
    echo "Workspace: ${{ github.workspace }}"
    echo "Event: ${{ github.event_name }}"
    echo "Actor: ${{ github.actor }}"
    echo "Repository: ${{ github.repository }}"
    echo "Ref: ${{ github.ref }}"
    echo "SHA: ${{ github.sha }}"
    env | sort
    pwd
    ls -la
```

**Test SSH Connection:**

```yaml
- name: Test SSH
  run: |
    ssh -v -i ~/.ssh/deploy_key \
      ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} \
      "echo 'SSH connection successful!'"
```

### Workflow Best Practices

**1. Keep Secrets Secure**
```yaml
# ❌ DON'T
- run: echo "${{ secrets.MY_SECRET }}"

# ✅ DO
- run: |
    echo "::add-mask::${{ secrets.MY_SECRET }}"
    # Use secret...
```

**2. Use Specific Action Versions**
```yaml
# ❌ DON'T (unpredictable)
- uses: actions/checkout@master

# ✅ DO (locked version)
- uses: actions/checkout@v4
```

**3. Fail Fast**
```yaml
# Stop on first error
- run: |
    set -e  # Exit on any error
    command1
    command2
```

**4. Clean Up Resources**
```yaml
- name: Cleanup
  if: always()  # Run even if previous steps fail
  run: |
    rm -f ~/.ssh/deploy_key
    docker system prune -f
```

**5. Use Environments for Protection**
```yaml
jobs:
  deploy:
    environment: production  # Requires approval
```

---

## Security Best Practices

### 1. Minimize Permissions

**Use Least Privilege SSH:**
```bash
# Create dedicated deploy user (on server)
sudo useradd -m -s /bin/bash deployer
sudo usermod -aG docker deployer  # Only if needed

# Give specific sudo permissions
sudo visudo
# Add line:
deployer ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart myapp
```

### 2. Protect Secrets

**Never log secrets:**
```yaml
# ❌ DON'T
- run: echo "Token: ${{ secrets.API_TOKEN }}"

# ✅ DO
- run: |
    # Secrets are automatically masked in logs
    curl -H "Authorization: Bearer ${{ secrets.API_TOKEN }}" ...
```

**Use environment-specific secrets:**
- Staging secrets ≠ Production secrets
- Rotate secrets regularly
- Delete unused secrets

### 3. Verify Before Deploying

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test
      - run: npm run lint
      - run: npm audit

  deploy:
    needs: test  # Only deploy if tests pass
    runs-on: ubuntu-latest
    steps:
      # ... deployment ...
```

### 4. Use HTTPS for API Calls

```yaml
# ❌ DON'T
- run: curl http://api.example.com

# ✅ DO
- run: curl https://api.example.com
```

### 5. Limit Workflow Permissions

```yaml
name: Deploy

permissions:
  contents: read  # Only read repository
  deployments: write  # Allow deployments

jobs:
  # ...
```

### 6. Sign Commits (Advanced)

```yaml
- name: Import GPG key
  run: |
    echo "${{ secrets.GPG_PRIVATE_KEY }}" | gpg --import
    git config --global user.signingkey ${{ secrets.GPG_KEY_ID }}
    git config --global commit.gpgsign true
```

---

## Hands-On Exercises

### Exercise 1: Deploy Your Static Site

**Goal:** Create automated deployment for your static website from Chapter 16.

**Steps:**
1. Set up SSH keys for GitHub Actions
2. Add secrets to GitHub (SSH_PRIVATE_KEY, SERVER_HOST, SERVER_USER)
3. Create `.github/workflows/deploy-static.yml`
4. Make a change to your website
5. Push and watch automated deployment

**Success Criteria:**
- ✅ Workflow runs on push
- ✅ Files copied to server
- ✅ Website updates automatically

### Exercise 2: Add Testing

**Goal:** Add automated tests before deployment.

**Steps:**
1. Create simple test script for your site
2. Add test job to workflow
3. Make deploy job depend on test passing
4. Push broken code and see deployment blocked
5. Fix code and see deployment succeed

**Test Script Example:**
```bash
#!/bin/bash
# test.sh

# Test 1: Check HTML validity
if grep -q "<html>" static-site/index.html; then
  echo "✅ HTML structure valid"
else
  echo "❌ Invalid HTML"
  exit 1
fi

# Test 2: Check for broken links
if grep -q "href=\"#\"" static-site/*.html; then
  echo "⚠️ Warning: Found placeholder links"
fi

echo "✅ All tests passed"
```

### Exercise 3: Add Health Checks

**Goal:** Verify deployment succeeded by checking your site.

**Steps:**
1. Add health check step after deployment
2. Check HTTP status code
3. Check for specific content
4. Fail deployment if checks don't pass

**Example:**
```yaml
- name: Verify deployment
  run: |
    # Check site responds
    status_code=$(curl -s -o /dev/null -w "%{http_code}" http://${{ secrets.SERVER_HOST }})
    
    # Check for specific content
    if curl -s http://${{ secrets.SERVER_HOST }} | grep -q "My Website"; then
      echo "✅ Content verified"
    else
      echo "❌ Expected content not found"
      exit 1
    fi
```

### Exercise 4: Multi-Environment Deployment

**Goal:** Deploy to staging automatically, production manually.

**Steps:**
1. Create `develop` branch in your repo
2. Set up staging and production environments in GitHub
3. Create workflow that deploys `develop` to staging
4. Set up manual approval for production
5. Test both deployments

### Exercise 5: Add Notifications

**Goal:** Get notified when deployments succeed or fail.

**Steps:**
1. Choose notification method (Slack, Discord, Email)
2. Set up webhook/credentials
3. Add notification steps to workflow
4. Test both success and failure notifications

### Challenge: Full CI/CD Pipeline

**Goal:** Create production-ready deployment with all best practices.

**Requirements:**
- ✅ Automated testing (lint, unit tests)
- ✅ Deploy to staging on `develop` push
- ✅ Deploy to production on `master` push with approval
- ✅ Health checks after deployment
- ✅ Automatic rollback on failure
- ✅ Slack/Discord notifications
- ✅ Deployment metrics (time, success rate)

---

## Real-World Examples

### Example 1: Simple Static Site

**Use Case:** Personal blog deployed to Caddy

```yaml
name: Deploy Blog

on:
  push:
    branches: [master]
    paths: ['blog/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy
        uses: appleboy/scp-action@v0.1.4
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          source: "blog/*"
          target: "/var/www/blog"
          strip_components: 1
```

### Example 2: Node.js API

**Use Case:** REST API with database migrations

```yaml
name: Deploy API

on:
  push:
    branches: [master]
    paths: ['api/**']

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy
        run: |
          ssh ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} << 'EOF'
            cd ~/api
            git pull
            npm ci --production
            npm run migrate
            sudo systemctl restart api
          EOF
      
      - name: Health check
        run: |
          for i in {1..10}; do
            if curl -f http://${{ secrets.SERVER_HOST }}:3000/health; then
              echo "✅ API is healthy"
              exit 0
            fi
            sleep 5
          done
          exit 1
```

### Example 3: Docker Multi-Container App

**Use Case:** Full stack app with frontend, backend, database

```yaml
name: Deploy Full Stack App

on:
  push:
    branches: [master]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build images
        run: |
          docker compose build
          docker compose push

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        run: |
          ssh ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} << 'EOF'
            cd ~/app
            docker compose pull
            docker compose up -d
            docker compose exec -T backend npm run migrate
          EOF
      
      - name: Smoke test
        run: |
          # Test frontend
          curl -f http://${{ secrets.SERVER_HOST }}
          
          # Test backend
          curl -f http://${{ secrets.SERVER_HOST }}/api/health
```

---

## Cost and Limits

### GitHub-Hosted Runners

**Free Tier (Public Repos):**
- ✅ Unlimited minutes
- ✅ 20 concurrent jobs

**Free Tier (Private Repos):**
- 2,000 minutes/month
- 500 MB storage
- After free tier: $0.008/minute (Linux)

**Paid Plans:**
- **Team:** 3,000 minutes/month ($4/user)
- **Enterprise:** 50,000 minutes/month (custom pricing)

**Multipliers:**
- Linux: 1x
- Windows: 2x
- macOS: 10x

### Self-Hosted Runners

**Costs:**
- Server costs only
- No GitHub usage charges
- Unlimited minutes

**Resource Requirements:**
- **Minimum:** 2 GB RAM, 2 cores
- **Recommended:** 4 GB RAM, 4 cores
- **Heavy workloads:** 8+ GB RAM, 8+ cores

### Optimization Tips

**1. Use caching:**
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```
Saves 30-60 seconds per run.

**2. Run tests in parallel:**
```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npm test -- --shard=${{ matrix.shard }}/4
```

**3. Only run on needed paths:**
```yaml
on:
  push:
    paths:
      - 'src/**'
      - '!docs/**'  # Ignore docs changes
```

**4. Cancel stale workflows:**
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

---

## Quick Reference

### Essential Workflow Syntax

```yaml
# Workflow name
name: My Workflow

# When to run
on:
  push:
    branches: [master, develop]
    paths: ['src/**']
  pull_request:
  workflow_dispatch:
  schedule:
    - cron: '0 2 * * *'

# Environment variables
env:
  NODE_ENV: production

# Jobs
jobs:
  job-name:
    runs-on: ubuntu-latest
    environment: production
    timeout-minutes: 30
    
    steps:
      # Use action
      - uses: actions/checkout@v4
      
      # Run command
      - run: echo "Hello"
      
      # Multi-line command
      - run: |
          echo "Line 1"
          echo "Line 2"
      
      # Conditional step
      - if: github.ref == 'refs/heads/master'
        run: ./deploy.sh
```

### Common Actions

```yaml
# Checkout code
- uses: actions/checkout@v4

# Set up Node.js
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'

# Set up Python
- uses: actions/setup-python@v4
  with:
    python-version: '3.11'

# Upload artifact
- uses: actions/upload-artifact@v3
  with:
    name: my-artifact
    path: dist/

# Download artifact
- uses: actions/download-artifact@v3
  with:
    name: my-artifact
```

### Context Variables

```yaml
${{ github.repository }}      # username/repo
${{ github.ref }}             # refs/heads/master
${{ github.ref_name }}        # master
${{ github.sha }}             # commit SHA
${{ github.actor }}           # username who triggered
${{ github.event_name }}      # push, pull_request, etc.
${{ runner.os }}              # Linux, Windows, macOS
${{ secrets.SECRET_NAME }}    # Access secrets
```

### SSH Deployment Template

```yaml
steps:
  - name: Set up SSH
    run: |
      mkdir -p ~/.ssh
      echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/key
      chmod 600 ~/.ssh/key
      ssh-keyscan -H ${{ secrets.SERVER_HOST }} >> ~/.ssh/known_hosts
  
  - name: Deploy
    run: |
      ssh -i ~/.ssh/key ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} << 'EOF'
        cd ~/project
        git pull
        # ... deployment commands ...
      EOF
  
  - name: Cleanup
    if: always()
    run: rm -f ~/.ssh/key
```

### Useful Commands

```bash
# Test workflow locally (with act)
act push

# Validate workflow syntax
cat .github/workflows/deploy.yml | yaml-language-server

# View workflow runs
gh run list

# View workflow details
gh run view <run-id>

# Re-run failed workflow
gh run rerun <run-id>

# Cancel workflow
gh run cancel <run-id>

# Download workflow logs
gh run download <run-id>
```

---

## Key Takeaways

**1. CI/CD Automates Deployment**
- Push code → Automatic tests → Automatic deployment
- Consistent, repeatable, reliable
- Reduces human error and deployment fear

**2. GitHub Actions is Free and Powerful**
- Free for public repositories
- 2,000 minutes/month for private repos
- Integrated with GitHub
- Huge ecosystem of actions

**3. Start Simple, Add Complexity**
- Begin with basic deployment
- Add tests
- Add health checks
- Add rollback strategies
- Add notifications

**4. Security is Critical**
- Use SSH keys without passphrases
- Store secrets in GitHub Secrets (never in code)
- Minimize deployment user permissions
- Validate deployments before switching traffic

**5. Self-Hosted Runners for Advanced Cases**
- Direct access to private resources
- No time limits
- Custom tools and environment
- You manage security and updates

**6. Monitor and Notify**
- Set up Slack/Discord/Email notifications
- Check logs regularly
- Monitor deployment success rates
- Plan for failure scenarios

---

## Next Steps

**Immediate Actions:**
1. ✅ Create your first workflow (Exercise 1)
2. ✅ Add testing to workflow (Exercise 2)
3. ✅ Set up health checks (Exercise 3)
4. ✅ Configure notifications

**Short-Term Goals:**
- Deploy all your applications with CI/CD
- Set up staging and production environments
- Implement rollback strategies
- Monitor deployment metrics

**Long-Term Goals:**
- Optimize workflow performance
- Implement advanced deployment patterns (blue-green, canary)
- Set up self-hosted runners if needed
- Create reusable workflow templates

**Resources:**
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [Awesome GitHub Actions](https://github.com/sdras/awesome-actions)

---

**Congratulations!** 🎉

You've completed the entire hosting infrastructure course! You now know how to:

1. **Set up servers** from scratch
2. **Secure systems** with firewalls, SSH, users
3. **Deploy applications** with Docker and reverse proxies
4. **Configure DNS** and SSL certificates
5. **Monitor and operate** production systems
6. **Automate deployments** with CI/CD

**You're ready to host real applications in production!** 🚀

---

[← Previous: Chapter 20 - Operations and Monitoring](20-operations-monitoring.md) | [Home](../README.md)
