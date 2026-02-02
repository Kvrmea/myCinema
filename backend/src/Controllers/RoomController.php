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

    public function create() {
        // Lire le contenu brut de la requête (le JSON envoyé par JS)
        $json = file_get_contents("php://input");
        $data = json_decode($json, true);

        // Vérification de sécurité pour éviter l'erreur 500 si les données sont vides
        if (!$data || !isset($data['name'])) {
            http_response_code(400);
            echo json_encode(["message" => "Données incomplètes"]);
            return;
        }

        $room = new \App\Models\Room($this->db);
        
        if($room->create($data)) {
            http_response_code(201);
            echo json_encode(["message" => "Salle créée avec succès !"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Erreur lors de l'insertion en base."]);
        }
    }


    public function update() {
        $id = $_GET['id'] ?? null;
        $data = json_decode(file_get_contents("php://input"), true);
        if ($id) {
            $room = new \App\Models\Room($this->db);
            if ($room->update($id, $data)) {
                echo json_encode(["message" => "Salle mise à jour"]);
            }
        }
    }

    public function delete() {
        $id = $_GET['id'] ?? null;

        if($id) {
            $room = new \App\Models\Room($this->db);
            if($room->delete($id)) {
                http_response_code(200);
                echo json_encode(["message" => "Salle supprimée."], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(400);
                echo json_encode(["message" => "Échec de la suppression (ID: $id)."], JSON_UNESCAPED_UNICODE);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "ID manquant."], JSON_UNESCAPED_UNICODE);
        }
    }
}