CREATE TABLE IF NOT EXISTS `tasks` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `trello_id` int(11) NOT NULL,
    `column_id` int(11) NOT NULL,
    `title` varchar(255) NOT NULL,
    `description` text NOT NULL,
    `assign_to` varchar(255) NOT NULL,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`trello_id`) REFERENCES `trello`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;