# MOTOSNAP Vercel CLI Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying MOTOSNAP (Motorcycle Workshop Management System) to Vercel using the Vercel CLI. MOTOSNAP is a Next.js application with custom authentication, role-based dashboards, and integration with a Spring Boot backend.

## Prerequisites
- Node.js 18+ installed locally
- Vercel account (free tier is sufficient)
- Git repository with MOTOSNAP code
- Backend API deployed on Render.com
- Basic command line knowledge

## Project Architecture
- **Frontend**: Next.js 15.5.2 with static export
- **Backend**: Spring Boot API on Render.com (`https://motosnap-8uii.onrender.com/api`)
- **Authentication**: Custom JWT-based system
- **Roles**: ADMIN, MECHANIC, CUSTOMER with different dashboards
- **Static Export**: Configured for optimal Vercel performance

## Step 1: Install Vercel CLI

### 1.1 Install globally via npm
```bash
npm install -g vercel
```

### 1.2 Verify installation
```bash
vercel --version
# Expected output: Vercel CLI X.X.X
```

## Step 2: Login to Vercel

### 2.1 Authenticate your account
```bash
vercel login
```

### 2.2 Follow the authentication flow
- The command will open your default browser
- Log in to your Vercel account (GitHub, GitLab, or email)
- Grant necessary permissions
- Return to terminal when authentication is complete

### 2.3 Verify login
```bash
vercel whoami
# Expected output: your-email@example.com
```

## Step 3: Navigate to Your Project Directory

### 3.1 Go to the MOTOSNAP frontend directory
```bash
# Navigate to your project root
cd /path/to/your/project

# Navigate to the frontend directory
cd motosnap-client
```

### 3.2 Verify you're in the correct directory
```bash
ls -la
# Should show package.json, src/, public/, next.config.ts, vercel.json, etc.
```

## Step 4: Verify Local Build

### 4.1 Test local build before deployment
```bash
npm run build
```

### 4.2 Expected build output
```
✓ Compiled successfully in 1402ms
✓ Generating static pages (31/31)
✓ Exporting (2/2)
```

### 4.3 Test locally (optional)
```bash
npm start
# Open http://localhost:3000 to verify the app works
```

## Step 5: Link Project to Vercel

### 5.1 Link your project
```bash
vercel link --yes
```

### 5.2 What happens during linking:
- Vercel detects your project type (Next.js)
- Creates a `.vercel` directory in your project
- Prompts for project scope (if you have multiple teams)
- Creates a new project or links to existing one
- Sets up automatic deployment configuration

### 5.3 Verify linking
```bash
cat .vercel/project.json
# Should show your project ID and configuration
```

## Step 6: Configure Environment Variables (Critical for MOTOSNAP)

### 6.1 Required Environment Variables
MOTOSNAP requires these environment variables to connect to the backend API:

```bash
# Backend API Configuration (REQUIRED for MOTOSNAP)
NEXT_PUBLIC_API_URL=https://motosnap-8uii.onrender.com/api
```

### 6.2 Add Environment Variables via CLI
```bash
# Method 1: Using echo (recommended)
echo "https://motosnap-8uii.onrender.com/api" | vercel env add NEXT_PUBLIC_API_URL production
```

### 6.3 Alternative: Add via Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Navigate to your project
3. Go to **Settings** → **Environment Variables**
4. Add the API URL variable with **Production** environment:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://motosnap-8uii.onrender.com/api`
   - Environment: Production
5. Redeploy after adding variables

### 6.4 Verify environment variables
```bash
vercel env ls production
```

⚠️ **Important**: MOTOSNAP will not function without the correct `NEXT_PUBLIC_API_URL` environment variable. The frontend includes fallback values for local development, but production environment variables are required for proper API connectivity.

## Step 7: Initial Deployment

### 7.1 Deploy to production
```bash
vercel --prod --yes
```

### 7.2 Deployment process:
1. **Upload**: Vercel uploads your project files
2. **Build**: Runs `npm install` and `npm run build`
3. **Static Export**: Generates static files in `out` directory
4. **Deploy**: Deploys static files to production environment
5. **URL**: Provides deployment URL

### 7.3 Expected output:
```
Vercel CLI X.X.X
Retrieving project…
Deploying motosnap-client
Uploading [====================] (100%)
Inspect: https://vercel.com/your-username/motosnap-client/deployment-id
Production: https://motosnap-client-random-hash.vercel.app
Queued
Building
Completing
```

