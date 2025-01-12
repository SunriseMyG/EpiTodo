const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');
require('dotenv').config();

const secretKey = process.env.SECRET_KEY;

//   _____  ______ _____ _____  _____ _______ ______ _____
//  |  __ \|  ____/ ____|_   _|/ ____|__   __|  ____|  __ \
//  | |__) | |__ | |  __  | | | (___    | |  | |__  | |__) |
//  |  _  /|  __|| | |_ | | |  \___ \   | |  |  __| |  _  /
//  | | \ \| |___| |__| |_| |_ ____) |  | |  | |____| | \ \
//  |_|  \_\______\_____|_____|_____/   |_|  |______|_|  \_\
                                                         
// route to register a user
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe sont requis' });
    }

    const username = email.split('@')[0];

    try {
        db.query('SELECT * FROM user WHERE email = ?', [email], (err, results) => {
            if (err) {
                console.error('Erreur lors de la requête SQL: ' + err.stack);
                return res.status(500).json({ message: 'Erreur serveur' });
            }
            if (results.length > 0) {
                return res.status(409).json({ message: 'Email déjà utilisé' });
            }
            const creationDate = new Date();
            db.query('INSERT INTO user (email, password, username, created_at) VALUES (?, ?, ?, ?)', [email, password, username, creationDate], (insertErr) => {
                if (insertErr) {
                    console.error('Erreur lors de l\'insertion de l\'utilisateur: ' + insertErr.stack);
                    return res.status(500).json({ message: 'Erreur serveur' });
                }
                res.status(201).json({ message: 'Utilisateur enregistré avec succès' });
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

//   _      ____   _____ _____ _   _ 
//  | |    / __ \ / ____|_   _| \ | |
//  | |   | |  | | |  __  | | |  \| |
//  | |   | |  | | | |_ | | | | . ` |
//  | |___| |__| | |__| |_| |_| |\  |
//  |______\____/ \_____|_____|_| \_|
                                  

// route to register a user and login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe sont requis' });
    }

    try {
        console.log('Login attempt with:', { email, password });

        db.query('SELECT * FROM user WHERE email = ?', [email], (err, results) => {
            if (err) {
                console.error('Erreur lors de la requête SQL: ' + err.stack);
                return res.status(500).json({ message: 'Erreur serveur' });
            }
            if (results.length === 0) {
                console.log('No user found with email:', email);
                return res.status(401).json({ message: 'Email ou mot de passe invalide' });
            }

            const user = results[0];

            if (password !== user.password) {
                console.log('Invalid password for email:', email);
                return res.status(401).json({ message: 'Email ou mot de passe invalide' });
            }

            const token = jwt.sign({ userId: user.id, email: user.email }, secretKey, { expiresIn: '1h' });
            return res.json({ accessToken: token });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

//   _    _  _____ ______ _____  
//  | |  | |/ ____|  ____|  __ \ 
//  | |  | | (___ | |__  | |__) |
//  | |  | |\___ \|  __| |  _  / 
//  | |__| |____) | |____| | \ \ 
//   \____/|_____/|______|_|  \_\                        
                            

// route to get all users using SQL query
router.get('/users', (req, res) => {
    db.query('SELECT * FROM user', (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des utilisateurs: ' + err.stack);
            return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
        }
        res.json(results);
    });
});

//   _______        _____ _  __
//  |__   __|/\    / ____| |/ /
//     | |  /  \  | (___ | ' / 
//     | | / /\ \  \___ \|  <  
//     | |/ ____ \ ____) | . \ 
//     |_/_/    \_\_____/|_|\_\
                            
// route to add a task in a specific trello
router.post('/trello/:trelloId/task', (req, res) => {
    const { trelloId } = req.params;
    const { title, description, columnId, assign_to } = req.body; // Ajout de assign_to
    const createdAt = new Date();

    db.query('INSERT INTO tasks (title, description, trello_id, column_id, created_at, assign_to) VALUES (?, ?, ?, ?, ?, ?)',
        [title, description, trelloId, columnId, createdAt, assign_to], (err) => {
            if (err) {
                console.error('Erreur lors de l\'insertion de la tâche:', err);
                return res.status(500).json({ message: 'Erreur lors de l\'insertion de la tâche' });
            }
            res.status(201).json({ message: 'Tâche ajoutée avec succès' });
        });
});

// route to get all tasks from a specific trello
router.get('/trello/:trelloId/tasks', (req, res) => {
    const trelloId = req.params.trelloId;

    const query = `
        SELECT t.name AS trello_name, tk.id AS task_id, tk.title, tk.description, tk.assign_to, tk.column_id, tk.created_at
        FROM trello t
        JOIN tasks tk ON t.id = tk.trello_id
        WHERE t.id = ?`;

    db.query(query, [trelloId], (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des tâches:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        // console.log(results);
        res.json(results);
    });
});

// route to delete a tasks from a specific trello
router.delete('/trello/:trelloId/task/:taskId', (req, res) => {
    const { trelloId, taskId } = req.params;

    db.query('DELETE FROM tasks WHERE id = ? AND trello_id = ?', [taskId, trelloId], (err) => {
        if (err) {
            console.error('Erreur lors de la suppression de la tâche:', err);
            return res.status(500).json({ message: 'Erreur lors de la suppression de la tâche' });
        }
        res.json({ message: 'Tâche supprimée avec succès' });
    });
});

// route to update the column of a task
router.put('/trello/:trelloId/task/:taskId/column', (req, res) => {
    const { trelloId, taskId } = req.params;
    const { columnId } = req.body;

    db.query('UPDATE tasks SET column_id = ? WHERE id = ? AND trello_id = ?', [columnId, taskId, trelloId], (err) => {
        if (err) {
            console.error('Erreur lors de la mise à jour de la colonne de la tâche:', err);
            return res.status(500).json({ message: 'Erreur lors de la mise à jour de la colonne de la tâche' });
        }
        res.json({ message: 'Colonne de la tâche mise à jour avec succès' });
    });
});

//   _______ _____  ______ _      _      ____  
//  |__   __|  __ \|  ____| |    | |    / __ \ 
//     | |  | |__) | |__  | |    | |   | |  | |
//     | |  |  _  /|  __| | |    | |   | |  | |
//     | |  | | \ \| |____| |____| |___| |__| |
//     |_|  |_|  \_\______|______|______\____/ 
                                            
// route to add an user to a specific trello
router.post('/trello/:trelloId/invite', (req, res) => {
    const { email } = req.body;
    const { trelloId } = req.params;

    // Vérifie si l'email est fourni
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // Vérifier si le trelloId existe
    const checkTrelloQuery = 'SELECT * FROM trello WHERE id = ?';

    db.query(checkTrelloQuery, [trelloId], (err, trelloResults) => {
        if (err) {
            console.error('Erreur lors de la vérification du trelloId:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la vérification du trelloId' });
        }

        // Si aucun résultat n'est trouvé, renvoyer une erreur
        if (trelloResults.length === 0) {
            return res.status(404).json({ message: 'Trello ID not found' });
        }

        // Vérifier si l'email existe dans la table user
        const checkUserQuery = 'SELECT * FROM user WHERE email = ?';
        
        db.query(checkUserQuery, [email], (err, userResults) => {
            if (err) {
                console.error('Erreur lors de la vérification de l\'email:', err);
                return res.status(500).json({ message: 'Erreur serveur lors de la vérification de l\'email' });
            }

            // Vérifier si l'utilisateur a déjà été invité
            const checkInviteQuery = 'SELECT * FROM invites WHERE trello_id = ? AND email = ?';

            db.query(checkInviteQuery, [trelloId, email], (err, inviteResults) => {
                if (err) {
                    console.error('Erreur lors de la vérification de l\'invitation:', err);
                    return res.status(500).json({ message: 'Erreur serveur lors de la vérification de l\'invitation' });
                }

                // Si l'utilisateur a déjà été invité, renvoyer une erreur
                if (inviteResults.length > 0) {
                    return res.status(409).json({ message: 'User already invited' });
                }

                // Insérer l'email dans la table invites
                const insertQuery = 'INSERT INTO invites (trello_id, email) VALUES (?, ?)';
                db.query(insertQuery, [trelloId, email], (err) => {
                    if (err) {
                        console.error('Erreur lors de l\'insertion de l\'email dans la table invites:', err);
                        return res.status(500).json({ message: 'Erreur serveur lors de l\'insertion de l\'email' });
                    }

                    // Répondre avec un message de succès
                    res.status(201).json({ message: 'Utilisateur invité avec succès', email });
                });
            });
        });
    });
});

// create a trello
router.post('/trello', (req, res) => {
    const { name, creationDate } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }

    if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = req.headers.authorization.split(' ')[1];

    try {
        const decoded = jwt.verify(token, secretKey);
        const email = decoded.email;
        console.log('Email:', email);

        if (!email) {
            return res.status(400).json({ message: 'Invalid token: email is missing' });
        }

        const updatedAt = creationDate;
        const invite = '';

        db.query('INSERT INTO trello (name, email, created_at, updated_at, invite) VALUES (?, ?, ?, ?, ?)',
            [name, email, creationDate, updatedAt, invite], (err, results) => {
                if (err) {
                    console.error('Erreur lors de l\'insertion du trello:', err);
                    return res.status(500).json({ message: 'Erreur lors de l\'insertion du trello' });
                }

                const trelloId = results.insertId;

                db.query('INSERT INTO invites (trello_id, email) VALUES (?, ?)', [trelloId, email], (inviteErr) => {
                    if (inviteErr) {
                        console.error('Erreur lors de l\'insertion de l\'email dans la table invites:', inviteErr);
                        return res.status(500).json({ message: 'Erreur lors de l\'insertion de l\'email dans la table invites' });
                    }

                    res.status(201).json({ message: 'Trello ajouté avec succès et utilisateur invité', trelloId });
                });
            });
    } catch (err) {
        console.error('Erreur lors du décodage du token:', err);
        return res.status(401).json({ message: 'Token invalide' });
    }
});

// route to get all trello from email
router.get('/trello', (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const query = `
        SELECT t.id, t.name, DATE_FORMAT(t.created_at, "%Y-%m-%dT%H:%i:%s.000Z") as creationDate, t.email
        FROM trello t
        LEFT JOIN invites i ON t.id = i.trello_id
        WHERE t.email = ? OR i.email = ?
        GROUP BY t.id, t.name, t.created_at, t.email
    `;

    db.query(query, [email, email], (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des trello: ' + err.stack);
            return res.status(500).json({ message: 'Erreur lors de la récupération des trello' });
        }
        res.json(results);
    });
});

// get trello name from a specific trello
router.get('/trello/:id', (req, res) => {
    const { id } = req.params;

    db.query('SELECT name FROM trello WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération du nom du trello:', err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Trello not found' });
        }
        res.json(results[0]);
    });
});

// route to post an email in a specific trello
router.post('/trello/:id/email', (req, res) => {
    const { id } = req.params;
    const { email } = req.body;

    db.query('UPDATE trello SET email = ? WHERE id = ?', [email, id], (err, results) => {
        if (err) {
            console.error('Erreur lors de la mise à jour de l\'email: ' + err.stack);
            return res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'email' });
        }
        res.json({ message: 'Email mis à jour avec succès' });
    });
});

