<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0;
            font-size: 12px;
            color: #666;
        }
        .info {
            margin-bottom: 20px;
            border: 1px solid #ddd;
            padding: 10px;
            background: #f9f9f9;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        thead {
            background-color: #007bff;
            color: white;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        th {
            font-weight: bold;
            font-size: 12px;
        }
        td {
            font-size: 11px;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .statut-present {
            color: green;
            font-weight: bold;
        }
        .statut-absent {
            color: red;
            font-weight: bold;
        }
        .statut-retard {
            color: orange;
            font-weight: bold;
        }
        .statut-justifie {
            color: blue;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            font-size: 10px;
            color: #999;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .signature {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            width: 30%;
            text-align: center;
            border-top: 1px solid black;
            padding-top: 20px;
            font-size: 11px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📋 Feuille de Présence</h1>
        <p>CNI - Gestion des Formations</p>
    </div>

    <div class="info">
        <strong>Formation:</strong> {{ $session->formation->titre ?? 'N/A' }}<br>
        <strong>Session:</strong> {{ $session->titre ?? 'Nouvelle session' }}<br>
        <strong>Période:</strong> {{ $dateDebut->format('d/m/Y') }} au {{ $dateFin->format('d/m/Y') }}<br>
        <strong>Lieu:</strong> {{ $session->lieu ?? 'À définir' }}<br>
        <strong>Date d'édition:</strong> {{ now()->format('d/m/Y H:i') }}
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 30%">Participant</th>
                @foreach($presences as $date => $presencesDate)
                    <th style="width: 7%; text-align: center;">
                        {{ \Carbon\Carbon::createFromFormat('Y-m-d', $date)->format('d/m') }}
                    </th>
                @endforeach
                <th style="width: 10%; text-align: center;">Taux</th>
            </tr>
        </thead>
        <tbody>
            @forelse($session->inscriptions ?? [] as $inscription)
                <tr>
                    <td>
                        {{ $inscription->etudiant->prenom ?? '' }}
                        {{ $inscription->etudiant->nom ?? '' }}
                    </td>
                    @foreach($presences as $date => $presencesDate)
                        <td style="text-align: center;">
                            @php
                                $presence = collect($presencesDate)->firstWhere('inscription_id', $inscription->id);
                                $statut = $presence['statut'] ?? '-';
                            @endphp
                            <span class="statut-{{ $statut }}">
                                @switch($statut)
                                    @case('present')
                                        ✓
                                        @break
                                    @case('absent')
                                        ✗
                                        @break
                                    @case('retard')
                                        R
                                        @break
                                    @case('justifie')
                                        J
                                        @break
                                    @default
                                        -
                                @endswitch
                            </span>
                        </td>
                    @endforeach
                    <td style="text-align: center;">
                        {{ $inscription->presences->where('inscription_id', $inscription->id)->whereIn('statut', ['present', 'justifie'])->count() }} / 
                        {{ $inscription->presences->where('inscription_id', $inscription->id)->count() }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="100%">Aucune inscription trouvée</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div style="margin-top: 20px; font-size: 11px;">
        <strong>Légende:</strong>
        <span class="statut-present">✓ = Présent</span> |
        <span class="statut-absent">✗ = Absent</span> |
        <span class="statut-retard">R = Retard</span> |
        <span class="statut-justifie">J = Justifié</span>
    </div>

    <div class="signature">
        <div class="signature-box">
            Formateur<br>
            {{ $session->formation->formateur->prenom ?? '' }}
            {{ $session->formation->formateur->nom ?? '' }}
        </div>
        <div class="signature-box">
            Date<br>
            {{ now()->format('d/m/Y') }}
        </div>
        <div class="signature-box">
            Signature
        </div>
    </div>

    <div class="footer">
        <p>Document généré automatiquement par le système de gestion des formations CNI</p>
        <p>Référence: Session #{{ $session->id }} | Page générée le {{ now()->format('d/m/Y H:i') }}</p>
    </div>
</body>
</html>
