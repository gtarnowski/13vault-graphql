import DB from './db'
import Mongo from './mongo'
import randomId from 'random-id'
import map from 'lodash/map'
import { createRelatedAutocomplete } from '../resolvers/search'
import extractHtmlFromSource from '../lib/htmlExtraction'
import OLD_SOURCES from '../../old/sources'

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
  console.log(extractHtmlFromSource(OLD_SOURCES.postapocalypticComics))

  // const data = extractHtmlFromSource()
  // console.log(data)
  // Mongo.insert('Articles', data)

}

export {
  usersMigrateFromSqlDatabase,
  newsMigrateFromSqlDatabase,
  oldHtmlMigration
}
