# MOTOSNAP Branch Merge Guide

This guide provides step-by-step instructions for selectively merging commits from feature branches into your stable deployment branch (`releases/version-1.01`) while excluding configuration files.

## Project Structure Overview

**Deployment Branch:** `releases/version-1.01` (stable, production-ready)
**Feature Branches:** `features/*`, `fixes/*`

## Configuration Files to Exclude

The following files contain environment-specific settings and should NOT be merged from feature branches:

### Backend Configuration

```
workshop/src/main/resources/application.properties
workshop/src/main/resources/application-h2.properties
workshop/.env.local
```

### Frontend Configuration

```
motosnap-client/.env
motosnap-client/package.json (dependencies only if needed)
```

### Build and Deployment Files

```
build-and-deploy-frontend.bat
run-springboot.bat
```

## Method 1: Cherry-picking Specific Commits (Recommended)

### Step 1: Identify Commits to Merge

```bash
# Switch to your feature branch
git checkout features/your-feature-branch

# View commits that are not in master
git log --oneline master..HEAD

# Or view commits with more detail
git log --graph --pretty=format:'%h - %s (%cr) <%an>' master..HEAD
```

### Step 2: Switch to Deployment Branch

```bash
git checkout master
git pull origin master  # Ensure you have latest master
```

### Step 3: Cherry-pick Selected Commits

```bash
# Cherry-pick single commit
git cherry-pick <commit-hash>

# Cherry-pick multiple commits in order
git cherry-pick <commit-hash-1> <commit-hash-2> <commit-hash-3>

# Cherry-pick a range of commits
git cherry-pick <start-commit>..<end-commit>
```

### Step 4: Handle Conflicts (if any)

```bash
# If conflicts occur during cherry-pick
git status  # See conflicted files

# Edit conflicted files manually, then:
git add <resolved-files>
git cherry-pick --continue

# Or abort if needed
git cherry-pick --abort
```

### Step 5: Verify and Test

```bash
# Build and test the backend
cd workshop
mvn clean install
mvn test

# Build and test the frontend
cd ../motosnap-client
npm run build
npm run lint
```

## Method 2: Interactive Rebase (For Complex Selections)

### Step 1: Create Temporary Branch

```bash
# Create a temporary branch from your feature branch
git checkout features/your-feature-branch
git checkout -b temp-merge-branch
```

### Step 2: Interactive Rebase

```bash
# Interactive rebase against master
git rebase -i master

# In the editor, keep only the commits you want:
# - Change 'pick' to 'drop' for commits you don't want
# - Keep 'pick' for commits you want to include
```

### Step 3: Merge Clean Branch

```bash
# Switch to master and merge
git checkout master
git merge temp-merge-branch

# Clean up temporary branch
git branch -d temp-merge-branch
```

## Method 3: Selective File Merge (Advanced)

### Step 1: Start Merge Without Committing

```bash
git checkout master
git merge features/your-feature-branch --no-commit --no-ff
```

### Step 2: Reset Configuration Files

```bash
# Reset backend config files to master version
git reset HEAD workshop/src/main/resources/application.properties
git reset HEAD workshop/src/main/resources/application-h2.properties
git reset HEAD workshop/.env.local

# Reset frontend config files to master version
git reset HEAD motosnap-client/.env
git reset HEAD motosnap-client/package.json  # Only if you don't want dependency updates

# Checkout master versions of these files
git checkout HEAD -- workshop/src/main/resources/application.properties
git checkout HEAD -- workshop/src/main/resources/application-h2.properties
git checkout HEAD -- workshop/.env.local
git checkout HEAD -- motosnap-client/.env
```

### Step 3: Complete the Merge

```bash
# Review what will be committed
git status
git diff --cached

# Commit the selective merge
git commit -m "Merge feature: [description] - excluding config files"
```

## Method 4: Automated Protection Setup (.gitattributes)

Create a `.gitattributes` file in the root directory to automatically handle config files:

### Step 1: Create .gitattributes

```bash
# Create the file
touch .gitattributes
```

### Step 2: Add Merge Strategies

Add this content to `.gitattributes`:

