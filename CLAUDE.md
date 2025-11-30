# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Hamsaya Dashboard** is a React-based admin panel for managing the Hamsaya social platform. It provides administrators with tools to:

- Monitor platform statistics (users, posts, businesses, reports)
- Manage users (view, edit, suspend, activate)
- Moderate content (posts, comments, reports)
- Manage businesses and categories
- Review and action reports
- Configure platform settings

## Technology Stack

- **Framework:** React 19.1.1
- **Language:** TypeScript 5.9.3
- **Build Tool:** Vite 7.1.7
- **Router:** React Router DOM 7.9.5
- **State Management:** React Context API
- **HTTP Client:** Axios 1.13.1
- **UI Components:** Radix UI + shadcn/ui
- **Styling:** Tailwind CSS 3.4.18
- **Charts:** Recharts 3.3.0
- **Icons:** Lucide React + UntitledUI Icons
- **Toast Notifications:** Sonner 2.0.7
- **Date Utilities:** date-fns 4.1.0
- **Cookies:** js-cookie 3.0.5

## Project Structure

```
hamsaya-dashboard/
├── src/
│   ├── pages/              # Page components
│   │   ├── dashboard/      # Dashboard pages (Overview, Users, Posts, etc.)
│   │   ├── users/          # User management pages
│   │   └── login/          # Authentication pages
│   ├── components/         # Reusable components
│   │   ├── admin/          # Admin-specific components (modals)
│   │   ├── layout/         # Layout components (DashboardLayout)
│   │   └── ui/             # shadcn/ui components (Button, Card, etc.)
│   ├── context/            # React Context providers
│   │   └── AuthContext.tsx # Authentication state management
│   ├── lib/                # Utilities and helpers
│   │   ├── api-client.ts   # Axios client with interceptors
│   │   └── utils.ts        # Utility functions (cn, etc.)
│   ├── routes/             # Route configuration
│   │   └── ProtectedRoute.tsx # Auth guard for protected routes
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # Shared types
│   ├── assets/             # Static assets
│   ├── App.tsx             # Main app component
│   ├── App.css             # Global app styles
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles (Tailwind directives)
├── public/                 # Public static files
├── node_modules/           # Dependencies
├── .env                    # Environment variables (local)
├── .env.example            # Environment template (commit this)
├── .gitignore              # Git ignore rules
├── components.json         # shadcn/ui configuration
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.app.json       # TypeScript config (app)
├── tsconfig.json           # TypeScript config (base)
├── tsconfig.node.json      # TypeScript config (node)
├── vite.config.ts          # Vite configuration
├── Dockerfile              # Production Docker image
├── docker-compose.yml      # Local development with Docker
├── Makefile                # Common development commands
├── CLAUDE.md               # This file
└── README.md               # Project documentation
```

## Common Development Commands

```bash
# Installation
npm install                # Install all dependencies

# Development
npm run dev                # Start development server (http://localhost:5173)
make dev                   # Alternative using Makefile

# Building
npm run build              # Build for production (creates dist/)
make build                 # Alternative using Makefile

# Linting
npm run lint               # Run ESLint
make lint                  # Alternative using Makefile

# Preview
npm run preview            # Preview production build locally
make preview               # Alternative using Makefile

# Type Checking
npx tsc --noEmit           # Type check without emitting files
make type-check            # Alternative using Makefile

# Docker (when available)
make docker-build          # Build Docker image
make docker-run            # Run Docker container
docker-compose up          # Start dashboard with Docker Compose
```

## Architecture

### Layered Architecture

```
User Interface (Pages) → Components → Context/State → API Client → Backend
```

1. **Pages Layer** (`src/pages/`)
   - Full-page components
   - Route handlers
   - Data fetching and state management

2. **Components Layer** (`src/components/`)
   - Reusable UI components
   - Admin-specific components (modals, tables)
   - Layout components

3. **Context Layer** (`src/context/`)
   - Global state management
   - Authentication state
   - User session management

4. **API Layer** (`src/lib/api-client.ts`)
   - HTTP client configuration
   - Request/response interceptors
   - Token management
   - Error handling

### Authentication Flow

1. **Login**
   - User submits credentials → `/api/v1/auth/login`
   - Backend validates and returns JWT tokens
   - Tokens stored in cookies (httpOnly for security)
   - User redirected to dashboard

