<?php
namespace App\Models;

class Screening {
    private $conn;
    private $table_name = "rooms";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function readAll() {
        $query = "SELECT 
                    s.id, s.start_time, 
                    m.title as movie_title, 
                    r.name as room_name 
                  FROM " . $this->table_name . " s
                  JOIN movies m ON s.movie_id = m.id
                  JOIN rooms r ON s.room_id = r.id
                  ORDER BY s.start_time ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }


}