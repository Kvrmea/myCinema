<?php
namespace App\Controllers;

use App\Models\Screening;

class ScreeningController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }
    public function list() {
        $screening = new Screening($this->db);
        $stmt = $screening->readAll();
        
        if ($stmt) {
            $data = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            echo json_encode($data, JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Erreur lors de la récupération du planning"]);
        }
    }

}