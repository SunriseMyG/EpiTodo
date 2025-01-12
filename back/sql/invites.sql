CREATE TABLE IF NOT EXISTS invites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trello_id INT,
    email VARCHAR(255) NOT NULL,
    FOREIGN KEY (trello_id) REFERENCES trello(id)
);