import DB from './db'
import Mongo from './mongo'
import randomId from 'random-id'
import { createRelatedAutocomplete } from '../resolvers/search'
import { extractPostapocalypticMovies } from '../lib/htmlExtraction'

async function usersMigrateFromSqlDatabase () {
  const users = await DB.query(`SELECT * FROM schron_users`)
  Mongo.createCollection('Users')
  const newUsers = users.map(({ userid, nick, imie, nazwisko, pass, zrobil, mail }) => {
    return {
      email: mail,
      username: nick,
      firstName: imie,
      lastName: nazwisko,
      password: pass,
      duties: zrobil,
      oldUserId: userid
    }
  })


  Mongo.insert('Users', newUsers)
}

async function newsMigrateFromSqlDatabase () {
  const news = await DB.query('SELECT * FROM `schron_news`')
  const users = await Mongo.find('Users')

  const autoCompleteData = []
  const allData = news.map((row) => {
    const user = users.find(({ username, email }) => username === row.nick || email === row.mail)
    if (!row.tytul || !row.tresc) return false
    const data =  {
      _id: randomId(12),
      userId: user && user._id,
      username: row.nick,
      email: row.mail,
      title: row.tytul.replace(/<\/?[^>]+(>|$)/g, ""),
      content: row.tresc,
      date: row.data,
      commentsCount: row.komentarzy,
      isNews: row.isnews,
      oldId: row.uniq
    }

    autoCompleteData.push({
      name: data.title,
      collectionName: 'News',
      documentId: data._id,
    })

    return data

  }).filter(Boolean)
  createRelatedAutocomplete()

  Mongo.insert('AutoComplete', autoCompleteData)
  Mongo.insert('News', allData)
}

async function oldHtmlMigration () {
  const data = extractPostapocalypticMovies()
  Mongo.insert('Articles', data)

}

export {
  usersMigrateFromSqlDatabase,
  newsMigrateFromSqlDatabase,
  oldHtmlMigration
}
