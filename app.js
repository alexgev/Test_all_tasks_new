var http = require("http");
var express = require("express");
var fs = require("fs");

var index = fs.readFileSync("./index.html");

var app = express();
app.use(express.static(__dirname + '/public'));


app.get("/", function(req, res) {
    res.end(index);
});

app.listen(8080, function() {
    console.log("server listening on port 8080")
});