// route to delete a trello from a specific trello
router.delete('/trello/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM trello WHERE id = ?', [id], (err) => {
        if (err) {
            console.error('Erreur lors de la suppression du trello:', err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }
        res.json({ message: 'Trello supprimé avec succès' });
    });
});

//   _____ _   ___      _______ _______ ______ 
//  |_   _| \ | \ \    / /_   _|__   __|  ____|
//    | | |  \| |\ \  / /  | |    | |  | |__   
//    | | | . ` | \ \/ /   | |    | |  |  __|  
//   _| |_| |\  |  \  /   _| |_   | |  | |____ 
//  |_____|_| \_|   \/   |_____|  |_|  |______|
                                            

// route to get invite from a specific trello
router.get('/trello/:trelloId/invite', (req, res) => {
    const { trelloId } = req.params;

    const query = 'SELECT * FROM invites WHERE trello_id = ?';

    db.query(query, [trelloId], (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des invites:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(results);
    });
});

//    _____ ____  _     _    _ __  __ _   _ 
//   / ____/ __ \| |   | |  | |  \/  | \ | |
//  | |   | |  | | |   | |  | | \  / |  \| |
//  | |   | |  | | |   | |  | | |\/| | . ` |
//  | |___| |__| | |___| |__| | |  | | |\  |
//   \_____\____/|______\____/|_|  |_|_| \_|
                                         

