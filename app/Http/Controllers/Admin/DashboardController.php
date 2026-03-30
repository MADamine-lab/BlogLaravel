<?php
// app/Http/Controllers/Admin/DashboardController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Check if user is admin
        if (!auth()->user()?->is_admin) {
            abort(403, 'Unauthorized');
        }

        // Get statistics
        $stats = [
            'totalUsers' => User::count(),
            'totalPosts' => Post::count(),
            'totalComments' => Comment::count(),
            'totalCategories' => Category::count(),
            'publishedPosts' => Post::where('is_published', true)->count(),
            'pendingComments' => Comment::where('is_approved', false)->count(),
            'totalAdmins' => User::where('is_admin', true)->count(),
        ];

        // Get user registrations over time (last 30 days)
        $userRegistrations = User::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', now()->subDays(30))
        ->groupBy('date')
        ->orderBy('date')
        ->get()
        ->map(fn($item) => [
            'date' => $item->date,
            'count' => $item->count
        ]);

        // Get posts created over time (last 30 days)
        $postsByDay = Post::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', now()->subDays(30))
        ->groupBy('date')
        ->orderBy('date')
        ->get()
        ->map(fn($item) => [
            'date' => $item->date,
            'count' => $item->count
        ]);

        // Get top users by post count
        $topUsers = User::withCount('posts')
            ->orderBy('posts_count', 'desc')
            ->limit(5)
            ->get()
            ->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'posts_count' => $user->posts_count,
            ]);

        // Get posts per category
        $postsByCategory = Category::withCount('posts')
            ->having('posts_count', '>', 0)
            ->orderBy('posts_count', 'desc')
            ->get()
            ->map(fn($category) => [
                'name' => $category->name,
                'posts_count' => $category->posts_count,
            ]);

        // Get recent posts
        $recentPosts = Post::with('user')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($post) => [
                'id' => $post->id,
                'title' => $post->title,
                'author' => $post->user->name,
                'is_published' => $post->is_published,
                'created_at' => $post->created_at->diffForHumans(),
            ]);

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'userRegistrations' => $userRegistrations,
            'postsByDay' => $postsByDay,
            'topUsers' => $topUsers,
            'postsByCategory' => $postsByCategory,
            'recentPosts' => $recentPosts,
        ]);
    }
}