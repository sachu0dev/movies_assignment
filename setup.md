# Setup Guide for Favorite Movies & TV Shows

This guide will help you set up and run the complete full-stack application.

## Prerequisites

- Node.js 18+
- MySQL database
- Cloudinary account (free tier available)

## Quick Setup

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

1. Create a MySQL database named `movies_db`
2. Copy the environment file:
   ```bash
   cd backend
   cp env.example .env
   ```
3. Update `.env` with your database credentials:
   ```
   DATABASE_URL="mysql://username:password@localhost:3306/movies_db"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN="http://localhost:5173"
   ```

### 3. Database Migration & Seeding

```bash
cd backend
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

### 4. Frontend Environment

```bash
cd frontend
cp env.example .env
```

Update `.env`:

```
VITE_API_URL=http://localhost:5000
```

### 5. Run the Application

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

## Demo Credentials

After running the seed script, you can use these demo accounts:

- **Email:** john@example.com | **Password:** password123
- **Email:** jane@example.com | **Password:** password123
- **Email:** mike@example.com | **Password:** password123

## Features Available

### Authentication

- ✅ Register new account
- ✅ Login with existing account
- ✅ JWT-based authentication
- ✅ Protected routes

### My List (Personal Entries)

- ✅ Create new movie/TV entries
- ✅ View your personal entries
- ✅ Edit existing entries
- ✅ Delete entries
- ✅ Release entries to community

### Community

- ✅ View all public entries
- ✅ Like/Dislike entries
- ✅ Sort by popularity (likes)
- ✅ Infinite scroll

### Search & Filters

- ✅ Search by title/director
- ✅ Filter by type (Movie/TV)
- ✅ Filter by year
- ✅ Advanced search with multiple criteria

### Image Upload

- ✅ Upload poster images
- ✅ Cloudinary integration
- ✅ Image optimization

## API Endpoints

### Authentication

- `POST /auth/register` - Register user
- `POST /auth/login` - Login user

### Entries

- `POST /entries` - Create entry
- `GET /entries/my` - Get user's entries
- `GET /entries/community` - Get public entries
- `PUT /entries/:id` - Update entry
- `DELETE /entries/:id` - Delete entry
- `POST /entries/:id/release` - Release to community
- `POST /entries/:id/like` - Like entry
- `POST /entries/:id/dislike` - Dislike entry
- `GET /entries/search` - Search entries

### Upload

- `POST /upload` - Upload image

## Tech Stack

### Backend

- Node.js with Express
- TypeScript
- MySQL with Prisma ORM
- JWT authentication
- Zod validation
- Cloudinary for image upload

### Frontend

- React 18 with Vite
- TypeScript
- TailwindCSS
- Shadcn UI components
- React Query for data fetching
- React Router for navigation
- React Hook Form for forms

## Troubleshooting

### Common Issues

1. **Database Connection Error**

   - Ensure MySQL is running
   - Check database credentials in `.env`
   - Verify database `movies_db` exists

2. **CORS Error**

   - Check `CORS_ORIGIN` in backend `.env`
   - Ensure frontend URL matches

3. **Image Upload Fails**

   - Verify Cloudinary credentials
   - Check file size (max 5MB)
   - Ensure file is an image

4. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT_SECRET in backend `.env`
   - Verify token expiration

### Development Commands

```bash
# Backend
npm run dev          # Start development server
npm run build        # Build for production
npm run db:studio    # Open Prisma Studio

# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Project Structure

```
movies-assignment/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth middleware
│   │   ├── utils/          # Validation schemas
│   │   └── types/          # TypeScript types
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed data
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── lib/           # Utilities
│   │   └── types/         # TypeScript types
│   └── package.json
└── README.md
```

## Next Steps

1. **Customization**: Modify the UI theme in `tailwind.config.js`
2. **Features**: Add new features like comments, ratings, etc.
3. **Deployment**: Deploy to platforms like Vercel, Netlify, or Heroku
4. **Testing**: Add unit and integration tests
5. **Performance**: Implement caching and optimization

## Support

If you encounter any issues:

1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check the database connection and schema

The application is now ready to use! 🎉
