const readline = require('readline')

const bot = global.bot

console.log(`[System message] ${bot.initialMessage.content}

======================================================

`)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.setPrompt('[You] ')

rl.on('line', async input => {
  sendMessage({ message: input, useStream: true })
})

rl.on('close', () => {
  console.log('\n[Bot] Bye!')
  process.exit(0)
})

rl.prompt()

async function sendMessage({ message, useStream }) {
  let showHistory = false
  if (message === '$history') {
    showHistory = true
    message = ''
  }

  const { context, reply, stream } = await bot.send({ message, stream: useStream })

  if (showHistory) {
    console.log(context)
    rl.prompt()
    return
  }

  if (stream) {
    stream.once('data', () => {
      process.stdout.write('\n[Bot] ')
    })

    stream.on('end', () => {
      process.stdout.write('\n\n')
      rl.prompt()
    })

    stream.pipe(process.stdout)

    return new Promise(resolve => {
      stream.on('end', resolve)
    })
  }

  if (reply) {
    console.log(`\n[Bot] ${reply}\n`)
    rl.prompt()
  }
}

module.exports = {
  sendMessage: async function ({ message, useStream, simulation }) {
    if (simulation) {
      await new Promise(resolve => {
        let i = 0

        function renderCharacter() {
          if (i > message.length - 1) {
            process.stdout.write('\n')
            return resolve()
          }
          process.stdout.write(message[i])
          i++
          setTimeout(renderCharacter, 16)
        }

        renderCharacter()
      })
    }

    await sendMessage({ message, useStream })
  }
}
