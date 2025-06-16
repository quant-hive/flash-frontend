# Deploying to Vercel

This document outlines the steps to deploy the Flash Frontend application to Vercel.

## Pre-Deployment Checklist

1. Ensure all changes are committed to your repository
2. Verify that the application builds successfully locally (`npm run build`)
3. Check that all environment variables are properly set up

## Environment Variables

The following environment variables should be set in the Vercel dashboard:

- `NEXT_PUBLIC_API_URL`: The URL of your backend API (e.g., https://api.quanthive.in)

## Deployment Steps

### Option 1: Automatic Deployment via GitHub

1. Log into the [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your Git repository
4. Set the following configuration:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)
5. Configure the environment variables
6. Click "Deploy"

### Option 2: Manual Deployment via CLI

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Log in to your Vercel account:
   ```
   vercel login
   ```

3. Deploy the application:
   ```
   vercel
   ```

   Follow the prompts to configure your project.

4. For subsequent deployments:
   ```
   vercel --prod
   ```

## Post-Deployment Verification

1. Check the deployment log for any errors
2. Verify that the application is accessible at the provided URL
3. Test critical functionality (login, backtest creation, results viewing)
4. Check that API connections are working properly

## Monitoring and Troubleshooting

- Monitor application performance using Vercel Analytics
- Check the Function Logs for any API-related issues
- For more detailed debugging, use the "Function Logs" section in the Vercel dashboard

## Custom Domain Configuration

If you want to use a custom domain:

1. Go to your project settings in the Vercel dashboard
2. Navigate to the "Domains" section
3. Add your custom domain
4. Follow the provided instructions to update DNS records

## CI/CD Integration

This project is configured to automatically deploy when changes are pushed to the main branch. To enable this:

1. Connect your Git repository in the Vercel dashboard
2. Enable the "Auto Deploy" option in project settings
3. Configure branch deployment settings as needed

## Rollback Procedure

If you need to roll back to a previous deployment:

1. Go to the "Deployments" section in the Vercel dashboard
2. Find the deployment you want to roll back to
3. Click on the three dots (...) menu
4. Select "Promote to Production" 