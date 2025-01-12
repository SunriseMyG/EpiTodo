const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    multipleStatements: true
});

connection.connect((err) => {
    if (err) {
        console.error('Erreur lors de la connexion au serveur MySQL: ' + err.stack);
        return;
    }
    console.log('Connecté au serveur MySQL.');

    const dbName = process.env.DATABASE_NAME;
    connection.query(`SHOW DATABASES LIKE '${dbName}'`, (err, results) => {
        if (err) {
            console.error('Erreur lors de la vérification de la base de données: ' + err.stack);
            return;
        }

        if (results.length === 0) {
            connection.query(`CREATE DATABASE ${dbName}`, (err) => {
                if (err) {
                    console.error('Erreur lors de la création de la base de données: ' + err.stack);
                    return;
                }
                console.log(`Base de données ${dbName} créée avec succès.`);
                useDatabaseAndLoadFiles();
            });
        } else {
            useDatabaseAndLoadFiles();
        }
    });
});

function useDatabaseAndLoadFiles() {
    const dbName = process.env.DATABASE_NAME;
    connection.changeUser({ database: dbName }, (err) => {
        if (err) {
            console.error('Erreur lors du changement de base de données: ' + err.stack);
            return;
        }
        loadSQLFile('user', () => {
            loadSQLFile('trello', () => {
                loadSQLFile('tasks', () => {
                    loadSQLFile('invites', () => {
                        loadSQLFile('columns', () => {
                            console.log('Connecté à la base de données.');
                        });
                    });
                });
            });
        });
    });
}

function loadSQLFile(filename, callback) {
    const sqlFilePath = path.join(__dirname, `../sql/${filename}.sql`);
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    connection.query(sql, (err, results) => {
        if (err) {
            console.error(`Erreur lors de l'exécution du fichier SQL ${filename}: ` + err.stack);
            return;
        }
        console.log(`Fichier SQL ${filename} exécuté avec succès`);
        callback();
    });
}

module.exports = connection;