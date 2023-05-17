const path = require('path')
const { PassThrough } = require('stream')
const OpenAI = require('openai')
require('dotenv').config()

const { encode } = require('gpt-3-encoder')

let initialMessage = ''
let transformMessage = (history, msg) => msg
let transformReply = (history, msg) => msg

let model = global.model

const openai = new OpenAI()

let history = []

module.exports.send = async function ({ message = '', stream = false } = {}) {
  const transformedMessage = await transformMessage(history, message)

  if (transformedMessage != message) {
    console.log(`\t[message transformed into] ${transformedMessage}`)
  }

  history.push({ role: 'user', content: transformedMessage })

  const recentHistory = history.slice(-40)

  do {
    const allMessages = recentHistory.map(m => m.content).join('\n')
    const tokenLength = encode(allMessages).length

    if (tokenLength < 7000) break
  } while (recentHistory.shift())

  recentHistory.unshift(initialMessage)

  const allMessages = recentHistory.map(m => m.content).join('\n')
  const tokenLength = encode(allMessages).length

  // console.log(`\t[received ${tokenLength} tokens in ${recentHistory.length} messages]`)

  const returnStream = new PassThrough()

  const doCall = async () => {
    if (!message) {
      return { context: recentHistory, reply: '' }
    }

    const completions = await openai.chat.completions.create({
      model: model,
      messages: recentHistory,
      temperature: 1,
      n: 1,
      stream
    })

    if (!stream) {
      let reply = completions.choices[0].message

      const transformedReply = await transformReply(history, reply.content)
      if (transformedReply != reply.content) {
        console.log(`\t[reply transformed, original reply] ${reply.content}`)
      }

      history.push({ role: 'assistant', content: transformedReply })

      return { context: recentHistory, reply: transformedReply }
    }

    let response = ''

    for await (const part of completions) {
      if (!part.choices[0]?.delta?.content) continue

      response += part.choices[0].delta.content

      returnStream.write(part.choices[0].delta.content)
    }

    history.push({ role: 'assistant', content: response })

    returnStream.end()
  }

  if (stream) {
    setTimeout(doCall, 10)
    return { context: recentHistory, stream: returnStream }
  } else {
    return doCall()
  }
}

module.exports.load = function (name) {
  name = path.join(__dirname, '..', 'profiles', name)

  const profile = require(name)

  module.exports.history = history = []
  module.exports.initialMessage = initialMessage = profile.initialMessage
  module.exports.model = model = global.model || profile.model

  if (profile.transformMessage) transformMessage = profile.transformMessage
  if (profile.transformReply) transformReply = profile.transformReply

  module.exports.title = profile.title
}
