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

    public function create($data) {
        // On vérifie qu'on a bien toutes les infos
        if (!isset($data['movie_id'], $data['room_id'], $data['start_time'])) {
            http_response_code(400);
            echo json_encode(["message" => "Données incomplètes"]);
            return;
        }

        $query = "INSERT INTO screenings (movie_id, room_id, start_time, created_at) 
                  VALUES (:movie_id, :room_id, :start_time, NOW())";
        
        try {
            $stmt = $this->db->prepare($query);
            $success = $stmt->execute([
                ':movie_id'   => $data['movie_id'],
                ':room_id'    => $data['room_id'],
                ':start_time' => $data['start_time']
            ]);

            if ($success) {
                http_response_code(201);
                echo json_encode(["message" => "Séance créée avec succès"]);
            } else {
                throw new \Exception("Erreur lors de l'insertion");
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["message" => $e->getMessage()]);
        }
    }

}