import * as news from './news'

export default {
  Query: {
    news: (_, data, context) => news.getAllNews(),
    newsAll: (_, data, context) => news.getAllNews()
  }
}



