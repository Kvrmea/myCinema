<?php
namespace App\Controllers;

use App\Models\Screening;

class ScreeningController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function list() {
        $sreening = new Screening($this->db);
        $stmt = $screening->readAll();
        $screenings = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        echo json_encode($screenings, JSON_UNESCAPED_UNICODE);
    }
}