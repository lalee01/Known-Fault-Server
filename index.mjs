import express from 'express'
import dotenv from 'dotenv'
const app = express()
import cors from 'cors'
import bcrypt from 'bcrypt'
const saltRounds = 10;
import validator from 'validator';
import multer from 'multer'
import mongoose from 'mongoose'
import authRoutes from './Component/controllers/auth.controller.js'
import Knex , {Config} from 'knex'
import knexConfig from './Component/knexConfig/knexConfigFile.js'

const knex =Knex(knexConfig.local)
console.log(knexConfig.local)

app.use(cors())
app.use(express.json())
app.use(express.static('public'))
//Google Auth

app.use("/auth", authRoutes);
mongoose.connect('mongodb+srv://shaan:shaan@cluster0.h5im6.mongodb.net/social_media?retryWrites=true&w=majority');
const db = mongoose.connection;

db.once("open", () => console.log("Connected to Mongo DB!!"));
db.on("error", (error) => console.error(error));

//Google Auth End
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
    const source = req.body.source
    const ytLink = req.body.ytLink

    
        await knex('post').insert({title:title,manufacturer:manufacturer,model:model,description:description,postid:postid})
        await knex('yt').insert({ytLink:ytLink,postid:postid})
        res.send('Beviteli mező Error')

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
    const readYtLink = await knex.select().from('yt').where('yt.postid',req.params.postid)

    const joining = readPosts.map((item,key)=>{
        const payload =  {
            model: item.model,
            title: item.title,
            manufacturer: item.manufacturer,
            description: item.description,
            postid: item.postid,
            date: item.date,
            name: [],
            username: [],
            source: [],
            link:[]
        }

        readImages.map((pic)=>{
            if(pic.postid === payload.postid){
                payload.name.push(pic.name)
                payload.username.push(pic.username)
                payload.source.push(pic.source)
            }
        })
        readYtLink.map((link)=>{
            if(link.postid === payload.postid){
                payload.link.push(link.ytLink)
            }
        })
        
        
        return payload
    })
        res.send(joining)
    
    

    console.log('API call with postid:')
    console.log(req.params.postid)
    console.log(joining)

})

app.get ('/manufacturer/:manufacturer',async(req,res)=>{

    const readPosts = await knex.select().from('post').where('post.manufacturer',req.params.manufacturer)
    const readImages = await knex.select().from('uploads')
    if (readPosts.length >1){
        const joining = readPosts.map((item,key)=>{
            const payload =  {
                model: item.model,
                title: item.title,
                manufacturer: item.manufacturer,
                description: item.description,
                postid: item.postid,
                date: item.date,
                name: [],
            }

            readImages.map((pic)=>{
                if(pic.postid === payload.postid){
                    payload.name.push(pic.name)
                }
            })
            
            return payload
        })
        res.send(joining)
        console.log(joining)
    }else{
        console.log('Ehhez a gyártóhoz nincs post!!!!')
        const errorMsg = 'Ehhez a gyártóhoz nincs post!!!!'
        const error = []
        const addError = error.push(errorMsg)
        res.send(readPosts)
        console.log(error)
        //res.send("Sorry! We don't have any post for this manufacturer.")
    }
})

app.get ('/counter',async(req,res)=>{

    const readPosts = await knex.select().from('post')
    const noPost = []

    const counter = noPost.push(readPosts.length)
    
    res.send(noPost)
    console.log(readPosts.length)
    console.log(noPost)

})
app.listen(3001,()=>{
    console.log("server port is 3001")
});
