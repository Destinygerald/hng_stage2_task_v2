const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const { connectDatabase }  = require('./database/query.js')
const apiRoute = require('./routes/apiRoute.js')
const authRoute = require('./routes/authRoute.js')

require('dotenv').config()


const app = express()
const PORT = process.env.PORT || 8000

app.use(express.json())
app.use(cookieParser())
app.use(cors({
	origin: "*",
	credentials: true
}))

app.use('/auth', authRoute)
app.use('/api', apiRoute)

connectDatabase()

app.listen(PORT, () => console.log(`Server running on Port ${PORT}`))

module.exports = app