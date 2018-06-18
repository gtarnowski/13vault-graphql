import postapocalypticMovies from '../../old/sources/postapocalypticMovies'
import randomId from 'random-id'
import consts from '../constants'
const { HTML_ROOTS } = consts

const fieldSplit = '<span[^<>]*class="niebieski"[^<>]*>[\\s\\S]*?</span>'
const fieldSplit2 = `<span[^<>]*class="niebieski2"[^<>]*>[\\s\\S]*?<p>`
const fieldSplit3 = /(<([^>]+)>)/ig
const contentSplit = /<p[^<>]*[^<>]*>[\s\S]*?<\/p>/ig
const imgSrcPattern = 'src\\s*=\\s*"(.+?)"'
const imgAltPattern = 'alt="(.+?)"'
const imgMoviesSplitter = '<[^>]+class="imgfilmy"'
const splitSeparator = "  "

const charsRemovers = {
  endOfStringDot: /\.$/,
  lineBreak: /(\r\n\t|\n|\r\t)/gm,
  emptySpace: /^\s+/g,
  multiSpaces: / +(?= )/g,
  coma: ':'
}

const getImageFileName = string => {
  const imgTag = string.match(imgMoviesSplitter)[0]
  const imgAlt = imgTag.match(imgAltPattern)[1]
  const arrayOfMatchedUrl = imgTag.match(imgSrcPattern)[1]
  const fileName = arrayOfMatchedUrl.substring(arrayOfMatchedUrl.lastIndexOf('/')+1);

  return {
    fileName,
    alt: imgAlt
  }
}

const getFields = string => {

  const fieldString = string.match(fieldSplit2, '/gm')[0]
  const splicedFields = fieldString.split('<br>')
  let title = ''
  let fields = []

  splicedFields.forEach((field , key)=> {
    if (key === 0) {
      title = field
        .replace(fieldSplit3, splitSeparator)
        .split(splitSeparator)
        .filter(String)
        .join(' ')
        .replace(charsRemovers.multiSpaces, '')
    } else {
      const fieldsArray = field.replace(fieldSplit3, splitSeparator).split(splitSeparator).filter(String).filter(Boolean)
      if (fieldsArray.length > 1) {
        fields.push({
          name: fieldsArray[1]
            .replace(charsRemovers.emptySpace, '')
            .replace(charsRemovers.coma, ""),

          value: fieldsArray[2]
            .replace(charsRemovers.emptySpace, '')
            .replace(charsRemovers.lineBreak,"")
            .replace(charsRemovers.endOfStringDot, "")
        })
      }
    }
  })

  return {
    title,
    fields
  }
}

const getContent = string => {
  const content = string.match(contentSplit)
  let copyright = []
  content.forEach((val, key )=> {
    if (val.match(/<p align="center">/ig)) {
      copyright = content.splice(key)
    }
  })
  copyright = copyright.find(c => c.match(/<p align="right">/ig))

  if (copyright) {
    copyright = copyright.replace(fieldSplit3, splitSeparator).replace(charsRemovers.emptySpace,"").replace(charsRemovers.multiSpaces, "")
  }
  return {
    content: content.join(" "),
    copyright
  }
}

const extractPostapocalypticMovies = () => {
  const { htmlContent, mainSeparatorRegEx } = postapocalypticMovies
  const splicedItems = htmlContent.split(new RegExp(mainSeparatorRegEx)).filter(Boolean)

  const data = []

  splicedItems.forEach(string => {
    const imgFile = getImageFileName(string)
    const fields = getFields(string)
    const content = getContent(string)

    data.push({
      _id: randomId(12),
      root: HTML_ROOTS.POST_MOVIES,
      img: imgFile,
      ...fields,
      ...content
    })
  })

  return data
}

export {
  extractPostapocalypticMovies
}
