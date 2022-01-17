import express from "express";
//const express=require('express')
import { authenticateUser } from "./Component/controllers/auth.controller";
//const { authenticateUser } = require('./Component/controllers/auth.controller')
const router = express.Router();

router.post("/", authenticateUser);

export default router;
