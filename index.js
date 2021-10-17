const express = require('express')
const dotenv = require('dotenv').config()
const app = express()
const mysql = require('mysql')
const cors = require ('cors')
const bcrypt = require ('bcrypt');
const saltRounds = 10;
const validator = require('validator');
const multer = require('multer')

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

const storage = multer.diskStorage({
    destination: (req,file,cb) =>{
        cb(null,'public')
    },
    filename: (req,file,cb) =>{
        cb(null,Date.now() + '-' + file.originalname) 
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

    db.query(
        "INSERT INTO post (title,manufacturer,model,description) VALUES(?,?,?,?)",
        [title,manufacturer,model,description],
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

app.get ('/getposts', (req,res)=>{
    const title = req.body.title
    const manufacturer = req.body.manufacturer
    const model = req.body.model
    const description = req.body.description
    const id = req.body.id

    db.query(
        "SELECT * FROM post ",
        (err,result) =>{
            if(err) {
                console.log(err);
            }else {
                res.send(result)
            }
        }       
    )
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

app.post ('/register', (req,res)=>{
    const username = req.body.username
    const password = req.body.password
    const email = req.body.email

    db.query(
        "SELECT * FROM users WHERE username=(?) OR email=(?)",
        [username,email],
        (err,result) =>{
            if(err) {
                console.log(err);
            }else {
                res.send("Values posted")
                if(result<2){
                    console.log("nincs ilyen felhasználó")
                    bcrypt.genSalt(saltRounds, function(err, salt) {  
                        bcrypt.hash(password, salt, function(err, hash) {
                    
                            db.query(
                                "INSERT INTO users (username,password,email) VALUES(?,?,?)",
                                [username,hash,email],
                                (err,result) =>{
                                    if(err) {
                                        console.log(err);
                                    }else {
                                        res.send("Values posted")
                                    }
                                }
                            )
                        })
                    })
                }else{
                    console.log("már van ilyen")
                }
            }
        }
    )
})

app.post ('/login', (req,res)=>{
    const username = req.body.username
    const loginPassword = req.body.password
    db.query(
        "SELECT password FROM users WHERE username=?",
        [username],
        (err,result) =>{
            if(err) {
                console.log("err", err);
                throw Error("Wrong username or password")
            }else {
                if(result<1 || bcrypt.compareSync(loginPassword, result[0].password)==false){
                    res.send(false)
                }else{    
                    res.send(bcrypt.compareSync(loginPassword, result[0].password))
                }
            }
        }
    )
})


app.listen(3001,()=>{
    console.log("server port is 3001")
});
