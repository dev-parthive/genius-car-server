const express = require("express");
const cors = require('cors')
const app  = express()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

//require dotenv 
require('dotenv').config()

//middlewares 
app.use(cors())
app.use(express.json())
// ---------------------------------
// connect mongodb 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.afdwhlk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});

console.log(process.env.DB_USER)
console.log(process.env.DB_PASSWORD)

app.get('/', (req, res) =>{
    res.send('Genius car server running')
})
app.listen(port, ()=>{
    console.log('genius car server running on port' , port );
})