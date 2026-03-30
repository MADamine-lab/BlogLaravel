<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
   public function store(Request $request): RedirectResponse
{
    \Log::info('Registration attempt', [
        'name' => $request->name,
        'email' => $request->email,
        'has_face' => !is_null($request->face_descriptor),
        'face_length' => is_array($request->face_descriptor) ? count($request->face_descriptor) : 0,
    ]);

    $validated = $request->validate([
        'name'              => ['required', 'string', 'max:255'],
        'email'             => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
        'password'          => ['required', 'confirmed', Rules\Password::defaults()],
        'face_descriptor'   => ['nullable', 'array'],
        'face_descriptor.*' => ['numeric'],
    ]);

    \Log::info('Validation passed', $validated);

    $user = User::create([
        'name'            => $validated['name'],
        'email'           => $validated['email'],
        'password'        => Hash::make($validated['password']),
        'face_descriptor' => $validated['face_descriptor'] ?? null,
    ]);

    \Log::info('User created', [
        'id' => $user->id,
        'face_descriptor' => is_null($user->face_descriptor) ? 'NULL' : 'SET',
    ]);

    event(new Registered($user));
    Auth::login($user);

    return redirect(route('dashboard', absolute: false));
}
}
