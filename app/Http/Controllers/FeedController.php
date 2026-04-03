<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeedController extends Controller
{
    public function index(Request $request)
    {
        // If user is admin, redirect them to admin dashboard
        if ($request->user()?->is_admin) {
            return redirect()->route('admin.dashboard');
        }

        $posts = Post::with(['user', 'comments.user'])
            ->where('is_published', true)
            ->orderBy('published_at', 'desc')
            ->get();

        return Inertia::render('Feed/Index', [
            'posts' => $posts,
        ]);
    }
}
