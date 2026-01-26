<?php

namespace App\Core;

use PDO;
use PDOException;

class Database {
    private $host = "127.0.0.1";//localhost // Utilise l'IP plutôt que localhost pour éviter certains délais
    private $db_name = "my_cinema";
    private $username = "yoriichi";
    private $password = "090303";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8mb4");
        } catch(PDOException $exception) {
            // erreur si ca bug
            die("Erreur de connexion : " . $exception->getMessage());
        }

        return $this->conn;
    }
}