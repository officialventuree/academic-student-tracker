# Academic Student Tracker

A comprehensive academic management system for secondary schools with role-based access for Admins and Teachers.

## Features

- **Role-based access control**: Admin and Teacher roles
- **Student management**: Add, edit, and track students across all forms
- **Assessment tracking**: US1, US2, UASA (Semester 1), US3, US4, UASA2 (Semester 2)
- **Assignment management**: Track assignments and submissions
- **Attendance tracking**: Mark and monitor attendance
- **Carry mark calculation**: Automatic calculation with predefined weightages
- **PDF report generation**: Professional academic reports
- **User management**: Admin panel to manage user accounts

## Project Structure

```
academic-co-curricular-system/
├── backend/          # Node.js/Express.js server
│   ├── controllers/  # API controllers
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   ├── middleware/   # Authentication middleware
│   ├── utils/        # Utility functions
│   ├── config/       # Configuration files
│   ├── .env          # Environment variables
│   └── server.js     # Main server file
└── frontend/         # React/Vite application
    ├── src/
    │   ├── components/   # React components
    │   ├── context/      # React context
    │   └── App.jsx       # Main application component
    ├── public/
    ├── package.json
    └── vite.config.js
```

## Deployment Instructions

### Frontend Deployment to Vercel

1. **Prepare the frontend for deployment**:
   - Ensure all API calls use relative paths (which is already implemented)
   - The frontend build process is configured to work with Vercel

2. **Deploy to Vercel**:
   - Go to [Vercel](https://vercel.com)
   - Sign in and click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect this is a Vite project
   - In the build settings:
     - Build Command: `npm run build` or `yarn build`
     - Output Directory: `dist`
     - Root Directory: `frontend`

3. **Environment Variables** (if needed):
   - `REACT_APP_API_URL`: Set this to your backend API URL (e.g., `https://your-backend-app.onrender.com`)

### Backend Deployment

The backend needs to be deployed separately from the frontend. Here are some options:

#### Option 1: Deploy to Render
1. Create an account at [Render](https://render.com)
2. Create a new Web Service
3. Connect to your GitHub repository
4. Set the environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `process.env.PORT` (Render will set this automatically)
   - `JWT_SECRET`: Your secret key
   - `JWT_REFRESH_SECRET`: Your refresh token secret
   - `MONGODB_URI`: Your MongoDB connection string
5. Build command: `npm install`
6. Start command: `node server.js`

#### Option 2: Deploy to Heroku
1. Create an account at [Heroku](https://heroku.com)
2. Create new app
3. Deploy using GitHub integration
4. Set config vars in Settings:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: Your secret key
   - `JWT_REFRESH_SECRET`: Your refresh token secret
   - `MONGODB_URI`: Your MongoDB connection string

### Important Notes

- The frontend and backend are deployed separately
- The frontend expects the backend to be available at the same domain in production (or configured via environment variable)
- CORS is configured to allow the deployment domain
- Make sure to set up a production MongoDB database
- Use strong secrets for JWT tokens in production

## Environment Variables

### Frontend (.env file or Vercel dashboard)
```
REACT_APP_API_URL=https://your-backend-app.onrender.com
```

### Backend (.env file or environment variables)
```
NODE_ENV=production
PORT=5000
JWT_SECRET=your_production_secret_key
JWT_REFRESH_SECRET=your_production_refresh_secret
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
```

## Technologies Used

- **Frontend**: React, Vite, Material UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT with refresh tokens
- **Styling**: Material UI
- **Deployment**: Vercel (frontend), Render/Heroku (backend)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (admin only)
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/users` - Get all users (admin only)
- `GET /api/auth/users/:id` - Get specific user (admin only)
- `PUT /api/auth/users/:id` - Update user (admin only)
- `DELETE /api/auth/users/:id` - Delete user (admin only)

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create student
- `GET /api/students/:id` - Get specific student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create class
- `GET /api/classes/:id` - Get specific class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Assessments
- `GET /api/assessments` - Get all assessments
- `POST /api/assessments` - Create assessment
- `GET /api/assessments/:id` - Get specific assessment
- `PUT /api/assessments/:id` - Update assessment
- `DELETE /api/assessments/:id` - Delete assessment

### Other endpoints for assignments, attendance, carry marks, and PDF generation follow similar patterns.

## Security Features

- JWT-based authentication with access and refresh tokens
- HTTP-only cookies for refresh tokens
- Role-based access control
- Input validation
- Password hashing
- Secure token storage and handling

## License

MIT