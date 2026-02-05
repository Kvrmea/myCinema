DROP DATABASE IF EXISTS my_cinema;
CREATE DATABASE my_cinema;

CREATE DATABASE my_cinema CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE my_cinema;

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