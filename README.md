# Innovation Project

A modern Node.js backend API for managing recipes, dietary preferences, and user nutrition information with AI-powered recipe generation capabilities.

## Features

- **User Authentication**: JWT-based authentication with refresh tokens and secure cookie handling
- **Recipe Management**: Create, update, publish, and manage recipe drafts with AI-powered generation
- **Dietary Preferences**: Track user dietary preferences and allergen information
- **Nutrition Tracking**: Store and retrieve nutrition information for recipes (calories, protein, carbs, fat)
- **Rate Limiting**: API rate limiting for authentication and general endpoints
- **Security**: Helmet for HTTP headers, CORS configuration, input sanitization, bcrypt password hashing
- **Data Validation**: Zod schema validation for all request bodies
- **Error Handling**: Comprehensive error handling middleware with proper HTTP status codes

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (jsonwebtoken) with bcrypt password hashing
- **Security**: Helmet, CORS, Express Rate Limit, Input Sanitization
- **Validation**: Zod
- **Development**: Nodemon for hot reloading
- **HTTP Client**: Axios
- **Cookie Handling**: cookie-parser

## Project Structure

```
src/
├── app.js                 # Express app configuration
├── server.js             # Server entry point
├── controllers/          # Request handlers
│   ├── auth.controller.js
│   ├── diet.controller.js
│   ├── recipe.controller.js
│   └── user.controller.js
├── routes/               # API route definitions
│   ├── auth.routes.js
│   ├── diet.routes.js
│   ├── recipe.routes.js
│   └── user.routes.js
├── services/             # Business logic layer
│   ├── auth.service.js
│   ├── diet.service.js
│   ├── recipe.service.js
│   └── user.service.js
├── repositories/         # Data access layer
│   ├── auth.repository.js
│   ├── diet.repository.js
│   ├── recipe.repository.js
│   └── user.repository.js
├── middlewares/          # Express middlewares
│   ├── auth.middleware.js
│   ├── errorHandling.middleware.js
│   ├── inputSanitisation.middleware.js
│   └── rateLimit.middleware.js
├── schemas/              # Zod validation schemas
│   ├── auth/
│   ├── recipe/
│   └── user/
├── utils/                # Utility functions
│   ├── client.js
│   └── tokens.js
└── errors/               # Custom error classes
    └── http.error.js
```

## Database Schema

### Core Models

- **User**: User account with authentication credentials
- **RefreshToken**: Refresh token storage for JWT token rotation
- **Recipe**: Recipe records with status (DRAFT/PUBLISHED) and nutritional data
- **NutritionInfo**: Nutrition details (calories, protein, carbs, fat)
- **UserDietaryPreference**: Many-to-many relationship between users and dietary preferences
- **DietaryPreference**: Reference table for dietary restriction types
- **userAllergen**: Many-to-many relationship between users and allergens
- **Allergen**: Reference table for common allergens

## Installation

### Prerequisites

- Node.js 16+
- PostgreSQL database
- npm or yarn

### Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd Innovation-Project
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root with the following variables:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/innovation_db
PORT=3000
FRONTEND_ORIGIN=http://localhost:3000
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_EXPIRE=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Generate Prisma Client:
```bash
npx prisma generate
```

## Running the Server

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user (returns access token + refresh token cookie)
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user (clears refresh token)

### Users
- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update user profile
- `DELETE /users/me` - Delete user account
- `POST /users/allergens` - Add allergen to user profile
- `POST /users/dietary-preferences` - Add dietary preference to user profile

### Recipes
- `GET /recipes` - List user's recipes
- `POST /recipes/generate-drafts` - Generate recipe drafts using AI
- `POST /recipes` - Create a recipe
- `PATCH /recipes/:id` - Update recipe
- `POST /recipes/:id/publish` - Publish recipe draft

### Diet
- `GET /diet/preferences` - Get available dietary preferences
- `GET /diet/allergens` - Get available allergens

## Security Features

- **Helmet**: Sets HTTP headers for security
- **CORS**: Configured to accept requests only from specified frontend origin
- **Rate Limiting**: 
  - Authentication endpoints: Limited to prevent brute force attacks
  - General API endpoints: Limited to prevent abuse
- **Cookie Security**: 
  - Secure flag for production
  - HttpOnly flag to prevent XSS attacks
  - SameSite policy configured
- **Password Hashing**: bcrypt with automatic salt rounds
- **Input Sanitization**: Middleware to sanitize all inputs
- **Error Handling**: Generic error messages in responses (detailed logs server-side only)

## Important Notes

### Cookie Handling
- Refresh tokens are stored in httpOnly cookies
- For local development with `localhost`, ensure `secure: false` is set
- Cookie options must be consistent between `res.cookie()` and `res.clearCookie()` calls
- The `/auth/refresh` endpoint is NOT protected by access token middleware (allows token refresh when expired)

### Token Management
- Access tokens expire in 15 minutes (configurable via `JWT_EXPIRE`)
- Refresh tokens expire in 7 days (configurable via `REFRESH_TOKEN_EXPIRES_IN`)
- Ensure `RefreshToken.expiresAt` in the database matches the JWT expiry time

### Recipe Generation
- AI-powered recipe generation via n8n/LLM integration
- Response parsing handles various JSON formats (plain JSON, JSON strings, fenced JSON)
- Supports extraction of recipes from mixed prose responses

## Development

### Database Migrations
Create a new migration after schema changes:
```bash
npx prisma migrate dev --name migration_name
```

View database with Prisma Studio:
```bash
npx prisma studio
```

Reset database (development only):
```bash
npx prisma migrate reset
```

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Server port | 3000 |
| `FRONTEND_ORIGIN` | Allowed frontend origin for CORS | Required |
| `NODE_ENV` | Environment (development/production) | development |
| `JWT_SECRET` | Secret key for signing JWTs | Required |
| `JWT_EXPIRE` | Access token expiration time | 15m |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token expiration time | 7d |
