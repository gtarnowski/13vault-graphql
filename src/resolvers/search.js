import Mongo from '../lib/mongo'

const COLLECTION_KEYS = ['News']

export async function createRelatedAutocomplete () {
  await Mongo.createCollection('AutoComplete')
}

export async function getAutoCompleteResults ({ regex, limit, page: { page = 1 } = { page: 1} }) {
  const results = await Mongo.find('AutoComplete', { name: { $regex: regex, $options: "i" }}, {}, limit)

  const newResults =  results.map((obj ) =>{
    return {
      id: obj._id,
      collectionName: obj.collectionName,
      name: obj.name,
      documentId: obj.documentId
    }
  })

  if (limit) {
    return {
      autoComplete: newResults.slice(0, limit),
      allResults: newResults.length
    }
  }
  const innerLimit = 25
  return {
    autoComplete: newResults.slice((page - 1) * innerLimit, page * innerLimit),
    pagination: {
      total: newResults.length,
      page
    }
  }
}

export async function getSearchResults ({ regex }) {
  const allResults = []
  COLLECTION_KEYS.forEach(collectionName => {
    const results = Mongo.find(collectionName, { name: { $regex: regex, $options: "i" }}, {})
    allResults.push(results)
  })

  console.log('allRes', allResults)
}
