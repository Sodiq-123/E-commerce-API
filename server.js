const express = require('express'),
    config = require('./app'),
    path = require("path");
    app = express(),
    dotenv = require('dotenv').config();

app = config(app);
app.set("port", process.env.PORT || 5000);

// Database connection

const db = require('./database/db')
db.sequelize.sync()

//  Server
const server = app.listen(app.get("port"), function () {
  console.log("Server up: http://localhost:" + app.get("port"));
});