```
# Keep master versions of configuration files during merges
workshop/src/main/resources/application.properties merge=ours
workshop/src/main/resources/application-h2.properties merge=ours
workshop/.env.local merge=ours
motosnap-client/.env merge=ours
build-and-deploy-frontend.bat merge=ours
run-springboot.bat merge=ours
```

### Step 3: Commit .gitattributes

```bash
git add .gitattributes
git commit -m "Add merge strategies for config files"
```

## Workflow Best Practices

### 1. Pre-merge Checklist

- [ ] Feature is complete and tested in feature branch
- [ ] Feature branch is up to date with master
- [ ] Identify which commits contain actual feature code vs config changes
- [ ] Backup current master branch (optional: `git tag backup-$(date +%Y%m%d)`)

### 2. Branch Naming Convention

```
features/feature-name        # New functionality
fixes/issue-description      # Bug fixes
releases/version-x.x         # Release preparation
hotfix/critical-fix         # Production hotfixes
```

### 3. Post-merge Steps

```bash
# Test the merged code
cd workshop && mvn test
cd ../motosnap-client && npm run build

# Update deployment if tests pass
./build-and-deploy-frontend.bat

# Tag the release (optional)
git tag v1.x.x
git push origin v1.x.x
```

## Common Scenarios

### Scenario 1: Merging Completed Feature

```bash
# You have features/user-management with 5 commits, all needed
git checkout master
git cherry-pick commit1 commit2 commit3 commit4 commit5

# Or use range
git cherry-pick features/user-management~4..features/user-management
```

### Scenario 2: Merging Partial Feature

```bash
# You have features/invoice-system with 8 commits, only need 5
git checkout master

# Cherry-pick specific commits only
git cherry-pick commit2 commit4 commit6 commit7 commit8
```

### Scenario 3: Emergency Hotfix

```bash
# Quick hotfix that needs immediate deployment
git checkout master
git checkout -b hotfix/critical-security-fix

# Make the fix
# ... make changes ...

git add .
git commit -m "Fix: Critical security vulnerability"

# Merge back to master
git checkout master
git merge hotfix/critical-security-fix

# Clean up
git branch -d hotfix/critical-security-fix
```

## Troubleshooting

### Issue: "Merge conflict in application.properties"

**Solution:**

```bash
# During cherry-pick/merge conflict
git checkout --ours workshop/src/main/resources/application.properties
git add workshop/src/main/resources/application.properties
git cherry-pick --continue  # or git merge --continue
```

### Issue: "Accidentally merged config files"

**Solution:**

```bash
# Reset to previous commit
git reset --hard HEAD~1

# Or revert the merge
git revert -m 1 HEAD
```

### Issue: "Feature branch is behind master"

**Solution:**

```bash
# Update feature branch first (optional)
git checkout features/your-feature
git rebase master

# Then proceed with cherry-picking from updated branch
```

### Issue: "Need to merge dependencies but not config"

**Solution:**

```bash
# For package.json updates only
git checkout master
git checkout features/your-feature -- motosnap-client/package.json
git checkout master -- motosnap-client/.env  # Keep master .env

git add motosnap-client/package.json
git commit -m "Update dependencies from feature branch"
```

## Quick Reference Commands

```bash
# View branches
git branch -a

# View commits to be merged
git log --oneline master..features/branch-name

# Cherry-pick with message editing
git cherry-pick -e <commit-hash>

# Cherry-pick without committing (for review)
git cherry-pick -n <commit-hash>

# See what files changed in a commit
git show --name-only <commit-hash>

# Create backup tag
git tag backup-$(date +%Y%m%d-%H%M)
```

## Integration with MOTOSNAP Deployment

After successful merge to master:

1. **Build Frontend:**
   
   ```bash
   cd motosnap-client
   npm run build
   ```

2. **Deploy to Backend:**
   
   ```bash
   ./build-and-deploy-frontend.bat
   ```

3. **Test Full Stack:**
   
   ```bash
   cd workshop
   mvn spring-boot:run
   # Test at http://localhost:8080
   ```

4. **Push to Remote:**
   
   ```bash
   git push origin master
   ```

This guide ensures your production configuration remains stable while allowing selective integration of new features and fixes.