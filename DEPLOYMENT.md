# Deployment Guide

This project is a React application built with Vite and Tailwind CSS. It is ready for deployment to platforms like Vercel, Netlify, or Cloudflare Pages.

## Build Settings

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **GitHub Repository**: [Saxon-Commits/Gamify](https://github.com/Saxon-Commits/Gamify)

## Environment Variables

To deploy to production, you must set the following environment variables in your Vercel/Netlify dashboard:

```env
# 1. Clerk Authentication (Get these from Clerk Dashboard > API Keys)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)

# 2. Convex Database (Get these from Convex Dashboard or `npx convex env`)
# Note: On Vercel, the Convex Integration can set these automatically.
VITE_CONVEX_URL=https://...
CONVEX_DEPLOYMENT=...
```

## Going to Production (Clerk & Convex)

### 1. Clerk Authentication
Currently, the app uses **Development** keys (`pk_test_...`). To go live:
1.  Go to your **Clerk Dashboard**.
2.  Select your application and click **"Deploy to Production"**.
3.  Add your production domain (e.g., `gamify.vercel.app`).
4.  Copy the new **Publishable Key** (`pk_live_...`).
5.  Update your `VITE_CLERK_PUBLISHABLE_KEY` environment variable in your deployment platform (Vercel).

### 2. Convex Database
1.  Run `npx convex deploy` to push your schema and functions to the production Cloud.
2.  Update `VITE_CONVEX_URL` to point to your production instance.

## Recent Changes & Preparation

1.  **Dependencies**:
    - Installed `tailwindcss`, `postcss`, and `autoprefixer`.
    - Configured `tailwind.config.js` and `postcss.config.js`.

2.  **Code Cleanup**:
    - Cleaned up `index.html`.
    - Consolidated styles.
    - Fixed TypeScript errors.

3.  **Verification**:
    - Verified `npm run build` succeeds.
    - Verified type safety.

## Local Development

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Create a `.env.local` file with your keys:
    ```
    VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
    # Convex vars are usually managed by `npx convex dev`
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
