const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const port = 5000;
//mongo database require
const objectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tbdbuji.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// db connection checking
app.get("/", function (req, res) { res.send("------------->> Flash-bright database connected  <<-------------"); })

//DB connection between client-server
client.connect(err => {
    //Database
    const Services = client.db("flashBright").collection("services");
    const Orders = client.db("flashBright").collection("orders");
    const Admin = client.db("flashBright").collection("admin");

    console.log('database connected');

    // MainPage
    //get services
    app.get("/getServices", (req, res) => {
        Services.find({})
            .toArray((err, documents) => { res.send(documents) })
    })

    // get services by id
    app.get('/getServices/:id', (req, res) => {
        Services.find({ _id: ObjectId(req.params.id) })
            .toArray((err, documents) => { res.send(documents[0]) })
    })

    // Booking panel
    // new booking
    app.post('/newBooking', (req, res) => {
        Orders.insertOne(req.body)
            .then(result => { res.send(result.insertedCount > 0) })
    })

    // show Booking
    app.get('/getBookingList', (req, res) => {
        Orders.find({ email: req.query.email })
            .toArray((err, documents) => { res.send(documents) })
    })

    // Admin panel
    // All Orders
    app.get("/allOrders", (req, res) => {
        Orders.find({})
            .toArray((err, documents) => { res.send(documents) })
    })

    // Update orders
    app.patch("/allOrders/:id", (req, res) => {
        Orders.updateOne({ _id: ObjectId(req.params.id) },
            { $set: { status: req.body.status } })
            .then(result => { res.send(result.modifiedCount > 0) })
    })

    //Add services
    app.post('/addService', (req, res) => {
        Services.insertOne(req.body)
            .then(result => { res.send(result.insertedCount > 0) })
    });

    //delete service
    app.delete('/deleteService/:id', (req, res) => {
        Services.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => { res.send(result.deletedCount > 0) })
    })

    // admin
    app.post('/isAdmin', (req, res) => {
        Admin.find({ email: req.body.email })
            .toArray((err, admin) => { res.send(admin.length > 0) })
    })

    //makeAdmin
    app.get('/makeAdmin', (req, res) => {
        Admin.insertOne(req.body)
            .then(result => { res.send(result.insertedCount > 0) })
    })

    // getAdmin
    app.get('/getAdmin', (req, res) => {
        Admin.findOne(req.params.id)
            .toArray((err, admin) => { res.send(admin) })
    })

});

app.listen(process.env.PORT || port)