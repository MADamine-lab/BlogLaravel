<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'face_descriptor',
        'is_admin',
        'status',
        'suspension_reason',
        'approved_at',
        'suspended_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'face_descriptor',
        'approved_at' => 'datetime',
        'suspended_at' => 'datetime',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'face_descriptor'   => 'array',
        ];
    }
    // Check if user is approved
    public function isApproved(): bool
    {
        return $this->status === 'active';
    }

    // Check if user is pending
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    // Check if user is suspended
    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    // Approve user
    public function approve(): void
    {
        $this->status = 'active';
        $this->approved_at = now();
        $this->save();
    }

    // Suspend user
    public function suspend(string $reason = null): void
    {
        $this->status = 'suspended';
        $this->suspension_reason = $reason;
        $this->suspended_at = now();
        $this->save();
    }

    // Reactivate user
    public function reactivate(): void
    {
        $this->status = 'active';
        $this->suspension_reason = null;
        $this->suspended_at = null;
        $this->save();
    }
    
    public function posts()
    {
        return $this->hasMany(Post::class);
    }
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
