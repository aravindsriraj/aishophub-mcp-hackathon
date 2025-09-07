# Overview

This is a full-stack e-commerce application built with a React frontend and Express.js backend. The application provides product browsing, search functionality, user authentication, and shopping cart management. It uses modern technologies including TypeScript, Tailwind CSS, shadcn/ui components, and PostgreSQL with Drizzle ORM for data persistence.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite for development/build tooling
- **Routing**: Wouter for client-side routing with pages for home, login, and product details
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and theme support
- **Form Handling**: React Hook Form with Zod schema validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured route handlers
- **Authentication**: Session-based authentication with bcrypt for password hashing
- **Middleware**: Custom logging, error handling, and authentication middleware
- **Development**: Hot reloading with Vite integration for development mode

## Data Layer
- **Database**: PostgreSQL as the primary database
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema**: Defined in shared directory for consistency between frontend and backend
- **Tables**: Users, products, cart items, and sessions with proper foreign key relationships

## Authentication & Authorization
- **Strategy**: Token-based authentication using session tokens stored in localStorage
- **Password Security**: bcrypt hashing with salt for secure password storage
- **Session Management**: Database-stored sessions with expiration handling
- **Route Protection**: Middleware-based authentication checks for protected endpoints

## Project Structure
- **Monorepo**: Single repository with client/, server/, and shared/ directories
- **Shared Code**: Common TypeScript types and Zod schemas used by both frontend and backend
- **Build Process**: Separate build processes for client (Vite) and server (esbuild)
- **Development**: Unified development server with API proxy and hot reloading

## Key Features
- **Product Catalog**: Browse, search, and filter products with pagination
- **User Management**: Registration, login, and profile management
- **Shopping Cart**: Add/remove items, quantity management, and persistent cart state
- **Responsive Design**: Mobile-first design with adaptive layouts
- **Theme Support**: Light/dark theme toggle with system preference detection

# External Dependencies

## Core Technologies
- **@neondatabase/serverless**: Neon PostgreSQL database connection with serverless support
- **drizzle-orm**: Type-safe ORM for database operations and query building
- **@tanstack/react-query**: Server state management and caching for the frontend
- **wouter**: Lightweight client-side routing library for React

## UI and Styling
- **@radix-ui/***: Comprehensive set of unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Utility for creating consistent component variants
- **lucide-react**: Icon library with React components

## Development Tools
- **vite**: Fast build tool and development server for the frontend
- **tsx**: TypeScript execution engine for Node.js development
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay for Replit environment

## Authentication & Security
- **bcrypt**: Password hashing library for secure authentication
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Form Management
- **react-hook-form**: Performant forms library with minimal re-renders
- **@hookform/resolvers**: Validation resolvers for various schema libraries
- **zod**: TypeScript-first schema validation library