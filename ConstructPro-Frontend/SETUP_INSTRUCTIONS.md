# Setup Instructions

## Phase 1 Setup - Manual Steps

Since there was a network connectivity issue, please follow these steps:

### 1. Install Dependencies

Run this command in the `constructpro-frontend` directory:

```bash
npm install
```

If you continue to have network issues, try:
- Check your internet connection
- If behind a proxy, configure npm proxy settings
- Try using a different network
- Or use `yarn install` as an alternative

### 2. Verify Installation

After successful installation, verify by running:

```bash
npm run dev
```

The development server should start on `http://localhost:3000`

### 3. Backend Configuration

Make sure your .NET backend is running on:
```
https://localhost:7001
```

If your backend runs on a different port, update `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://localhost:YOUR_PORT/api
```

### 4. Test the Setup

1. Open browser to `http://localhost:3000`
2. You should see the ConstructPro welcome page
3. Links to Login and Register pages should be visible

## Phase 1 Completion Checklist

✅ Next.js project initialized with TypeScript
✅ TailwindCSS configured with custom theme
✅ shadcn/ui components setup (Button, Input, Card, Label)
✅ Axios configured with interceptors
✅ TanStack Query provider setup
✅ Environment variables configured
✅ Folder structure created
✅ TypeScript types defined (User, Project, Task, Comment, API)
✅ Toast notifications configured
✅ Utils and helpers created

⏳ **Pending**: npm install (network issue - run manually)

## Next Steps (Phase 2)

Once dependencies are installed and the dev server runs successfully, we'll proceed to:

1. Create authentication store (Zustand)
2. Build login page with form validation
3. Build registration page
4. Implement password recovery flow
5. Setup protected route middleware

## Troubleshooting

### Network Issues
If npm install fails:
```bash
# Clear npm cache
npm cache clean --force

# Try with different registry
npm install --registry=https://registry.npmmirror.com

# Or use yarn
yarn install
```

### Port Already in Use
If port 3000 is busy:
```bash
# Run on different port
npm run dev -- -p 3001
```

### Backend Connection Issues
If frontend can't connect to backend:
1. Ensure backend is running
2. Check CORS settings in backend
3. Verify API URL in `.env.local`
4. Check browser console for errors
