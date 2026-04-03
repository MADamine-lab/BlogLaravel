<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;

class DashboardController extends Controller
{
    public function stats()
    {
        // Check if admin
        if (!auth()->user()?->is_admin) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        // Get recent posts for real-time monitoring
        $recentPosts = Post::with('user')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($post) => [
                'id' => $post->id,
                'title' => $post->title,
                'user' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                    'email' => $post->user->email,
                ],
                'is_published' => $post->is_published,
                'published_at' => $post->published_at,
                'created_at' => $post->created_at,
            ]);

        return response()->json([
            'recentPosts' => $recentPosts,
        ]);
    }
}
