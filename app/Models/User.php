<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use RuntimeException;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The roles allowed for this application, matching the MySQL enum
     * values defined on the `role` column.
     *
     * @var list<string>
     */
    public const ROLES = [
        'admin',
        'kepala_sekolah',
        'guru',
        'staf_keuangan',
        'staf_ppdb',
        'wali_murid',
        'siswa',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::saving(function (User $user) {
            if (! in_array($user->role, self::ROLES, true)) {
                throw new RuntimeException(
                    "Invalid role \"{$user->role}\" assigned to User. Allowed roles: ".implode(', ', self::ROLES)
                );
            }
        });
    }

    /**
     * Get this user's landing page after login or registration.
     * Roles without a dedicated dashboard (admin, kepala_sekolah, guru)
     * fall back to the generic starter-kit dashboard.
     */
    public function defaultRedirectPath(): string
    {
        return match ($this->role) {
            'staf_ppdb' => route('staf.ppdb-dashboard', absolute: false),
            'staf_keuangan' => route('staf.tagihan.index', absolute: false),
            'wali_murid' => route('wali.dashboard', absolute: false),
            'siswa' => route('siswa.dashboard', absolute: false),
            default => route('dashboard', absolute: false),
        };
    }

    /**
     * The model's default values for attributes.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'role' => 'wali_murid',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'username',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
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
        ];
    }
}
