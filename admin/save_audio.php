<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

$maxFileSizeBytes = 25 * 1024 * 1024; // 25MB
$allowedExt = ['mp3'];
$targetDir = dirname(__DIR__) . '/songs/';

if (!file_exists($targetDir)) {
  if (!mkdir($targetDir, 0755, true)) {
    http_response_code(500);
    echo json_encode(['error' => 'Klasör oluşturulamadı']);
    exit;
  }
}

function sanitizeFileName($name) {
  $name = preg_replace('/[^\w\s.-]/u', '', $name);
  $name = preg_replace('/\s+/', '_', $name);
  return $name;
}

function generateRandomName($ext) {
  return 'audio_' . bin2hex(random_bytes(8)) . '.' . strtolower($ext);
}

// 1) FormData yükleme modu (input name="audio")
if (isset($_FILES['audio'])) {
  $file = $_FILES['audio'];

  if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Yükleme hatası: ' . $file['error']]);
    exit;
  }

  if ($file['size'] > $maxFileSizeBytes) {
    http_response_code(400);
    echo json_encode(['error' => 'Dosya çok büyük (25MB sınır)']);
    exit;
  }

  $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
  if (!in_array($ext, $allowedExt, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Sadece MP3 dosyaları kabul edilir']);
    exit;
  }

  $finfo = new finfo(FILEINFO_MIME_TYPE);
  $mime = $finfo->file($file['tmp_name']);
  if ($mime !== 'audio/mpeg' && $mime !== 'audio/mp3' && $mime !== 'audio/mpeg3') {
    http_response_code(400);
    echo json_encode(['error' => 'Geçersiz ses dosyası türü']);
    exit;
  }

  $safeName = sanitizeFileName($file['name']);
  if ($safeName === '' || pathinfo($safeName, PATHINFO_EXTENSION) === '') {
    $safeName = generateRandomName($ext);
  }

  $targetFile = $targetDir . $safeName;
  if (!move_uploaded_file($file['tmp_name'], $targetFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'Dosya kaydedilemedi']);
    exit;
  }

  echo json_encode(['success' => true, 'filePath' => 'songs/' . basename($targetFile)]);
  exit;
}

// 2) JSON body modu (audioUrl, fileName)
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
if (is_array($input) && isset($input['audioUrl'])) {
  $audioUrl = $input['audioUrl'];
  $fileName = isset($input['fileName']) ? sanitizeFileName($input['fileName']) : '';

  $parts = parse_url($audioUrl);
  if (!$parts || !isset($parts['scheme']) || !in_array(strtolower($parts['scheme']), ['http', 'https'], true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Geçersiz URL']);
    exit;
  }

  $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
  if ($ext === '') { $ext = 'mp3'; }
  if (!in_array($ext, $allowedExt, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Sadece MP3 dosyaları kabul edilir']);
    exit;
  }

  if ($fileName === '' || pathinfo($fileName, PATHINFO_EXTENSION) === '') {
    $fileName = generateRandomName($ext);
  }

  $targetFile = $targetDir . $fileName;

  $context = stream_context_create([
    'http' => [
      'timeout' => 15,
      'follow_location' => 1,
      'user_agent' => 'SongleDownloader/1.0'
    ]
  ]);

  $in = @fopen($audioUrl, 'rb', false, $context);
  if ($in === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Ses dosyası indirilemedi']);
    exit;
  }

  $out = @fopen($targetFile, 'wb');
  if ($out === false) {
    @fclose($in);
    http_response_code(500);
    echo json_encode(['error' => 'Dosya oluşturulamadı']);
    exit;
  }

  $bytes = 0;
  $chunk = 8192;
  while (!feof($in)) {
    $data = fread($in, $chunk);
    if ($data === false) break;
    $bytes += strlen($data);
    if ($bytes > $maxFileSizeBytes) {
      @fclose($in);
      @fclose($out);
      @unlink($targetFile);
      http_response_code(400);
      echo json_encode(['error' => 'Dosya çok büyük (25MB sınır)']);
      exit;
    }
    fwrite($out, $data);
  }
  @fclose($in);
  @fclose($out);

  echo json_encode(['success' => true, 'filePath' => 'songs/' . basename($targetFile)]);
  exit;
}

http_response_code(400);
echo json_encode(['error' => 'Geçersiz istek']);
