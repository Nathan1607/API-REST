const express = require('express');
const tedious = require('tedious');
const app = express();
const port = 8080;

var Connection = require('tedious').Connection;  
var config = {  
    server: 'LAPTOP-Q8KRVCC6\SQLEXPRESS',
    authentication: {
        type: 'default',
        options: {
            userName: 'orizon', 
            password: 'orizon'  
        }
    },
    options: {
        encrypt: true,
        database: 'Orizon'
    }
};  

var connection = new Connection(config);  
connection.on('connect', function(err) {  
    // If no error, then good to proceed.
    console.log("Connected");  
});
    
connection.connect();

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  });