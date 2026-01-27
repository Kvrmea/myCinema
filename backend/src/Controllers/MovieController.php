<?php

namespace App\Controllers;

use App\Models\Movie;

class MovieController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function list() {
        $movie = new Movie($this->db);
        $stmt = $movie->readAll();
        $num = $stmt->rowCount();

        if ($num > 0) {
            $movies_arr = array();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $movies_arr[] = $row;
            }
            echo json_encode($movies_arr, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        } else {
            echo json_encode(["message" => "Aucun film trouvé."]);
        }
    }

    public function create() {
        // On récupère le contenu de la requête (POST)
        $data = json_decode(file_get_contents("php://input"), true);

        if (!empty($data['title']) && !empty($data['duration'])) {
            $movie = new Movie($this->db);
            if ($movie->create($data)) {
                http_response_code(201); // Created
                echo json_encode(["message" => "Film ajouté avec succès !"], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(503); // Service Unavailable
                echo json_encode(["message" => "Impossible d'ajouter le film."], JSON_UNESCAPED_UNICODE);
            }
        } else {
            http_response_code(400); // Bad Request
            echo json_encode(["message" => "Données incomplètes."], JSON_UNESCAPED_UNICODE);
        }
    }
}