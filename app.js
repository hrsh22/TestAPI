require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./db/connect");

const PORT = process.env.PORT || 5000;

const products_router = require("./routes/products");

const uri= process.env.MONGODB_URL;

app.get("/", (req,res)=>{
    res.send("Hi i am live!");
});

// set router

app.use("/api/products",products_router);

const start = async ()=>{
    try{
        await connectDB(uri);
        app.listen(PORT, ()=>{
            console.log("Server is live!");
            console.log(`${PORT} is the magic port!`);
        });
    } catch (err){
        console.log(err);
    }
}

start();