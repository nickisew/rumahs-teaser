# GitHub Setup Guide for Rumahs Landing Page

This guide will walk you through uploading your Rumahs landing page project to GitHub, step by step.

## Prerequisites

- A GitHub account (create one at [github.com](https://github.com) if you don't have one)
- Git installed on your computer (usually comes with macOS)
- Your project files in the "Grupo Teaser" folder

## Step 1: Create a GitHub Repository

1. **Go to GitHub.com** and sign in to your account
2. **Click the "+" icon** in the top-right corner
3. **Select "New repository"**
4. **Fill out the form**:
   - Repository name: `rumahs-landing` (or whatever you prefer)
   - Description: "Landing page for Rumahs app waitlist"
   - Make it **Public** (so Vercel can access it for deployment)
   - **Don't** check "Add a README file" (since you already have one)
   - **Don't** add .gitignore or license yet (you already have a complete project with all necessary files)
5. **Click "Create repository"**

## Step 2: Initialize Git in Your Project

Open your terminal in Cursor and run these commands:

```bash
# Navigate to your project folder
cd "/Users/nickisew/Library/CloudStorage/OneDrive-Personal/Grupo Teaser"

# Initialize git repository
git init

# Add all your files
git add .

# Make your first commit
git commit -m "Initial commit: Rumahs landing page with backend"
```

## Step 3: Connect to GitHub

```bash
# Add your GitHub repository as the remote origin
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/rumahs-landing.git

# Push your code to GitHub
git push -u origin main
```

**Important**: Replace `YOUR_USERNAME` with your actual GitHub username!

## Step 4: Verify Everything is There

1. Go back to your GitHub repository page and refresh it
2. You should see all your files:
   - `index.html`
   - `about.html` 
   - `styles.css`
   - `script.js`
   - `server.js`
   - `package.json`
   - `admin.html`
   - `BACKEND_README.md`
   - `README.md`
   - `GitHub_README.md`

## Troubleshooting

### If you get "fatal: not a git repository" error:
**This is the most common error when starting!**

**Problem**: You tried to run `git add .` or other git commands before initializing git.

**Solution**: You must run the commands in the correct order:
```bash
# 1. FIRST: Initialize git (creates the .git folder)
git init

# 2. THEN: Add your files
git add .

# 3. FINALLY: Make your first commit
git commit -m "Initial commit: Rumahs landing page with backend"
```

**Why this happens**: Git commands only work inside a git repository. The `git init` command creates a hidden `.git` folder that tells your computer "this folder is now a git repository." Without this folder, git doesn't know where to store your file history.

### If you get a "repository not found" error:
- Double-check your GitHub username
- Make sure the repository name matches exactly
- Ensure the repository is set to Public

### If you get authentication errors:
- GitHub may ask you to authenticate
- You can use a Personal Access Token instead of your password
- Or use GitHub Desktop for a GUI approach

### If you get "main branch" errors:
- Try: `git branch -M main` before pushing
- Or use: `git push -u origin master` if your default branch is "master"

## What's Next?

Once your code is successfully on GitHub, you can:
1. Deploy to Vercel (see main README.md)
2. Set up automatic deployments
3. Collaborate with others
4. Track changes and versions

## Quick Reference Commands

```bash
# Check status
git status

# See what files are tracked
git ls-files

# Check remote connection
git remote -v

# Pull latest changes (if working from multiple computers)
git pull origin main

# Push new changes
git add .
git commit -m "Your commit message"
git push origin main
```

---

**Need help?** Check the [GitHub documentation](https://docs.github.com/en/get-started) or ask for assistance!
