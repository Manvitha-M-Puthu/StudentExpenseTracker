import db from "../utils/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req, res) => {
    // CHECK IF USER EXISTS
    const q = "SELECT * FROM users WHERE email = ? AND name = ?";

    db.query(q, [req.body.email, req.body.name], (err, data) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error", details: err });
        }
        if (data.length) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Encrypt password
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        // INSERT NEW USER
        const q = "INSERT INTO users (`name`, `email`, `password`,`phone_no`) VALUES (?,?,?,?)";
        const values = [req.body.name, req.body.email, hash, req.body.phone_no];

        db.query(q, values, (err, data) => {
            if (err) {
                console.error("Error inserting user:", err);
                return res.status(500).json({ error: "Database error", details: err });
            }
            return res.status(201).json({ message: "User has been created successfully" });
        });
    });
};

export const login = (req, res) => {
    //CHECK IF USER EXISTS
    const q = "SELECT * FROM users WHERE name=?";

    db.query(q,[req.body.name],(err,data)=>{
        if(err) return res.json(err);
        if(data.length===0) return res.status(404).json("User not found");

        //CHECK PASSWORD
        const isPasswordCorrect = bcrypt.compareSync(req.body.password,data[0].password);

        if(!isPasswordCorrect) return res.status(400).json("Wrong username or password");

        const token = jwt.sign({id:data[0].id},"jwtKey");
        const {password,...other}=data[0];
        res.cookie("access_token",token,{
            httpOnly:true
        }).status(200).json(other);
    
    })
};

export const logout = (req, res) => {
    res.clearCookie("access_token",{
        sameSite:"none",
        secure:"true"
    }).status(200).json("user successfully logged out")
};
