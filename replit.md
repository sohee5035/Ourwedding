# Wedding Planning Application

## Overview

This is a full-stack wedding planning web application built with React, Express, and PostgreSQL. The application helps couples organize their wedding by managing venues, budgets, guest lists, checklists, and timelines. It features a modern, elegant UI with a soft color palette (ivory, blush pink, gold, lavender) and includes interactive features like map integration for venue locations and calendar views for planning.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tool**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server, providing fast hot module replacement
- React Router for client-side routing with nested layouts
- Single Page Application (SPA) architecture

**UI Component Library**
- shadcn/ui component library built on Radix UI primitives for accessible, customizable components
- Tailwind CSS v4 for utility-first styling with custom design tokens
- Custom theme with wedding-specific color palette (ivory, blush, gold, lavender)
- Pretendard and Playfair Display fonts for Korean and serif typography

**State Management**
- Zustand for lightweight, hook-based global state management
- Separate stores for different domains (wedding info, venues, checklist, budget, guests)
- Each store manages its own loading states and API interactions
- React Query (@tanstack/react-query) configured but state primarily managed through Zustand

**Form Handling**
- React Hook Form with Zod schema validation via @hookform/resolvers
- Drizzle-Zod for generating validation schemas from database schemas
- Type-safe form inputs aligned with database schema

**Styling Approach**
- CSS-in-JS through Tailwind's @theme directive for design tokens
- Custom utility classes (btn-primary, btn-secondary, card) for consistent styling
- Responsive design with mobile-first approach
- Mobile bottom navigation, desktop top navigation

### Backend Architecture

**Server Framework**
- Express.js server with TypeScript
- Separate entry points for development (index-dev.ts) and production (index-prod.ts)
- Development mode integrates Vite middleware for seamless HMR
- Production mode serves pre-built static assets

**API Design**
- RESTful API endpoints under `/api` namespace
- Resource-based routing (wedding-info, venues, checklist, budget, guests)
- Standard HTTP methods (GET, POST, PUT/PATCH, DELETE)
- JSON request/response format with validation via Zod schemas

**Request Processing**
- Express JSON body parser with raw body preservation for webhook support
- Request/response logging middleware with timing information
- Error handling with appropriate HTTP status codes (400, 404, 500)

**Database Layer**
- Storage abstraction interface (IStorage) for potential future database swaps
- DatabaseStorage implementation using Drizzle ORM
- All database operations return promises for async handling
- Centralized database connection management

### Data Storage Solutions

**Database**
- PostgreSQL via Neon serverless driver (@neondatabase/serverless)
- WebSocket support for serverless connection pooling
- Connection string from DATABASE_URL environment variable
- Database schema migrations managed by Drizzle Kit

**Schema Design**
- Six main tables: wedding_info, venues, checklist_items, budget_items, guests, group_guests
- UUID primary keys using PostgreSQL's gen_random_uuid()
- Timestamps for created_at/updated_at tracking
- Array fields for flexible data (photos array in venues)
- Text fields for flexible string data, integer fields for numeric values
- Group guests table for unnamed/headcount-only guest entries (parents' guests, relatives)

**ORM & Type Safety**
- Drizzle ORM for type-safe database queries
- Schema definitions in shared/schema.ts used by both frontend and backend
- Drizzle-Zod for automatic validation schema generation
- Type inference from schema for insert/select operations

### Authentication and Authorization

**Current Implementation**
- Session-based authentication using express-session with PostgreSQL storage
- bcrypt password hashing (12 rounds) for secure credential storage
- Dual-hash verification supports migration from legacy SHA-256 to bcrypt
- Auto-migration: old SHA-256 passwords are automatically upgraded to bcrypt on successful login
- Minimum 6-character password policy

**Password Recovery**
- "Forgot password" feature displays admin KakaoTalk contact (wsh9193) for password reset requests

### Project Structure

**Monorepo Organization**
- `/client` - Frontend React application
  - `/src/components` - Reusable UI components and shadcn/ui components
  - `/src/pages` - Route-based page components
  - `/src/store` - Zustand state management stores
  - `/src/lib` - Utility functions and API client
  - `/src/hooks` - Custom React hooks
- `/server` - Backend Express application
  - `routes.ts` - API endpoint definitions
  - `storage.ts` - Database abstraction layer
  - `db.ts` - Database connection setup
- `/shared` - Code shared between client and server
  - `schema.ts` - Drizzle schema and Zod validation schemas
- `/migrations` - Drizzle database migration files

**Build & Deployment**
- Client builds to `dist/public` for static serving
- Server bundles to `dist/index.js` using esbuild
- Production mode serves client from built assets
- Development mode uses Vite dev server with middleware

## External Dependencies

### Third-Party Services

**Map Integration**
- Leaflet/OpenStreetMap for displaying venue locations
- Map markers for each venue with popups
- Interactive map navigation and centering

**Image Storage (Cloudinary)**
- Cloudinary for optimized image hosting
- Automatic image optimization (resizing, quality, format)
- Secure upload via server-side API
- Images stored with URL and publicId for proper cleanup

**Database Service**
- Neon PostgreSQL serverless database
- WebSocket-based connection pooling
- Requires DATABASE_URL environment variable

### Key NPM Packages

**UI & Styling**
- @radix-ui/* - Primitive UI components (accordion, dialog, dropdown, etc.)
- tailwindcss - Utility-first CSS framework
- lucide-react - Icon library
- react-icons - Additional icon library (Font Awesome)
- class-variance-authority - CVA for component variants
- embla-carousel-react - Carousel component

**State & Data Management**
- zustand - State management
- @tanstack/react-query - Async state management
- react-hook-form - Form handling
- zod - Schema validation
- date-fns - Date manipulation and formatting

**Database & ORM**
- drizzle-orm - Type-safe ORM
- drizzle-kit - Migration tooling
- @neondatabase/serverless - PostgreSQL driver
- drizzle-zod - Zod schema generation

**Development Tools**
- @replit/vite-plugin-* - Replit-specific development features
- vite - Build tool and dev server
- typescript - Type checking
- esbuild - Production bundling

**Server**
- express - Web server framework
- ws - WebSocket support for database connections
- nanoid - ID generation (development)