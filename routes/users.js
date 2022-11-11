const express = require('express')
const router = new express.Router()
const {ensureLoggedIn, ensureCorrectUser} = require('../middleware/auth')
const User = require('../models/user')

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get('/', ensureLoggedIn, async function getUsers(req, res, next){
    try {
        let users = await User.all()

        return res.send({users})
    } catch (error) {
        return next(error)
    }
})


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get('/:username', ensureCorrectUser, async function getUser(req, res, next){
    try {
        let {username} = req.params
        let user = await User.get(username)

        return res.send({user})
    } catch (error) {
        return next(error)
    }
})


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/to', ensureCorrectUser, async function messageTo(req, res, next){
    try {
        let {username} = req.params
        let messages = await User.messagesTo(username)

        return res.send({messages})
    } catch (error) {
        return next(error)
    }
})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/from', async function getMessage(req, res, next){
    try {
        let {username} = req.params
        let messages = await User.messagesFrom(username)

        return res.send({messages})
    } catch (error) {
        return next(error)
    }
})