2. **Token Management**
   - Access token: 15 minutes (short-lived)
   - Refresh token: 7 days (stored in cookie)
   - Auto-refresh on 401 responses

3. **Protected Routes**
   - `ProtectedRoute` component wraps authenticated pages
   - Checks for valid token
   - Redirects to `/login` if unauthorized

4. **Logout**
   - Clears tokens from cookies
   - Redirects to login page
   - Optionally calls backend `/api/v1/auth/logout`

### State Management

**React Context API** is used for global state:

```typescript
// AuthContext provides:
- user: User | null           // Current authenticated user
- loading: boolean            // Loading state
- login: (email, password)    // Login function
- logout: ()                  // Logout function
- updateUser: (user)          // Update user data
```

For local component state, use `useState` and `useEffect`.

### API Integration

**Backend Endpoint:** `http://172.30.11.34:8080/api/v1` (configurable via `VITE_API_URL`)

**Available Admin Endpoints:**

```typescript
// Authentication
POST   /auth/login                    // Admin login
POST   /auth/refresh                  // Refresh access token
POST   /auth/logout                   // Logout

// Dashboard Statistics
GET    /admin/statistics              // Platform overview stats

// User Management
GET    /admin/users                   // List all users (paginated)
GET    /admin/users/:id               // Get user details
PUT    /admin/users/:id               // Update user
PUT    /admin/users/:id/status        // Update user status (active/suspended)

// Post Management
GET    /admin/posts                   // List all posts (paginated)
GET    /admin/posts/sell/statistics   // Marketplace statistics
PUT    /admin/posts/:id               // Update post
PUT    /admin/posts/:id/status        // Update post status

// Business Management
GET    /admin/businesses              // List all businesses (paginated)
PUT    /admin/businesses/:id          // Update business
PUT    /admin/businesses/:id/status   // Update business status

// Report Management
GET    /admin/reports                 // List all reports (paginated)
PUT    /admin/reports/:type/:id/status // Update report status

// Category Management
GET    /admin/categories              // List all categories
POST   /admin/categories              // Create category
PUT    /admin/categories/:id          // Update category
DELETE /admin/categories/:id          // Delete category
```

**API Client Usage:**

```typescript
import apiClient from '@/lib/api-client'

// GET request
const response = await apiClient.get('/admin/statistics')
const stats = response.data.data

// POST request with data
const response = await apiClient.post('/admin/categories', {
  name: 'New Category',
  name_pashto: 'نوی کټګوري',
  name_farsi: 'دسته جدید'
})

// PUT request
const response = await apiClient.put(`/admin/users/${userId}/status`, {
  status: 'suspended'
})

// Error handling
try {
  const response = await apiClient.get('/admin/users')
} catch (error) {
  const message = handleApiError(error) // Returns user-friendly message
  toast.error(message)
}
```

### Styling

**Tailwind CSS** is used for all styling:

```tsx
// Utility classes
<div className="flex items-center justify-between p-4 rounded-lg border">

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Dark mode support (if enabled)
<div className="bg-white dark:bg-gray-900">
```

**shadcn/ui Components:**
- Pre-built accessible components
- Customizable via Tailwind
- Located in `src/components/ui/`

```tsx
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'

<Button variant="default" size="lg">Click me</Button>
<Card>Content here</Card>
```

### Routing

**React Router DOM v7** is used for routing:

```tsx
// Route structure in App.tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
    <Route index element={<DashboardOverview />} />
    <Route path="users" element={<UserManagement />} />
    <Route path="posts" element={<PostsPage />} />
    <Route path="reports" element={<ReportsPage />} />
    <Route path="businesses" element={<BusinessesPage />} />
    <Route path="categories" element={<CategoriesPage />} />
    <Route path="settings" element={<SettingsPage />} />
  </Route>
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

**Navigation:**
```tsx
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()
navigate('/users')               // Navigate to users page
navigate('/posts', { replace: true })  // Replace current history entry
```

## Environment Variables

Create a `.env` file in the root directory:

```bash
# API Configuration
VITE_API_URL=http://localhost:8080/api/v1

# Optional: Analytics, Sentry, etc.
# VITE_SENTRY_DSN=your-sentry-dsn
```

**Accessing in code:**
```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

