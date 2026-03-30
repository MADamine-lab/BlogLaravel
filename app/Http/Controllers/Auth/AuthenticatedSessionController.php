<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();
        
        // Check if user is admin and redirect accordingly
        if (Auth::user()->is_admin) {
            return redirect()->intended(route('admin.dashboard', absolute: false));
        }
        
        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }

    public function faceLogin(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $request->validate([
                'descriptor'   => ['required', 'array', 'size:128'],
                'descriptor.*' => ['numeric'],
            ]);

            $incoming  = $request->input('descriptor');
            $threshold = 0.5;
            $matched   = null;

            // Only get non-admin users with face descriptors
            // Admins cannot use face login
            foreach (\App\Models\User::whereNotNull('face_descriptor')
                                    ->where('is_admin', false)  // Exclude admin users
                                    ->get() as $user) {
                
                // Skip if face_descriptor is empty or not an array
                if (empty($user->face_descriptor) || !is_array($user->face_descriptor)) {
                    continue;
                }

                $sum = 0.0;
                foreach ($incoming as $i => $val) {
                    if (!isset($user->face_descriptor[$i])) {
                        continue 2; // Skip this user if descriptor is incomplete
                    }
                    $sum += ($val - $user->face_descriptor[$i]) ** 2;
                }
                if (sqrt($sum) < $threshold) {
                    $matched = $user;
                    break;
                }
            }

            if (!$matched) {
                return response()->json(['success' => false, 'message' => 'Face not recognized']);
            }

            // Check if matched user is admin (should never happen due to query above, but double-check)
            if ($matched->is_admin) {
                return response()->json(['success' => false, 'message' => 'Admins must use password login']);
            }

            Auth::login($matched);

            return response()->json([
                'success'  => true,
                'redirect' => route('dashboard'),
            ]);
        } catch (\Exception $e) {
            \Log::error('Face login error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Server error'], 500);
        }
    }
}