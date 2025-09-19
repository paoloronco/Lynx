# Lynx AI Agent Instructions

## Project Overview
Lynx is a self-hosted link management system built with React, Express, and SQLite. The application enables users to create a personalized hub for their digital touchpoints with secure authentication and customizable themes.

## Architecture

### Frontend (`/src`)
- React + Vite application using TypeScript
- Tailwind CSS for styling with a custom design system (`/src/index.css`)
- Component structure:
  - `/components` - UI components including admin and public views
  - `/hooks` - Custom React hooks
  - `/lib` - Core utilities and API client
  - `/pages` - Main route components (Admin, Index, NotFound)

### Backend (`/server`)
- Express.js server with SQLite database
- Key modules:
  - `server.js` - Main Express application
  - `auth.js` - Authentication logic (JWT + bcrypt)
  - `database.js` - SQLite operations
  - `uploads/` - User uploaded assets

## Critical Workflows

### Development
1. Start development:
   ```bash
   npm install
   # Terminal 1 - Frontend
   npm run dev
   # Terminal 2 - Backend
   cd server
   npm install
   npm run dev
   ```

2. Build for production:
   ```bash
   npm run build
   cd server
   npm install
   npm start
   ```

### Authentication
- JWT tokens with 7-day expiry
- Default admin credentials:
  - Username: `admin`
  - Password: `ChangeMe123!`

## Project Conventions

### State Management
- API calls centralized in `/lib/api-client.ts`
- Authentication state handled via `auth.ts`
- Theme customization through CSS variables in `index.css`

### Security Patterns
- Rate limiting on authentication endpoints
- Parameterized SQLite queries for DB operations
- Secure cookie handling with HttpOnly flags
- Password strength validation in `auth.js`

### Integration Points
1. Theme System
   - Theme variables in `:root` and `.dark` in `index.css`
   - Components consume CSS variables for consistent styling

2. File Uploads
   - Handled in `server.js` via multer
   - Stored in `/server/uploads/`

## Common Tasks
1. Adding new link types:
   - Extend `LinkCard.tsx` component
   - Update schema in `server.js`
   - Add validation in frontend forms

2. Theme customization:
   - Modify CSS variables in `index.css`
   - Update `ThemeCustomizer.tsx` for new options