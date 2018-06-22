import Mongo from '../lib/mongo'
import _T from '../constants/fieldTranslations'
import truncate from 'lodash/truncate'
export async function createRelatedAutocomplete () {
  await Mongo.createCollection('AutoComplete')
}

export async function getAutoCompleteResults ({ regex }) {
  const results = await Mongo.find('AutoComplete', { name: { $regex: regex, $options: "i" }}, {})

  const newResults =  results.map(({ _id, collectionName, name, documentId }) =>{
    return {
      _id,
      collectionName,
      name,
      documentId
    }
  })
  return {
    autoComplete: newResults.slice(0, 10),
    allResultsCount: newResults.length
  }
}

export async function getSearchResults ({ regex, page = 1, limit = 25 }) {
  const searchRange = ['News', 'Articles']
  const queryResults = []

  searchRange.forEach(collectionName => {
    const results = Mongo.find(collectionName, {title: {$regex: regex, $options: "i"}}, {})
    queryResults.push(results)
  })

  const results = await Promise.all(queryResults).then(values => {
    const selectedValues = []
    values.forEach(val => selectedValues.push(...val))

    return selectedValues.map(({_id, category, img, title, content}) => ({
      _id,
      img,
      title,
      content: truncate(content, {length: 200}),
      category: _T.categories[category]
    }))
  })

  return {
    results: results.slice((page - 1) * limit, page * limit),
    pagination: {
      page,
      total: results.length,
      pages: Math.ceil(results.length / limit),
      limit
    }
  }
}
