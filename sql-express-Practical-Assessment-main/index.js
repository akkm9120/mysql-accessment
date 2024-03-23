const express = require('express');
const cors = require('cors');
const mysql2 = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

let app = express();
app.use(express.json());
app.use(cors());

async function main() {
    app.get('/', function(req,res){
        res.send("Hello world");
    })
}
main()

app.listen(3000, ()=>{
    console.log("server has started")
})