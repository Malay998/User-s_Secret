const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');


// render our home page
app.get("/", (req, res) => {
    res.render("home");
});

// render our login page
app.get("/login", (req, res) => {
    res.render("login");
});

// render our register page
app.get("/register", (req, res) => {
    res.render("register");
});



// post register
app.post("/register", async (req, res) => {
    try {
        const {username, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10); // Hashing password
        const newUser = await prisma.User.create({
            data: {
                email: username,
                password: hashedPassword    // Replace password with hashed password
            }
        });
        res.status(201).render("secrets");
        
    } catch (error) {
        if (error.code === "InvalidInputError") {
            res.status(400).json({message: "Invalid input" + error.message});
        } else {
            console.log(error);
            res.status(500).json({message: "And error occurred while creating the user"});
        }
    }
});



// post login
app.post("/login", async (req,res) => {
    try {
        const {username, password} = req.body;
        const foundUser = await prisma.User.findUnique({
            where: {
                email: username
            }
        });

        if (foundUser) {
            const isPasswordMatch = await bcrypt.compare(password, foundUser.password); // Comparing hashed password with user's input
            if (isPasswordMatch) {
                res.status(200).render("secrets")
            } else {
                res.status(400).json("message: Password is wrong")
            }
        } else {
            res.status(404).json("message: User not found!!");
        }
    } catch (error) {
        console.log(error);
        res.status(500).json("And error while getting the user");
    }
});




app.listen(5000, () => {
    console.log("Server is running on port 5000");
});