**Important:**
- All environment variables MUST be prefixed with `VITE_`
- Variables are embedded at build time (not runtime)
- Don't commit `.env` file (use `.env.example` instead)

## Adding New Features

### 1. Create a New Page

```tsx
// src/pages/dashboard/NewFeaturePage.tsx
import { useState, useEffect } from 'react'
import apiClient from '@/lib/api-client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function NewFeaturePage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await apiClient.get('/admin/new-feature')
      setData(response.data.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">New Feature</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Card>{/* Render data */}</Card>
      )}
    </div>
  )
}
```

### 2. Add Route

```tsx
// src/App.tsx
import NewFeaturePage from './pages/dashboard/NewFeaturePage'

// Inside the protected route group:
<Route path="new-feature" element={<NewFeaturePage />} />
```

### 3. Add Navigation Link

```tsx
// src/components/layout/DashboardLayout.tsx
<Link to="/new-feature" className="nav-link">
  New Feature
</Link>
```

### 4. Create Modal Component (if needed)

```tsx
// src/components/admin/NewFeatureModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface NewFeatureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: Item | null
  onSuccess: () => void
}

export default function NewFeatureModal({
  open,
  onOpenChange,
  item,
  onSuccess
}: NewFeatureModalProps) {
  const handleSubmit = async () => {
    try {
      await apiClient.put(`/admin/items/${item.id}`, {...})
      toast.success('Updated successfully')
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error(handleApiError(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        {/* Form fields */}
      </DialogContent>
    </Dialog>
  )
}
```

## Code Style Guidelines

### TypeScript

```typescript
// Use interfaces for object shapes
interface User {
  id: string
  email: string
  name: string
  is_admin: boolean
}

// Use type for unions and primitives
type Status = 'active' | 'suspended' | 'deleted'

// Always type function parameters and returns
function updateUser(id: string, data: Partial<User>): Promise<User> {
  // ...
}
```

### React Components

```tsx
// Use function components (not class components)
export default function MyComponent() {
  // ...
}

// Props with TypeScript interface
interface MyComponentProps {
  title: string
  onClose: () => void
  children?: React.ReactNode
}

export default function MyComponent({ title, onClose, children }: MyComponentProps) {
  return (
    <div>
      <h1>{title}</h1>
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  )
}
```

### File Naming

- **Components:** PascalCase (e.g., `UserTable.tsx`, `DashboardLayout.tsx`)
- **Utilities:** camelCase (e.g., `api-client.ts`, `utils.ts`)
- **Types:** kebab-case or index (e.g., `types/index.ts`)

### Import Order

```typescript
// 1. React and third-party libraries
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// 2. Components
import { Button } from '@/components/ui/button'
import EditUserModal from '@/components/admin/EditUserModal'

// 3. Utilities and helpers
import apiClient, { handleApiError } from '@/lib/api-client'
import { cn } from '@/lib/utils'

// 4. Types
import type { User } from '@/types'
```

## Common Patterns

### Data Fetching

```tsx
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  fetchData()
}, [])

const fetchData = async () => {
  try {
    setLoading(true)
    const response = await apiClient.get('/admin/data')
    setData(response.data.data)
    setError(null)
  } catch (error) {
    setError(handleApiError(error))
  } finally {
    setLoading(false)
  }
}
```

### Pagination

```tsx
const [page, setPage] = useState(1)
const [limit] = useState(20)
const [total, setTotal] = useState(0)

const fetchUsers = async () => {
  const response = await apiClient.get('/admin/users', {
    params: { page, limit }
  })
  setData(response.data.data)
  setTotal(response.data.meta.total_count)
}

// Pagination controls
<div className="flex items-center justify-between">
  <Button
    disabled={page === 1}
    onClick={() => setPage(p => p - 1)}
  >
    Previous
  </Button>
  <span>Page {page} of {Math.ceil(total / limit)}</span>
  <Button
    disabled={page >= Math.ceil(total / limit)}
    onClick={() => setPage(p => p + 1)}
  >
    Next
  </Button>
</div>
```

### Toast Notifications

```tsx
import { toast } from 'sonner'

// Success
toast.success('User updated successfully')

// Error
toast.error('Failed to update user')

// Info
toast.info('Processing...')

// With duration
toast.success('Saved!', { duration: 3000 })
```

### Modal Management

