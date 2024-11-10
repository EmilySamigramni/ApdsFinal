import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import ExpressBrute from "express-brute";

const router = express.Router();
var store = new ExpressBrute.MemoryStore();
var bruteforce = new ExpressBrute(store);

router.post("/pay", bruteforce.prevent, async (req, res) => {
    const { sender, recipient, amount } = req.body;

    if (!sender || !recipient || !amount) {
        return res.status(400).send("Transaction not valid");
    }

    try {
        let newDocument = { sender, recipient, amount, verified: false };
        let collection = await db.collection("transactions");
        let result = await collection.insertOne(newDocument);
        res.status(201).json(result);
    } catch (error) {
        console.error("Transaction error: ", error);
        res.status(500).json({ message: "Transaction failed" });
    }
});

router.get("/getUnverifiedPayments", bruteforce.prevent, async (req, res) => {
    try {
        const query = { verified: false };
        const collection = await db.collection("transactions");
        const result = await collection.find(query).toArray();
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

router.patch("/verifyPayment", bruteforce.prevent, async (req, res) => {
    try {
        const docId = req.body.id;

        if (!docId) {
            return res.status(400).send("An id is required");
        }

        const filter = { _id: new ObjectId(docId) };
        const collection = db.collection("transactions");
        const updateDoc = { $set: { verified: true } };

        const result = await collection.updateOne(filter, updateDoc);

        if (result.modifiedCount === 0) {
            return res.status(404).send({ message: "Payment not found or already verified." });
        }

        res.status(204).json(result);
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

export default router;
