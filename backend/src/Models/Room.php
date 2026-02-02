<?php
namespace App\Models;

class Room {
    private $conn;
    private $table_name = "rooms";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function readAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY name ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function create($data) {
        $query = "INSERT INTO rooms (name, capacity, image_url) VALUES (:name, :capacity, :image_url)";
        $stmt = $this->conn->prepare($query);
        
        // On force les types pour être sûr que MySQL accepte
        $name = htmlspecialchars(strip_tags($data['name']));
        $capacity = (int)$data['capacity'];
        $image_url = $data['image_url'] ?? '';

        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":capacity", $capacity);
        $stmt->bindParam(":image_url", $image_url);

        return $stmt->execute();
    }


    public function update($id, $data) {
        $query = "UPDATE " . $this->table_name . " SET name = :name, capacity = :capacity, image_url = :image_url WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":name", $data['name']);
        $stmt->bindParam(":capacity", $data['capacity']);
        $stmt->bindParam(":image_url", $data['image_url']);

        return $stmt->execute();
    }

    public function delete($id) {
        $id = (int)$id;
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":id", $id, \PDO::PARAM_INT);

        if ($stmt->execute()) {
            return $stmt->rowCount() > 0;
        }
        return false;
    }
}