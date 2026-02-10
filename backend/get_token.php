<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Http\Kernel::class)->bootstrap();

use App\Models\User;

$etudiant = User::where('role', 'etudiant')->first();
if ($etudiant) {
    $token = $etudiant->createToken('test')->plainTextToken;
    echo "http://127.0.0.1:8000/api/certificats/1/download\n";
    echo "Authorization: Bearer $token\n";
}
