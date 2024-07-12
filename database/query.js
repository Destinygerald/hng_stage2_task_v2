const { Client } = require('pg')
require('dotenv').config()

const client = new Client({
	user: process.env.NOD_ENV == 'production' ? process.env.DEV_DB_USER : process.env.DB_USER,
	password: process.env.NOD_ENV == 'production' ? process.env.DEV_DB_PASSWORD : process.env.DB_PASSWORD,
	host: process.env.NOD_ENV == 'production' ? process.env.DEV_DB_HOST : process.env.DB_HOST,
	port: process.env.NOD_ENV == 'production' ? process.env.DEV_DB_PORT : process.env.DB_PORT,
	database: process.env.NOD_ENV == 'production' ? process.env.DEV_DB_NAME : process.env.DB_NAME,
});	

function connectDatabase () {
	
	client
		.connect()
		.then(() => {
			console.log('Connected to PostgreSQL database');
		})
		.catch((err) => {
			console.error('Error connecting to PostgreSQL database', err);
		});

	client.query(`DROP TABLE "user" CASCADE`)
	client.query(`DROP TABLE organisation CASCADE`)
	client.query(`DROP TABLE userorganisation`)

	client.query(`CREATE TABLE "user"(
		userId VARCHAR(255) UNIQUE,
		firstName VARCHAR(50) NOT NULL,
		lastName VARCHAR(50) NOT NULL,
		email VARCHAR(50) UNIQUE NOT NULL,
		password TEXT NOT NULL,
		phone VARCHAR(50)
		);`, (err, result) => {
		if (err) {
			console.error('Error executing query', err);
		} else {
			console.log('Query result:', result.rows);
		}
	})

	client.query(`CREATE TABLE organisation(
			orgId VARCHAR(255) UNIQUE,
			name VARCHAR(50) NOT NULL,
			description TEXT
		);`, (err, result) => {
		if (err) {
			console.error('Error executing query', err);
		} else {
			console.log('Query result:', result.rows);
		}
	})

	client.query(`CREATE TABLE userorganisation(
		orgIdTag VARCHAR(255),
		userIdTag VARCHAR(255),
		CONSTRAINT fk_org FOREIGN KEY(orgIdTag) REFERENCES organisation(orgId),
		CONSTRAINT fk_user FOREIGN KEY(userIdTag) REFERENCES "user"(userId)
		)`, (err, result) => {
		if (err) {
			console.error('Error executing query', err);
		} else {
			console.log('Query result:', result.rows);
		}
	})
}



function getAllUsers () {
	return new Promise((resolve, reject) => {
		client.query(`SELECT userid AS "userId" , firstname AS "firstName", lastname AS "lastName", email,  phone FROM "user"`, (err, res) => {
			if (err) {
				reject(err)
			} else {
				resolve(res)
			}
		})
	})
}

function getUser (id) {
	return new Promise((resolve, reject) => {
		client.query(`SELECT userid AS "userId" , firstname AS "firstName", lastname AS "lastName", email,  phone FROM "user" WHERE userId=$1`,[id], (err, res) => {
			if (err) {
				reject(err)
			} else {
				resolve(res)
			}
		})
	})
}

function getUserByEmail (email) {
	return new Promise((resolve, reject) => {
		client.query(`SELECT userid AS "userId" , firstname AS "firstName", lastname AS "lastName", email, password as "hashedPassword", phone FROM "user" WHERE email=$1`,[email], (err, res) => {
			if (err) {
				reject(err)
			} else {
				resolve(res)
			}
		})
	})
}

function addUser (id, firstname, lastname, email, password, phone, orgId) {
	return new Promise((resolve, reject) => {
		client.query(`INSERT INTO "user"(userId, firstName, lastName, email, password, phone) VALUES($1, $2, $3, $4, $5, $6)`,[id, firstname, lastname, email, password, phone], (err, res) => {
			if (err) {
				reject(err)
			} else {
				client.query(`INSERT INTO organisation(orgId, name) VALUES($1, $2)`, [orgId, `${firstname}'s Organisation`], (err, result) => {
					if(err) {
						reject(err)
					} else {
						client.query(`INSERT INTO userorganisation(orgIdTag, userIdTag) VALUES($1, $2)`, [orgId, id], (err, result) => {
							if(err) {
								reject(err)
							} else {
								resolve(res)					
							}
						})			
					}
				})
			}
		})
	})
}

function addToOrganisation (userId, orgId) {
	return new Promise((resolve, reject) => {
		client.query(`INSERT INTO userorganisation(orgIdTag, userIdTag) VALUES($1, $2)`, [orgId, userId], (err, result) => {
			if (err) {
				reject(err)
			} else {
				resolve(result)
			}
		})
	})
}



function getUserOrgsId (id) {
	return new Promise((resolve, reject) => {
		let response = []

		client.query(`SELECT * FROM userorganisation WHERE userIdTag=$1`, [id], (err, result) => {
			if(err) {
				reject(err)
			} else {
				resolve(result)
			}
		})
	})
}

function getUserFromOrganisation(orgId, userId) {
	return new Promise((resolve, reject) => {
		client.query(`SELECT userid FROM userorganisation WHERE userIdTag=$1 && orgIdTag=$2`, [userId, orgId], (err, result) => {
			if (err) {
				reject(err)
			} else {
				resolve(result)
			}
		})
	})
}


function getOrganisation (orgId) {
	return new Promise((resolve, reject) => {
		client.query(`SELECT orgid AS "orgId", name, description FROM organisation WHERE orgId=$1`, [orgId], (err, result) => {
			if(err) {
				reject(err)
			} else {
				resolve(result)					
			}
		})
	})
}

function addOrganisation (id ,name, desc, userId) {
	return new Promise((resolve, reject) => {
		client.query(`INSERT INTO organisation(orgId, name, description) VALUES($1, $2, $3)`, [id, name, desc], (err, result) => {
			if (err) {
				reject(err)
			} else {
				client.query(`INSERT INTO userorganisation(orgIdTag, userIdTag) VALUES($1, $2)`, [id, userId], (err, res) => {
					if (err) {
						reject(err)
					} else {
						resolve(res)
					}
				})
				
			}
		})
	})
}

function test () {
	return new Promise((resolve, reject) => {
		client.query(`SELECT * FROM userorganisation`, (err, result) => {
			if(err) {
				reject(err)
			} else {
				resolve(result)					
			}
		})
	})
}


module.exports = {
	client,
	connectDatabase,
	addUser,
	getUser,
	getUserByEmail,
	getAllUsers,
	addOrganisation,
	addToOrganisation,
	getUserOrgsId,
	getOrganisation,
	getUserFromOrganisation,
	test
}