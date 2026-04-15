# PTF Attendance Management System

A modern, glassmorphism-inspired attendance management application built with React, Vite, and Supabase.

## Features

- **Dashboard**: Real-time summary of total students and today's attendance metrics.
- **Student Management**: Full CRUD operations for student records.
- **Attendance Marking**: Daily attendance tracking with status options (Present, Absent, Permission).
- **Reports**: Monthly reports and low attendance tracking (filtered for <75% presence).
- **Role-based Access**: Admin and Class Incharge roles with specific permissions.

## Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS (Custom Glassmorphism)
- **State Management**: Zustand, React Query
- **Backend**: Supabase (Auth, Database, Storage)
- **Icons**: Lucide React

## Getting Started

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Build for Production

```bash
npm run build
```
