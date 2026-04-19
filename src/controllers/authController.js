import bcrypt from "bcrypt";
import User from "../models/User.js";
import { validateEmail } from "../utils/verifyEmail.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/db.js";

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name.trim() || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
        }

        const normalisedEmail = email.toLowerCase().trim();

        if (!validateEmail(normalisedEmail)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        const isExists = await User.findOne({ email: normalisedEmail });

        if (isExists) {
            return res.status(409).json({ success: false, message: "User with this email already exists" });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = await User.create({ name: name.trim(), email: normalisedEmail, password: hashPassword });

        res.status(201).json({ success: true, message: "User created successfully", data: { user: { userId: user._id, name: user.name, email: user.email } } });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const normalisedEmail = email.toLowerCase().trim();

        if (!validateEmail(normalisedEmail)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        const user = await User.findOne({ email: normalisedEmail });

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1d" });

        res.status(200).json({ success: true, message: "Login successful", data: { user: { userId: user._id, name: user.name, email: user.email }, token } });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};