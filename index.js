const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0dt9tdk.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toysCollection = client.db('kidolDB').collection('toysDB');
    const shopCollection = client.db('shopDB').collection('toyShop');

    // get items
    app.get('/toys',async(req,res)=>{
      // console.log(req.query.sellerEmail);
      let query = {};
      if(req.query?.sellerEmail){
        query = {sellerEmail: req.query.sellerEmail}
      }
      if(req.query?.category){
        query = {category: req.query.category}
      }
      // const type = req.query.type === "ascending";
      // const value = req.query.value;
      // console.log(req.query);
      // let sortObj = {};
      // sortObj[value] = type ? 1 : -1;
      // const result = await toysCollection.find(query).sort(sortObj).toArray();
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    })

    // get all toys
    app.get('/shopping',async(req,res)=>{
      const type = req.query.type === "ascending";
      const value = req.query.value;
      console.log(req.query);
      let sortObj = {};
      sortObj[value] = type ? 1 : -1;
      const result = await shopCollection.find({}).limit(20).sort(sortObj).toArray();
      res.send(result);
    })

    // get items by id
    app.get('/toys/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await toysCollection.findOne(query);
      res.send(result);
    })

    // update a items
    app.put('/toys/:id',async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updatedToys = req.body;
      const toys = {
        $set:{
          price: updatedToys.price,
          quantity: updatedToys.quantity,
          details: updatedToys.details
        }
      }
      const result = await toysCollection.updateOne(filter,toys,options);
      res.send(result);
    })

    // delete a items 
    app.delete('/toys/:id',async (req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    })

    // post a items
    app.post('/toys',async(req,res)=>{
        const newToy = req.body;
        console.log(newToy);
        const result = await toysCollection.insertOne(newToy);
        res.send(result);
    })

    // post myshop
    app.post('/shopping',async(req,res)=>{
      const shopping = req.body;
      console.log(shopping);
      const result = await shopCollection.insertOne(shopping);
      res.send(result);
    })


    // get all toys by id
    app.get('/shopping/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await shopCollection.findOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('Kidol is runnig')
})

app.listen(port,()=>{
    console.log(`Kidol server is ruunig on port:${port}`)
})