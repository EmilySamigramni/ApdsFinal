import http from "http";
import https from "https";
import express from "express";
import fs from "fs";
import cors from "cors";
import customer from "./routes/customer.mjs";
import employee from "./routes/employee.mjs";
import transaction from "./routes/transaction.mjs";

const app = express();
const port = 3000;

const allowedOrigins = ['https://your-frontend-domain.com']; 
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    next();
});

app.use("/customer", customer);
app.use("/employee", employee);
app.use("/transaction", transaction);

const sslOptions = {
    key: fs.readFileSync("path/to/ssl/key.pem"), 
    cert: fs.readFileSync("path/to/ssl/cert.pem")  
};

https.createServer(sslOptions, app).listen(port, () => {
    console.log(`Server running securely on port ${port}`);
});
