<?php

use Illuminate\Support\Facades\Route;

// Serve the React SPA for all web routes (React Router handles client-side routing)
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
