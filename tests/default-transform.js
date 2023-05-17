const initialMessage = {
  role: 'system',
  content: 'You are a famous copywriter.'
}

async function transformMessage(history, message) {
  return `transformed ${message}`
}

async function transformReply(history, reply) {
  return `transformed ${reply}`
}

const title = 'Copywriter'
const model = 'gpt-3.5-turbo-16k'

module.exports = { initialMessage, transformMessage, transformReply, title, model }
