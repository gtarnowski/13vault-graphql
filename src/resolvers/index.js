import * as news from './news'
import * as user from './user'
import * as autoComplete from './autocomplete'

export default {
  Query: {
    news: (_, data, context) => news.single(data),
    newsAll: (_, data, context) => news.list(data),
    autoComplete: (_, data, context) => autoComplete.getAutoCompleteResults(data)
  },
  Mutation: {
    signIn: (_, data, context) => user.signIn(data)
  },
  Pagination: {
    pages: ({ total, limit }) => Math.ceil(total / limit)
  },
}



