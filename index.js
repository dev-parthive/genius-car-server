const express = require("express");
const cors = require('cors'); 

// require jsonwebtoken 
const jwt = require('jsonwebtoken')
const app  = express()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId,  } = require('mongodb');
// const { ObjectID, serialize } = require("bson");

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

function verifyJWT (req, res, next){
    const authHeader = req.headers.authorization
    if(!authHeader){
        return res.status(401).send({message:'unauthorized access'})
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(401).send({message: 'unauthorized access'})
        }
        req.decoded = decoded;
        next()
        
    })
   
}

async function run(){
        try{
            const servicesCollection = client.db('geniusCar').collection('services')
            const orderCollection = client.db('geniusCar').collection('orders') 

            //jwt token api
            app.post('/jwt', (req, res)=>{
                const user = req.body
                const token  =  jwt.sign(user , process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'})
                res.send({token})
            })

            
            //services api

            app.get('/services', async(req, res)=>{
                //data gula k kujar jonno conditon set kora
                // const query = {price: {$gt: 20, $lt: 100}}
                // const query = {price: {$eq: 20}}
                // const query = {price: {$gte: 100}}
                const search = req.query.search
                let query  = {} 
                if(search.length){
                    query = {
                        $text: {
                            $search: search 
                        } 
                        
                         
                        
                    }

                }
                console.log(search)
                const order = req.query.order === 'asc' ? 1 : -1
                // cursor diye kojar kaj ta kora hoy 
                const cursor =servicesCollection.find(query).sort({price: order})
                // amra array te convert korbo jate client side a use korte pari
                const services = await cursor.toArray()
                res.send(services)
            });
            
            app.get('/services/:id', async(req, res) => {
              const id  = req.params.id;  
              console.log(id)
              //   console.log(id)
              const query = {_id: ObjectId(id)};
              const service = await servicesCollection.findOne(query); 
                res.send(service)
              

            });

            //Orders api 
            app.get('/orders', verifyJWT, async (req, res)=>{
                const decoded = req.decoded;
                console.log('inside orders api',decoded)
                if(decoded?.email !== req.query.email){
                    res.status(403).send({message: 'unauthorized access'})
                }
                console.log(req.query.email)
                // console.log(req.headers.authorization)
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
               const query = { _id: ObjectId(id) }
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
                const query = {_id: ObjectId(id)}
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
    res.send('Genius car server running................')
})
app.listen(port, ()=>{
    console.log('genius car server running on port' , port );
})