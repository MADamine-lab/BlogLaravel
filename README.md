# BlogHub - Real-time Blogging Platform with Face ID Authentication

A modern, secure, real-time blog application featuring dual authentication mechanisms: traditional email/password login and innovative face ID recognition. Built with Laravel 11, React, Inertia.js, and Firebase for real-time blogging capabilities.

## Features

### Authentication & Security
- 🔐 **Dual Authentication**: Email/password and Face ID login
- 👤 **Face Descriptor Storage**: Stores 128-value face descriptors during registration
- 🎯 **Face Matching**: Uses Euclidean distance algorithm (threshold: 0.5) for secure face recognition
- 🔑 **Secure Password Hashing**: Industry-standard bcrypt password encryption
- ✅ **Email Verification**: Secure email-based account verification

### Blogging Capabilities
- ✍️ **Real-time Posts**: Create, publish, and view blog posts in real-time
- 📝 **Instant Feedback**: Posts appear immediately for all users
- 💬 **Live Comments**: Comment on posts and see updates in real-time
- 👥 **User Feed**: See all posts from community members in a unified feed
- 🏠 **User Profile**: Manage profile and view your published posts after login

### Real-time Updates (Firebase)
- 🔴 **Live Post Monitor**: Admin dashboard detects new posts in real-time
- 📡 **Real-time Synchronization**: Comments and posts update instantly across clients
- 📊 **Live Activity Tracking**: See user engagement as it happens
- 🔔 **Instant Notification**: New posts appear immediately without page refresh

### Admin Dashboard
- 📊 **Analytics Dashboard**: Real-time statistics and comprehensive charts
- 📈 **User Analytics**: Track user registrations over the last 30 days
- 📝 **Post Management**: Monitor posts, publishing status, and activity
- 👨‍💼 **Post Monitoring**: Real-time alert section for new posts from Firebase
- 📉 **Engagement Metrics**: View top contributors, posts per category, comment stats
- 🎯 **Performance Tracking**: Charts showing user registrations and post creation trends

## Tech Stack

### Backend
- **Framework**: Laravel 11
- **Language**: PHP 8.3+
- **Database**: MySQL/MariaDB
- **ORM**: Eloquent
- **Database Migrations**: Laravel Migrations
- **API**: RESTful endpoints with JSON responses

### Frontend
- **Framework**: React 18+
- **Bundler**: Vite 7.3.1
- **Server-Side Rendering**: Inertia.js 2.0
- **Styling**: Tailwind CSS 3.2+
- **Face Recognition**: face-api.js
- **HTTP Client**: Axios

### Real-Time & Data
- **Real-time Database**: Firebase Realtime Database
- **Real-time Sync**: Firebase SDK
- **Chart Library**: Chart.js with react-chartjs-2

### Development Tools
- **Package Manager**: NPM & Composer
- **Laravel CLI**: Artisan
- **Database Tools**: Laravel Migrations & Seeders

## Installation

