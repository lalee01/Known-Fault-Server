const express = require('express')
const dotenv = require('dotenv').config()
const app = express()
const cors = require ('cors')
const bcrypt = require ('bcrypt');
const saltRounds = 10;
const validator = require('validator');
const multer = require('multer')
const mongoose = require('mongoose')
const authRoutes = require("./auth.route.ts");
const knex = require('knex')({
    client: 'mysql',
    connection: {
      host : process.env.DB_HOST,
      port : process.env.DB_PORT,
      user : process.env.DB_USER,
      password : process.env.DB_PASS,
      database : process.env.DB_DATABASE
    }
  });

app.use(cors())
app.use(express.json())
app.use(express.static('public'))
app.use("/auth", authRoutes);

const db = mongoose.connection;
db.once("open", () => console.log("Connected to Mongo DB!!"));
db.on("error", (error) => console.error(error));

const storage = multer.diskStorage({
    destination: (req,file,cb) =>{
        cb(null,'public')
    },
    filename: (req,file,cb) =>{
        cb(null,file.originalname) 
    }
})
const upload = multer({storage}).array('file');

app.post ('/create', async (req,res)=>{
    const title = req.body.title
    const manufacturer = req.body.manufacturer
    const model = req.body.model
    const description = req.body.description
    const postid = req.body.postid

    if(
    validator.isLength(title,{min:3,max:16})&&
    validator.isLength(manufacturer,{min:1,max:16})&&
    validator.isLength(model,{min:1,max:16})&&
    validator.isLength(description,{min:6,max:128})&&
    validator.isLength(source,{min:1,max:16})
    ){
        await knex('post').insert({title:title,manufacturer:manufacturer,model:model,description:description,postid:postid})
    }else{
        res.send('Beviteli mező Error')
    }
})

app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(500).json(err)
        }
        return res.status(200).send(req.files)
    })
});

app.post('/uploaddb', async (req, res) => {
    const username = req.body.username
    const postid = req.body.postid
    const name = req.body.name
    const source = req.body.source
    const dataSendDB = await knex('uploads').insert({ username:username,postid:postid,name:name,source:source})

});

app.get ('/getposts',async(req,res)=>{

    const readPosts = await knex.select().from('post')
    const readImages = await knex.select().from('uploads')
    const joinedTables = await knex.select().from('post').join('uploads', 'post.postid' , '=', 'uploads.postid')
    
    const joining = readPosts.map((item,key)=>{
        const payload =  {
            model: item.model,
            title: item.title,
            manufacturer: item.manufacturer,
            description: item.description,
            postid: item.postid,
            date: item.date,
            date: item.date,
            name: [],
            username: [],
            source: []
        }

        readImages.map((pic)=>{
            if(pic.postid === payload.postid){
                payload.name.push(pic.name)
                payload.username.push(pic.username)
                payload.source.push(pic.source)
            }
        })
        
        
        return payload
    })
 
    res.send(joining)

})
app.post ('/register', async(req,res)=>{
    const username = req.body.username
    const password = req.body.password
    const email = req.body.email
    const sameDataCheck= await knex('users').select().where(function(){this.where('username',username).orWhere({email:email})})

    if(
    validator.isLength(username,{min:6,max:16})&&
    validator.isLength(password,{min:6,max:16})&&
    validator.isEmail(email)&&
    validator.isLength(email,{min:6,max:256})&&
    sameDataCheck<2
    )
        {
            bcrypt.genSalt(saltRounds,   function(err, salt) {  
                bcrypt.hash(password, salt, async function(err, hash) {
                    await knex('users').insert({ username:username,password:hash,email:email})
                    res.send(["Sikeres regisztráció",true])
                })
            })
    }else{
        res.send(["Van ilyen felhasználó vagy a feltételek nem teljesülnek",false])
    }
})

app.post ('/login', async(req,res)=>{
    const username = req.body.username
    const loginPassword = req.body.password
    const getData= await knex('users').select().where({username:username})
    
        if(getData>1 || bcrypt.compareSync(loginPassword, getData[0].password)==false){
            res.send(false)
        }else{
            res.send(bcrypt.compareSync(loginPassword, getData[0].password))
        }
})

app.get ('/post/:postid',async(req,res)=>{

    const readPosts = await knex.select().from('post').where('post.postid',req.params.postid)
    const readImages = await knex.select().from('uploads').where('uploads.postid',req.params.postid)
    const selectedPost = []


    const joining =
    readPosts.map((item,key)=>{
        selectedPost.push({
            model:item.model,
            title: item.title,
            manufacturer:item.manufacturer,
            description:item.description,
            postid:item.postid,
            name:[],
            date:item.date,
            username:[],
            source:[]

        })
        readImages.map((pic)=>{
            if(pic.postid==selectedPost[key].postid){
                selectedPost[key].name.push(pic.name)
                selectedPost[key].username.push(pic.username)
                selectedPost[key].source.push(pic.source)
            }
        })
    })
    res.send(selectedPost)


    console.log('API call with postid:')
    console.log(req.params.postid)
    console.log(selectedPost)

})



app.listen(3001,()=>{
    console.log("server port is 3001")
});
