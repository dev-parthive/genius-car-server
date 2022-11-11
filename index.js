const express = require("express");
const app  = express()
const port = 5000;
app.get('/', (req, res) =>{
    res.send('Genius car server running')
})
app.listen(port, ()=>{
    console.log('genius car server running on port' , port );
})