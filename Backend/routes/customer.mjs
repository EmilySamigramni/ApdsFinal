import express from "express";
import db from "../db/conn.mjs";
import argon2 from "argon2"; // Updated to use Argon2
import jwt from "jsonwebtoken";
import ExpressBrute from "express-brute";
import xss from "xss";

const router = express.Router();
var store = new ExpressBrute.MemoryStore();
var bruteforce = new ExpressBrute(store);

const nameRegex = /^[a-zA-Z0-9_]{3,30}$/;
const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+=-]{8,}$/;

router.post("/signup", bruteforce.prevent, async (req, res) => { // Rate limiting added
    try {
        let { name, password } = req.body;
        name = xss(name);
        password = xss(password);

        if (!nameRegex.test(name) || !passwordRegex.test(password)) {
            return res.status(400).send("Invalid name or password.");
        }

        const securePassword = await argon2.hash(password); // Argon2 for hashing
        let newDocument = { name, password: securePassword };

        let collection = await db.collection("customer");
        let result = await collection.insertOne(newDocument);
        res.status(201).json(result);
    } catch (error) {
        console.error("Signup error: ", error);
        res.status(500).json({ message: "Signup failed" });
    }
});

router.post("/login", bruteforce.prevent, async (req, res) => {
    let { name, password } = req.body;
    try {
        name = xss(name);
        password = xss(password);

        const collection = await db.collection("customer");
        const user = await collection.findOne({ name });

        if (!user) {
            return res.status(401).json({ message: "Authentication failed" });
        }

        const passwordMatch = await argon2.verify(user.password, password); // Argon2 for verification
        if (!passwordMatch) {
            return res.status(401).json({ message: "Authentication failed" });
        }

        const token = jwt.sign({ name }, process.env.JWT_SECRET, { expiresIn: "1h" }); // Updated to use JWT_SECRET
        res.status(200).json({ message: "Authentication successful", token });
    } catch (error) {
        console.error("Login error: ", error);
        res.status(500).json({ message: "Login failed" });
    }
});

export default router;
