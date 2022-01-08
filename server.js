require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose= require('mongoose')
const bodyParser = require('body-parser')
const app = express();
const URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@mern-call.bsfhx.mongodb.net/mern-call?retryWrites=true&w=majority`;
app.use(express.json());
// Basic Configuration
const port = process.env.PORT || 3000;
const connectDB = async () => {
  try {
      await mongoose.connect(URI)
      console.log('Connect success!')
  }
  catch (err) {
      console.log(err);
      return err;
  }
}
connectDB();
app.use(bodyParser.urlencoded({extended: false}))
let urlSchema= new mongoose.Schema({
  original: {type: String, required:true},
  short: Number 
})
let Url = mongoose.model('Url',urlSchema)
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
responseObject={}
app.post('/api/shorturl',(req,res)=>{
  let inputUrl = req.body['url'];
  let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi)
  
  if(!inputUrl.match(urlRegex)){
    res.json({error: 'Invalid URL'})
    return
  }
    
  responseObject['original_url'] = inputUrl
  
  let inputShort = 1
  
  Url.findOne({})
        .sort({short: 'desc'})
        .exec((error, result) => {
          if(!error && result != undefined){
            inputShort = result.short + 1
          }
          if(!error){
            Url.findOneAndUpdate(
              {original: inputUrl},
              {original: inputUrl, short: inputShort},
              {new: true, upsert: true },
              (error, savedUrl)=> {
                if(!error){
                  responseObject['short_url'] = savedUrl.short
                  res.json(responseObject)
                }
              }
            )
          }
  })
})
app.get('/api/shorturl/:input', function(req, res) {
  let input = req.params.input;
  Url.findOne({short:input},(err, result)=>{
    if(err)
      console.log(err)
    else{
      res.redirect(result.original)
    }
  })
});
// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
