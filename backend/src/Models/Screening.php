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
                    s.id, 
                    s.start_time, 
                    m.title AS movie_title, 
                    m.image_url AS movie_poster,
                    r.name AS room_name 
                FROM screenings s
                INNER JOIN movies m ON s.movie_id = m.id
                INNER JOIN rooms r ON s.room_id = r.id
                ORDER BY s.start_time ASC";
        
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt;
        } catch (\PDOException $e) {
            // Potentiel erreur 
            error_log("Erreur SQL Screening: " . $e->getMessage());
            return null;
        }
    }

}