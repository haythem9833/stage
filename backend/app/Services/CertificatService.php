<?php

namespace App\Services;

use App\Models\Certificat;
use App\Models\Inscription;
use App\Models\SessionFormation;
use Illuminate\Support\Str;

class CertificatService
{
    /**
     * Générer un certificat pour une inscription
     */
    public function genererCertificat(int $inscriptionId): Certificat
    {
        $inscription = Inscription::with(['etudiant', 'session', 'session.formation'])
            ->findOrFail($inscriptionId);

        $session = $inscription->session;

        // Vérifier que la session est validée
        if (!$session->isValidee()) {
            throw new \Exception('La session doit être validée pour générer un certificat');
        }

        // Vérifier que la formation est terminée
        if (!$session->isTerminee()) {
            throw new \Exception('La formation doit être terminée pour générer un certificat');
        }

        // Vérifier que l'inscription est terminée
        if ($inscription->statut !== 'terminee') {
            throw new \Exception('L\'inscription doit être terminée pour générer un certificat');
        }

        // Vérifier qu'un certificat n'existe pas déjà
        $certificatExistant = Certificat::where('etudiant_id', $inscription->etudiant_id)
            ->where('session_formation_id', $session->id)
            ->first();

        if ($certificatExistant) {
            throw new \Exception('Un certificat existe déjà pour cette inscription');
        }

        // Créer le certificat
        $numeroCertificat = $this->genererNumeroCertificat();
        
        $certificat = Certificat::create([
            'etudiant_id' => $inscription->etudiant_id,
            'session_formation_id' => $session->id,
            'numero_certificat' => $numeroCertificat,
            'date_emission' => now()->toDateString(),
        ]);

        return $certificat;
    }

    /**
     * Générer un numéro de certificat unique
     */
    private function genererNumeroCertificat(): string
    {
        do {
            $numero = 'CERT-' . strtoupper(Str::random(10));
        } while (Certificat::where('numero_certificat', $numero)->exists());

        return $numero;
    }

    /**
     * Récupérer les certificats d'un étudiant
     */
    public function getCertificatsEtudiant(int $etudiantId)
    {
        return Certificat::where('etudiant_id', $etudiantId)
            ->with(['session', 'session.formation'])
            ->get();
    }

    /**
     * Récupérer les certificats d'une session
     */
    public function getCertificatsSession(int $sessionId)
    {
        return Certificat::where('session_formation_id', $sessionId)
            ->with('etudiant')
            ->get();
    }

    /**
     * Générer un PDF pour un certificat
     */
    public function genererPdf(Certificat $certificat): string
    {
        $pdf = \PDF::loadView('certificat_template', [
            'certificat' => $certificat,
            'etudiant' => $certificat->etudiant,
            'session' => $certificat->session,
            'formation' => $certificat->session->formation,
        ]);

        $cheminFichier = "certificats/{$certificat->numero_certificat}.pdf";
        $cheminComplet = storage_path("app/public/{$cheminFichier}");

        // Créer le répertoire s'il n'existe pas
        if (!file_exists(dirname($cheminComplet))) {
            mkdir(dirname($cheminComplet), 0755, true);
        }

        $pdf->save($cheminComplet);

        // Mettre à jour le chemin dans la BD
        $certificat->update(['chemin_fichier' => $cheminFichier]);

        return $cheminFichier;
    }

    /**
     * Télécharger un certificat PDF
     */
    public function telechargerPdf(Certificat $certificat)
    {
        if (!$certificat->chemin_fichier) {
            throw new \Exception('Aucun PDF disponible pour ce certificat');
        }

        $cheminComplet = storage_path("app/public/{$certificat->chemin_fichier}");

        if (!file_exists($cheminComplet)) {
            throw new \Exception('Le fichier PDF n\'existe pas');
        }

        return response()->download($cheminComplet, "{$certificat->numero_certificat}.pdf");
    }
}
