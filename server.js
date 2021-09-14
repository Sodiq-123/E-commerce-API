const express = require('express'),
    config = require('./app')
    path = require("path"),
    app = express();
    dotenv = require('dotenv').config()

app = config(app);
app.set("port", process.env.PORT || 5000);

// Database connection
const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
})

// authenticate database connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

//  Server
const server = app.listen(app.get("port"), function () {
  console.log("Server up: http://localhost:" + app.get("port"));
});