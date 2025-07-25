<?php
// JSON body'yi oku
$data = json_decode(file_get_contents("php://input"), true);

// filePath değişkeni al
$filePath = '../' . $data['filePath'] ?? null;

if ($filePath && file_exists($filePath)) {
    unlink($filePath);
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false]);
}
