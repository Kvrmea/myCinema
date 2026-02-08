DROP DATABASE IF EXISTS my_cinema;
CREATE DATABASE my_cinema;

CREATE DATABASE my_cinema CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE my_cinema;


CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- On stockera le hash ici
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1. Table des salles (rooms)
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    type VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Table des films (movies)
CREATE TABLE movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration INT NOT NULL,
    release_year INT NOT NULL,
    genre VARCHAR(255),
    director VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Table des séances (screenings)
CREATE TABLE screenings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    room_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- Clés étrangères
    CONSTRAINT fk_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE RESTRICT,
    CONSTRAINT fk_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB;

ALTER TABLE rooms ADD COLUMN image_url VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1517604401157-538a9663ecf4';

-- salles avec des images stylées (Unsplash)
INSERT INTO rooms (name, capacity, image_url) VALUES 
('Grande Salle IMAX', 300, 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'),
('Salle Dolby Atmos', 150, 'https://images.unsplash.com/photo-1517604401157-538a9663ecf4'),
('Salle VIP Lounge', 50, 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f');

UPDATE rooms SET image_url = 'https://images.unsplash.com/photo-1517604401157-538a9663ecf4' WHERE name LIKE '%Dolby%';

CREATE TABLE IF NOT EXISTS screenings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    room_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    FOREIGN KEY (movie_id) REFERENCES movies(id) CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) CASCADE
);

INSERT INTO screenings (movie_id, room_id, start_time) VALUES (1, 1, '2026-02-05 20:30:00');


USE my_cinema;

-- 1. On désactive temporairement les vérifications pour pouvoir tout vider sans erreur
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE screenings;
TRUNCATE TABLE movies;
TRUNCATE TABLE rooms;

-- 2. On s'assure que tes salles de test existent (car screenings en a besoin)
INSERT INTO rooms (id, name, capacity, image_url) VALUES 
(1, 'LUXE', 50, 'https://images.unsplash.com/photo-1517604401157-538a9663ecf4'),
(2, 'Salle IMAX', 120, 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba');

-- 3. On insère les films avec les bonnes colonnes
INSERT INTO movies (id, title, duration, genre, description, release_year, image_url) VALUES 
(1, 'Inception', 148, 'Sci-Fi', 'Dom Cobb est un voleur expérimenté.', 2010, 'https://image.tmdb.org/t/p/w500/9gk7Fn9sVAsS9696G1o3oP0mX0W.jpg'),
(2, 'The Dark Knight', 152, 'Action', 'Le combat de Batman contre le Joker.', 2008, 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDp9s1D3Pmc9G9SzkRBC.jpg'),
(3, 'Interstellar', 169, 'Aventure', 'Un voyage spatial pour sauver l\'humanité.', 2014, 'https://image.tmdb.org/t/p/w500/gEU2QniE6EwfVDxjTEreqq9hcC9.jpg'),
(4, 'Matrix', 136, 'Action', 'La vérité sur la réalité.', 1999, 'https://image.tmdb.org/t/p/w500/f89U3Y9L9vwpkPK9Gws9URpCjYw.jpg'),
(5, 'Gladiator', 155, 'Drame', 'Un général romain cherche vengeance.', 2000, 'https://image.tmdb.org/t/p/w500/27oJvHUYpS97wh397QY788pt0OX.jpg');

-- 4. On insère les séances (screenings)
INSERT INTO screenings (movie_id, room_id, start_time) VALUES 
(4, 2, DATE_SUB(NOW(), INTERVAL 4 HOUR)), 
(1, 1, DATE_SUB(NOW(), INTERVAL 30 MINUTE)), 
(2, 2, DATE_ADD(NOW(), INTERVAL 3 HOUR)), 
(3, 1, DATE_ADD(NOW(), INTERVAL 6 HOUR)), 
(5, 2, DATE_ADD(NOW(), INTERVAL 24 HOUR));

-- 5. On réactive les vérifications
SET FOREIGN_KEY_CHECKS = 1;