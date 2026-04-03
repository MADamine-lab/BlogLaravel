<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $pendingUsers = User::where('status', 'pending')
            ->where('is_admin', false)
            ->orderBy('created_at', 'desc')
            ->get();
            
        $activeUsers = User::where('status', 'active')
            ->where('is_admin', false)
            ->orderBy('name')
            ->get();
            
        $suspendedUsers = User::where('status', 'suspended')
            ->where('is_admin', false)
            ->orderBy('suspended_at', 'desc')
            ->get();
            
        $stats = [
            'total' => User::where('is_admin', false)->count(),
            'pending' => $pendingUsers->count(),
            'active' => $activeUsers->count(),
            'suspended' => $suspendedUsers->count(),
        ];
        
        return Inertia::render('Admin/Users', [
            'pendingUsers' => $pendingUsers,
            'activeUsers' => $activeUsers,
            'suspendedUsers' => $suspendedUsers,
            'stats' => $stats,
        ]);
    }
    
    public function approve(User $user)
    {
        if ($user->is_admin) {
            return back()->with('error', 'Cannot approve admin users');
        }
        
        $user->approve();
        
        // TODO: Send approval email
        // Mail::to($user->email)->send(new AccountApprovedMail($user));
        
        return back()->with('success', "User {$user->name} has been approved");
    }
    
    public function suspend(Request $request, User $user)
    {
        if ($user->is_admin) {
            return back()->with('error', 'Cannot suspend admin users');
        }
        
        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);
        
        $user->suspend($request->reason);
        
        // TODO: Send suspension notification email
        // Mail::to($user->email)->send(new AccountSuspendedMail($user, $request->reason));
        
        return back()->with('success', "User {$user->name} has been suspended");
    }
    
    public function reactivate(User $user)
    {
        if ($user->is_admin) {
            return back()->with('error', 'Cannot reactivate admin users');
        }
        
        $user->reactivate();
        
        // TODO: Send reactivation email
        // Mail::to($user->email)->send(new AccountReactivatedMail($user));
        
        return back()->with('success', "User {$user->name} has been reactivated");
    }
    
    public function destroy(User $user)
    {
        if ($user->is_admin) {
            return back()->with('error', 'Cannot delete admin users');
        }
        
        $user->delete();
        
        return back()->with('success', "User {$user->name} has been deleted");
    }
}
