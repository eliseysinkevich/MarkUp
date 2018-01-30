'use strict';
var express = require("express");
var bodyParser = require("body-parser");
var MongoClient = require("mongodb").MongoClient;

const url = 'mongodb://localhost:27017';
const dbName = 'md';

var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(express.static(__dirname + "/public"));
app.get("/", function (request, response) {
    response.end();
});
app.post("/save", urlencodedParser, function (request, response) {
    if (!request.body) return response.sendStatus(400);
    var text = request.body.data;
    var name = request.body.name;
    MongoClient.connect(url, function (err, client) {
        const db = client.db(dbName);

        var result = insertDocuments(db, text, name, function () {
            client.close();
        });
        response.end(result);
    });
});
app.post("/find", function (request, response) {
    var name;
    MongoClient.connect(url, function (err, client) {
        const db = client.db(dbName);

        findDocuments(db, function (docs) {
            for (var i = 0; i < docs.length; i++) {
                response.write(docs[i].name+"\n");
            }
            client.close();
            response.end();
        });
    });
});
app.get("/get", urlencodedParser, function (request, response) {
    MongoClient.connect(url, function (err, client) {
        const db = client.db(dbName);
        getDocument(db, request.query.data, function (result) {
            client.close();
            response.send(result);
        });
    });
});
app.post("/remove", urlencodedParser, function (request, response) {
    
    MongoClient.connect(url, function (err, client) {
        const db = client.db(dbName);
        var name = request.body.name;
        removeDocument(db, name, function () {
            client.close();
            response.end();
        });
    });
});
app.listen(3000);
const insertDocuments = function (db, text, name, callback) {
    const collection = db.collection('documents');
    if (name === "") {
        for (var i = 0; i < 10; i++) {
            name += Math.floor(Math.random() * 10);
        }
        name += ".md";
        var document = { name: name, text: text };
        collection.insertOne(document, function (err, result) {
            callback(result);
        });
    } else {
        collection.updateOne({ name: name }
            , { $set: { text: text } }, function (err, result) {
                callback(result);
            });
    }
    
    return name;
}
const findDocuments = function (db, callback) {
    // Get the documents collection
    const collection = db.collection('documents');
    // Find some documents
    collection.find({}).toArray(function (err, docs) {
        callback(docs);
    });
}
const getDocument = function (db, name, callback) {
    // Get the documents collection
    const collection = db.collection('documents');
    // Find some documents
    collection.find({}).toArray(function (err, docs) {
        for (var i = 0; i < docs.length; i++) {
            if (docs[i].name === name) {
                callback(docs[i].text);
                break;
            }
        }
    });
}
const removeDocument = function (db, name, callback) {
    // Get the documents collection
    const collection = db.collection('documents');
    // Delete document where a is 3
    collection.deleteOne({ name: name }, function (err, result) {
        callback(result);
    });
}