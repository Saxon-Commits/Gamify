# Deployment Guide

This project is a React application built with Vite and Tailwind CSS. It is ready for deployment to platforms like Vercel, Netlify, or Cloudflare Pages.

## Build Settings

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Environment Variables

The application does not currently require any specific environment variables for the build process.


## Recent Changes & Preparation

The following steps were taken to prepare the codebase for production:

1.  **Dependencies**:
    - Installed `tailwindcss`, `postcss`, and `autoprefixer` as development dependencies.
    - Configured `tailwind.config.js` and `postcss.config.js` for production builds.

2.  **Code Cleanup**:
    - Cleaned up `index.html` to remove external CDN links (Tailwind Play CDN, etc.) and import maps.
    - Consolidated styles into `index.css` and imported it in `index.tsx`.
    - Fixed TypeScript errors in `components/Layout.tsx`.

3.  **Verification**:
    - Verified that `npm run build` completes successfully and generates the `dist` folder.
    - Verified type safety with `tsc`.

## Local Development

To run the project locally:

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Create a `.env.local` file with your API key:
    ```
    GEMINI_API_KEY=your_key_here
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
