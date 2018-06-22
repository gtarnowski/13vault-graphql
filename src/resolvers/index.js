import * as news from './news'
import * as user from './user'
import * as search from './search'
import * as article from './article'

export default {
  Query: {
    news: (_, data, context) => news.single(data),
    newsAll: (_, data, context) => news.list(data),
    autoComplete: (_, data, context) => search.getAutoCompleteResults(data),
    searchResults: (_, data, context) => search.getSearchResults(data),
    articlesAll: (_, data, context) => article.list(data),
  },
  Mutation: {
    signIn: (_, data, context) => user.signIn(data)
  },
  Pagination: {
    pages: ({ total, limit }) => Math.ceil(total / limit)
  },
}



