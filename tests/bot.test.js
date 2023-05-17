const bot = require('../src/bot')

jest.setTimeout(30000)

describe('bot', () => {
  test('should send a message without stream', async () => {
    bot.load('../tests/default-no-transform')
    const { reply } = await bot.send({ message: 'Hello, bot!', stream: false })

    expect(bot.title).toBe('no transform')
    expect(bot.history).toHaveLength(2)
    expect(reply).toBeTruthy()
    expect(bot.history[bot.history.length - 1].role).toBe('assistant')
  })

  test('should load a profile', () => {
    bot.load('default')
    expect(bot.title).toBe('Copywriter')
  })

  test('should send a message', async () => {
    const { context, reply } = await bot.send({ message: 'Hello, bot!' })

    expect(context).toHaveLength(2)
    expect(context[1].role).toBe('user')
    expect(context[1].content).toBe('Hello, bot!')
    expect(reply).toBeTruthy()
  })

  test('should send a different message', async () => {
    const { context, reply } = await bot.send({ message: 'Tell me a joke, bot!' })

    expect(context).toHaveLength(4)
    expect(context[3].role).toBe('user')
    expect(context[3].content).toBe('Tell me a joke, bot!')
    expect(reply).toBeTruthy()
  })

  test('should send an empty message', async () => {
    const { context, reply } = await bot.send({ message: '' })

    expect(context).toHaveLength(6)
    expect(context[5].role).toBe('user')
    expect(context[5].content).toBe('')
    expect(reply).toBe('')
  })

  test('should transform a message', async () => {
    bot.load('../tests/default-transform')

    const { context, reply } = await bot.send({ message: 'Hello, bot!', stream: false })

    expect(context).toHaveLength(2)
    expect(context[1].content).toBe('transformed Hello, bot!')
    expect(reply.startsWith('transformed')).toBeTruthy()
  })
})

test('should send a message with stream', done => {
  bot.load('default')
  bot.send({ message: 'Hello, bot!', stream: true }).then(({ context, stream }) => {
    expect(stream).toBeInstanceOf(require('stream').Readable)

    stream.on('data', data => {
      expect(data).toBeTruthy()
    })

    stream.on('end', () => {
      done()
    })
  })
})

test('should use default message when no message is sent', async () => {
  const { reply } = await bot.send()

  expect(bot.history).toHaveLength(3)
  expect(reply).toBe('')
  expect(bot.history[bot.history.length - 1].role).toBe('user')
})

test('should handle token length greater than 7000', async () => {
  const longMessage = 'a0s'.repeat(3500)
  bot.history.push({ role: 'user', content: longMessage })

  const { reply } = await bot.send({ message: 'hello' })

  expect(reply).toBeTruthy()
  expect(bot.history[bot.history.length - 1].role).toBe('assistant')
})
