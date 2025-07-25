<?php
header('Content-Type: application/json');

// Hata raporlamayı aç
ini_set('display_errors', 1);
error_reporting(E_ALL);

// CORS başlıklarını ayarla
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// JSON verisini al
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['audioUrl']) || !isset($input['fileName'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Eksik parametreler']);
    exit;
}

$audioUrl = $input['audioUrl'];
$fileName = preg_replace('/[^\w\s.-]/', '', $input['fileName']); // Güvenli dosya adı
$fileName = str_replace(' ', '_', $fileName);

// Hedef klasör yolu (bir üst dizindeki songs klasörü)
$targetDir = dirname(__DIR__) . '/songs/';

// Klasör yoksa oluştur
if (!file_exists($targetDir)) {
    if (!mkdir($targetDir, 0777, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Klasör oluşturulamadı']);
        exit;
    }
}

$targetFile = $targetDir . $fileName;

// Dosyayı indir
$audioData = @file_get_contents($audioUrl);

if ($audioData === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Ses dosyası indirilemedi']);
    exit;
}

// Dosyayı kaydet
if (file_put_contents($targetFile, $audioData) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Dosya kaydedilemedi']);
    exit;
}

// Başarılı yanıt
http_response_code(200);
echo json_encode([
    'success' => true,
    'filePath' => 'songs/' . $fileName
]);
