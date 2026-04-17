<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // 1. Fetch unread notifications for the logged-in user
    public function index(Request $request)
    {
        // Laravel automatically fetches notifications for the authenticated user
        $unreadNotifications = $request->user()->unreadNotifications;

        return response()->json([
            'unread_count' => $unreadNotifications->count(),
            'notifications' => $unreadNotifications
        ], 200);
    }

    // 2. Mark a specific notification as read
    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->find($id);

        if ($notification) {
            $notification->markAsRead();
            return response()->json(['message' => 'Notification marked as read'], 200);
        }

        return response()->json(['message' => 'Notification not found'], 404);
    }

    // 3. Mark ALL notifications as read (useful for a "Clear All" button)
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'All notifications marked as read'], 200);
    }
}