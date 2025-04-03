import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authenticateToken = (req, res, next) => {
    const token = req.cookies.accessToken;
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No authentication token found. Please login first."
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "jwtKey");
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please login again."
            });
        }
        return res.status(403).json({
            success: false,
            message: "Invalid authentication token. Please login again."
        });
    }
}; 