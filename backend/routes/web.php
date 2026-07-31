<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;

Route::get('/{any}', function () {
    // If the request is for an API route that doesn't exist, return 404
    if (request()->is('api/*')) {
        return response()->json(['message' => 'API Endpoint not found.'], 404);
    }

    $path = public_path('index.html');
    
    if (!File::exists($path)) {
        return response()->json([
            'message' => 'Frontend not built yet. Please run npm run build in the frontend directory and copy the files to the backend public folder.',
            'help' => 'You should see an index.html file in ' . public_path()
        ], 404);
    }
    
    return File::get($path);
})->where('any', '.*');
