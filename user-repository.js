import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { DBMan } from "./src/database.js";

import { SALT_ROUNDS } from "./config.js";

export class UserRepository {
    static async createWithDatabase ( { username, password } ) {
        Validation.username(username)
        Validation.password(password)

        const user = await DBMan.findOne( { username } )
        if ( user ) throw new Error('Username already exists')

        const id = crypto.randomUUID()
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

        return await DBMan.create(id, username, hashedPassword)
    }

    static async loginWithDatabase ( { username, password } ) {
        Validation.username(username)
        Validation.password(password)

        const user = await DBMan.findOne(username)
        if (!user) throw new Error('Username does not exists')

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) throw new Error('Password is invalid')

        const { password: _, ... publicUser } = user
        
        return publicUser
    }
    
}

class Validation {
    static username ( username ) {
        if (typeof username != 'string') throw new Error('Username must be String.')
        if (username.length < 3) throw new Error('Username must be at least 3 characters long')
    }

    static password ( password ) {
        if (typeof password != 'string') throw new Error('Username must be String.')
        if (password.length < 6) throw new Error('Username must be at least 6 characters long')
    }
}