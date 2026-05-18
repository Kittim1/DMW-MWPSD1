<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\QueueController;
use App\Http\Controllers\Api\CounterController;

Route::group(['prefix' => 'auth'], function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:api');
    Route::get('/user', [AuthController::class, 'user'])->middleware('auth:api');
    Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('auth:api');
});

Route::group(['prefix' => 'queue', 'middleware' => 'auth:api'], function () {
    Route::get('/waiting', [QueueController::class, 'getWaiting']);
    Route::get('/serving', [QueueController::class, 'getServing']);
    Route::post('/call-next/{counterId}', [QueueController::class, 'callNext']);
    Route::post('/complete/{ticketId}', [QueueController::class, 'completeService']);
    Route::get('/tickets', [QueueController::class, 'getTickets']);
    Route::post('/tickets', [QueueController::class, 'addTicket']);
});

Route::group(['prefix' => 'counters', 'middleware' => 'auth:api'], function () {
    Route::get('/', [CounterController::class, 'getCounters']);
    Route::put('/{id}', [CounterController::class, 'updateCounter']);
});
