const express = require('express');
const odbc = require('odbc');

const app = express();

const connectionConfig = {
//    connectionString: 'Data Source=LAPTOP-Q8KRVCC6\\SQLEXPRESS;Initial Catalog=Orizon;User ID=orizon;Password=orizon'
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
app.get('/data', ensureConnected, (req, res) => {
    const connection = req.app.locals.connection;
  
    connection.query('SELECT * FROM Users', (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête' });
      }
  
      res.json(result);
    });
});

function handleNotFound(req, res, next) {
    res.status(404).json({ error: 'Route introuvable' });
}

// Appliquer les middlewares
app.use(closeConnection);
app.use(handleNotFound);

// Démarrer le serveur
const port = 3000;
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});