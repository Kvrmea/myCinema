<?php

namespace App\Models;

class Movie {
    private $conn;
    private $table_name = "movies";

    // Propriétés du film (correspondent aux colonnes SQL)
    public $id;
    public $title;
    public $duration;
    public $release_year;
    public $genre;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Méthode pour récupérer tous les films
    public function readAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " 
              SET title=:title, description=:description, duration=:duration, 
                  release_year=:release_year, genre=:genre, director=:director";

        $stmt = $this->conn->prepare($query);

        // Protection contre les injections
        $stmt->bindParam(":title", $data['title']);
        $stmt->bindParam(":description", $data['description']);
        $stmt->bindParam(":duration", $data['duration']);
        $stmt->bindParam(":release_year", $data['release_year']);
        $stmt->bindParam(":genre", $data['genre']);
        $stmt->bindParam(":director", $data['director']);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }
}