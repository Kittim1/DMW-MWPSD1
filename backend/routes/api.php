<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\QueueController;
use App\Http\Controllers\Api\CounterController;
use App\Http\Controllers\Api\ServiceController;

Route::group(['prefix' => 'auth'], function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::group(['middleware' => 'auth:api'], function () {
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
    });
});

Route::group(['prefix' => 'queue'], function () {
    Route::get('/status', [QueueController::class, 'getStatus']);
    Route::get('/waiting', [QueueController::class, 'getWaiting']);
    Route::get('/serving', [QueueController::class, 'getServing']);
    Route::get('/tickets', [QueueController::class, 'getTickets']);
    Route::post('/tickets', [QueueController::class, 'addTicket']);
    
    Route::group(['middleware' => 'auth:api'], function () {
        Route::post('/call-next/{counterId}', [QueueController::class, 'callNext']);
        Route::post('/complete/{ticketId}', [QueueController::class, 'completeService']);
        Route::post('/skip/{ticketId}', [QueueController::class, 'skipTicket']);
        Route::post('/cancel/{ticketId}', [QueueController::class, 'cancelTicket']);
        Route::post('/cater/{ticketId}/{counterId}', [QueueController::class, 'caterTicket']);
        Route::post('/reset', [QueueController::class, 'resetQueue']);
        Route::post('/forward/{ticketId}', [QueueController::class, 'forwardTicket']);
        Route::get('/reports', [QueueController::class, 'getReports']);
        Route::get('/logs', [QueueController::class, 'getSystemLogs']);
    });
});

Route::group(['prefix' => 'counters'], function () {
    Route::get('/', [CounterController::class, 'getCounters']); // Public for landing page
    Route::group(['middleware' => 'auth:api'], function () {
        Route::put('/{id}', [CounterController::class, 'updateCounter']);
    });
});

Route::group(['prefix' => 'services'], function () {
    Route::get('/', [ServiceController::class, 'index']);
    
    Route::group(['middleware' => 'auth:api'], function () {
        Route::post('/', [ServiceController::class, 'store']);
        Route::put('/{id}', [ServiceController::class, 'update']);
        Route::delete('/{id}', [ServiceController::class, 'destroy']);
    });
});