## Step 8: Redeploy with Environment Variables

### 8.1 Redeploy to apply environment variables
```bash
vercel --prod --yes
```

### 8.2 Monitor deployment
```bash
# Watch deployment progress
vercel logs your-project-name.vercel.app
```

## Step 9: Verify Deployment

### 9.1 Visit your deployed app
- Open the provided URL in your browser
- Test all features and functionality
- Check for any console errors

### 9.2 Test MOTOSNAP-Specific Features:

#### Authentication Testing
1. **Registration**: Create a new user account
2. **Login**: Verify login functionality works
3. **Role-based Access**: Test different user roles (ADMIN, MECHANIC, CUSTOMER)

#### Dashboard Testing
1. **Customer Dashboard**: Parts browsing, service booking, order management
2. **Mechanic Dashboard**: Booking assignments, parts requests
3. **Admin Dashboard**: User management, inventory, service management, invoice approvals

#### API Integration Testing
- Check browser console for successful API calls
- Verify backend connectivity
- Test CRUD operations across all modules

### 9.3 Check deployment status
```bash
vercel ls
# Shows all deployments with status
```

## Step 10: Deployment Management

### 10.1 View deployment history
```bash
vercel ls
```

### 10.2 View deployment logs
```bash
vercel logs your-deployment-url.vercel.app
```

### 10.3 Rollback to previous deployment
```bash
vercel rollback your-deployment-url.vercel.app
```

### 10.4 Remove deployment
```bash
vercel remove your-deployment-url.vercel.app
```

## Step 11: Custom Domain (Optional)

### 11.1 Add custom domain
```bash
vercel domains add your-custom-domain.com
```

### 11.2 Verify domain configuration
```bash
vercel domains ls
```

## Step 12: Git-Based Deployment (Optional but Recommended)

### 12.1 Push your code to GitHub
```bash
git add .
git commit -m "Deployment ready - MOTOSNAP frontend"
git push origin main
```

### 12.2 Connect to GitHub via Vercel CLI
```bash
vercel git connect
```

### 12.3 Enable auto-deployment
- Go to Vercel dashboard
- Navigate to your project
- Go to Settings → Git
- Connect your GitHub repository
- Select the branch to deploy
- Enable auto-deployment on push

## Common Vercel CLI Commands

### Project Management
```bash
vercel ls                    # List all deployments
vercel whoami               # Show current user
vercel projects             # List all projects
vercel switch               # Switch between projects
```

### Environment Variables
```bash
vercel env ls               # List environment variables
vercel env rm VAR_NAME      # Remove environment variable
vercel env pull .env        # Pull environment variables to file
```

### Domain Management
```bash
vercel domains add          # Add custom domain
vercel domains ls           # List domains
vercel domains remove       # Remove domain
```

### Logs and Debugging
```bash
vercel logs                 # View logs for deployment
vercel inspect              # Inspect deployment details
vercel info                 # Show project information
```

### Advanced Options
```bash
vercel --local-config        # Use local configuration
vercel --debug              # Enable debug mode
vercel --force              # Force deployment
vercel --with-cache         # Use build cache
```

## MOTOSNAP-Specific Troubleshooting

### Issue 1: API Connection Errors
**Symptoms:** "Failed to fetch" errors, cannot connect to backend
**Solution:**
```bash
# Add API environment variable
echo "https://motosnap-8uii.onrender.com/api" | vercel env add NEXT_PUBLIC_API_URL production

# Redeploy after adding variable
vercel --prod --yes
```

### Issue 2: Build Fails with Static Export Issues
**Symptoms:** Build fails during static export generation
**Solution:**
```bash
# Check local build first
npm run build

# Clear build cache and redeploy
rm -rf .next out .vercel
vercel --prod --yes
```

### Issue 3: Authentication Not Working
**Symptoms:** Login redirects not working, auth state not persisting
**Solution:**
```bash
# Verify API URL is correct
vercel env ls production

# Check browser console for auth errors
# Ensure backend is accessible from the deployed URL
```

