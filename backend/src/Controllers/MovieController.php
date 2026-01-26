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

        if($num > 0) {
            $movies_arr = array();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $movies_arr[] = $row;
            }
            echo json_encode($movies_arr, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        } else {
            echo json_encode(["message" => "Aucun film trouvé."]);
        }
    }
}