```tsx
const [isModalOpen, setIsModalOpen] = useState(false)
const [selectedItem, setSelectedItem] = useState<Item | null>(null)

const handleEdit = (item: Item) => {
  setSelectedItem(item)
  setIsModalOpen(true)
}

const handleSuccess = () => {
  fetchData() // Refresh data
}

<EditModal
  open={isModalOpen}
  onOpenChange={setIsModalOpen}
  item={selectedItem}
  onSuccess={handleSuccess}
/>
```

## Debugging Tips

1. **Check Browser Console:** All errors are logged to the console
2. **Check Network Tab:** Inspect API requests/responses
3. **React DevTools:** Install React DevTools extension
4. **Vite DevTools:** Inspect Vite build process
5. **Token Issues:** Check cookies in Application tab
6. **API Errors:** Check backend logs (hamsaya-backend)

## Common Issues

### 1. CORS Errors
**Problem:** API requests blocked by CORS
**Solution:** Backend must allow dashboard origin in CORS config

```go
// Backend: config/config.go or middleware/cors.go
AllowedOrigins: []string{"http://localhost:5173"}
```

### 2. 401 Unauthorized
**Problem:** Token expired or invalid
**Solution:** Check token in cookies, try logging out and back in

### 3. Build Errors
**Problem:** TypeScript errors during build
**Solution:** Run `npx tsc --noEmit` to see all type errors

### 4. Environment Variables Not Working
**Problem:** Variables not accessible
**Solution:** Ensure prefixed with `VITE_` and restart dev server

## Production Deployment

### Building for Production

```bash
# Build the application
npm run build

# Preview the build locally
npm run preview
```

The build output is in `dist/` directory.

### Deploying with Nginx

```nginx
server {
    listen 80;
    server_name admin.hamsaya.app;

    root /var/www/hamsaya-dashboard/dist;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Docker Deployment

```bash
# Build Docker image
docker build -t hamsaya-dashboard .

# Run container
docker run -p 80:80 -e VITE_API_URL=https://api.hamsaya.app/api/v1 hamsaya-dashboard
```

### Environment Variables in Production

**Important:** Vite embeds environment variables at **build time**, not runtime.

For runtime configuration:
1. Use a config endpoint from the backend
2. Or use nginx to inject config via `window.__ENV__`

## Security Best Practices

1. **Never commit `.env` file** - Use `.env.example` instead
2. **Use HTTPS in production** - Encrypt data in transit
3. **Validate user input** - Sanitize before sending to backend
4. **Store tokens in httpOnly cookies** - Prevent XSS attacks
5. **Implement CSRF protection** - If using cookies
6. **Keep dependencies updated** - Run `npm audit` regularly
7. **Use Content Security Policy** - Add CSP headers in production
8. **Rate limit API calls** - Prevent abuse
9. **Log security events** - Monitor for suspicious activity

## Testing (When Implemented)

```bash
# Unit tests with Vitest
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests with Playwright
npm run test:e2e
```

## Additional Resources

- **Backend API Docs:** See `hamsaya-backend/API_DOCUMENTATION.md`
- **Backend Integration:** See root `FLUTTER_GOLANG_INTEGRATION.md`
- **React Docs:** https://react.dev
- **Vite Docs:** https://vitejs.dev
- **Tailwind CSS:** https://tailwindcss.com
- **shadcn/ui:** https://ui.shadcn.com
- **React Router:** https://reactrouter.com

## Getting Help

1. Check backend logs for API errors
2. Check browser console for frontend errors
3. Review this documentation
4. Check API documentation in backend
5. Review type definitions in `src/types/`

## Known Limitations

1. **No real-time updates** - Dashboard doesn't use WebSockets (yet)
2. **No offline support** - Requires internet connection
3. **Basic error handling** - Could be more comprehensive
4. **No tests** - Testing infrastructure not yet implemented

## Future Enhancements

- [ ] Real-time dashboard updates via WebSocket
- [ ] Advanced analytics and charts
- [ ] Export data (CSV, PDF)
- [ ] Email notifications for admins
- [ ] Audit log viewer
- [ ] Bulk operations (bulk delete, bulk status change)
- [ ] Advanced search and filtering
- [ ] User activity timeline
- [ ] Content moderation tools
- [ ] A/B testing dashboard
