const blessed = require('blessed')

const bot = global.bot

const screen = blessed.screen({
  smartCSR: true,
  title: bot.title
})

const chat = blessed.box({
  parent: screen,
  padding: {
    top: 1,
    left: 2,
    right: 0,
    bottom: 0
  },
  top: 0,
  left: 0,
  width: '60%',
  height: '100%-5',
  scrollable: true,
  alwaysScroll: true,
  scrollbar: {
    bg: 'blue',
    fg: 'red'
  },
  mouse: true,
  label: ` Chat with ${bot.title} (${bot.model}) `,
  keys: true,
  tags: true,
  border: {
    type: 'line',
    fg: '#ffffff'
  }
})

const input = blessed.textarea({
  parent: screen,
  padding: {
    top: 1,
    left: 2,
    right: 2,
    bottom: 0
  },
  bottom: 0,
  left: 0,
  width: '100%',
  label: ' Input (hit tab to send) ',
  height: 5,
  focusable: true,
  inputOnFocus: true,
  mouse: true,
  keys: true,
  scrollable: true,
  alwaysScroll: true,
  scrollbar: {
    bg: 'blue',
    fg: 'red'
  },
  vi: true,
  tags: true,
  style: {
    focus: {
      border: {
        fg: 'blue'
      }
    }
  },
  border: 'line'
})

const contextBox = blessed.log({
  parent: screen,
  padding: {
    top: 1,
    left: 2,
    right: 0,
    bottom: 0
  },
  top: 0,
  left: '60%',
  width: '40%',
  height: '100%-5',
  scrollable: true,
  alwaysScroll: true,
  scrollbar: {
    ch: ' ',
    inverse: true
  },
  mouse: true,
  keys: true,
  vi: true,
  tags: true,
  border: {
    type: 'line',
    fg: '#ffffff'
  },
  label: ' Context '
})

let waitingResponse = false

let stop = false

input.key('C-c', () => {
  if (waitingResponse) stop = true
})

input.key('tab', async () => {
  if (waitingResponse) {
    input.setValue(input.getValue().slice(0, -1))
    return
  }

  await sendMessage({ message: input.value.slice(0, -1), useStream: true })
})

input.focus()

screen.key(['escape', 'q', 'C-c'], () => {
  return process.exit(0)
})

chat.pushLine(`{bold}{red-fg}[System]{/} {grey-fg}${bot.initialMessage.content}{/}\n`)
chat.scrollTo(chat.getScrollHeight())

screen.render()

async function sendMessage({ message, useStream }) {
  waitingResponse = true

  chat.pushLine(`{bold}{green-fg}[You]{/} ${message}\n`)
  chat.scrollTo(chat.getScrollHeight())

  input.clearValue()
  input.focus()
  screen.render()

  const { context, reply, stream } = await bot.send({ message, stream: useStream })

  contextBox.setContent(context.map((m, i) => `${i + 1}. [${m.role}] ${m.content}`).join('\n\n'))
  contextBox.setLabel(` Context (${context.length} messages) `)

  screen.render()

  if (stream) {
    let reply = ''

    stream.once('data', () => {
      chat.pushLine(`{bold}{red-fg}[Bot]{/} `)
    })

    stream.on('data', data => {
      if (stop) {
        stream.end()
        return
      }

      reply += data
      chat.setContent(chat.getContent() + data)
      chat.scrollTo(chat.getScrollHeight())

      screen.render()
    })

    stream.on('end', () => {
      waitingResponse = false
      stop = false

      chat.setContent(chat.getContent() + '\n')
      chat.scrollTo(chat.getScrollHeight())

      const history = [...context, { role: 'assistant', content: reply }]
      contextBox.setContent(history.map((m, i) => `${i + 1}. [${m.role}] ${m.content}`).join('\n\n'))
      contextBox.setLabel(` Context (${context.length} messages) `)

      screen.render()
    })

    return new Promise(resolve => {
      stream.on('end', resolve)
    })
  } else {
    chat.pushLine(`{bold}{red-fg}[Bot]{/} ${reply}\n`)
    chat.scrollTo(chat.getScrollHeight())

    const history = [...context, { role: 'assistant', content: reply }]
    contextBox.setContent(history.map((m, i) => `${i + 1}. [${m.role}] ${m.content}`).join('\n\n'))
    contextBox.setLabel(` Context (${context.length} messages) `)

    screen.render()
    waitingResponse = false
  }
}

module.exports.sendMessage = async function ({ message, useStream, simulation }) {
  if (simulation) {
    await new Promise(resolve => {
      let i = 1

      function renderCharacter() {
        if (i > message.length) {
          return resolve()
        }
        input.setValue(message.slice(0, i))
        screen.render()
        i++
        setTimeout(renderCharacter, 16)
      }

      renderCharacter()
    })
  }

  await sendMessage({ message, useStream })
}
