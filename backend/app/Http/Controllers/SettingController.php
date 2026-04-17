<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    // 1. View all system settings (Admin Only)
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $settings = Setting::all();
        return response()->json($settings, 200);
    }

    // 2. Add or Update a setting (Admin Only)
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'key' => 'required|string|max:255',
            'value' => 'required|string'
        ]);

        // This brilliant Laravel function updates the value if the key exists, 
        // or creates a brand new row if it doesn't!
        $setting = Setting::updateOrCreate(
            ['key' => $validated['key']],
            ['value' => $validated['value']]
        );

        return response()->json([
            'message' => 'System setting saved successfully.',
            'setting' => $setting
        ], 200);
    }
}