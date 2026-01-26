<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../autoload.php';

use App\Core\Database;
use App\Controllers\MovieController;

$database = new Database();
$db = $database->getConnection();

// On crée le contrôleur
$controller = new MovieController($db);

// Pour l'instant, on appelle juste la liste
$controller->list();