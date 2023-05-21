const express = require('express');
const router = express()
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Middleware
const corsConfig = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
  router.use(cors(corsConfig))
router.use(express.json())




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
    //  client.connect();
     const createdAt = new Date();
     const database = client.db("sci-fi-toy");
    const allToys = database.collection("all-toys");

    const indexKeys = {toyName: 1,}
    const indexOption = {name: 'toyNameSearch'}
    const index = await allToys.createIndex(indexKeys, indexOption)
    let query = {}
     router.get('/allToys', async(req, res) => {
      
        const result = await allToys.find().sort({ createdAt: -1 }).limit(20).toArray()
        res.send(result)
     })
     router.post('/allToys', async(req, res) => {

      const toy = req.body;
      toy.createdAt = createdAt;
      const result = await allToys.insertOne(toy)
      res.send(result)

     })
router.delete('/allToys/:id', async(req, res) => {
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await allToys.deleteOne(query)
  res.send(result)
})
     router.get('/my-toys', async(req, res) => {
      const email = req.query.email;
      
      if(req.query?.email){
        query = {sellerEmail: req.query.email};
      }
      const result = await allToys.find(query).toArray()
      console.log(email);
      res.send(result)
     })

     router.get('/my-toys/:text', async(req, res) => {
      const num = parseFloat(req.params.text)
      console.log(num);
      if(req.query?.email){
        query = {sellerEmail: req.query.email};
      }
      const result = await allToys.find(query).sort({price: num}).toArray()
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
        const result = await allToys.find({subCategory: req.params.text}).sort({ createdAt: -1 }).limit(4).toArray()
        res.send(result)
     })
     router.get('/toy/:id', async(req, res) => {
        const id = req.params.id;

        const query = {_id : new ObjectId(id) }
        const result = await allToys.findOne(query);
        if(req.query.some){
          const result = await allToys.findOne(query, {projection: { _id: 0, price: 1, availableQuantity: 1, detailDescription: 1 }});
          res.send(result)
        }else{

          res.send(result)
        }
        console.log(id);
     })

     router.put('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const toy = req.body;
      const filter = {_id : new ObjectId(id)}
      const options = { upsert: true };
      const updatedToy = {
          $set:{
              price: toy.price,
              availableQuantity: toy.availableQuantity,
              detailDescription: toy.detailDescription,
              createdAt : createdAt
              
          }
      }
      const result = await allToys.updateOne(filter, updatedToy, options)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
     client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

router.get('/', (req, res) => {
  res.send('toys are running')
})
router.listen(port, () => console.log('running on the port', port))