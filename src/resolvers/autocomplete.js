import Mongo from '../lib/mongo'

export async function createRelatedAutocomplete () {
  await Mongo.createCollection('AutoComplete')
}

export async function getAutoCompleteResults ({ regex }) {
  const limit = 10
  const results = await Mongo.find('AutoComplete', { name: { $regex: regex, $options: "i" }}, {}, limit)

  const newResults =  results.map((obj ) =>{
    return {
      id: obj._id,
      collectionName: obj.collectionName,
      name: obj.name,
      documentId: obj.documentId
    }
  })
  return {
    autoComplete: newResults
  }
}
