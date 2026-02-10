<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Certificat de formation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Georgia', serif;
            background-color: #f5f5f5;
        }
        
        .certificate {
            width: 100%;
            max-width: 900px;
            margin: 20px auto;
            padding: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            border: 3px solid #444;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            page-break-after: always;
        }
        
        .header {
            margin-bottom: 40px;
            border-bottom: 2px solid white;
            padding-bottom: 20px;
        }
        
        .header h1 {
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        
        .header p {
            font-size: 18px;
            font-style: italic;
        }
        
        .content {
            margin: 60px 0;
            font-size: 16px;
            line-height: 1.8;
        }
        
        .content p {
            margin: 20px 0;
        }
        
        .student-name {
            font-size: 36px;
            font-weight: bold;
            margin: 30px 0;
            text-decoration: underline;
        }
        
        .formation-title {
            font-size: 28px;
            font-weight: bold;
            margin: 25px 0;
        }
        
        .details {
            margin: 40px 0;
            font-size: 14px;
        }
        
        .details div {
            margin: 10px 0;
        }
        
        .footer {
            margin-top: 60px;
            border-top: 2px solid white;
            padding-top: 30px;
        }
        
        .signature-area {
            display: flex;
            justify-content: space-around;
            margin-top: 40px;
            padding-top: 40px;
        }
        
        .signature {
            text-align: center;
            width: 200px;
        }
        
        .signature .line {
            border-top: 2px solid white;
            margin: 30px 0 10px 0;
        }
        
        .certificate-number {
            font-size: 12px;
            margin-top: 20px;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="header">
            <h1>Certificat de Formation</h1>
            <p>Validation de compétences professionnelles</p>
        </div>
        
        <div class="content">
            <p>Ceci est pour certifier que</p>
            
            <div class="student-name">
                {{ $etudiant->prenom }} {{ strtoupper($etudiant->nom) }}
            </div>
            
            <p>a complété avec succès la formation :</p>
            
            <div class="formation-title">
                {{ $formation->titre }}
            </div>
            
            <div class="details">
                <div><strong>Description :</strong> {{ $formation->description ?? 'N/A' }}</div>
                <div><strong>Durée :</strong> {{ $formation->duree }} heures</div>
                <div><strong>Session :</strong> {{ $session->titre }}</div>
                <div><strong>Date de début :</strong> {{ $session->date_debut->format('d/m/Y') }}</div>
                <div><strong>Date de fin :</strong> {{ $session->date_fin->format('d/m/Y') }}</div>
                <div><strong>Lieu :</strong> {{ $session->lieu }}</div>
            </div>
        </div>
        
        <div class="footer">
            <p>Délivré en reconnaissance de la réussite et de la participation active</p>
            
            <div class="signature-area">
                <div class="signature">
                    <div class="line"></div>
                    <p>Responsable de Formation</p>
                </div>
                <div class="signature">
                    <div class="line"></div>
                    <p>Directeur Administratif</p>
                </div>
            </div>
            
            <div class="certificate-number">
                <strong>Numéro de certificat :</strong> {{ $certificat->numero_certificat }}<br>
                <strong>Date d'émission :</strong> {{ $certificat->date_emission->format('d/m/Y') }}
            </div>
        </div>
    </div>
</body>
</html>
