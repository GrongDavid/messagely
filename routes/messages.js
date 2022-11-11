const express = require('express')
const router = new express.Router()
const Message = require('../models/message')
const {SECRET_KEY} = require('../config')
const ExpressError = require('../expressError')
const jwt = require('jsonwebtoken')

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', async function getMessage(req, res, next){
    try {
        let {id} = req.params
        let {_token} = req.body
        let msg = await Message.get(id)

        let {username} = jwt.verify(_token, SECRET_KEY)
        if(msg.from_user.username === username || msg.to_user.username === username){
            return res.send(msg)
        }

        throw new ExpressError('You cannot access this message', 401)
    } catch (error) {
        return next(error)
    }
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', async function createMessage(req, res, next){
    try {
        let {toUsername, body} = req.body
        let {fromUsername} = body.message
        let message = await Message.create(fromUsername, toUsername, body)

        return res.send(message)
    } catch (error) {
        return next(error)
    }


})


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', async function markRead(req, res, next){
    try {
        let {id} = req.params
        let result = await Message.markRead(id)

        return res.send(result)
    } catch (error) {
        return next(error)
    }
})

module.exports = router
