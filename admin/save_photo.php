<?php
header('Content-Type: application/json');

// Hata raporlamayı aç
ini_set('display_errors', 1);
error_reporting(E_ALL);

// CORS başlıklarını ayarla
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// FormData'dan gelen verileri al
$song_id = $_POST['song_id'] ?? null;
$file = $_FILES['file'] ?? null;

if (!$song_id || !$file) {
    http_response_code(400);
    echo json_encode(['error' => 'Eksik parametreler']);
    exit;
}

// Hedef klasör yolu (bir üst dizindeki kapaklar klasörü)
$targetDir = dirname(__DIR__) . '/kapaklar/';

// Klasör yoksa oluştur
if (!file_exists($targetDir)) {
    if (!mkdir($targetDir, 0777, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Klasör oluşturulamadı']);
        exit;
    }
}

// Dosya uzantısını al
$fileExt = pathinfo($file['name'], PATHINFO_EXTENSION);
$fileName = 'song_' . $song_id . '.' . $fileExt;
$targetFile = $targetDir . $fileName;

// Dosyayı kaydet
if (!move_uploaded_file($file['tmp_name'], $targetFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'Dosya kaydedilemedi']);
    exit;
}

// Başarılı yanıt döndür
echo json_encode([
    'id' => $song_id,
    'kategori' => '', // Bu bilgiyi veritabanından alabilirsiniz
    'cevap' => '', // Bu bilgiyi veritabanından alabilirsiniz
    'sarki' => '', // Bu bilgiyi veritabanından alabilirsiniz
    'dosya' => '', // Bu bilgiyi veritabanından alabilirsiniz
    'kapak' => '/kapaklar/' . $fileName,
    'created_at' => date('Y-m-d H:i:s')
]);
