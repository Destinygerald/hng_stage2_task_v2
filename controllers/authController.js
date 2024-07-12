const { comparePassword, hashPassword, generateUuid, ValidateField, jwtSign } = require('../helperFunctions.js')
const { addUser, getUser, getUserByEmail } = require('../database/query.js')
// const { v4: uuidv4 } = require('uuid')


async function register (req, res) {
	try {
		
		const { firstName, lastName, email, password, phone } = req.body

		const check_firstname = ValidateField(firstName, `^[a-zA-Z0-9]{3,50}`, 'firstName', "Must contain letters and be more than 3 letters long")
		const check_lastname = ValidateField(lastName, `^[a-zA-Z0-9]{3,50}`, 'lastName', "Must contain letters and be more than 3 letters long")
		const check_email = ValidateField(email, `^[^\s@]+@[^\s@]+\.[^\s@]+$`, 'email', "Must contain @ but no other special character")
		const check_phone = ValidateField(phone, `^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$`, 'phone', "format should be +23 111 11...")
		const check_password = ValidateField(password, `^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$`, 'password', "Should contain at least 0ne special character, uppercase and number")
		
		if (check_firstname) {
			return res.status(422).json(check_firstname)
		}

		if (check_lastname) {
			return res.status(422).json(check_lastname)
		}

		if (check_password) {
			return res.status(422).json(check_password)
		}

		if (check_email) {
			return res.status(422).json(check_email)
		}

		if (check_phone) {
			return res.status(422).json(check_phone)
		}

		const id = generateUuid()
		const orgId = generateUuid()
		const hashedPassword = await hashPassword(password)

		const db_insert = await addUser(id, firstName, lastName, email, hashedPassword, phone, orgId)
		const db_query = await getUser(id)

		if (!db_query.rows[0]) {
			return res.status(400).json({
				status: "Bad request",
				message: "Registeration unsuccessful",
				statusCode: 400
			})
		}

		const accessToken = await jwtSign(db_query.rows[0])

		return res.status(201).json ({
			status: "Success",
			message: "Registeration successfull",
			data: {
				accessToken,
				user: db_query.rows[0]
			}
		})

	} catch (err) {
		return res.status(500).json({
			message: err.message
		})
	}
}

async function login (req, res) {
	try {

		const { email, password } = req.body

		const db_query = await getUserByEmail(email)

		if ( !db_query || !db_query.rows[0] ) {
			return res.status(401).json({
				status: 'Bad request',
				message: "Authentication failed"
			})
		}
		
		const passwordMatch = comparePassword(password, db_query.rows[0].hashedPassword)
		
		if (!passwordMatch) {
			return res.status(401).json({
				status: 'Bad request',
				message: "Authentication failed"
			})
		}

		const { hashedPassword,...userinfo } = db_query.rows[0]
		const accessToken = await jwtSign(userinfo)

		if (!accessToken || accessToken == undefined) {
			return res.status(404).json({
				message: "Jwt error"
			})
		}

		return res.cookie('accessToken', accessToken).status(200).json({
			status: 'success',
			message: 'Login successful',
			data: {
				accessToken,
				user: userinfo
			}
		})

	} catch (err) {
		return res.status(500).json({
			message: err.message
		})
	}
}

module.exports = {
	login,
	register
}