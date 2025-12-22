# TechChat Backend

Modern real-time chat application backend built with Node.js, MongoDB, and Socket.IO.

## Features

- User registration and authentication with JWT
- Real-time messaging with Socket.IO
- Online/offline user status tracking
- Message persistence with MongoDB
- RESTful API endpoints
- Clean architecture with separation of concerns

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)

## Installation

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file from the example:

```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/techchat
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

## Running the Server

### Development mode (with auto-reload):

```bash
npm run dev
```

### Production mode:

```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user (requires auth)
- `GET /api/auth/me` - Get current user (requires auth)

### Chat

- `GET /api/chat/users` - Get all users (requires auth)
- `GET /api/chat/conversation/:userId` - Get conversation with user (requires auth)
- `PUT /api/chat/messages/:userId/read` - Mark messages as read (requires auth)
- `GET /api/chat/unread` - Get unread message count (requires auth)

### Health

- `GET /api/health` - Server health check

## Socket.IO Events

### Client to Server

- `send_message` - Send a message
- `typing` - Indicate typing status

### Server to Client

- `receive_message` - Receive a new message
- `message_sent` - Confirmation of sent message
- `user_status_changed` - User online/offline status changed
- `user_typing` - User typing indicator

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Express middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── socket/         # Socket.IO handlers
│   ├── utils/          # Utility functions
│   └── server.js       # Application entry point
├── .env.example        # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Technologies

- **Express.js** - Web framework
- **MongoDB** - Database
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## License

ISC
