import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ExpressBrute from "express-brute";

const router = express.Router();

var store = new ExpressBrute.MemoryStore();
var bruteforce = new ExpressBrute(store);

router.post("/signup", async (req, res) => {

    try{
        const password = req.body.password;
        const name = req.body.name;

        if (!password || !name) {
            return res.status(400).send("Name and password are required.");
        }

        const securePassword = bcrypt.hash(req.body.password,10)
        let newDocument = {
            name: req.body.name,
            password: securePassword
        };
        
        let collection = await db.collection("employee");
        let result = await collection.insertOne(newDocument);
        res.send(result).status(204);
    } catch (error){
        console.error("Signup error: ", error);
        res.status(500).json( { message: "signup failed "});
    }
});

router.post("/login", bruteforce.prevent, async (req,res) => {
    const { name, password } = req.body;
    console.log(name );

    try {
        const collection = await db.collection("employee");
        const user = await collection.findOne({name});

        if (!user){
            return res.status(401).json({ message: "Authentication failed"});
        }
        else{
            const token = jwt.sign( {username:req.body.username, 
                password:req.body.password}, 
                "something_blah_blah_blah", 
                {expiresIn:"1h"});
            
            res.status(200).json({ message: "Authentication successful", 
                token: token,
                name: req.body.name
            })
        }
    } catch (error){
        console.error("Login error: ", error);
        res.status(500).json( { message: "Login failed "});
    }
});

export default router;
