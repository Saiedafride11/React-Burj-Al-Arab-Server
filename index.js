const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 5000;
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
// console.log(process.env.DB_PASS)

var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.jumub.mongodb.net:27017,cluster0-shard-00-01.jumub.mongodb.net:27017,cluster0-shard-00-02.jumub.mongodb.net:27017/burjAlArab?ssl=true&replicaSet=atlas-20e537-shard-0&authSource=admin&retryWrites=true&w=majority`;



var serviceAccount = require("./config/react-firebase-burj-al-a-20138-firebase-adminsdk-duj77-de07556c7d.json");



admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



app.get('/', (req, res) => {
  res.send('hello working Project')
})



client.connect(err => {
  const bookings = client.db("burjAlArab").collection("booking");
  // console.log("DB Connection Succesfully");

  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
    .then(result => {
        // console.log(result);
        res.send(result.insertedCount > 0);
    })
    console.log(newBooking)
  })

  // app.get('/bookings', (req, res) => {
  //   console.log(req.headers.authorization)
  //   // console.log(req.query.email)
  //   // bookings.find({})
  //   bookings.find({email: req.query.email})
  //   .toArray((err, documents) => {
  //     res.send(documents)
  //   })
  // })

  app.get('/bookings', (req, res) => {
    console.log(req.headers.authorization)
    // console.log(req.query.email)
    // bookings.find({})

    
    const bearer = req.headers.authorization;
    if(bearer && bearer.startsWith('Bearer ')){
        const idToken = bearer.split(' ')[1]
        console.log({idToken})

        admin.auth().verifyIdToken(idToken).then((decodedToken) => {
          let tokenEmail = decodedToken.email;
          let queryEmail = req.query.email;
           if(tokenEmail == queryEmail){
              bookings.find({email: queryEmail})
              .toArray((err, documents) => {
                res.status(200).send(documents)
              })
           }
           else{
            res.status(401).send("unAuthorizedAccess")
           }
          })
          .catch((error) => {
            res.status(401).send("unAuthorizedAccess")
        });
      }

      else{
        res.status(401).send("unAuthorizedAccess")
      }
  })

});



app.listen(process.env.PORT || port)

// https://mighty-lowlands-01566.herokuapp.com/