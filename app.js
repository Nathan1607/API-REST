const express = require('express');
const odbc = require('odbc');
const bodyParser = require('body-parser');

const app = express();

const connectionConfig = {
    connectionString: 'Driver={SQL Server};Server=LAPTOP-Q8KRVCC6\\SQLEXPRESS;Database=Orizon;User=orizon;Password=orizon;'

}

// Middleware pour gérer les erreurs de connexion
function handleConnectionError(err, req, res, next) {
    console.error(err);
    res.status(500).json({ error: 'Erreur de connexion à la base de données' });
}

  // Middleware pour vérifier la connexion avant chaque requête
function ensureConnected(req, res, next) {
    if (req.app.locals.connection) {
      return next();
    }

    odbc.connect(connectionConfig, (err, connection) => {
        if (err) {
          return handleConnectionError(err, req, res, next);
        }    
    req.app.locals.connection = connection;
    next();
    });
}

// Middleware pour fermer la connexion après chaque requête
function closeConnection(req, res, next) {
    if (req.app.locals.connection) {
      req.app.locals.connection.close((err) => {
        if (err) {
          console.error(err);
        }
        req.app.locals.connection = null;
      });
    }
    next();
}


// Exemple de route pour récupérer des données depuis la base de données

app.get('/users', ensureConnected, (req, res) => {
    const connection = req.app.locals.connection;
  
    connection.query('SELECT * FROM Users', (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête' });
      }
  
      res.json(result);
    });
});

// Configuration du body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Route pour ajouter un utilisateur à la base de données
app.post('/register', ensureConnected, (req, res) => {
  const connection = req.app.locals.connection;
  const { name, first_name, mail, password } = req.body;

  connection.query('INSERT INTO Users ( name, first_name, mail, password) VALUES ( ?, ?, ?, ?)', [name, first_name, mail, password], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de l\'insertion de l\'utilisateur' });
    }

    res.json({ success: true, message: 'Utilisateur inséré avec succès'});
  });
});

function handleNotFound(req, res, next) {
    res.status(404).json({ error: 'Route introuvable' });
}

function handleErrors(err, req, res, next) {
  console.error(err); // Affiche l'erreur dans la console

  // Vérifier si l'erreur est liée à l'insertion de l'utilisateur
  if (err.message === "Erreur lors de l'insertion de l'utilisateur") {
    return res.status(500).json({ error: 'Erreur lors de l\'insertion de l\'utilisateur' });
  }

  // Répondre avec un message d'erreur générique pour les autres erreurs
  res.status(500).json({ error: 'Erreur interne du serveur' });
}

// Middleware pour gérer les erreurs de connexion
function handleConnectionError(err, req, res, next) {
  console.error(err);

  // Vérifier si l'erreur est liée à la connexion à la base de données
  if (err.message === 'Erreur de connexion à la base de données') {
    return res.status(500).json({ error: 'Erreur de connexion à la base de données' });
  }

  // Répondre avec un message d'erreur générique pour les autres erreurs de connexion
  res.status(500).json({ error: 'Erreur de connexion à la base de données' });
}

// Appliquer les middlewares
app.use(express.json());
app.use(closeConnection);
app.use(handleNotFound);
app.use(handleErrors);
app.use(handleConnectionError);

// Démarrer le serveur
const port = 8080;
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});