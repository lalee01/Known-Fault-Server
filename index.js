const express = require('express')
const app = express()
const mysql = require('mysql')
const cors = require ('cors')

const bcrypt = require ('bcrypt');
const saltRounds = 10;

app.use(cors())
app.use(express.json())

const db= mysql.createPool({
    user:'root',
    host:'localhost',
    password:'',
    database:'posts',
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
                if(result<1){
                    res.send("Hibás felhasználónév vagy jelszó!")
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
