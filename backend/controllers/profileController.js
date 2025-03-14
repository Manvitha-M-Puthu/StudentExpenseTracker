// profileController.js
import db from '../utils/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'uploads/profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `user-${req.params.userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
}).single('profilePicture');

export const getProfileHandler = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Join users table with wallet to get both user details and wallet info
    const [results] = await db.query(
      `SELECT u.user_id, u.name, u.email, u.phone_no, u.about, u.college, 
       u.date_of_birth, u.profile_picture, w.current_balance, w.initial_balance
       FROM users u
       LEFT JOIN wallet w ON u.user_id = w.user_id
       WHERE u.user_id = ?`,
      [userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Format date_of_birth if exists
    if (results[0].date_of_birth) {
      const date = new Date(results[0].date_of_birth);
      results[0].date_of_birth = date.toISOString().split('T')[0];
    }

    return res.status(200).json(results[0]);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfileHandler = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name, email, phone_no, about, college, date_of_birth } = req.body;
    
    // Construct the update query dynamically based on provided fields
    let updateFields = [];
    const queryParams = [];
    
    if (name) {
      updateFields.push('name = ?');
      queryParams.push(name);
    }
    
    if (email) {
      updateFields.push('email = ?');
      queryParams.push(email);
    }
    
    if (phone_no) {
      updateFields.push('phone_no = ?');
      queryParams.push(phone_no);
    }
    
    if (about) {
      updateFields.push('about = ?');
      queryParams.push(about);
    }
    
    if (college) {
      updateFields.push('college = ?');
      queryParams.push(college);
    }
    
    if (date_of_birth) {
      updateFields.push('date_of_birth = ?');
      queryParams.push(date_of_birth);
    }
    
    // Handle profile picture separately (it's handled by multer middleware)
    if (req.file) {
      updateFields.push('profile_picture = ?');
      queryParams.push(req.file.path);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }
    
    // Add userId to query params
    queryParams.push(userId);
    
    await db.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`,
      queryParams
    );
    
    // Get updated profile by calling getProfileHandler with updated request
    req.params.userId = userId;
    return getProfileHandler(req, res);
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfilePictureHandler = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    await db.query(
      'UPDATE users SET profile_picture = ? WHERE user_id = ?',
      [req.file.path, userId]
    );
    
    return res.status(200).json({ 
      message: "Profile picture updated successfully",
      profile_picture: req.file.path
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};