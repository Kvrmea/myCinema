<?php
namespace App\Controllers;

use App\Models\Room;

class RoomController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function list() {
        $room = new Room($this->db);
        $stmt = $room->readAll();
        $rooms = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        echo json_encode($rooms, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }
}