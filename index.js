const express = require('express')
const app = express()
const mysql = require('mysql')
const cors = require ('cors')

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

app.listen(3001,()=>{
    console.log("server port is 3001")
});
