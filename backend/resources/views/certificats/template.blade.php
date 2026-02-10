<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Certificat</title>
    <style>
        body {
            font-family: 'Georgia', serif;
            margin: 0;
            padding: 40px;
            background: white;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            border: 3px solid #8b5cf6;
            padding: 60px;
            background: linear-gradient(135deg, #f5f3ff 0%, #faf9ff 100%);
            box-shadow: 0 10px 40px rgba(139, 92, 246, 0.1);
            text-align: center;
        }
        
        .header {
            margin-bottom: 40px;
        }
        
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #8b5cf6;
            margin-bottom: 10px;
        }
        
        .certificate-title {
            font-size: 48px;
            font-weight: bold;
            color: #1a1a2e;
            margin: 30px 0;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        
        .certificate-content {
            margin: 50px 0;
            line-height: 1.8;
        }
        
        .content-line {
            margin: 30px 0;
            font-size: 14px;
            color: #555;
        }
        
        .student-name {
            font-size: 32px;
            font-weight: bold;
            color: #8b5cf6;
            margin: 30px 0;
            text-transform: uppercase;
        }
        
        .formation-name {
            font-size: 24px;
            color: #1a1a2e;
            margin: 30px 0;
            font-weight: bold;
        }
        
        .certificate-number {
            font-size: 12px;
            color: #999;
            margin-top: 40px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .footer {
            margin-top: 60px;
            display: flex;
            justify-content: space-around;
            font-size: 12px;
            color: #666;
        }
        
        .signature-line {
            width: 150px;
            border-top: 1px solid #333;
            margin-top: 50px;
            text-align: center;
        }
        
        .date-line {
            margin-top: 30px;
            font-size: 12px;
            color: #666;
        }
        
        .decorative-line {
            height: 2px;
            background: linear-gradient(90deg, transparent, #8b5cf6, transparent);
            margin: 30px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">CNI GESTION FORMATIONS</div>
        </div>
        
        <div class="decorative-line"></div>
        
        <div class="certificate-title">Certificat de Participation</div>
        
        <div class="certificate-content">
            <div class="content-line">Ce certificat atteste que</div>
            
            <div class="student-name">
                {{ $certificat->etudiant->prenom }} {{ strtoupper($certificat->etudiant->nom) }}
            </div>
            
            <div class="content-line">a suivi avec succès la formation</div>
            
            <div class="formation-name">
                {{ $certificat->formation->nom }}
            </div>
            
            <div class="content-line">
                Certificat émis le: <strong>{{ \Carbon\Carbon::parse($certificat->date_emission)->format('d F Y') }}</strong>
            </div>
        </div>
        
        <div class="decorative-line"></div>
        
        <div class="certificate-number">
            N° {{ $certificat->numero_certificat }}
        </div>
        
        <div class="footer">
            <div class="signature-line">
                <div style="margin-top: 10px; font-size: 12px;">La Direction</div>
            </div>
            <div class="signature-line">
                <div style="margin-top: 10px; font-size: 12px;">Le Formateur</div>
            </div>
        </div>
    </div>
</body>
</html>
