# NestJS Chat API Documentation

## Overview
This API provides a real-time chat system using NestJS, supporting both REST and WebSocket communication. It features JWT authentication, private and group messaging, message persistence, message history, rate limiting, logging with log rotation, and CORS for browser-based clients.

---

## Features
- **JWT Authentication** for REST and WebSocket connections
- **Private Messaging** between users
- **Group Messaging** (join, leave, send to group)
- **Message Persistence** (messages stored in the database)
- **Message History** endpoints (REST and WebSocket)
- **Rate Limiting** (100 requests per 15 minutes per IP)
- **Logging with Log Rotation** (Winston + daily rotate)
- **CORS enabled** for browser clients
- **Swagger UI** for REST API documentation

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <https://github.com/Aliyugambo/nest-api-project.git>
cd nest-api-project
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Edit the `.env` file with your database and JWT settings. Example:
```
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
DB_SSL=true
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=3600
```

### 4. Run Database Migrations/Seed (if needed)
```bash
npm run seed:admin
```

### 5. Start the API
```bash
npm run start:dev
```

### 6. Access Swagger UI
- User API: [http://localhost:3000/api/docs/user](http://localhost:3000/api/docs/user)
- Admin API: [http://localhost:3000/api/docs/admin](http://localhost:3000/api/docs/admin)

---

## REST Endpoints
- **POST /auth/login** — Login and receive JWT
- **POST /auth/signup** — Register a new user
- **GET /users/private-messages?recipient=USER_ID** — Fetch private message history (JWT required)
- **GET /users/group-messages?group=GROUP_NAME** — Fetch group message history (JWT required)

## WebSocket Events
- **register**: `{ token }` — Authenticate socket
- **privateMessage**: `{ to, message }` — Send private message
- **groupMessage**: `{ group, message }` — Send group message
- **joinGroup**: `{ group }` — Join a group
- **leaveGroup**: `{ group }` — Leave a group
- **fetchPrivateHistory**: `{ recipient }` — Fetch private message history
- **fetchGroupHistory**: `{ group }` — Fetch group message history

---

## Rate Limiting
All HTTP endpoints are rate-limited to 100 requests per 15 minutes per IP. Exceeding this limit returns a 429 error.

## Logging
All requests and key WebSocket events are logged to `logs/app-YYYY-MM-DD.log` and the console. Logs are rotated daily and kept for 14 days.

---

## Example Client Setup
- Use `client.html` and `client2.html` for browser-based chat testing.
- Use Swagger UI to test REST endpoints.

---

## Troubleshooting
- Ensure your database is running and credentials are correct.
- Check the `logs/` directory for error logs.
- Use different browsers/incognito windows for multiple users.

---

## Contact
For questions or issues, please contact the project maintainer.
