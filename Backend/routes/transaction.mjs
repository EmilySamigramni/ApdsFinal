import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/pay", async (req, res) =>{

    const sender = req.body.sender;
    const recipient = req.body.recipient;
    const amount = req.body.amount;

    if (!sender || !recipient || !amount) {
        return res.status(400).send("Transaction not valid");
    }

    try{
        let newDocument = {
            sender: sender,
            recipient: recipient,
            amount: amount,
            verified: false
        }

        let collection = await db.collection("transactions");
        let result = await collection.insertOne(newDocument);
        res.send(result).status(204)

    } 
    catch (error){
        console.error("Transaction error: ", error);
        res.status(500).json( { message: "Transaction failed "});
    }
});

router.get("/getUnverifiedPayments", async (req, res) => {

    try{
        const query = { verified: false}

        const collection = await db.collection("transactions");

        const result = await collection.find(query).toArray();
        return res.send(result).status(200);
    }
    catch (error){
        console.error("Error: ", error);
        res.status(500).json( { message: "Something went wrong "});
    }
})


router.patch("/verifyPayment", async (req, res) => {
    
    try{
        const docId = req.body.id;
        console.log("Extracted docId:", docId);

        if(!docId){
            return res.status(400).send("An id is required");
        }

        const filter = { _id: new ObjectId(docId) };

        const collection = db.collection("transactions");

        const updateDoc = {$set: {verified: true}};

        const result = await collection.updateOne(filter, updateDoc);

        if (result.modifiedCount === 0) {
            return res.status(404).send({ message: "Payment not found or already verified." });
        }

        res.send(result).status(204);
    }
    catch(error){
        console.error("Error: ", error);
        res.status(500).json( { message: "Something went wrong "});
    }
});

export default router;
