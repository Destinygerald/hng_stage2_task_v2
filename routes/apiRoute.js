const express = require('express')
const { protectedGetUser, protectedGetOrg, createOrganisation, addUserToOrginasation, protectedGetOrgs, getAll } = require('../controllers/apiController.js')


const Route = express.Router();

Route.get('/users/:id', protectedGetUser)
Route.get('/organisations', protectedGetOrgs)
Route.get('/organisations/:orgId', protectedGetOrg)
Route.get('/all', getAll)
Route.post('/organisations', createOrganisation)
Route.post('/organisations/:orgId/users', addUserToOrginasation)

module.exports = Route