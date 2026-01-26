# Migration Notes - Fusion Starter to Next.js

## Completed Tasks

### ✅ Project Structure
- Created Next.js 15 App Router structure
- Migrated all components from `client/components` to root `components/`
- Migrated all hooks from `client/hooks` to root `hooks/`
- Migrated services, lib, and i18n folders to root
- Created proper Next.js page structure in `app/` directory

### ✅ Configuration Files
- Created `next.config.mjs` for Next.js configuration
- Updated `tsconfig.json` for Next.js with proper paths
- Updated `components.json` for shadcn/ui with Next.js structure
- Created `.eslintrc.json` for Next.js linting
- Updated `.dockerignore` for Next.js build artifacts

### ✅ Package Management
- Converted from pnpm to npm
- Updated `package.json` with Next.js dependencies
- Removed Vite, Express, and server-related dependencies
- Added Next.js 15 and related packages

### ✅ Docker Support
- Created `Dockerfile` with multi-stage build for Next.js
- Created `docker-compose.yml` for easy deployment
- Created `.env.example` for environment variables

### ✅ Pages Migrated
- ✅ Home page (`app/page.tsx`)
- ✅ About page (`app/about/page.tsx`)
- ✅ Contact page (`app/contact/page.tsx`)
- ✅ Not Found page (`app/not-found.tsx`)
- ✅ Sign In page (`app/signin/page.tsx`)
- ✅ Sign Up page (`app/signup/page.tsx`)
- ✅ Dashboard Home (`app/dashboard/page.tsx`)
- ✅ Dashboard Courses (`app/dashboard/courses/page.tsx`)
- ✅ Dashboard Settings (`app/dashboard/settings/page.tsx`)
- ⚠️ Course Details (needs dynamic route structure)
- ⚠️ Lesson page (needs dynamic route structure)

### ✅ Cleanup
- Removed `client/` folder
- Removed `server/` folder
- Removed `shared/` folder
- Removed Vite configuration files
- Removed pnpm lock file and .npmrc
- Removed Netlify configuration

## Pending Tasks

### 🔧 Code Updates Required

The following files were copied but need manual updates to work with Next.js:

1. **Replace React Router with Next.js Navigation**
   - Files to update: All page files in `app/` directory
   - Change: `import { Link } from "react-router-dom"` → `import Link from "next/link"`
   - Change: `import { useNavigate } from "react-router-dom"` → `import { useRouter } from "next/navigation"`
   - Change: `<Link to="/path">` → `<Link href="/path">`

2. **Add "use client" Directive**
   - All pages using hooks, state, or event handlers need `"use client"` at the top
   - Already added to: home, about, contact, not-found pages
   - Need to add to: signin, signup, dashboard pages

3. **Dynamic Routes**
   - Create `app/dashboard/courses/[id]/page.tsx` for course details
   - Create `app/dashboard/courses/[id]/lesson/[lessonId]/page.tsx` for lessons
   - Update these files to use Next.js dynamic params

4. **Layout Components**
   - Check `components/layout/MainLayout.tsx` for router dependencies
   - Update `components/layout/Header.tsx` if it uses React Router

## Next Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Update Migrated Pages**
   - Add `"use client"` to interactive pages
   - Replace `react-router-dom` imports with Next.js equivalents
   - Update Link components

3. **Create Dynamic Routes**
   ```bash
   mkdir -p app/dashboard/courses/[id]
   mkdir -p app/dashboard/courses/[id]/lesson/[lessonId]
   ```

4. **Test the Application**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

6. **Docker Deployment**
   ```bash
   docker build -t sels-portal .
   docker run -p 3000:3000 sels-portal
   ```
   Or use docker-compose:
   ```bash
   docker-compose up -d
   ```

## Key Differences: Vite/React Router vs Next.js

| Feature | Old (Vite + React Router) | New (Next.js) |
|---------|---------------------------|---------------|
| Routing | React Router (`<Route>`) | File-based routing |
| Navigation | `<Link to="">` | `<Link href="">` |
| Client-side | All components | Need `"use client"` for interactivity |
| Server | Express backend | Next.js API routes (optional) |
| Build | Vite | Next.js |
| Dev Server | Port 8080 | Port 3000 |

## Environment Variables

Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

## Troubleshooting

### Common Issues After Migration

1. **"Cannot find module 'next'" errors**
   - Run `npm install` to install dependencies

2. **"You're importing a component that needs useState"**
   - Add `"use client"` directive at the top of the file

3. **404 errors on routes**
   - Ensure pages are named `page.tsx` in their respective folders
   - Check that dynamic routes use `[param]` folder naming

4. **Build errors**
   - Run `npm run typecheck` to find TypeScript errors
   - Check that all imports are correct

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Migrating from Vite](https://nextjs.org/docs/app/building-your-application/upgrading/from-vite)
- [shadcn/ui with Next.js](https://ui.shadcn.com/docs/installation/next)
