# Setup Instructions

## Prerequisites

- Node.js 18+ (v24.15.0 recommended)
- npm 9+
- PostgreSQL 12+
- Git
- Docker (optional, for containerized deployment)

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/selfassessment-app.git
cd Selfassessment-app
```

### 2. Install Dependencies

```bash
npm install
```

This installs dependencies for:
- Backend (`backend/package.json`)
- Frontend (`frontend/package.json`)
- Root workspace

### 3. Setup Environment Variables

#### Backend Setup

Copy the example file:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/iso9001
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-key
LOG_LEVEL=info
```

#### Frontend Setup

Copy the example file:
```bash
cp frontend/.env.example frontend/.env.local
```

Edit `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ENV=development
```

### 4. Setup Database

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE iso9001;

# Create user (optional)
CREATE USER iso9001_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE iso9001 TO iso9001_user;

# Exit
\q
```

#### Run Migrations

```bash
cd backend
npm run db:generate    # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:seed       # Seed with initial data
cd ..
```

### 5. Start Development Servers

#### Option A: Individual Servers

Terminal 1 - Backend:
```bash
cd backend
npm run dev
# Server running on http://localhost:5000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
# Application running on http://localhost:3000
```

#### Option B: Both Servers

```bash
npm run dev
```

This starts both backend and frontend (if your root package.json has this script).

### 6. Access Application

Open browser:
```
http://localhost:3000
```

Default test user (after seeding):
- Email: `hermes@greisz.se`
- Password: `Sidvolt2`


### Test Backend
## Database Setup Details

### Using Docker Compose

```bash
# Start PostgreSQL in Docker
docker-compose up -d postgres

# Run migrations
cd backend
npm run db:generate
npm run db:push
npm run db:seed
cd ..
```

### Connection String

Format:
```
postgresql://[user[:password]@]host[:port]/database[?params]
```

Examples:
```
# Local development
postgresql://localhost/iso9001

# With credentials
postgresql://iso9001_user:password@localhost:5432/iso9001

# Production (AWS RDS)
postgresql://user:password@db.example.com:5432/iso9001?ssl=true
```

---

## Backend Setup

### Dependencies

```bash
cd backend
npm install
```

### Configuration

Key files:
- `backend/src/config/database.ts` - Database config
- `backend/src/config/index.ts` - App config
- `backend/.env` - Environment variables

### Build TypeScript

```bash
cd backend
npm run build
# Output in dist/
```

### Run Tests

```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Seed Database

```bash
cd backend
npm run db:seed
```

This loads:
- 73 ISO 9001:2015 sections
- 27 audit questions
- Sample users
- Sample assessment

---

## Frontend Setup

### Dependencies

```bash
cd frontend
npm install
```

### Build Next.js

```bash
cd frontend
npm run build
# Output in .next/
```

### Run Tests

```bash
cd frontend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Generate Static Site (Optional)

```bash
cd frontend
npm run export
# Output in out/
```

---

## Docker Setup

### Build Images

```bash
# Backend
docker build -f docker/Dockerfile.backend -t iso9001-backend .

# Frontend
docker build -f docker/Dockerfile.frontend -t iso9001-frontend .
```

### Run with Docker Compose

```bash
# Development
docker-compose -f docker/docker-compose.dev.yml up

# Production
docker-compose -f docker/docker-compose.yml up -d
```

### Database in Docker

PostgreSQL will be created automatically with:
- Volume: `postgres_data` (persistent storage)
- Port: 5432
- User: `iso9001_user`
- Password: Set in `.env`

---

## Verification Checklist

After setup, verify everything works:

- [ ] Backend starts without errors
- [ ] Frontend loads in browser
- [ ] Can login with test user
- [ ] Database migrations ran successfully
- [ ] Seed data loaded (73 sections, 27 questions)
- [ ] Tests pass (backend and frontend)
- [ ] No console errors in browser
- [ ] API calls return correct responses

### Test Backend

```bash
cd backend
npm test -- auth
# Should pass all auth tests
```

### Test Frontend

```bash
cd frontend
npm test -- Button
# Should pass Button component tests
```

### Manual Test

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Get assessments (replace TOKEN)
curl http://localhost:5000/api/assessments \
  -H "Authorization: Bearer TOKEN"
```

---

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
1. Check PostgreSQL is running: `psql -U postgres`
2. Verify DATABASE_URL in backend/.env
3. Check database name exists: `psql -U postgres -l`

### Port Already in Use

```
Error: listen EADDRINUSE :::5000
```

**Solution:**
```bash
# Find process on port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or use different port
PORT=5001 npm run dev
```

### Module Not Found

```
Error: Cannot find module 'prisma/client'
```

**Solution:**
```bash
cd backend
npm run db:generate
npm install
npm run dev
```

### Seed Fails

```
Error: Missing section/question data
```

**Solution:**
```bash
# Recreate database
npx prisma migrate reset --force

# Or manually push and seed
npm run db:push
npm run db:seed
```

### Next.js Cache Issues

```bash
# Clear cache
rm -rf frontend/.next

# Rebuild
npm run build
```

---

## Environment Variables

### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | - | PostgreSQL connection string |
| NODE_ENV | development | development or production |
| PORT | 5000 | API server port |
| JWT_SECRET | - | JWT signing secret (change!) |
| JWT_REFRESH_SECRET | - | JWT refresh secret (change!) |
| LOG_LEVEL | info | info, warn, error, debug |
| CORS_ORIGIN | http://localhost:3000 | Allowed CORS origin |

### Frontend

| Variable | Default | Description |
|----------|---------|-------------|
| NEXT_PUBLIC_API_URL | http://localhost:5000 | Backend API URL |
| NEXT_PUBLIC_ENV | development | development or production |

---

## File Structure After Setup

```
Selfassessment-app/
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── node_modules/     (installed)
│   ├── dist/             (after build)
│   ├── .env              (configured)
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── node_modules/     (installed)
│   ├── .next/            (after build)
│   ├── .env.local        (configured)
│   └── package.json
│
├── docs/                 (documentation)
├── presentations/        (presentation files)
├── docker/              (Docker files)
├── scripts/             (utility scripts)
├── node_modules/        (root dependencies)
└── package.json
```

---

## Development Workflow

### Make Code Changes

1. Edit files in `backend/src/` or `frontend/src/`
2. Save changes
3. Changes auto-reload (HMR)
4. Check console for errors

### Add Database Field

1. Edit `backend/prisma/schema.prisma`
2. Run migration: `npm run db:push`
3. Regenerate Prisma client: `npm run db:generate`
4. Update TypeScript types if needed

### Add New API Endpoint

1. Create route handler in `backend/src/routes/`
2. Create controller in `backend/src/controllers/`
3. Create service in `backend/src/services/`
4. Add tests in `backend/src/__tests__/`
5. Update frontend API client: `frontend/src/lib/api.ts`

### Add New Frontend Component

1. Create component in `frontend/src/components/`
2. Add tests in `frontend/src/__tests__/`
3. Use in pages: `frontend/src/app/`

---

## Next Steps

- [ ] Complete setup above
- [ ] Run tests to verify
- [ ] Review API documentation (see docs/API.md)
- [ ] Explore the application
- [ ] Create first assessment
- [ ] Run through complete audit workflow
- [ ] Review deployment guide (see docs/DEPLOYMENT.md)

---

## Support

For issues:
1. Check logs: `backend/logs/combined.log`
2. Check browser console (F12)
3. See docs/TROUBLESHOOTING.md
4. Check docs/API.md for endpoint details

---

Last Updated: March 24, 2026
Version: 1.0
