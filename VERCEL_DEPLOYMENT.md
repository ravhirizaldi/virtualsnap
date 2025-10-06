# Vercel Deployment Checklist

## Pre-deployment Checklist

- [ ] `vercel.json` configuration file created
- [ ] `.vercelignore` file configured to exclude unnecessary files
- [ ] `package.json` includes Node.js engine specification (>=18.0.0)
- [ ] `vite.config.js` updated with optimized build settings
- [ ] Environment variables documented in `.env.example`
- [ ] README updated with Vercel deployment instructions

## Required Environment Variables

Set these in your Vercel dashboard (Settings → Environment Variables):

1. **VITE_GEMINI_API_KEY** (Required)
   - Your Google Gemini API key
   - Get it from: https://makersuite.google.com/app/apikey

## Deployment Steps

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables
4. Deploy!

## Post-deployment Testing

- [ ] App loads correctly
- [ ] API key modal appears if no key is set
- [ ] Image upload functionality works
- [ ] AI generation works with proper API key
- [ ] All routes work correctly (SPA routing)
- [ ] Assets load properly
- [ ] Responsive design works on mobile

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json
- Check for any TypeScript errors

### App Loads but API Doesn't Work
- Verify VITE_GEMINI_API_KEY is set in Vercel dashboard
- Check API key is valid and has credits
- Verify environment variable name matches exactly

### 404 Errors on Page Refresh
- Ensure vercel.json has proper rewrite rules
- Check that framework is detected as "vite"

### Images Don't Load
- Check asset paths in build
- Verify public folder contents are included
- Check vite.config.js base path setting