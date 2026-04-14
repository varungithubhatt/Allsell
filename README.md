# ALLsell - Multi-vendor E-commerce Platform

ALLsell is a full-stack demo platform where users can register, create one shop, manage products in their own shop, and explore all shops/products. Admin users can moderate the platform.

## Tech Stack

- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt
- Frontend: React (Vite), React Router, Axios
- Security/Utilities: Helmet, CORS, custom input sanitization, express-validator
- Optional image upload: Cloudinary

## Project Structure

```text
backend/
  controllers/
  models/
  routes/
  middleware/
  config/
  utils/
  app.js
  server.js
frontend/
  src/
    pages/
    components/
    services/
    App.jsx
    main.jsx
```

## Setup Instructions

## 1) Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Required backend env vars in `.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/allsell
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN=7d
```

Optional Cloudinary vars:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## 2) Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend env var:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## API Base URL

All endpoints are versioned under:

```text
/api/v1
```

## Authentication

- JWT is returned on register/login.
- Send token in header for protected routes:

```text
Authorization: Bearer <token>
```

## API Endpoints

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

### Shop

- `POST /api/v1/shops` (authenticated; one shop per user)
- `GET /api/v1/shops`
- `GET /api/v1/shops/:id`
- `DELETE /api/v1/shops/:id` (admin only)

### Product

- `POST /api/v1/products` (authenticated; under owner's shop)
- `GET /api/v1/products` (supports `page` and `limit` query)
- `GET /api/v1/products/:id`
- `PUT /api/v1/products/:id` (owner only)
- `DELETE /api/v1/products/:id` (owner or admin)

### Admin

- `GET /api/v1/admin/users`
- `GET /api/v1/admin/shops`
- `GET /api/v1/admin/products`

## Request/Response Samples

### Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "123456"
}
```

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "<jwt>",
  "data": {
    "user": {
      "id": "...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user"
    }
  }
}
```

### Error Format

```json
{
  "success": false,
  "message": "Error message"
}
```

## Postman Documentation

Import this collection:

- `backend/ALLsell.postman_collection.json`

It includes sample requests for auth, shop, products, and admin APIs.

## Validation & Security Notes

- Email format validated.
- Password minimum length is 6.
- Required fields validated in route-level validators.
- Passwords hashed with bcrypt.
- JWT with expiry for auth sessions.
- Protected routes via auth middleware.
- Role-based access for admin routes.
- Input sanitization removes potentially unsafe keys (`$`, `.`).

## Scalability Notes

- Microservices: split auth, catalog, and order domains into independent services.
- Redis caching: cache frequently requested products/shops and session-like data.
- Load balancing: distribute traffic across API instances behind Nginx or cloud LB.
- Horizontal scaling: run multiple stateless backend instances with shared DB/cache.

## Frontend Features Implemented

- Register and Login pages.
- JWT storage in localStorage.
- Protected routes (dashboard and create shop).
- Dashboard with user info, shop info, and product CRUD.
- Explore page for all shops and products.
- API integration through `frontend/src/services/api.js`.
- Loading and success/error states in pages.
