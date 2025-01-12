CREATE TABLE IF NOT EXISTS `columns` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trello_id INT,
    `name` varchar(255) NOT NULL,
    FOREIGN KEY (trello_id) REFERENCES trello(id)
);
