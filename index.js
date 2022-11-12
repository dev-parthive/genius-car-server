const express = require("express");
const cors = require('cors')
const app  = express()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectID, serialize } = require("bson");

//require dotenv 
require('dotenv').config()

//middlewares 
app.use(cors())
app.use(express.json())
// ---------------------------------
// connect mongodb 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.afdwhlk.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
        try{
            const servicesCollection = client.db('geniusCar').collection('services')
            const orderCollection = client.db('geniusCar').collection('orders')

            app.get('/services', async(req, res)=>{
                //data gula k kujar jonno conditon set kora
                const query = {}
                // cursor diye kojar kaj ta kora hoy 
                const cursor =servicesCollection.find(query)
                // amra array te convert korbo jate client side a use korte pari
                const services = await cursor.toArray()
                res.send(services)
            })
            app.get('/services/:id', async(req, res) => {
              const id  = req.params;  
              //   console.log(id)
              const query = {_id: ObjectID(id)};
              const service = await servicesCollection.findOne(query); 
                res.send(service)
              

            });

            //Orders api 
            app.get('/orders', async (req, res)=>{
                console.log(req.query.email)
                let  query = {};
                if(req.query.email){
                    query = {
                        email: req.query.email,
                    }
                }
                const cursor = orderCollection.find(query)
                const orders = await cursor.toArray();
                res.send(orders);
            })
            // order create 
            app.post('/orders', async(req, res)=>{
                const order = req.body;
                const result = await orderCollection.insertOne(order);
                res.send(result);
            });
            // order update 
            app.patch('/orders/:id', async (req, res) =>{
                const id = req.params.id;
                const status = req.body.status
               const query = {_id:  ObjectId(id)}
               const updateDoc = {
                $set:{
                    status : status,
                }
               }
               const result = await orderCollection.updateOne(query, updateDoc);
               res.send(result)
            })

                //order cancel 
            app.delete('/orders/:id', async(req, res)=>{
                const id = req.params.id;
                const query = {_id: ObjectID(id)}
                const result = await orderCollection.deleteOne(query) 
                res.send(result)
            })

        }
        catch{

        }
        finally{

        }
}
run() .catch( err => console.log(err))

// console.log(process.env.DB_USER)
// console.log(process.env.DB_PASSWORD)

app.get('/', (req, res) =>{
    res.send('Genius car server running')
})
app.listen(port, ()=>{
    console.log('genius car server running on port' , port );
})