import db from '../lib/db'
import moment from 'moment'

export async function getAllNews () {
  const news = await db.query('SELECT * FROM `schron_news` ORDER BY `data` DESC LIMIT 10')

  return news.map(({ uniq, tytul, tresc, data }) => {
    const date = moment.unix(data).locale('pl').format('DD MMMM YYYY')
    return {
      title: tytul,
      id: uniq,
      content: tresc,
      date,
    }
  })
}
