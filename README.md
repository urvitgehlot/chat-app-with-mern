# Real-Time Chat Application

A modern, real-time chat application built with the MERN (MongoDB, Express.js, React, Node.js) stack. This application supports both direct messaging and group conversations with file attachments, providing a complete communication platform.

## 🚧 **UNDER DEVELOPMENT** 🚧

This project is currently in active development. Features and documentation are being continuously improved and expanded.

## Features

### Core Functionality
- **Real-time messaging** - Send and receive messages instantly
- **Direct Messaging** - One-on-one private conversations
- **Group Chat** - Create and participate in group conversations
- **User Authentication** - Secure JWT-based authentication system
- **File Attachments** - Share images, documents, and other files
- **Message Reactions** - React to messages with emojis
- **Read Receipts** - See when messages have been read
- **User Presence** - Track online/offline status
- **Message Replies** - Reply to specific messages in conversations

### Technical Features
- **Responsive Design** - Works seamlessly across desktop and mobile devices
- **Modern UI** - Clean, intuitive interface built with TailwindCSS
- **File Upload** - Cloudinary integration for reliable file storage
- **Database Optimization** - Efficient MongoDB schema design
- **Security** - Password hashing, JWT tokens, and input validation
- **RESTful API** - Well-structured API endpoints

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Cloud storage for attachments

### Frontend
- **React 19** - Frontend library
- **Vite** - Build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hook Form** - Form handling and validation

## Project Structure

```
chat-app with mern/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Custom middleware
│   │   ├── utils/           # Utility functions
│   │   ├── db/              # Database connection
│   │   ├── constants.js     # Application constants
│   │   ├── app.js           # Express app setup
│   │   └── index.js         # Server entry point
│   ├── public/              # Static files
│   ├── package.json
│   └── sample.env           # Environment variables template
│
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── assets/          # Static assets
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Global styles
│   ├── public/              # Public static files
│   ├── package.json
│   └── vite.config.js       # Vite configuration
│
└── README.md               # This file
```

## Database Models

- **User** - User accounts with authentication
- **Message** - Individual messages in conversations
- **Group** - Group chat configurations
- **GroupMembership** - Group membership management
- **DirectChat** - Direct conversation tracking
- **Attachment** - File attachment metadata
- **MessageReaction** - Message reaction tracking
- **ReadReceipt** - Message read status

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Copy `sample.env` to `.env`
   - Configure your environment variables:
     ```
     PORT=5000
     MONGODB_URI=your_mongodb_connection_string
     ACCESS_TOKEN_SECRET=your_jwt_access_secret
     REFRESH_TOKEN_SECRET=your_jwt_refresh_secret
     ACCESS_TOKEN_EXPIRY=1d
     REFRESH_TOKEN_EXPIRY=7d
     CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     CLOUDINARY_API_KEY=your_cloudinary_api_key
     CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Copy `sample.env` to `.env`
   - Configure your environment variables:
     ```
     VITE_API_BASE_URL=http://localhost:5000/api/v1
     ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### User Management
- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User login
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `POST /api/v1/users/logout` - User logout

### Messaging
- `GET /api/v1/messages` - Get messages for a conversation
- `POST /api/v1/messages` - Send a new message
- `PUT /api/v1/messages/:id` - Edit a message
- `DELETE /api/v1/messages/:id` - Delete a message
- `POST /api/v1/messages/:id/reactions` - Add reaction to message

*More endpoints being added as development progresses*

## Development Status

### ✅ Completed Features
- User authentication system
- Database schema design
- API structure and routing
- File upload infrastructure
- Basic frontend setup

### 🚧 In Progress
- Frontend UI components
- Real-time messaging implementation
- Group chat functionality
- Message reactions and read receipts

### 📋 Planned Features
- Voice and video calls
- Message search functionality
- User status and presence indicators
- Push notifications
- Mobile app version
- Message encryption
- Advanced group management features

## Contributing

This project is in active development. Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Input validation and sanitization implemented
- File upload restrictions and validation
- CORS configuration for API security

## Performance Optimizations

- Efficient database queries with proper indexing
- File compression and optimization
- Client-side caching strategies
- Bundle optimization with Vite

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Contact

For questions, suggestions, or collaboration opportunities, please reach out to the development team.

---

**Note:** This project is currently under active development. APIs, features, and documentation may change as development progresses. Thank you for your interest in our chat application!
