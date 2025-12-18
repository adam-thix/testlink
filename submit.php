<?php
/**
 * Traitement du formulaire RSVP
 * Site Mariage - Shire & Alan
 */

header('Content-Type: application/json; charset=utf-8');

// Configuration
$CONFIG = [
    'email_to' => 'votre@email.com',  // Email où recevoir les réponses
    'email_subject' => 'Nouvelle réponse RSVP - Mariage Shire & Alan',
    'save_to_file' => true,           // Sauvegarder aussi dans un fichier
    'responses_file' => 'data/responses.json'
];

// Vérifier la méthode
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

// Récupérer les données
$data = [
    'nom' => htmlspecialchars(trim($_POST['nom'] ?? '')),
    'email' => filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL),
    'telephone' => htmlspecialchars(trim($_POST['telephone'] ?? '')),
    'presence' => htmlspecialchars(trim($_POST['presence'] ?? '')),
    'nombre_invites' => intval($_POST['nombre_invites'] ?? 1),
    'allergies' => htmlspecialchars(trim($_POST['allergies'] ?? '')),
    'message' => htmlspecialchars(trim($_POST['message'] ?? '')),
    'date_soumission' => date('Y-m-d H:i:s'),
    'ip' => $_SERVER['REMOTE_ADDR'] ?? ''
];

// Validation
$errors = [];

if (empty($data['nom'])) {
    $errors[] = 'Le nom est requis';
}

if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Email invalide';
}

if (empty($data['presence']) || !in_array($data['presence'], ['oui', 'non'])) {
    $errors[] = 'Veuillez indiquer votre présence';
}

if (!empty($errors)) {
    echo json_encode(['success' => false, 'message' => implode(', ', $errors)]);
    exit;
}

// Sauvegarder dans un fichier JSON
if ($CONFIG['save_to_file']) {
    $dataDir = dirname($CONFIG['responses_file']);
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }

    $responses = [];
    if (file_exists($CONFIG['responses_file'])) {
        $content = file_get_contents($CONFIG['responses_file']);
        $responses = json_decode($content, true) ?? [];
    }

    $responses[] = $data;
    file_put_contents($CONFIG['responses_file'], json_encode($responses, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Préparer l'email
$presenceText = $data['presence'] === 'oui' ? 'OUI - Sera présent(e)' : 'NON - Ne pourra pas venir';

$emailBody = "
Nouvelle réponse RSVP reçue !
=============================

Nom: {$data['nom']}
Email: {$data['email']}
Téléphone: {$data['telephone']}

PRÉSENCE: {$presenceText}
";

if ($data['presence'] === 'oui') {
    $emailBody .= "
Nombre de personnes: {$data['nombre_invites']}
Allergies/Régime: " . ($data['allergies'] ?: 'Aucun') . "
";
}

$emailBody .= "
Message: " . ($data['message'] ?: 'Aucun message') . "

---
Date: {$data['date_soumission']}
";

// Envoyer l'email
$emailHeaders = [
    'From' => $data['email'],
    'Reply-To' => $data['email'],
    'Content-Type' => 'text/plain; charset=UTF-8'
];

$emailSent = @mail(
    $CONFIG['email_to'],
    $CONFIG['email_subject'],
    $emailBody,
    $emailHeaders
);

// Réponse
$responseMessage = $data['presence'] === 'oui'
    ? 'Merci ! Nous avons hâte de vous voir !'
    : 'Merci pour votre réponse. Vous nous manquerez !';

echo json_encode([
    'success' => true,
    'message' => $responseMessage
]);
