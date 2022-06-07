require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const route = require("./route/route")
const app = express();

const mongoose = require("mongoose")
const multer = require("multer")
const { AppConfig } = require('aws-sdk');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(multer().any());

console.log(process.env)
mongoose.connect(process.env.MONGO_URI,
    { useNewUrlParser: true })
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))


app.use('/', route);

app.listen(process.env.PORT || 3000, () => {
    console.log("Express App Running On Port " + (process.env.PORT || 3000))
})
