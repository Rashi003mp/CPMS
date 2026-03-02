# ConstructPro Frontend

Modern construction project management system built with Next.js, React, and TailwindCSS.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: Zustand + TanStack Query
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `https://localhost:7001`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env.local` file with:
```env
NEXT_PUBLIC_API_URL=https://localhost:7001/api
NEXT_PUBLIC_APP_NAME=ConstructPro
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
constructpro-frontend/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   └── forms/            # Form components
├── lib/                   # Utilities and configurations
│   ├── api/              # API client and endpoints
│   ├── hooks/            # Custom React hooks
│   ├── providers/        # Context providers
│   └── utils.ts          # Utility functions
├── store/                 # Zustand stores
├── types/                 # TypeScript type definitions
└── public/               # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features

- 🔐 JWT Authentication
- 👥 User Management
- 📊 Project Management
- ✅ Task Tracking
- 💬 Comments System
- 📈 Dashboard Analytics
- 🎨 Modern UI with TailwindCSS
- 📱 Fully Responsive
- ⚡ Fast and Optimized

## API Integration

The frontend connects to the .NET Core backend API. All API calls are configured in `lib/api/` directory with proper TypeScript types.

## Development Status

✅ Phase 1: Project Setup & Configuration - COMPLETED

Next: Phase 2 - Authentication System

## License

Private - ConstructPro Project
