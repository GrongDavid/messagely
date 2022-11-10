/** User class for message.ly */
const db = require('../db')
const ExpressError = require('../expressError')
const bcrypt = require('bcrypt')

const BCRYPT_WORK_FACTOR = 12

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    const hashedPassword = bcrypt.hash(password, BCRYPT_WORK_FACTOR)
    const result = await db.query(`
    INSERT INTO users
    VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
    RETURNING *`, [username, hashedPassword, first_name, last_name, phone])

    return result.rows[0]
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    let storedPassword = await db.query(`
    SELECT password FROM users
    WHERE username=$1`, [username])

    return bcrypt.compare(password, storedPassword)
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    let result = await db.query(`
    UPDATE users SET last_login_at = current_timestamp
    WHERE username=$1 RETURNING last_login_at`, [username])

    return updatedUser.rows[0]
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    let result = await db.query(`
    SELECT * FROM users RETURNING *`)

    return result.rows
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    let result = await db.query(`
    SELECT * FROM users WHERE username=$1 RETURNING *`, [username])

    return result.rows[0]
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT m.id, m.to_username,
              u.first_name, u.last_name,
              u.phone, m.body,
              m.sent_at, m.read_at
          FROM messages AS m
          JOIN users AS u ON m.to_username = u.username
          WHERE from_username = $1`,
      [username]);

    result.rows.map(msg => ({
      id: msg.id,
      to_user: {
        username: msg.to_username,
        first_name: msg.first_name,
        last_name: msg.last_name,
        phone: msg.phone
      },
      body: msg.body,
      sent_at: msg.sent_at,
      read_at: msg.read_at
    }))

    return result.rows
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query(
      `SELECT m.id, m.from_username,
              u.first_name, u.last_name,
              u.phone, m.body,
              m.sent_at, m.read_at
          FROM messages AS m
          JOIN users AS u ON m.from_username = u.username
          WHERE to_username = $1`,
      [username]);

  result.rows.map(msg => ({
    id: msg.id,
    from_user: {
      username: msg.from_username,
      first_name: msg.first_name,
      last_name: msg.last_name,
      phone: m.phone,
    },
    body: m.body,
    sent_at: m.sent_at,
    read_at: m.read_at
  }))
  }
}


module.exports = User;