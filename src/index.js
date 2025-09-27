// require("dotenv").config({path: "./env"})
import dotenv from "dotenv"
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import express from "express";
import connnectDB from "./db/index.js";



dotenv.config({
    path:"./db"
})

connnectDB();




// ;( async ()=>{
//     try{
//         await mongoose.connect(`${process.env.MNGODB_URI}/${DB_NAME}`);
//         console.log("Database connected successfully");
//         app.on("error",(error)=>{
//             console.log("ERRR: ", error);
//             throw error;
//         });

//         app.listen(process.env.PORT, ()=>{
//             console.log(`app listening to port ${process.env.PORT}`);
//         })
        

//     }catch(err){
//         console.log("Error connecting database", err);
//         throw err;
//     }
// })()