#!/bin/bash

echo "🎬 Setting up Favorite Movies & TV Shows Application"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Generate Prisma client
echo ""
echo "🗄️  Generating Prisma client..."
cd ../backend
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Create a MySQL database named 'movies_db'"
echo "2. Copy environment files:"
echo "   - cp backend/env.example backend/.env"
echo "   - cp frontend/env.example frontend/.env"
echo "3. Update backend/.env with your database and Cloudinary credentials"
echo "4. Run database migrations:"
echo "   cd backend && npx prisma migrate dev"
echo "5. Seed the database:"
echo "   npx prisma db seed"
echo "6. Start the application:"
echo "   - Backend: cd backend && npm run dev"
echo "   - Frontend: cd frontend && npm run dev"
echo ""
echo "🎉 Happy coding!" 