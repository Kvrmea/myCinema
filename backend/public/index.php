<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../autoload.php';

use App\Core\Database;
use App\Controllers\MovieController;
use App\Controllers\RoomController;
use App\Controllers\ScreeningController;

$database = new Database();
$db = $database->getConnection();

$resource = $_GET['resource'] ?? 'movies';
$method = $_SERVER['REQUEST_METHOD'];

switch($resource) {
    case 'movies':
        $controller = new MovieController($db);
        if ($method === 'GET') $controller->list();
        elseif ($method === 'POST') $controller->create();
        elseif ($method === 'PUT') $controller->update(); // Ajouté pour la modification
        elseif ($method === 'DELETE') $controller->delete();
        break;

    case 'rooms':
        $controller = new RoomController($db);
        if ($method === 'GET') $controller->list();
        elseif ($method === 'POST') $controller->create();
        elseif ($method === 'PUT') $controller->update();
        elseif ($method === 'DELETE') $controller->delete();
        break;
    
    case 'screenings':
        $controller = new ScreeningController($db); 
        if ($method === 'GET') {
            $controller->list();
        } elseif ($method === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            $controller->create($data);
        } elseif ($method === 'DELETE') {
            $controller->delete();
        } elseif ($method === 'PUT') {
            $data = json_decode(file_get_contents("php://input"), true);
            $controller->update($data);
        }
        break;

    // --- NOUVEAU : GESTION DE LA CONNEXION ---
    case 'login':
        if ($method === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            $email = $data['email'] ?? '';
            $password = $data['password'] ?? '';

            $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($password, $user['password'])) {
                // On ne renvoie jamais le mot de passe au client
                unset($user['password']);
                echo json_encode([
                    "message" => "Connexion réussie",
                    "user" => $user
                ]);
            } else {
                http_response_code(401);
                echo json_encode(["message" => "Email ou mot de passe incorrect"]);
            }
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(["message" => "Ressource non trouvée"]);
        break;
}