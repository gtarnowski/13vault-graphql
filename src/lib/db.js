import mysql from 'mysql'
import Cache from 'ttl'
import crypto from 'crypto'

require('dotenv').config();
function hash (query, params) {
    return crypto.createHash('md5').update(JSON.stringify({query, params})).digest('hex')
}



// 1 hour cache
const cache = new Cache({
    ttl: 3600 * 1000
})
class DB {
    constructor () {
        this.connection = mysql.createPool({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        })
        console.log('pool created')
    }

  query( sql, args ) {
    return new Promise( ( resolve, reject ) => {
      this.connection.query( sql, args, ( err, rows ) => {
        if ( err )
          return reject( err );
        resolve( rows );
      } );
    } );
  }

    async findOne (q, params) {
        const result = await this.query(q, params)
        return result.length ? result[0] : []
    }

    async cachedFindOne (q, params) {
        const result = await this.cachedQuery(q, params)
        return result.rows[0]
    }

    async cachedQuery (q, params, key) {
        key = key || hash(q, params)

        const cachedData = cache.get(key)

        if (cachedData) {
            return JSON.parse(cachedData)
        }

        const sourceData = await this.query(q, params)
        cache.put(key, JSON.stringify({ rows: sourceData.rows }))
        return sourceData
    }
}

export default new DB()
