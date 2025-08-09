<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

$maxFileSizeBytes = 5 * 1024 * 1024; // 5MB
$allowedExt = ['jpg', 'jpeg', 'png', 'webp'];
$allowedMime = ['image/jpeg', 'image/png', 'image/webp'];

$song_id = $_POST['song_id'] ?? null;
$file = $_FILES['file'] ?? null;

if (!$song_id || !$file) {
  http_response_code(400);
  echo json_encode(['error' => 'Eksik parametreler']);
  exit;
}

if ($file['error'] !== UPLOAD_ERR_OK) {
  http_response_code(400);
  echo json_encode(['error' => 'Yükleme hatası: ' . $file['error']]);
  exit;
}

if ($file['size'] > $maxFileSizeBytes) {
  http_response_code(400);
  echo json_encode(['error' => 'Dosya çok büyük (5MB sınır)']);
  exit;
}

$targetDir = dirname(__DIR__) . '/kapaklar/';
if (!file_exists($targetDir)) {
  if (!mkdir($targetDir, 0755, true)) {
    http_response_code(500);
    echo json_encode(['error' => 'Klasör oluşturulamadı']);
    exit;
  }
}

$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($ext, $allowedExt, true)) {
  http_response_code(400);
  echo json_encode(['error' => 'Geçersiz dosya uzantısı']);
  exit;
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);
if (!in_array($mime, $allowedMime, true)) {
  http_response_code(400);
  echo json_encode(['error' => 'Geçersiz dosya tipi']);
  exit;
}

$fileName = 'song_' . preg_replace('/[^0-9]/', '', (string)$song_id) . '.' . $ext;
$targetFile = $targetDir . $fileName;

if (!move_uploaded_file($file['tmp_name'], $targetFile)) {
  http_response_code(500);
  echo json_encode(['error' => 'Dosya kaydedilemedi']);
  exit;
}

echo json_encode([
  'id' => (int)$song_id,
  'kapak' => 'kapaklar/' . $fileName,
  'created_at' => date('Y-m-d H:i:s')
]);
