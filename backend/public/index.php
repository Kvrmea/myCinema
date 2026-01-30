<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Gestion du Preflight (indispensable pour les requêtes DELETE/POST depuis JS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../autoload.php';

use App\Core\Database;
use App\Controllers\MovieController;
use App\Controllers\RoomController;

$database = new Database();
$db = $database->getConnection();

// On récupère les infos de la requête
$resource = $_GET['resource'] ?? 'movies';
$method = $_SERVER['REQUEST_METHOD'];

switch($resource) {
    case 'movies':
        $controller = new MovieController($db);
        if ($method === 'GET') $controller->list();
        elseif ($method === 'POST') $controller->create();
        elseif ($method === 'DELETE') $controller->delete();
        break;

    case 'rooms':
        $controller = new RoomController($db);
        if ($method === 'GET') $controller->list();
        // AJOUT PLUS tard des autres methodes
        break;

    default:
        http_response_code(404);
        echo json_encode(["message" => "Ressource non trouvée"]);
        break;
}