// route to post column in a specific trello
router.post('/trello/:trelloId/column', (req, res) => {
    const { trelloId } = req.params;
    const { name } = req.body;

    db.query('INSERT INTO columns (name, trello_id) VALUES (?, ?)',
        [name, trelloId], (err) => {
            if (err) {
                console.error('Erreur lors de l\'insertion de la colonne:', err);
                return res.status(500).json({ message: 'Erreur lors de l\'insertion de la colonne' });
            }
            res.status(201).json({ message: 'Colonne ajoutée avec succès' });
        });
});

// get all columns from a specific trello
router.get('/trello/:trelloId/columns', (req, res) => {
    const { trelloId } = req.params;

    db.query('SELECT * FROM columns WHERE trello_id = ?', [trelloId], (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des colonnes:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(results);
    });
});

// route to check if a column exists in a specific trello
router.post('/trello/:trelloId/check-column', (req, res) => {
    const { name } = req.body;
    const { trelloId } = req.params;

    const query = 'SELECT * FROM columns WHERE name = ? AND trello_id = ?';
    db.query(query, [name, trelloId], (err, results) => {
        if (err) {
            console.error('Erreur lors de la vérification du nom de la colonne:', err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }

        if (results.length > 0) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    });
});

// route to delete a column from a specific trello
router.delete('/trello/:trelloId/column/:columnId', (req, res) => {
    const { columnId } = req.params;

    db.query('DELETE FROM columns WHERE id = ?', [columnId], (err) => {
        if (err) {
            console.error('Erreur lors de la suppression de la colonne:', err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }
        res.json({ message: 'Colonne supprimée avec succès' });
    });
});

module.exports = router;
