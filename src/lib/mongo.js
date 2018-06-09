import mongo from 'mongodb'
import dotenv from 'dotenv'
import randomId from 'random-id'
import isArray from 'lodash/isArray'
import moment from 'moment'
dotenv.config()

class Mongo {
  constructor () {
    this.url = process.env.MONGO_URL
    this.name = process.env.MONGO_DATABASE_NAME
  }

  createCollection (name) {
    mongo.connect(this.url, (err, db) => {
      if (err) throw err

      const database = db.db(this.name)
      database.createCollection(name, (err, res) => {
        if (err) throw err
        console.log(`Collection ${name} created!`)
        db.close()
      })
    })
  }

  find (name, query = {}, sort = {}, limit = 25) {
    return new Promise( ( resolve, reject ) => {
      mongo.connect(this.url, (err, db) => {
        if (err) throw err
        const database = db.db(this.name)
        const results = database
          .collection(name)
          .find(query)
          .sort(sort)
          .limit(limit)
          .toArray()
        resolve( results );
      })
    })
  }

  async findOne (name, query) {
    const results = await this.find(name, query)
    return results[0]

  }

  insert (name, data) {
    if (!name || !data) throw new Error('INSERT: No database name or data')

    mongo.connect(this.url, (err, db) => {
      if (err) throw err
      if (isArray(data)) {
        data.forEach(row => {
          if (!row._id) {
            row._id = randomId(12)
          }
        })
      } else {
        data._id = randomId(12)
      }
      console.log('check this insert method')
      data.createdAt = moment.unix();
      const database = db.db(this.name)
      database.collection(name).insertMany(data, () => {
        if (err) throw err
        db.close()
      })
    })
  }

}

export default new Mongo()
