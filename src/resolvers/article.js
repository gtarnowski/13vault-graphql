import db from '../lib/db'
import moment from 'moment'
import Mongo from '../lib/mongo'

export async function list ({ page = 1, root }) {
  const results = await Mongo.find('Articles', { root } , {})
  return {
    articles: results,
    pagination: {
      page
    }
  }

}

