<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the siswa's placeholder academic dashboard.
     *
     * The academic module (kelas, jadwal, absensi) doesn't exist yet --
     * siswa.kelas_id has no equivalent column or relation in the schema
     * -- so only the siswa's own name is sent for now.
     */
    public function index(Request $request): Response
    {
        $siswa = Siswa::where('user_id', $request->user()->id)->firstOrFail(['id', 'nama']);

        return Inertia::render('siswa/dashboard', [
            'siswa' => $siswa,
        ]);
    }
}
