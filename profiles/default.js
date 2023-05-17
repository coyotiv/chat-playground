const initialMessage = {
  role: 'system',
  content: 'You are a famous copywriter.'
}

async function transformMessage(history, message) {
  return message
}

async function transformReply(history, reply) {
  return reply
}

const title = 'Copywriter'
const model = 'gpt-3.5-turbo'

module.exports = { initialMessage, transformMessage, transformReply, title, model }
