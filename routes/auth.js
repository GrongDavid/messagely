const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const {SECRET_KEY} = require('../config')
const ExpressError = require('../expressError')
const jwt = require('jsonwebtoken')

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', async function(req, res, next){
    try {
        let {username, password} = req.body
        if(await User.authenticate(username, password)){
            let token = jwt.sign({username}, SECRET_KEY)
            User.updateLoginTimestamp(username)

            return res.json(token)
        }
        throw new ExpressError('Invalid credentials, please try again', 400)
    } catch (error) {
        return next(error)
    }
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

 router.post("/register", async function (req, res, next) {
    try {
        let {username} = req.body
        await User.register(username)
        let token = jwt.sign({username}, SECRET_KEY)
        User.updateLoginTimestamp(username)

        return res.json({token})
    } catch (err) {
        return next(err);
    }
})
