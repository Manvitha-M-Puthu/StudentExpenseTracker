import db from "../utils/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

export const register = async (req, res) => {
    try {
        console.log("Register request received");

        // CHECK IF USER EXISTS (More efficient way)
        const checkUserQuery = "SELECT COUNT(*) AS count FROM users WHERE email = ?";
        const [rows] = await db.execute(checkUserQuery, [req.body.email]);

        if (rows[0].count > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Encrypt password
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        // INSERT NEW USER
        const insertUserQuery = "INSERT INTO users (`name`, `email`, `password`, `phone_no`) VALUES (?, ?, ?, ?)";
        const values = [req.body.name, req.body.email, hash, req.body.phone_no];

        await db.execute(insertUserQuery, values);

        return res.status(201).json({ message: "User has been created successfully" });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Database error", details: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const q = "SELECT user_id, name, email, password FROM users WHERE name = ?";
        const [data] = await db.execute(q, [req.body.name]);

        if (data.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = data[0];
        const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.password);
        
        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Wrong username or password"
            });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET || "jwtKey");

        // Exclude password before sending user details
        const { password, ...userData } = user;

        // Send token as a cookie & return user data
        res.cookie("accessToken", token, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        }).status(200).json({
            success: true,
            user: userData,
            message: "Login successful"
        });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const logout = (req, res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    }).status(200).json({
        success: true,
        message: "User successfully logged out"
    });
};

export const checkAuth = (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
};
