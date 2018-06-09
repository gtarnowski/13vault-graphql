import db from '../lib/db'
import moment from 'moment'
import Mongo from '../lib/mongo'

export async function list ({ page: { limit = 25, page = 1 } = {limit: 25, page: 1} }) {
  const allNews = await Mongo.find('News', {}, { date: -1 })
  const pickedNews = allNews.map(({
   _id: id,
   userId,
   username,
   title,
   content,
   date,
   commentsCount,
   userEmail
 }) => {
    const newDate = moment.unix(date).locale('pl').format('DD MMMM YYYY')
    return {
      id,
      userId,
      username,
      userEmail,
      title,
      content,
      date: newDate,
      commentsCount,
    }
  })
  return {
    news: pickedNews.slice((page - 1) * limit, page * limit),
    pagination: {
      total: pickedNews.length,
      page,
      limit
    }
  }
}

export async function single ({ id }) {
  const news = await Mongo.findOne('News', {_id: id})
  return news
}
