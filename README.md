# Blog Project with Face ID Authentication

A modern, secure blog application featuring dual authentication mechanisms: traditional email/password login and innovative face ID recognition. Built with Laravel 11, React, and face-api.js for biometric authentication.

## Features

### Authentication & Security
- 🔐 **Dual Authentication**: Email/password and Face ID login
- 👤 **Face Descriptor Storage**: Stores 128-value face descriptors during registration
- 🎯 **Face Matching**: Uses Euclidean distance algorithm (threshold: 0.5) for secure face recognition
- 🔑 **Secure Password Hashing**: Industry-standard bcrypt password encryption

### Blogging Capabilities
- ✍️ **Post Management**: Create, edit, and publish blog posts
- 🏷️ **Categories**: Organize posts with multiple categories
- 💬 **Comments**: Readers can comment on posts with moderation
- 👥 **User Profiles**: Personalized user profiles and dashboard

### Admin Dashboard
- 📊 **Analytics Dashboard**: Real-time statistics and charts
- 📈 **User Analytics**: Track user registrations over time
- 📝 **Post Management**: Monitor posts and publishing status
- 👨‍💼 **Admin Controls**: User management, post approval, comment moderation

## Tech Stack

### Backend
- **Framework**: Laravel 11
- **Language**: PHP 8.3+
- **Database**: MySQL/MariaDB
- **ORM**: Eloquent
- **Database Migrations**: Laravel Migrations

### Frontend
- **Framework**: React 18+
- **Bundler**: Vite 7.3.1
- **Server-Side Rendering**: Inertia.js
- **Styling**: Tailwind CSS
- **Face Recognition**: face-api.js

### Development Tools
- **NPM**: Package management
- **Composer**: PHP dependency management
- **Laravel Artisan**: Command-line interface

## Installation

### Prerequisites
- PHP 8.3 or higher
- MySQL/MariaDB
- Node.js 18+ and NPM
- Composer
- A development server (Laragon, Valet, or similar)

### Setup Steps

1. **Clone the repository** (or extract the project files)
   ```bash
   cd blogproject
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node dependencies**
   ```bash
   npm install
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your database credentials and other settings.

5. **Generate application key**
   ```bash
   php artisan key:generate
   ```

6. **Run database migrations**
   ```bash
   php artisan migrate
   ```

7. **Seed the database** (optional - creates admin user)
   ```bash
   php artisan db:seed
   ```

8. **Build frontend assets**
   ```bash
   npm run build
   ```

9. **Start the development server**
   ```bash
   php artisan serve
   ```

   The application will be available at `http://localhost:8000`

## Usage

### Regular User Registration
1. Click "Register" on the login page
2. Enter name, email, and password
3. **Optional**: Enable face ID capture during registration
   - Allow camera access
   - Face will be detected and stored as 128-value descriptor
4. Click "Register" to create account

### Login
**Password Login**:
1. Enter email and password
2. Click "Login"

**Face ID Login**:
1. Click "Login with Face ID"
2. Allow camera access
3. Face will be detected and matched against registered descriptors
4. Automatic login if match found (distance < 0.5)

### Dashboard
- After login, view personalized dashboard with greeting
- See your profile information
- (Admin users: Redirected to admin dashboard with analytics)

### Admin Dashboard
- Access statistics: total users, posts, comments
- View user registration trends (last 30 days)
- Monitor post creation activity
- Review top users by post count
- Manage posts and comments
- Only accessible to users with `is_admin` flag set to true

## Database Schema

### Key Tables
- **users**: Stores user accounts with `face_descriptor` (JSON array) and `is_admin` flag
- **posts**: Blog post content with publishing status
- **categories**: Post categories
- **comments**: User comments on posts
- **category_post**: Many-to-many relationship between categories and posts

### Important Fields
- `users.face_descriptor`: JSON array of 128 numeric values (null for password-only users)
- `users.is_admin`: Boolean flag for admin access

## Face ID Authentication Details

### Face Descriptor Capture
- Uses face-api.js library from CDN
- Requires browser camera access
- Detects single face with landmarks
- Extracts 128-dimensional descriptor vector
- Stores as JSON array in database

### Face Matching Algorithm
- Calculates Euclidean distance between descriptors
- Distance < 0.5: Match found, user logged in
- Distance ≥ 0.5: No match, login fails
- Only matches non-admin users (admins use password)

### Browser Requirements
- Modern browser with WebRTC support
- Camera device and permissions
- JavaScript enabled

## Environment Configuration

Key `.env` variables:
```
APP_NAME=BlogProject
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=blogproject
DB_USERNAME=root
DB_PASSWORD=

FACE_DESCRIPTOR_THRESHOLD=0.5
```

## File Structure

```
resources/
├── js/
│   ├── Pages/
│   │   ├── Admin/Dashboard.jsx      (Admin analytics)
│   │   ├── Auth/Login.jsx           (Dual auth)
│   │   ├── Auth/Register.jsx        (Face capture)
│   │   └── Dashboard.jsx            (User dashboard)
│   └── Layouts/
│       ├── AdminLayout.jsx          (Admin sidebar/nav)
│       └── AuthenticatedLayout.jsx  (User layout)
│
app/
├── Http/
│   ├── Controllers/
│   │   ├── Auth/AuthenticatedSessionController.php  (Face matching)
│   │   ├── Auth/RegisteredUserController.php
│   │   └── Admin/DashboardController.php
│   └── Middleware/
│       ├── AdminMiddleware.php      (Admin route protection)
│       └── HandleInertiaRequests.php
│
database/
├── migrations/           (Schema definitions)
└── seeders/            (Initial data)
```

## API Endpoints

### Authentication
- `POST /login/face` - Face ID login (expects `descriptor` array of 128 numbers)
- `POST /login` - Password login
- `POST /register` - User registration with optional face descriptor
- `POST /logout` - Logout user

### Protected Routes
- `GET /dashboard` - User dashboard (auth middleware)
- `GET /admin/dashboard` - Admin dashboard (auth + admin middleware)

## Troubleshooting

### Face Not Being Detected
- Ensure proper lighting
- Face should be clearly visible
- Browser camera permissions are granted
- Check browser console for face-api.js errors

### Face Login Not Working
- Verify face was captured during registration (check database)
- Check distance threshold (default: 0.5)
- Ensure only non-admin users can use face login

### Admin Dashboard Not Loading
- Verify user has `is_admin = true` in database
- Check middleware configuration in `bootstrap/app.php`
- Clear browser cache and rebuild frontend: `npm run build`

### Database Errors
- Run migrations: `php artisan migrate`
- Check database connection in `.env`

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

This project is open-source software licensed under the [MIT license](https://opensource.org/licenses/MIT).
