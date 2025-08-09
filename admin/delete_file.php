<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$relative = isset($data['filePath']) ? $data['filePath'] : null;

if (!$relative) {
  echo json_encode(['success' => false, 'error' => 'filePath zorunlu']);
  exit;
}

$allowedRoots = [
  realpath(dirname(__DIR__) . '/songs'),
  realpath(dirname(__DIR__) . '/kapaklar'),
];

$fullPath = realpath(dirname(__DIR__) . '/' . ltrim($relative, '/\\'));

if (!$fullPath) {
  echo json_encode(['success' => false, 'error' => 'Geçersiz yol']);
  exit;
}

$isAllowed = false;
foreach ($allowedRoots as $root) {
  if ($root && strncmp($fullPath, $root, strlen($root)) === 0) {
    $isAllowed = true;
    break;
  }
}

if (!$isAllowed) {
  echo json_encode(['success' => false, 'error' => 'İzin verilmeyen yol']);
  exit;
}

if (file_exists($fullPath)) {
  if (@unlink($fullPath)) {
    echo json_encode(['success' => true]);
  } else {
    echo json_encode(['success' => false, 'error' => 'Silinemedi']);
  }
} else {
  echo json_encode(['success' => false, 'error' => 'Dosya yok']);
}
