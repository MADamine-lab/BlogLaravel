<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PostController extends Controller
{
    /**
     * Check image for NSFW content using Sightengine API.
     * Returns true if image is safe, false if NSFW detected.
     */
  private function isImageSafe(string $imagePath): bool
{
    try {
        // Check 1: Sightengine for nudity/offensive
        $response = Http::attach(
            'media',
            file_get_contents($imagePath),
            basename($imagePath)
        )->post('https://api.sightengine.com/1.0/check.json', [
            'models'     => 'nudity-2.0,offensive',
            'api_user'   => env('SIGHTENGINE_USER'),
            'api_secret' => env('SIGHTENGINE_SECRET'),
        ]);

        $result = $response->json();

        if (isset($result['status']) && $result['status'] === 'success') {
            $explicitScore   = $result['nudity']['sexual_explicit'] ?? 0;
            $nudityScore     = $result['nudity']['sexual_display']  ?? 0;
            $suggestiveScore = $result['nudity']['suggestive']      ?? 0;
            $offensiveScore  = $result['offensive']['prob']         ?? 0;

            if ($explicitScore > 0.3 || $nudityScore > 0.3 || $suggestiveScore > 0.3 || $offensiveScore > 0.5) {
                return false;
            }
        }

        // Check 2: Hugging Face resnet-50 for gore/violence
        $hfResponse = Http::withToken(env('HUGGINGFACE_TOKEN'))
            ->timeout(15)
            ->withBody(file_get_contents($imagePath), 'image/jpeg')
            ->post('https://router.huggingface.co/hf-inference/models/microsoft/resnet-50');

        $hfResult = $hfResponse->json();

        if (is_array($hfResult)) {
            $goreLabels = [
                'butcher shop', 'meat market', 'cleaver', 'slaughterhouse',
                'blood', 'wound', 'gore', 'knife', 'gun', 'weapon',
            ];

            foreach ($hfResult as $prediction) {
                $label = strtolower($prediction['label'] ?? '');
                $score = $prediction['score'] ?? 0;

                foreach ($goreLabels as $goreLabel) {
                    if (str_contains($label, $goreLabel) && $score > 0.5) {
                        return false; // Gore detected
                    }
                }
            }
        }

        return true;
    } catch (\Exception $e) {
        return true;
    }
}

    /**
     * Check text for hate speech using Hugging Face BERT model.
     * Returns true if text is safe, false if hate speech detected.
     */
    private function isTextSafe(string $text): bool
{
    try {
        $response = Http::withToken(env('HUGGINGFACE_TOKEN'))
            ->timeout(15)
            ->post('https://router.huggingface.co/hf-inference/models/unitary/toxic-bert', [
                'inputs' => $text,
            ]);

        $result = $response->json();

        if (!isset($result[0]) || !is_array($result[0])) {
            return true;
        }

        foreach ($result[0] as $prediction) {
            if (
                isset($prediction['label'], $prediction['score']) &&
                in_array(strtolower($prediction['label']), ['toxic', 'threat', 'identity_hate', 'insult']) &&
                $prediction['score'] > 0.7
            ) {
                return false; // Toxic content detected
            }
        }

        return true;
    } catch (\Exception $e) {
        return true;
    }
}

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        if ($request->user()?->is_admin) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Posts/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if ($request->user()?->is_admin) {
            return redirect()->route('admin.dashboard');
        }

        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'content'        => 'required|string',
            'excerpt'        => 'nullable|string|max:500',
            'featured_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        // Check title + content for hate speech
        $fullText = $validated['title'] . ' ' . $validated['content'];
        if (!$this->isTextSafe($fullText)) {
            return back()
                ->withErrors(['content' => 'Your post contains hate speech or inappropriate language and could not be published.'])
                ->withInput();
        }

        // Also check excerpt if provided
        if (!empty($validated['excerpt']) && !$this->isTextSafe($validated['excerpt'])) {
            return back()
                ->withErrors(['excerpt' => 'Your summary contains inappropriate language and could not be published.'])
                ->withInput();
        }

        // Handle image upload with NSFW check
        $imagePath = null;
        if ($request->hasFile('featured_image')) {
            $uploadedFile = $request->file('featured_image');
            $tempPath     = $uploadedFile->getRealPath();

            if (!$this->isImageSafe($tempPath)) {
                return back()
                    ->withErrors(['featured_image' => 'Your image was flagged as inappropriate and could not be uploaded.'])
                    ->withInput();
            }

            $imagePath = $uploadedFile->store('posts', 'public');
        }

        Post::create([
            'user_id'        => Auth::id(),
            'title'          => $validated['title'],
            'slug'           => Str::slug($validated['title']) . '-' . uniqid(),
            'content'        => $validated['content'],
            'excerpt'        => $validated['excerpt'] ?? '',
            'featured_image' => $imagePath,
            'is_published'   => true,
            'published_at'   => now(),
        ]);

        return redirect()->route('feed')->with('success', 'Post created successfully!');
    }

    /**
     * Delete a post (owner only).
     */
    public function destroy(Request $request, Post $post)
    {
        if ($post->user_id !== Auth::id()) {
            abort(403);
        }

        if ($post->featured_image) {
            Storage::disk('public')->delete($post->featured_image);
        }

        $post->delete();

        return redirect()->route('feed')->with('success', 'Post deleted successfully!');
    }
}