import 'babel-polyfill'
import express from 'express'
import dotenv from 'dotenv'
import mysql from 'mysql'
import DB from './lib/db'
import graphqlHTTP from 'express-graphql'
import MongoClient from 'mongodb'
import mySchema from './schema.graphql'
import radnomId from 'random-id'
import expressPlayground from 'graphql-playground-middleware-express'
import { graphqlExpress } from 'apollo-server-express'
import cors from 'cors'
import { makeExecutableSchema } from 'graphql-tools'
import bodyParser from 'body-parser'

dotenv.config({ path: `${__dirname}/.env` })
// const express_graphql = require('express-graphql');
// const { buildSchema } = require('graphql');
const resolvers = require('./resolvers')
const schema = makeExecutableSchema({
  typeDefs: mySchema,
  tracing: process.env.NODE_ENV !== 'production',
  resolvers: resolvers.default,
  formatError: err => {
   console.log(err)
    return err
  }
})

const app = express();
app.use(cors())
app.use('/graphql', bodyParser.json(), graphqlExpress(request => ({
  schema,
  cacheControl: true,
})))
app.get('/playground', expressPlayground({ endpoint: '/graphql' }))
app.listen(4000, () => console.log('Express GraphQL Server Now'))
