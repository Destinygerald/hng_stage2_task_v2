const { getUser, getUserOrgsId, getUserFromOrganisation, addOrganisation, addToOrganisation, getOrganisation, test } = require('../database/query.js')
const { jwtVerify, ValidateField, generateUuid } = require('../helperFunctions.js')
// const { v4: uuidV4 } = require('uuid')

async function protectedGetUser(req, res) {
	try {

		const { id } = req.params

		const { accessToken } = req.cookies

		const verifyUserToken = await jwtVerify(accessToken)

		if (!verifyUserToken) {
			return res.status(401).json({
				message: "Invalid credentials"
			})
		}

		const db_query = await getUser(id)

		if (!db_query.rows[0]) {
			return res.status(404).json({
				status: "Not Found",
				message: 'User Not found'
			})
		}

		const { password ,...response } = db_query.rows[0]

		res.status(200).json({
			status: "success",
			message: "<message>",
			data: response
		})

	} catch (err) {
		return res.status(500).json({
			message: err.message
		})
	}
}

async function protectedGetOrgs(req, res) {
	try {

		const { accessToken } = req.cookies

		const verifyUserToken = await jwtVerify(accessToken)

		// let orgs = []

		if (!verifyUserToken) {
			return res.status(401).json({
				message: "Invalid credentials"
			})
		} 


		const db_query = await getUserOrgsId(verifyUserToken.userId)


		async function getOrg (row) {
			const result = await getOrganisation(row.orgidtag)
			return result
		}

		let orgs = []

		for (const row of db_query.rows) {
			const result = await getOrg(row)
			orgs.push(result.rows[0]);
		}


		return res.status(200).json({
			status: "success",
			message: "<message>",
			data: orgs 	
		})

	} catch (err) {
		return res.status(500).json({
			message: err.message
		})
	}
}


async function protectedGetOrg(req, res) {
	try {

		const { accessToken } = req.cookies
		const { orgId } = req.params

		const verifyUserToken = await jwtVerify(accessToken)

		if (!verifyUserToken) {
			return res.status(401).json({
				message: "Invalid credentials"
			})
		} 

		const db_query = await getOrganisation(orgId)

		if (!db_query.rows[0]) {
			return res.status(404).json({
				status: "Not Found",
				message: "Organisation doesnt exist"
			})
		}

		return res.status(200).json({
			status: "success",
			message: "<message>",
			data: db_query.rows[0]  || ''
		})

	} catch (err) {
		return res.status(500).json({
			message: err.message
		})
	}
}



async function createOrganisation(req, res) {
	try {

		const { name, description } = req.body
		const { accessToken } = req.cookies
		
		const verifyUserToken = await jwtVerify(accessToken)

		if (!verifyUserToken) {
			return res.status(401).json({
				message: "Invalid credentials"
			})
		}

		const name_check = ValidateField(name, `[a-zA-Z0-9]{3,50}`, 'name', "Must contain letters and be more than 3 letters long")

		if (name_check) {
			return res.status(422).json(name_check)
		}

		const orgId = generateUuid()

		const db_insert = await addOrganisation(orgId, name, description, verifyUserToken.userId )
		const db_query = await getOrganisation(orgId)

		if (!db_query.rows[0]) {
			return res.status(400).json({
				status: "Bad Request",
				message: "Client error",
				statusCode: 400
			})
		}

		return res.status(201).json({
			status: "success",
			message: "Organisation created successfully",
			data: db_query.rows[0]
		})

	} catch (err) {
		return res.status(500).json({
			message: err.message
		})
	}
}


async function addUserToOrginasation (req, res) {
	try {

		const { userId } = req.body
		const { orgId } = req.params

		//check if the user is already on the organisation

		const db_query = await getUserFromOrganisation(orgId, userId)

		if (db_query.rows[0]) {
			return res.status(409).json({
				status: "Already exist",
				message: "User is already on this organisation"
			})
		}

		const db_insert = await addToOrganisation(userId, orgId)


		console.log(db_query.rows[0])
	
		return res.status(200).json({
			status: "success",
			message: "User added to organisation successfully"
		}) 


	} catch (err) {
		return res.status(500).json({
			message: err.message
		})
	}
}

//test function
async function getAll(req, res) {
	const db_query = await test()

	return res.status(200).json({
		data: db_query.rows
	})
}




module.exports = {
	protectedGetUser,
	protectedGetOrgs,
	protectedGetOrg,
	createOrganisation,
	addUserToOrginasation,
	getAll
}