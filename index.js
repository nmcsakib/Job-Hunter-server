const express = require('express');
const router = express()
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Middleware
router.use(cors())
router.use(express.json())

router.get('/', (req, res) => {
    res.send('toys are running')
})


// MongoDB

const uri = process.env.DB_URI;

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
     client.connect();
     const createdAt = new Date();
     const database = client.db("sci-fi-toy");
    const allToys = database.collection("all-toys");

    const indexKeys = {toyName: 1,}
    const indexOption = {name: 'toyNameSearch'}
    const index = await allToys.createIndex(indexKeys, indexOption)

     router.get('/allToys', async(req, res) => {
      
        const result = await allToys.find().sort({ createdAt: -1 }).toArray()
        res.send(result)
     })
     router.post('/allToys', async(req, res) => {

      const toy = req.body;
      toy.createdAt = createdAt;
      const result = await allToys.insertOne(toy)
      res.send(result)

     })

     router.get('/my-toys', async(req, res) => {
      const email = req.query.email;
      let query = {}
      if(req.query?.email){
        query = {sellerEmail: req.query.email};
      }
      const result = await allToys.find(query).toArray()
      console.log(email);
      res.send(result)
     })

     router.get('/searchToy/:text', async(req, res) => {
      const text = req.params.text;
      const result = await allToys.find(
      {
        $or:[
          {toyName:{$regex: text, $options: "i"}},
          
        ]
      }
      ).toArray()
      res.send(result)
    })
     router.get('/subCategoryToys/:text', async(req, res) => {
        const result = await allToys.find({subCategory: req.params.text}).toArray()
        res.send(result)
     })
     router.get('/toy/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id : new ObjectId(id) }
        const result = await allToys.findOne(query);
        console.log(id);
        res.send(result)
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

router.listen(port)