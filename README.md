# Favorite Movies & TV Shows

A full-stack web application for managing and sharing your favorite movies and TV shows.

## 🚀 Features

- **Authentication**: Register/Login with JWT
- **Personal Library**: Create and manage your own movie/TV entries
- **Community**: Share and discover entries from other users
- **Image Upload**: Upload posters using Cloudinary
- **Search & Filters**: Find entries by title, director, type, year, etc.
- **Like/Dislike System**: Rate community entries
- **Infinite Scroll**: Smooth browsing experience

## 🛠 Tech Stack

### Frontend

- React 18 with Vite and TypeScript
- TailwindCSS for styling
- Shadcn UI components
- Axios + React Query for API requests
- React Router for navigation

### Backend

- Node.js with Express and TypeScript
- MySQL database with Prisma ORM
- JWT for authentication
- Zod for input validation
- Multer + Cloudinary for image upload

## 📁 Project Structure

```
movies-assignment/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── README.md         # This file
└── .gitignore        # Git ignore file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MySQL database
- Cloudinary account

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Update `.env` with your credentials:

```
DATABASE_URL="mysql://username:password@localhost:3306/movies_db"
JWT_SECRET="your-super-secret-jwt-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
PORT=5000
```

5. Set up database:

```bash
npx prisma migrate dev
npx prisma db seed
```

6. Start the server:

```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Update `.env` with backend URL:

```
VITE_API_URL=http://localhost:5000
```

5. Start the development server:

```bash
npm run dev
```

## 📚 API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Entries

- `POST /entries` - Create new entry
- `GET /entries/my` - Get user's entries
- `GET /entries/community` - Get public entries
- `PUT /entries/:id` - Update entry
- `DELETE /entries/:id` - Delete entry
- `POST /entries/:id/release` - Release to community
- `POST /entries/:id/like` - Like entry
- `POST /entries/:id/dislike` - Dislike entry
- `GET /entries/search` - Search and filter entries

### Upload

- `POST /upload` - Upload image to Cloudinary

## 🎨 UI Components

- **Authentication Pages**: Register and Login forms
- **Home Page**: My List and Community sections
- **Entry Form**: Create/Edit movie/TV entries
- **Entry List**: Display entries with infinite scroll
- **Search & Filters**: Advanced search functionality
- **Image Upload**: Drag & drop image upload

## 🔐 Security Features

- JWT-based authentication
- Protected routes
- Input validation with Zod
- Secure password hashing
- CORS configuration

## 📱 Responsive Design

The application is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.
