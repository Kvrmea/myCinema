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
}