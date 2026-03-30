<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\DashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Regular dashboard (for regular users)
Route::get('/dashboard', function () {
    // If user is admin, redirect to admin dashboard
    if (auth()->user()?->is_admin) {
        return redirect()->route('admin.dashboard');
    }
    
    return Inertia::render('Dashboard', [
        'userName' => auth()->user()?->name ?? 'User',
        'userEmail' => auth()->user()?->email ?? 'N/A',
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// Admin routes - protected by admin middleware
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Route for login face
Route::middleware('guest')->group(function () {
    Route::post('/login/face', [AuthenticatedSessionController::class, 'faceLogin'])
        ->name('login.face');
});

require __DIR__.'/auth.php';