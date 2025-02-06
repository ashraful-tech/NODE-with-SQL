const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: '071022'
});

let getRandomUser = () => {
    return [
        faker.string.uuid(),
        faker.internet.username(), // before version 9.1.0, use userName()
        faker.internet.email(),
        faker.internet.password()
    ];
};
//Insert New Data
// let q = "INSERT INTO user (id, username, email, password) VALUES ?";

// let data = [];
// for (let i=1; i<=100; i++){
//     data.push(getRandomUser()); //100 fake user
// }

// try{
//     connection.query(q,[data],(err,result) =>{
//         if (err) throw err;
//         console.log(result);
//     });   
// } catch(err){
//     console.log(err);
// }

//connection.end();

//Home route
app.get("/", (req, res) => {
    let q = `SELECT count(*) FROM user`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let count = result[0]["count(*)"];
            res.render("index.ejs", { count });
        });
    } catch (err) {
        console.log(err);
        res.send("some error in DB");
    }
    //res.send("welcome to home page");
});

//Show route
app.get("/user", (req, res) => {
    let q = `SELECT * FROM user`;
    try {
        connection.query(q, (err, users) => {
            if (err) throw err;
            //console.log(result);
            res.render("showusers.ejs", { users });
            //res.send(result);
        });
    } catch (err) {
        console.log(err);
        res.send("some error in DB");
    }
});

//Edit route

app.get("/user/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id = '${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            console.log(user);
            res.render("edituser.ejs", { user });
            //res.send(result);
        });
    } catch (err) {
        console.log(err);
        res.send("some error in DB");
    }
    //res.render("edituser.ejs",{id});
});

//Update route
app.patch("/user/:id", (req, res) => {
    let { id } = req.params;
    let { password: formPass, username: newUsername } = req.body;
    let q = `SELECT * FROM user WHERE id ='${id}'`;

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            if (formPass != user.password) {
                res.send("Wrong Password");
            } else {
                let q2 = `UPDATE user SET username ='${newUsername}' WHERE id='${id}'`;
                connection.query(q2, (err, result) => {
                    if (err) throw err;
                    res.redirect("/user");
                });
            }
        });
    } catch (err) {
        console.log(err);
        res.send("some error in DB");
    }

});

//Add a new user
app.get("/user/new", (req, res) => {
    res.render("add.ejs");
});

app.post("/user/new", (req, res) => {
    let { username, email, password } = req.body;
    let id = uuidv4();
    let q3 = `INSERT INTO user(id, username, email, password) VALUES ('${id}','${username}','${email}', '${password}')`;
    try {
        connection.query(q3, (err, result) => {
            if (err) throw err;
            console.log("added new user");
            res.redirect("/user");
        });
    } catch (err) {
        console.log(err);
        res.send("some error in DB");
    }
});

//delete
app.get("/user/:id/delete", (req,res)=>{
    let {id} = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;

    try{
        connection.query(q, (err,result)=>{
            if (err) throw err;
            let user = result[0];
            res.render("delete.ejs", { user });
        }); 
    } catch (err){
        console.log(err);
        res.send("some error with DB");
    }
});

app.delete("/user/:id/", (req,res)=>{
    let {id} = req.params;
    let {password} = req.body;

    let q = `SELECT * FROM user WHERE id='${id}'`;

    try{
        connection.query(q,(err,result)=>{
            if (err) throw err;
            let user = result[0];

            if (user.password != password){
                res.send("You entered wrong passwprd!");
            } else {
                let q2 = `DELETE FROM user WHERE id='${id}'`;
                connection.query(q2, (err,result)=>{
                    if(err) throw err;
                    else {
                        console.log(result);
                        console.log("deleted");
                        res.redirect("/user");
                    }
                });
            }
        });
    } catch(err){

    }
});


app.listen(port, () => {
    console.log("Listening port is: ", port);
})








//console.log(getRandomUser());