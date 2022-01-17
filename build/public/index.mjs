"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const express = require('express');
const dotenv = require('dotenv').config();
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const validator = require('validator');
const multer = require('multer');
const mongoose = require('mongoose');
const authRoutes = require('./Component/controllers/auth.controller');
const knex = require('knex')({
    client: 'mysql',
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_DATABASE
    }
});
const path = require('path');
const rootDir = path.resolve(path.resolve(''));
console.log(path.resolve(path.resolve('')));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
//Google Auth
app.use("/auth", authRoutes);
const db = mongoose.connection;
db.once("open", () => console.log("Connected to Mongo DB!!"));
db.on("error", (error) => console.error(error));
//Google Auth End
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage }).array('file');
app.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const title = req.body.title;
    const manufacturer = req.body.manufacturer;
    const model = req.body.model;
    const description = req.body.description;
    const postid = req.body.postid;
    const source = req.body.source;
    if (validator.isLength(title, { min: 3, max: 16 }) &&
        validator.isLength(manufacturer, { min: 1, max: 16 }) &&
        validator.isLength(model, { min: 1, max: 16 }) &&
        validator.isLength(description, { min: 6, max: 128 }) &&
        validator.isLength(source, { min: 1, max: 16 })) {
        yield knex('post').insert({ title: title, manufacturer: manufacturer, model: model, description: description, postid: postid });
    }
    else {
        res.send('Beviteli mező Error');
    }
}));
app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(500).json(err);
        }
        return res.status(200).send(req.files);
    });
});
app.post('/uploaddb', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const postid = req.body.postid;
    const name = req.body.name;
    const source = req.body.source;
    const dataSendDB = yield knex('uploads').insert({ username: username, postid: postid, name: name, source: source });
}));
app.get('/getposts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const readPosts = yield knex.select().from('post');
    const readImages = yield knex.select().from('uploads');
    const joinedTables = yield knex.select().from('post').join('uploads', 'post.postid', '=', 'uploads.postid');
    const joining = readPosts.map((item, key) => {
        const payload = {
            model: item.model,
            title: item.title,
            manufacturer: item.manufacturer,
            description: item.description,
            postid: item.postid,
            date: item.date,
            name: [],
            username: [],
            source: []
        };
        readImages.map((pic) => {
            if (pic.postid === payload.postid) {
                payload.name.push(pic.name);
                payload.username.push(pic.username);
                payload.source.push(pic.source);
            }
        });
        return payload;
    });
    res.send(joining);
}));
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const sameDataCheck = yield knex('users').select().where(function () { this.where('username', username).orWhere({ email: email }); });
    if (validator.isLength(username, { min: 6, max: 16 }) &&
        validator.isLength(password, { min: 6, max: 16 }) &&
        validator.isEmail(email) &&
        validator.isLength(email, { min: 6, max: 256 }) &&
        sameDataCheck < 2) {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield knex('users').insert({ username: username, password: hash, email: email });
                    res.send(["Sikeres regisztráció", true]);
                });
            });
        });
    }
    else {
        res.send(["Van ilyen felhasználó vagy a feltételek nem teljesülnek", false]);
    }
}));
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const loginPassword = req.body.password;
    const getData = yield knex('users').select().where({ username: username });
    if (getData > 1 || bcrypt.compareSync(loginPassword, getData[0].password) == false) {
        res.send(false);
    }
    else {
        res.send(bcrypt.compareSync(loginPassword, getData[0].password));
    }
}));
app.get('/post/:postid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const readPosts = yield knex.select().from('post').where('post.postid', req.params.postid);
    const readImages = yield knex.select().from('uploads').where('uploads.postid', req.params.postid);
    const selectedPost = [];
    const joining = readPosts.map((item, key) => {
        selectedPost.push({
            model: item.model,
            title: item.title,
            manufacturer: item.manufacturer,
            description: item.description,
            postid: item.postid,
            name: [],
            date: item.date,
            username: [],
            source: []
        });
        readImages.map((pic) => {
            if (pic.postid == selectedPost[key].postid) {
                selectedPost[key].name.push(pic.name);
                selectedPost[key].username.push(pic.username);
                selectedPost[key].source.push(pic.source);
            }
        });
    });
    res.send(selectedPost);
    console.log('API call with postid:');
    console.log(req.params.postid);
    console.log(selectedPost);
}));
app.listen(3001, () => {
    console.log("server port is 3001");
});
