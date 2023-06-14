const express = require('express');
const odbc = require('odbc');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

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


// Route pour récupérer des données Users depuis la base de données
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

// Route pour récupérer des données Formations depuis la base de données
app.get('/schools', ensureConnected, (req, res) => {
  const connection = req.app.locals.connection;

  connection.query('SELECT * FROM School', (err, result) => {
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
app.post('/registerUsers', ensureConnected, (req, res) => {
  const connection = req.app.locals.connection;
  const { name, first_name, mail, password } = req.body;

  connection.query('INSERT INTO Users (name, first_name, mail, password, profil) VALUES ( ?, ?, ?, ?, ?)', [name, first_name, mail, password, '1'], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de l\'insertion de l\'utilisateur' });
    }

    res.json({ success: true, message: 'Utilisateur inséré avec succès'});
  });
});

// Route pour ajouter un utilisateur + école dans la base de données
app.post('/registerSchool', ensureConnected, (req, res) => {
  const connection = req.app.locals.connection;
  const { name, first_name, mail, school_name, address, city, postcode, password } = req.body;

  connection.beginTransaction((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors du démarrage de la transaction' });
    }

    // Requête d'insertion dans la table "Users"
    connection.query('INSERT INTO Users (name, first_name, mail, password, profil) VALUES (?, ?, ?, ?, ?)', [name, first_name, mail, password, '2'], (err, result) => {
      if (err) {
        console.error(err);
        connection.rollback(() => {
          return res.status(500).json({ error: 'Erreur lors de l\'insertion de l\'utilisateur' });
        });
      }

      // Requête d'insertion dans une autre table (par exemple, "AutreTable")
      connection.query('INSERT INTO School (name, adress, city, postcode) VALUES (?, ?, ?, ?)', [school_name, address, city, postcode], (err, result) => {
        if (err) {
          console.error(err);
          connection.rollback(() => {
            return res.status(500).json({ error: 'Erreur lors de l\'insertion dans une autre table' });
          });
        }

        connection.commit((err) => {
          if (err) {
            console.error(err);
            connection.rollback(() => {
              return res.status(500).json({ error: 'Erreur lors de la validation de la transaction' });
            });
          }

          res.json({ success: true, message: 'Utilisateur inséré avec succès' });
        });
      });
    });
  });
});

// Route pour ajouter un professionnel à la base de données
app.post('/registerProfessionnal', ensureConnected, (req, res) => {
  const connection = req.app.locals.connection;
  const { name, first_name, mail, password, company_name, job_name } = req.body;

  connection.query('INSERT INTO Users (name, first_name, mail, password, profil, company_name, job_name) VALUES ( ?, ?, ?, ?, ?, ?, ?)', [name, first_name, mail, password, '3', company_name, job_name], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de l\'insertion de l\'utilisateur' });
    }

    res.json({ success: true, message: 'Utilisateur inséré avec succès'});
  });
});


// Route pour login des données Formations depuis la base de données
app.post('/login', ensureConnected, (req, res) => {
  const connection = req.app.locals.connection;
  const { mail, password } = req.body;

  connection.query('SELECT * FROM Users WHERE mail = ? AND password = ?', [mail, password], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête' });
    }

    if (result.length === 0) {
      return res.status(401).json({ error: 'Adresse e-mail ou mot de passe incorrect' });
    }

    // Les informations de connexion sont valides, générer un jeton d'authentification
    const userId = result[0].id;
    const token = jwt.sign({ userId }, 'B5F61F537C695F36447823C3644B3D95E68E71947A11C502EC5D0D6A5F0B9B2A');

    res.json({ success: true, message: 'Utilisateur existant', token });
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