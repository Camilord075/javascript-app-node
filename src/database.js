import { createPool } from "mysql2/promise.js";
import { DATABASE_PASS } from "../config.js";

export const pool = createPool({
    host: 'localhost',
    user: 'root',
    password: DATABASE_PASS,
    port: '3306',
    database: 'app-javascript'
})

export class DBMan {
    static async findOne (username) {
        const [found] = await pool.query('SELECT * FROM users WHERE username = ?', [username])

        if (found.length <= 0) {
            return false
        }

        return found[0]
    }

    static async create (id, username, password) {
        const [rows] = await pool.query('INSERT INTO users (_id, username, password, role) VALUES (?, ?, ?, "user")', [id, username, password])

        return rows
    }
}