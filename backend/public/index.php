<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../autoload.php';

use App\Core\Database;
use App\Controllers\MovieController;

$database = new Database();
$db = $database->getConnection();

// On récupère la méthode HTTP (GET, POST, etc.)
$method = $_SERVER['REQUEST_METHOD'];

// On crée le contrôleur
$controller = new MovieController($db);

// Le Router : il dirige vers la bonne méthode du contrôleur
switch($method) {
    case 'GET':
        $controller->list();
        break;
        
    case 'POST':
        $controller->create();
        break;

    case 'OPTIONS':
        // Utile pour les navigateurs qui font une vérification avant un POST
        http_response_code(200);
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Méthode non autorisée"], JSON_UNESCAPED_UNICODE);
        break;
}