import express from "express"
import { PORT } from "./config.js"
import { UserRepository } from "./user-repository.js";
import jwt from "jsonwebtoken";
import { SECRET_JWT_KEY } from "./config.js";
import cookieParser from "cookie-parser";
import { DBMan } from "./src/database.js"; 

const app = express()

app.set('view engine', 'ejs')
app.use(express.json())
app.use(cookieParser())
app.use((req, res, next) => {
    const token = req.cookies.access_token
    req.session = { user: null }

    try {
        const data = jwt.verify(token, SECRET_JWT_KEY)
        req.session.user = data
    } catch {
    }

    next()
})

app.get('/', (req, res) => {
    const { user } = req.session
    res.render('index', user)
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body

    try {
        const user = await UserRepository.loginWithDatabase( { username, password } )
        const token = jwt.sign({ 
            id: user._id, username: user.username }, 
            SECRET_JWT_KEY, 
            {
            expiresIn: '1h'
            })
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV == 'production',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 
        }).send( { user } )
    } catch (error) {
        res.status(401).send(error.message)
    }
})

app.post('/register', async (req, res) => {
    const { username, password } = req.body

    try {
        const id = await UserRepository.createWithDatabase ( { username, password } )
        const user = await UserRepository.loginWithDatabase( { username, password } )
        const token = jwt.sign({ 
            id: user._id, username: user.username }, 
            SECRET_JWT_KEY, 
            {
            expiresIn: '1h'
            })
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV == 'production',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 
        }).send(  user  )
    } catch (error) {
        res.status(400).send(error.message)
    }
})

app.post('/logout', (req, res) => {
    res.clearCookie('access_token').json({ message: 'Logout successful' })
})

app.get('/protected', (req, res) => {
    const { user } = req.session
    
    if (!user) return res.status(403).send('Access not authorized')

    res.render('protected-page', user)
})

app.get('/users', async(req, res) => {
    const users = await DBMan.getAll();

    res.render('users', { 'users': users })
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})