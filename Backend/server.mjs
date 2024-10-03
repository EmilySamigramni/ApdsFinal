import http from "http";
import https from "https";
import express from "express";
import fs from "fs";
import cors from "cors";
import customer from "./routes/customer.mjs";
import employee from "./routes/employee.mjs";
import transaction from "./routes/transaction.mjs";

const port = 3000;
const app = express()

app.use(cors());
app.use(express.json());

app.use((reg,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Acces-Control-Allow-Headers', '*');
    res.setHeader('Acces-Control-Allow-Methods', '*');
    next();
})

app.use("/customer",customer);
app.route("/customer",customer);
app.use("/employee", employee);
app.route("/employee", employee);
app.use("/transaction", transaction)

let server = http.createServer(app)
console.log(port);
server.listen(port)
