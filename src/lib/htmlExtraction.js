import postapocalypticMovies from '../../old/sources/postapocalypticMovies'
import postapocalypticStories from '../../old/sources/postapocalypticStories'
import randomId from 'random-id'
import consts from '../constants'
import isArray from 'lodash/array'
const { HTML_ROOTS } = consts

const fieldSplit = '<span[^<>]*class="niebieski"[^<>]*>[\\s\\S]*?</span>'
const fieldSplit2 = `<span[^<>]*class="niebieski2"[^<>]*>[\\s\\S]*?<p>`
const fieldSplit3 = /(<([^>]+)>)/ig
const contentSplit = /<p[^<>]*[^<>]*>[\s\S]*?<\/p>/ig
const imgSrcPattern = 'src\\s*=\\s*"(.+?)"'
const imgAltPattern = 'alt="(.+?)"'
const imgMoviesSplitter = '<[^>]+class="imgfilmy"'
const splitSeparator = '  '

const charsRemovers = {
  endOfStringDot: /\.$/,
  lineBreak: /(\r\n\t|\n|\r\t)/gm,
  emptySpace: /^\s+/g,
  multiSpaces: / +(?= )/g,
  coma: ':'
}

const getImageFileName = (string, splitter) => {
  if (isArray(splitter)) {
    
  } else {
    const imgTag = string.match(splitter)[0].replace(/(\r\n\t|\n|\r\t)/gm, "")
    const imgAlt = imgTag.match(imgAltPattern)[1].replace(`'`, "").replace(`\'`, "")
    const arrayOfMatchedUrl = imgTag.match(imgSrcPattern)[1]
    const fileName = arrayOfMatchedUrl.substring(arrayOfMatchedUrl.lastIndexOf('/') + 1)

    return {
      fileName,
      alt: imgAlt
    }
  }
}

const getFields = (string, fieldSplitterClass) => {
  const fieldSplitter = `<span[^<>]*class="${fieldSplitterClass}"[^<>]*>[\\s\\S]*?<p>`
  const fieldString = string.match(fieldSplitter, '/gm')[0]
  const splicedFields = fieldString.split('<br>')
  let title = ''
  let fields = []

  splicedFields.forEach((field, key) => {
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
        const fieldList = {
          name: fieldsArray[1]
            .replace(charsRemovers.emptySpace, '')
            .replace(charsRemovers.coma, ''),

          value: (fieldsArray[2] || '')
            .replace(charsRemovers.emptySpace, '')
            .replace(charsRemovers.lineBreak, '')
            .replace(charsRemovers.endOfStringDot, '')
        }
        if (fieldList.name && fieldList.value) {
          fields.push(fieldList)
        }
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
  content.forEach((val, key) => {
    if (val.match(/<p align="center">/ig)) {
      copyright = content.splice(key)
    }
  })
  copyright = copyright.find(c => c.match(/<p align="right">/ig))

  if (copyright) {
    copyright = copyright.replace(fieldSplit3, splitSeparator).replace(charsRemovers.emptySpace, '').replace(charsRemovers.multiSpaces, '')
  }
  return {
    content: content.join(' '),
    copyright
  }
}

const extractHtmlFromSource = source => {
  const { htmlContent, mainSeparatorRegEx, imageSeparatorClass, fieldSplitterClass } = source
  const splicedItems = htmlContent.split(new RegExp(mainSeparatorRegEx)).filter(Boolean)
  const data = []

  splicedItems.forEach(string => {
    const imgFile = getImageFileName(string, imageSeparatorClass)
    const fields = getFields(string, fieldSplitterClass)
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



export default extractHtmlFromSource
