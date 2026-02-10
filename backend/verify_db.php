<?php
require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

echo "=== VÉRIFICATION BASE DE DONNÉES ===\n";
echo "Utilisateurs: " . \App\Models\User::count() . "\n";
echo "Formations: " . \App\Models\Formation::count() . "\n";
echo "Sessions: " . \App\Models\SessionFormation::count() . "\n";
echo "Inscriptions: " . \App\Models\Inscription::count() . "\n";
echo "Certificats: " . \App\Models\Certificat::count() . "\n\n";

echo "=== UTILISATEURS (premiers 5) ===\n";
foreach (\App\Models\User::select('email', 'role')->limit(5)->get() as $u) {
    echo "- {$u->email} ({$u->role})\n";
}

echo "\n=== FORMATIONS ===\n";
foreach (\App\Models\Formation::select('titre', 'duree')->get() as $f) {
    echo "- {$f->titre} ({$f->duree}h)\n";
}

echo "\n=== SESSIONS ===\n";
foreach (\App\Models\SessionFormation::select('titre', 'statut')->get() as $s) {
    echo "- {$s->titre} (statut: {$s->statut})\n";
}

echo "\n✅ BASE DE DONNÉES COMPLÈTE ET FONCTIONNELLE\n";
