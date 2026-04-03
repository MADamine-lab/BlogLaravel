<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;

class FeedController extends Controller
{
    public function index(Request $request)
    {
        // Check if user is authenticated
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Don't allow admins to access regular feed
        if (auth()->user()?->is_admin) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $posts = Post::with(['user', 'comments.user'])
            ->where('is_published', true)
            ->orderBy('published_at', 'desc')
            ->get();

        return response()->json([
            'posts' => $posts,
        ]);
    }
}
