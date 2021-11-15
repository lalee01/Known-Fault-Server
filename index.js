const express = require('express')
const dotenv = require('dotenv').config()
const app = express()
const mysql = require('mysql')
const cors = require ('cors')
const bcrypt = require ('bcrypt');
const saltRounds = 10;
const validator = require('validator');
const multer = require('multer')
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

const storage = multer.diskStorage({
    destination: (req,file,cb) =>{
        cb(null,'public')
    },
    filename: (req,file,cb) =>{
        cb(null,file.originalname) 
    }
})
const upload = multer({storage}).array('file');

const db= mysql.createPool({
    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    password:process.env.DB_PASS,
    database:process.env.DB_DATABASE,
})

app.post ('/create', (req,res)=>{
    const title = req.body.title
    const manufacturer = req.body.manufacturer
    const model = req.body.model
    const description = req.body.description
    const postid = req.body.postid

    db.query(
        "INSERT INTO post (title,manufacturer,model,description,postid) VALUES(?,?,?,?,?)",
        [title,manufacturer,model,description,postid],
        (err,result) =>{
            if(err) {
                console.log(err);
            }else {
                res.send("Values posted")
            }
        }  
    )
})

app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(500).json(err)
        }

        return res.status(200).send(req.files)
    })
});

app.post('/uploaddb', (req, res) => {
    const username = req.body.username
    const postid = req.body.postid
    const name = req.body.name
    const source = req.body.source
    

    db.query(
        "INSERT INTO uploads (name,postid,username,source) VALUES(?,?,?,?)",
        [name,postid,username,source],
        (err,result) =>{
            if(err) {
                console.log(err);
            }else {
                res.send("Values posted")
            }
        }  
    )

});

app.get ('/getposts',async(req,res)=>{

    const readPosts = await knex.select().from('post')
    const readImages = await knex.select().from('uploads')
    const joinedTables = await knex.select().from('post').join('uploads', 'post.postid' , '=', 'uploads.postid')
    const selectedImages = []
    const joining =
    readPosts.map((item,key)=>{
        selectedImages.push({
            model:item.model,
            title: item.title,
            manufacturer:item.manufacturer,
            description:item.description,
            postid:item.postid,
            name:[]
        })
        readImages.map((pic)=>{
            if(pic.postid==selectedImages[key].postid){
                selectedImages[key].name.push(pic.name)
            }

        })
    })
  

    console.log(selectedImages)

    res.send(selectedImages)

})

app.get ('/audi', (req,res)=>{
    const title = req.body.title
    const manufacturer = req.body.manufacturer
    const model = req.body.model
    const description = req.body.description
    const id = req.body.id

    db.query(
        "SELECT * FROM post WHERE manufacturer='Audi'",
        (err,result) =>{
            if(err) {
                console.log(err);
            }else {
                res.send(result)
            }
        }       
    )
})

app.post ('/register', async(req,res)=>{
    const username = req.body.username
    const password = req.body.password
    const email = req.body.email
    const sameDataCheck= await knex('users').select().where(function(){this.where('username',username).orWhere({email:email})})


    if(sameDataCheck<2){
        bcrypt.genSalt(saltRounds,   function(err, salt) {  
            bcrypt.hash(password, salt, async function(err, hash) {
                await knex('users').insert({ username:username,password:hash,email:email})
                res.send(["Sikeres regisztráció",true])
            })
        })
    }else{
        res.send(["Van ilyen felhasználó",false])
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


app.listen(3001,()=>{
    console.log("server port is 3001")
});