### Issue 4: Role-Based Access Not Working
**Symptoms:** Users seeing wrong dashboard, header visibility issues
**Solution:**
This should be automatically handled by the updated header logic. If issues persist:
```bash
# Check console logs for header visibility
# Look for "🔍 Header visibility check" messages
# Verify user role is being returned correctly from API
```

### Issue 5: Images Not Loading
**Symptoms:** Static images not displaying correctly
**Solution:**
MOTOSNAP uses static export with unoptimized images. This is expected behavior:
```bash
# Verify images are in public/ directory
ls -la public/
# Check image paths in deployed application
```

### Issue 6: General Vercel CLI Issues

#### "Command not found: vercel"
**Solution:**
```bash
npm install -g vercel
# Or use npx
npx vercel
```

#### Authentication errors
**Solution:**
```bash
vercel logout
vercel login
```

#### Build failures
**Solution:**
```bash
# Check local build first
npm run build

# Clear Vercel cache
rm -rf .vercel
vercel --prod --yes

# Check Node.js version
node --version
```

#### Environment variables not working
**Solution:**
```bash
# Verify variables are set
vercel env ls

# Redeploy after adding variables
vercel --prod --yes
```

## Best Practices

### 1. Use Git Integration
- Connect your GitHub repository
- Enable auto-deployment on push
- Use different branches for different environments

### 2. Environment Management
- Use different environment variables for staging and production
- Never commit sensitive information to git
- Use `.env.local` for local development

### 3. Deployment Strategy
- Deploy to preview URL first for testing
- Use feature branches for development
- Keep production deployments stable

### 4. Monitoring and Maintenance
- Regularly check deployment logs
- Monitor API connectivity
- Keep dependencies updated

### 5. Static Export Considerations
- No server-side rendering or API routes in frontend
- All API calls go to the backend Spring Boot service
- Images are unoptimized for static hosting

## Vercel Free Tier Limits

### What's Included:
- 100 GB bandwidth per month
- 6 serverless functions (unlimited invocations)
- 1 production deployment
- Unlimited preview deployments
- 1 GB built-in storage

### When to Upgrade:
- High traffic applications
- Custom domain requirements
- Advanced analytics needs
- Team collaboration features

## MOTOSNAP Quick Reference

### One-Command Deployment (After Setup)
```bash
# From your project directory
cd motosnap-client
git push origin <your-branch>
vercel --prod --yes
```

### Environment Variables Checklist
- [ ] `NEXT_PUBLIC_API_URL=https://motosnap-8uii.onrender.com/api`

### Post-Deployment Testing
1. **API Connectivity**: Check browser for successful API calls
2. **Authentication**: Test login/logout for all roles
3. **Customer Features**: Parts browsing, service booking, orders
4. **Mechanic Features**: Booking assignments, parts requests
5. **Admin Features**: User management, inventory, approvals
6. **Header Visibility**: Verify header is hidden on appropriate pages

### Expected Console Messages
```
🔧 API Configuration: {
  environment: 'production',
  envVariable: 'https://motosnap-8uii.onrender.com/api',
  finalApiUrl: 'https://motosnap-8uii.onrender.com/api'
}
🔍 Header visibility check: {
  pathname: '/dashboard/',
  userRole: 'ADMIN',
  hideHeader: true,
  reasons: ['admin on main dashboard']
}
🚫 Header hidden for: /dashboard/ User: ADMIN
```

## Backend Dependencies

### Backend API Requirements
- Spring Boot backend must be deployed and accessible
- CORS must be configured to accept requests from Vercel domain
- JWT tokens must work with the deployed frontend URL

### Backend Deployment Status
- Current backend: `https://motosnap-8uii.onrender.com/api`
- Ensure backend is running and accessible before frontend deployment

## Support Resources

### Documentation
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Next.js on Vercel](https://vercel.com/guides/deploying-nextjs-with-vercel)
- [Vercel Static Export Guide](https://vercel.com/guides/static-export)

### Community Support
- [Vercel Community](https://vercel.com/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/vercel)
- [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)

### Getting Help
```bash
vercel help                    # Show CLI help
vercel help command            # Show help for specific command
vercel --version              # Check CLI version
```

---

This guide covers everything needed to deploy MOTOSNAP using the Vercel CLI. The application uses a static export configuration for optimal performance, with all business logic handled by the Spring Boot backend. Follow these steps carefully, and you'll have your motorcycle workshop management system deployed in no time!