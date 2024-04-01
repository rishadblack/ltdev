<?php

use Illuminate\Support\Facades\Route;
use Modules\Blog\Http\Controllers\BlogController;
use Modules\Blog\Pages\New\Yahoo;
use Modules\Blog\Pages\Test;

Route::group([], function () {
    Route::resource('blog', BlogController::class)->names('blog');
    Route::get('test', Test::class)->name('test');
    Route::get('yahoo', Yahoo::class)->name('yahoo');
});