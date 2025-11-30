# Hamsaya Dashboard

An admin panel for managing the Hamsaya social platform. Built with React, TypeScript, and Tailwind CSS.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![React](https://img.shields.io/badge/React-19.1-blue)
![Vite](https://img.shields.io/badge/Vite-7.1-purple)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Development](#development)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The Hamsaya Dashboard is a web-based admin panel that allows administrators to:

- **Monitor** platform statistics and analytics
- **Manage** users, posts, businesses, and content
- **Moderate** reports and handle flagged content
- **Configure** platform settings and categories

## ✨ Features

### Dashboard & Analytics
- 📊 Real-time platform statistics
- 📈 User growth and engagement metrics
- 💰 Marketplace insights (sell posts)
- 📋 Recent activity feed

### User Management
- 👥 View and search all users
- ✏️ Edit user profiles
- 🚫 Suspend or activate accounts
- 📊 User activity tracking

### Content Moderation
- 📝 Manage all posts (FEED, EVENT, SELL, PULL types)
- 💬 Review comments and interactions
- 🚩 Handle user reports
- ❌ Remove inappropriate content

### Business Management
- 🏢 View and edit business profiles
- 📂 Manage business categories
- ⏰ Update business hours
- 📸 Review business galleries

### Reports & Safety
- 🔍 Review all user reports
- 🛡️ Moderate flagged content
- ✅ Approve or reject reports
- 📝 Add admin notes to reports

### Settings
- 🏷️ Manage post and business categories
- ⚙️ Configure platform settings
- 🔧 System preferences

## 🛠 Tech Stack

### Core
- **[React 19.1](https://react.dev)** - UI library
- **[TypeScript 5.9](https://www.typescriptlang.org)** - Type safety
- **[Vite 7.1](https://vitejs.dev)** - Build tool & dev server

### Routing & State
- **[React Router DOM 7.9](https://reactrouter.com)** - Client-side routing
- **React Context API** - Global state management

### UI & Styling
- **[Tailwind CSS 3.4](https://tailwindcss.com)** - Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com)** - Component library
- **[Radix UI](https://www.radix-ui.com)** - Accessible primitives
- **[Lucide React](https://lucide.dev)** - Icon library
- **[Recharts 3.3](https://recharts.org)** - Charts and graphs

### Data & APIs
- **[Axios 1.13](https://axios-http.com)** - HTTP client
- **[date-fns 4.1](https://date-fns.org)** - Date utilities
- **[js-cookie 3.0](https://github.com/js-cookie/js-cookie)** - Cookie management

### Developer Experience
- **[ESLint](https://eslint.org)** - Linting
- **[TypeScript ESLint](https://typescript-eslint.io)** - TypeScript linting
- **[Prettier](https://prettier.io)** - Code formatting

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** or **pnpm**
- **Hamsaya Backend** running (see `../hamsaya-backend/README.md`)

### Installation

1. **Clone the repository** (if not already cloned)
   ```bash
   git clone https://github.com/your-org/hamsaya.git
   cd hamsaya/hamsaya-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your backend URL:
   ```env
   VITE_API_URL=http://localhost:8080/api/v1
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

### Default Login

Use the admin account created during backend setup:
```
Email: admin@hamsaya.app
Password: [your-admin-password]
```

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

### Using Makefile (Alternative)

```bash
# Install dependencies
make install

# Start dev server
make dev

# Build production
make build

# Run linter
make lint

# Type check
make type-check

# Preview build
make preview
```

### Adding a New Page

1. Create page component in `src/pages/dashboard/`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/layout/DashboardLayout.tsx`

### Adding a New Admin Modal

1. Create modal component in `src/components/admin/`
2. Import and use in relevant page
3. Handle API calls with error handling

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Use Tailwind utility classes for styling
- Organize imports: React → Components → Utils → Types
- Type all props and function returns

## 📁 Project Structure

```
hamsaya-dashboard/
├── src/
│   ├── pages/              # Page components
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── users/          # User management
│   │   └── login/          # Auth pages
│   ├── components/         # Reusable components
│   │   ├── admin/          # Admin modals
│   │   ├── layout/         # Layout components
│   │   └── ui/             # shadcn/ui components
│   ├── context/            # React Context
│   │   └── AuthContext.tsx # Auth state
│   ├── lib/                # Utilities
│   │   ├── api-client.ts   # Axios setup
│   │   └── utils.ts        # Helper functions
│   ├── routes/             # Route guards
│   │   └── ProtectedRoute.tsx
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── assets/             # Static assets
│   ├── App.tsx             # Main component
│   ├── App.css             # Global styles
│   ├── main.tsx            # Entry point
│   └── index.css           # Tailwind directives
├── public/                 # Public files
├── .env.example            # Env template
├── package.json            # Dependencies
├── tsconfig.*.json         # TypeScript config
├── tailwind.config.js      # Tailwind config
├── vite.config.ts          # Vite config
├── components.json         # shadcn/ui config
├── Makefile                # Dev commands
├── Dockerfile              # Production image
├── docker-compose.yml      # Docker setup
├── CLAUDE.md               # Dev guide
└── README.md               # This file
```

## 🔗 API Integration

### Backend Endpoints

The dashboard communicates with the Hamsaya backend API:

**Base URL:** `http://localhost:8080/api/v1` (configurable)

**Admin Endpoints:**
```
GET    /admin/statistics              - Dashboard stats
GET    /admin/users                   - List users
PUT    /admin/users/:id/status        - Update user status
GET    /admin/posts                   - List posts
PUT    /admin/posts/:id               - Update post
GET    /admin/businesses              - List businesses
PUT    /admin/businesses/:id/status   - Update business status
GET    /admin/reports                 - List reports
PUT    /admin/reports/:type/:id/status - Update report status
GET    /admin/categories              - List categories
POST   /admin/categories              - Create category
```

See `src/lib/api-client.ts` for the HTTP client configuration.

### Authentication

- **JWT Tokens** stored in cookies
- **Auto-refresh** on 401 responses
- **Access Token:** 15 minutes
- **Refresh Token:** 7 days

### API Client Usage

```typescript
import apiClient from '@/lib/api-client'

// GET request
const response = await apiClient.get('/admin/users')

// POST request
const response = await apiClient.post('/admin/categories', data)

// PUT request
const response = await apiClient.put(`/admin/users/${id}`, data)

// Error handling
try {
  const response = await apiClient.get('/admin/statistics')
  setData(response.data.data)
} catch (error) {
  const message = handleApiError(error)
  toast.error(message)
}
```

## 🚢 Deployment

### Building for Production

```bash
# Build the application
npm run build

# Output will be in dist/
```

### Docker Deployment

```bash
# Build Docker image
docker build -t hamsaya-dashboard .

# Run container
docker run -p 80:80 \
  -e VITE_API_URL=https://api.hamsaya.app/api/v1 \
  hamsaya-dashboard
```

### Docker Compose (with backend)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f dashboard

# Stop services
docker-compose down
```

### Deploy to Nginx

1. Build the application: `npm run build`
2. Copy `dist/` to server: `/var/www/hamsaya-dashboard/`
3. Configure Nginx (see `CLAUDE.md` for config)
4. Enable SSL with Let's Encrypt
5. Restart Nginx

### Environment Variables in Production

**Important:** Vite embeds environment variables at **build time**.

For different environments:
```bash
# Build for staging
VITE_API_URL=https://staging-api.hamsaya.app/api/v1 npm run build

# Build for production
VITE_API_URL=https://api.hamsaya.app/api/v1 npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Guidelines

- Write clean, readable TypeScript code
- Follow existing code style and patterns
- Add comments for complex logic
- Update documentation for new features
- Test your changes thoroughly

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Additional Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive development guide
- **[Backend API Docs](../hamsaya-backend/API_DOCUMENTATION.md)** - API reference
- **[Integration Guide](../FLUTTER_GOLANG_INTEGRATION.md)** - Cross-project integration

## 🐛 Troubleshooting

### Common Issues

**CORS Errors**
- Ensure backend allows dashboard origin in CORS config
- Check `VITE_API_URL` is correct

**401 Unauthorized**
- Clear cookies and log in again
- Check admin role in backend

**Build Errors**
- Run `npx tsc --noEmit` to check TypeScript errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

**Environment Variables Not Working**
- Ensure prefixed with `VITE_`
- Restart dev server after changing `.env`
- Variables are embedded at build time, not runtime

## 📞 Support

For issues and questions:
- Check [CLAUDE.md](./CLAUDE.md) for detailed documentation
- Review backend API docs for endpoint details
- Check browser console and network tab for errors
- Review backend logs for API errors

## 🎉 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com) components
- Icons from [Lucide](https://lucide.dev)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Powered by [Vite](https://vitejs.dev)

---

**Happy Coding! 🚀**
