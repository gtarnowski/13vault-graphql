import db from '../lib/db'
import moment from 'moment'
import Mongo from '../lib/mongo'
import truncate from 'lodash/truncate'

export async function list ({ page: { limit = 25, page = 1 } = {limit: 25, page: 1} }) {
  const fields = { _id: 1, username: 1, title: 1, content: 1, date: 1}
  const allNews = await Mongo.find('News', {}, { sort: { date: -1 }, ...fields} )

  allNews.forEach((news, key) => {
    news.date = moment.unix(news.date).locale('pl').format('DD MMMM YYYY')
    news.description = truncate(news.content, {length: 200}).substr(/^\.]([^.]*)$/g)
  })

  console.log(allNews.length)
  return {
    news: allNews.slice((page - 1) * limit, page * limit),
    pagination: {
      total: allNews.length,
      page,
      limit
    }
  }
}

export async function single ({ _id }) {
  return await Mongo.findOne('News', { _id })
}
