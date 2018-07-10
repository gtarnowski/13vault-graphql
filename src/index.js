import 'babel-polyfill'
import express from 'express'
import dotenv from 'dotenv'
import mySchema from './schema.graphql'
import expressPlayground from 'graphql-playground-middleware-express'
import { graphqlExpress } from 'apollo-server-express'
import cors from 'cors'
import { makeExecutableSchema } from 'graphql-tools'
import bodyParser from 'body-parser'
import {
  usersMigrateFromSqlDatabase,
  newsMigrateFromSqlDatabase,
  oldHtmlMigration
} from './lib/migrations'

dotenv.config({ path: `${__dirname}/.env` })
const resolvers = require('./resolvers')
const schema = makeExecutableSchema({
  typeDefs: mySchema,

  tracing: process.env.NODE_ENV !== 'production',
  resolvers: resolvers.default,
  formatError: err => {
    console.log(err)
    console.log(err)
    return err
  }
})

// oldHtmlMigration()

const app = express()
app.use(cors())
app.use('/graphql', bodyParser.json(), graphqlExpress(request => ({
  schema,
  cacheControl: true,
  context: {
    'user-agent': request.headers['user-agent'],
    authorization: request.headers.authorization,
    ip: request.connection.remoteAddress
  }
})))
app.get('/playground', expressPlayground({ endpoint: '/graphql' }))
app.listen(4000, () => console.log('Express GraphQL Server Now'))
