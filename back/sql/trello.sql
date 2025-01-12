CREATE TABLE IF NOT EXISTS `trello` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    `invite` TEXT NOT NULL,
    `column` text NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- id
-- nom
-- creator (email) (a qui le trello appartient ou simpleement l'id de l'utilisateur qui a créé le trello)
-- created_at
-- updated_at
-- invite (email) (liste des utilisateurs invités)