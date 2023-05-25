const express = require('express');
const sql = require('mssql');
const app = express();
const port = 8080;

// Connexion BDD
const dbConfig = {
    server: 'localhost',
    port: '',
    database: '',
    user: '',
    password: '',
};


app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  });