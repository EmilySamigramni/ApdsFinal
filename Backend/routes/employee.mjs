import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import argon2 from "argon2"; // Updated to use Argon2
import jwt from "jsonwebtoken";
import ExpressBrute from "express-brute";

const router = express.Router();
var store = new ExpressBrute.MemoryStore();
var bruteforce = new ExpressBrute(store);

router.post("/signup", bruteforce.prevent, async (req, res) => { // Rate limiting added
    try {
        const { password, name } = req.body;

        if (!password || !name) {
            return res.status(400).send("Name and password are required.");
        }

        const securePassword = await argon2.hash(password); // Argon2 for hashing
        let newDocument = {
            name,
            password: securePassword
        };

        let collection = await db.collection("employee");
        let result = await collection.insertOne(newDocument);
        res.status(201).json(result);
    } catch (error) {
        console.error("Signup error: ", error);
        res.status(500).json({ message: "Signup failed" });
    }
});

router.post("/login", bruteforce.prevent, async (req, res) => { // Rate limiting added
    const { name, password } = req.body;

    try {
        const collection = await db.collection("employee");
        const user = await collection.findOne({ name });

        if (!user) {
            return res.status(401).json({ message: "Authentication failed" });
        }

        const passwordMatch = await argon2.verify(user.password, password); // Argon2 for verification
        if (!passwordMatch) {
            return res.status(401).json({ message: "Authentication failed" });
        }

        const token = jwt.sign({ name }, process.env.JWT_SECRET, { expiresIn: "1h" }); // Updated to use JWT_SECRET
        res.status(200).json({ message: "Authentication successful", token, name });
    } catch (error) {
        console.error("Login error: ", error);
        res.status(500).json({ message: "Login failed" });
    }
});

export default router;
