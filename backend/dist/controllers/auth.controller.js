"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
require("dotenv/config");
async function register(req, res) {
    console.log("Inside registration api with body ::: ", req.body);
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "email and password are required" });
    }
    const existing = await db_1.pool.query("SELECT id,* FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
        console.log("existing :: ", existing.rows);
        return res.status(409).json({ error: "User already exists" });
    }
    console.log("Process completed::: ");
    return;
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const result = await db_1.pool.query("INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email", [email, passwordHash]);
    const user = result.rows[0];
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
    res.status(201).json({ user, token });
}
register({ "body": {
        "email": "sdeepender449@gmail.com",
        "password": "12345678",
    } }, {});
async function login(req, res) {
    console.log("Inside login api with body ::: ", req.body);
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "email and password are required" });
    }
    const result = await db_1.pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const valid = await bcryptjs_1.default.compare(password, user.password_hash);
    if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
    res.json({ user: { id: user.id, email: user.email }, token });
}
