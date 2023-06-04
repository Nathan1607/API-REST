const express = require('express');
const app = express();

var Connection = require('tedious').Connection;  
    var config = {  
        server: 'LAPTOP-Q8KRVCC6\\SQLEXPRESS', 
        authentication: {
            type: 'default',
            options: {
                userName: 'orizon', 
                password: 'orizon'  
            }
        },
        options: {
            // If you are on Microsoft Azure, you need encryption:
            encrypt: true,
            database: 'Orizon' 
        }
    };  
    
    var connection = new Connection(config);  
    connection.on('connect', function(err) {  
        console.log("Connected to the database");
        // executeStatement();
      }
    );
    
    connection.connect();
/*
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

function executeStatement() {
    var request = new Request("SELECT * FROM Users", function(err) {
        if (err) {
            console.log(err);
        }
    });

    var result = "";
    request.on('row', function(columns) {
        columns.forEach(function(column) {
            if (column.value === null) {
                console.log('NULL');
            } else {
                result += column.value + " ";
            }
        });
        console.log(result);
        result = "";
    });

    request.on('done', function(rowCount, more) {
        console.log(rowCount + ' rows returned');
        connection.close();
    });

    connection.execSql(request);
}
*/

app.listen(8080, () => {
    console.log('Serveur démarré sur le port 8080');
});