### Prerequisites
- PHP 8.3 or higher
- MySQL/MariaDB
- Node.js 18+ and NPM
- Composer
- A development server (Laragon, Valet, or similar)
- Firebase Project (free tier available at https://firebase.google.com)
- Node.js 18+ and NPM
- Composer
- A development server (Laragon, Valet, or similar)

### Setup Steps

#### 1. Clone or Download Project
```bash
cd blogproject
```

#### 2. Install Dependencies
```bash
# Install PHP dependencies
composer install

# Install Node dependencies
npm install
```

#### 3. Environment Configuration
```bash
cp .env.example .env
```

Update `.env` with your database and Firebase credentials:
```env
# Database Setup
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=blog_db
DB_USERNAME=root
DB_PASSWORD=

# Firebase Configuration (get from Firebase Console)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### 4. Generate Application Key
```bash
php artisan key:generate
```

#### 5. Run Database Migrations
```bash
php artisan migrate
```

#### 6. Seed Database (Optional - Creates Admin User)
```bash
php artisan db:seed
```

#### 7. Build Frontend Assets
```bash
npm run build
```

Or for development with hot reload:
```bash
npm run dev
```

#### 8. Start Development Server
```bash
php artisan serve
```

The application will be available at `http://localhost:8000`

### Firebase Setup

1. **Create Firebase Project**:
   - Go to https://console.firebase.google.com
   - Click "Create Project"
   - Follow the setup wizard

2. **Enable Realtime Database**:
   - In Firebase Console, go to "Realtime Database"
   - Click "Create Database"
   - Start in test mode (change rules to production later)
   - Choose your region

3. **Get Firebase Config**:
   - In Project Settings → Your Apps, create a web app
   - Copy the configuration object
   - Add values to your `.env` file

4. **Configure Database Rules** (for production):
   ```json
   {
     "rules": {
       "posts": {
         ".read": "auth != null",
         ".write": "auth != null",
         "$uid": {
           ".read": true,
           ".write": "$uid === auth.uid"
         }
       }
     }
   }
   ```

## Usage

### User Workflow

#### 1. Registration
- Click "Register" on the login page
- Enter name, email, and password
- Optional: Enable face ID capture during registration
  - Allow camera access
  - Face will be detected and stored as 128-value descriptor
  - During setup, camera and lighting requirements are clearly shown
- Click "Register" to create account

#### 2. Login
**Password Login**:
1. Navigate to login page
2. Enter email and password
3. Click "Login"

**Face ID Login**:
1. Click "Login with Face ID"
2. Allow camera access
3. Face will be detected and matched
4. Automatic login if match found (distance < 0.5)

#### 3. Profile & Dashboard
- After login, you're redirected to your **Profile** page
- View and manage your profile information
- Access controls for password and account deletion
- Ready to start creating posts!

#### 4. Create Posts
1. Navigate to "Feed" section
2. Click "Create Post" button
3. Fill in:
   - **Title**: Post headline
   - **Excerpt**: Brief summary (optional)
   - **Content**: Full post content
4. Click "Publish Post"
5. Post appears immediately on your feed and all users' feeds

#### 5. Browse Feed & Comment
1. Visit the Feed page
2. See all published posts from all users
3. Read posts with author name and publish date
4. View existing comments
5. Add your own comment using the comment form
6. Comments appear in real-time

#### 6. Real-time Updates
- Posts and comments sync in real-time via Firebase
- No page refresh needed - see updates as they happen
- New posts appear automatically for all logged-in users
- New comments display instantly

### Admin Workflow

#### Access Admin Dashboard
1. **Only accessible to users with admin privileges**
2. Navigate to `/admin/dashboard` or use admin navigation
3. If not admin, you'll be blocked with a 403 error

#### Admin Features

**Stats Overview**:
- Total Users with admin count
- Total Posts with published count
- Total Comments with pending count
- Total Categories

**Analytics Charts**:
- User Registrations (last 30 days) - visual trend line
- Posts Created (last 30 days) - activity tracking
- Posts per Category - pie chart distribution
- Top Contributors - users with most posts

**Real-time Posts Monitor**:
- 🔴 **Live section** that updates from Firebase
- Shows newest posts as they're published
- Includes author, timestamp, and status
- Animate live indicator
- Helps admins keep tabs on platform activity

**Recent Posts Section**:
- Latest 5 posts from database
- Shows publication status
- Click to manage individual posts

## Architecture & Data Flow

### Application Flow Diagram
```
1. User Registration/Login
   ↓
2. Profile Page (after login)
   ↓
3. Feed Page (view all posts)
   ↓
4. Create Post (through Create Post page)
   ↓
5. Post published to Database & Firebase
   ↓
6. All connected users see post in real-time (Firebase listener)
   ↓
7. Users can comment on posts
   ↓
8. Admin Dashboard monitors all activity
```

### Database Schema

#### Key Tables
- **users**: Stores user accounts
  - `id`: Primary key
  - `name`: User's display name
  - `email`: Login email
  - `password`: Hashed password
  - `face_descriptor`: JSON array of 128 numeric values (nullable)
  - `is_admin`: Boolean flag for admin access
  - `email_verified_at`: Email verification timestamp

- **posts**: Blog post content
  - `id`: Primary key
  - `user_id`: Foreign key to users
  - `title`: Post title
  - `slug`: URL-friendly title
  - `excerpt`: Short summary
  - `content`: Full post content
  - `featured_image`: Post cover image (nullable)
  - `is_published`: Boolean publication status
  - `published_at`: Publication timestamp

- **comments**: User comments on posts
  - `id`: Primary key
  - `post_id`: Foreign key to posts
  - `user_id`: Foreign key to users
  - `content`: Comment text
  - `is_approved`: Boolean moderation status

- **categories**: Post categories
  - `id`: Primary key
  - `name`: Category name
  - `slug`: URL-friendly name

- **category_post**: Many-to-many relationship
  - `post_id`: Foreign key to posts
  - `category_id`: Foreign key to categories

### Firebase Structure
```
Firebase Realtime Database:
└── posts/
    └── {postId}/
        ├── id: string
        ├── userId: string
        ├── title: string
        ├── content: string
        ├── author: string
        ├── timestamp: number
        └── status: string
```

Posts are synced to Firebase when published for real-time distribution to admin dashboard.

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

### Required `.env` Variables

```env
# App Configuration
APP_NAME=BlogHub
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=blog_db
DB_USERNAME=root
DB_PASSWORD=

# Session Configuration
SESSION_DRIVER=database
SESSION_LIFETIME=120

# Cache & Queue
CACHE_STORE=database
QUEUE_CONNECTION=database

# Firebase Configuration (Required for Real-time Features)
VITE_FIREBASE_API_KEY=........................
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=........................
VITE_FIREBASE_APP_ID=........................
```

### Getting Firebase Credentials

1. Visit https://console.firebase.google.com
2. Create a new project or select existing
3. Go to Project Settings (gear icon)
4. Under "Your apps", create a Web app if needed
5. Copy the config object and use its values

## File Structure

```
resources/
├── js/
│   ├── Pages/
│   │   ├── Admin/Dashboard.jsx      (Admin analytics with real-time monitor)
│   │   ├── Auth/Login.jsx           (Dual authentication)
│   │   ├── Auth/Register.jsx        (Face capture & registration)
│   │   ├── Feed/Index.jsx           (All posts with comments - real-time)
│   │   ├── Posts/Create.jsx         (Create post form - styled like login)
│   │   ├── Dashboard.jsx            (Legacy user dashboard)
│   │   └── Profile/Edit.jsx         (User profile management)
│   │
│   ├── config/
│   │   └── firebase.js              (Firebase initialization & config)
│   │
│   ├── Layouts/
│   │   ├── AdminLayout.jsx          (Admin sidebar/navigation)
│   │   └── AuthenticatedLayout.jsx  (User layout wrapper)
│   │
│   └── Components/
│       └── ApplicationLogo.jsx      (Logo component)
│
app/
├── Http/
│   ├── Controllers/
│   │   ├── Auth/
│   │   │   ├── AuthenticatedSessionController.php  (Login logic with face matching)
│   │   │   ├── RegisteredUserController.php        (Registration & validation)
│   │   │   └── ...other auth controllers
│   │   ├── FeedController.php                      (Fetch all posts)
│   │   ├── PostController.php                      (Create/manage posts)
│   │   ├── CommentController.php                   (Add/manage comments)
│   │   ├── ProfileController.php                   (User profile management)
│   │   └── Admin/
│   │       └── DashboardController.php             (Admin stats & analytics)
│   │
│   └── Middleware/
│       ├── AdminMiddleware.php      (Admin route protection)
│       ├── Authenticate.php
│       └── HandleInertiaRequests.php
│
database/
├── migrations/
│   ├── 0001_01_01_000000_create_users_table.php
│   ├── 2026_03_27_104637_create_posts_table.php
│   ├── 2026_03_27_105214_create_categories_table.php
│   ├── 2026_03_27_105312_create_comments_table.php
│   └── ...other migrations
└── seeders/
    ├── AdminUserSeeder.php         (Creates default admin user)
    └── DatabaseSeeder.php

routes/
├── web.php                          (Main application routes)
├── auth.php                         (Authentication routes)
└── console.php                      (Artisan commands)
```

## API Endpoints

### Authentication
- `POST /login/face` - Face ID login (expects `descriptor` array of 128 numbers)
- `POST /login` - Password login
- `POST /register` - User registration with optional face descriptor
- `POST /logout` - Logout user
- `GET /` - Welcome/home page

### Protected Routes (Authenticated Users)
- `GET /profile` - View/edit user profile (auth middleware)
- `PATCH /profile` - Update profile information (auth middleware)
- `DELETE /profile` - Delete user account (auth middleware)

### Feed & Posts (Authenticated Users)
- `GET /feed` - View all published posts with comments (real-time via Firebase)
- `GET /posts/create` - Display create post form
- `POST /posts` - Create and publish new post
- `POST /posts/{post}/comments` - Add comment to a post (real-time sync)

### Admin Routes (Admin Only)
- `GET /admin/dashboard` - Admin dashboard with stats and real-time post monitor (admin + auth middleware)

### Response Format
All API responses for post/comment creation follow this format:
```json
{
  "success": true,
  "post": { /* post object */ },
  "comment": { /* comment object */ },
  "message": "Success message"
}
```

## Real-time Features

### How Real-time Works

The application uses **Firebase Realtime Database** to enable instant updates across all connected users:

1. **When a post is created**:
   - Post is saved to MySQL database
   - Post details are pushed to Firebase
   - All connected clients' Firebase listeners trigger
   - New post appears in feeds automatically (no refresh needed)

2. **When a comment is added**:
   - Comment is saved to MySQL database
   - Feed is refreshed to show latest comments
   - All users see the comment immediately

3. **Admin Real-time Monitor**:
   - Admin dashboard listens to Firebase `posts` node
   - New posts appear in the "Real-time Posts Monitor" section
   - Shows live badge indicating active monitoring

### Firebase Configuration Required

Before real-time features work, you **must**:
1. Create a Firebase project (free tier available)
2. Enable Realtime Database with test/production rules
3. Add Firebase config to `.env` file
4. Restart development server

Without Firebase configured, the app still works but real-time updates won't function.

### Testing Real-time Features

To test real-time functionality:
1. Open the application in two browser windows
2. Login as different users in each window
3. In window 1, create a post
4. Watch it appear in window 2 without page refresh
5. Add comments and see them sync instantly
6. Open admin dashboard in another window to see real-time monitor

## Troubleshooting

### Real-time Features Not Working
- **Check Firebase Configuration**:
  - Verify all Firebase env variables are set in `.env`
  - Restart development server: `npm run dev` and `php artisan serve`
  - Check browser console (F12 → Console) for Firebase errors
  
- **Check Firebase Rules**:
  - Ensure Realtime Database has proper read/write rules
  - Default test mode rules allow all access
  - Check Firebase Console → Database → Rules

- **Check Network**:
  - Verify internet connection
  - Check if Firebase domain is blocked by proxy/firewall
  - Check browser console for CORS issues

### Posts Not Appearing on Feed
- Ensure you have posts published in the database
- Check if `is_published = true` for posts
- Refresh the feed page (or it will auto-refresh)
- Check database connection

### Comments Not Saving
- Verify you're logged in
- Check post exists in database
- Check browser console for validation errors
- Ensure database migrations ran successfully

### Admin Dashboard Not Loading
- Verify your account has `is_admin = true` in database
- Check middleware configuration
- Clear browser cache: `npm run build`
- Check user permissions

### Face Not Being Detected
- Ensure proper lighting
- Face should be clearly visible
- Browser camera permissions must be granted
- Check browser console for face-api.js errors
- Verify camera device is working

### Face Login Not Working
- Verify face was captured during registration (check database)
- Check distance threshold (default: 0.5)
- Ensure only non-admin users can use face login
- Try password login instead

### Database Errors
- Run migrations: `php artisan migrate`
- Check database connection in `.env`
- Verify database exists and is accessible
- Check MySQL is running

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

This project is open-source software licensed under the [MIT license](https://opensource.org/licenses/MIT).
