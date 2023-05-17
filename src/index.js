require('dotenv').config()

const yargs = require('yargs')
const { hideBin } = require('yargs/helpers')

const argv = yargs(hideBin(process.argv))
  .command('$0 [profile]', 'Run a GPT-powered chatbot.', {
    window: {
      alias: 'w',
      type: 'boolean',
      description: 'Run the bot in window mode.'
    },
    profile: {
      type: 'string',
      description: 'Load a bot profile from an existing JS file2324.',
      default: 'default'
    },
    model: {
      alias: 'm',
      type: 'string',
      description: 'The model to use in OpenAI.',
      choices: ['gpt-3.5-turbo', 'gpt-4']
    }
  })
  .command('simulate <simulation>', 'Run a simulation.', {
    window: {
      alias: 'w',
      type: 'boolean',
      description: 'Run the simulation in window mode.'
    },
    model: {
      alias: 'm',
      type: 'string',
      description: 'The model to use in OpenAI.',
      choices: ['gpt-3.5-turbo', 'gpt-4']
    },
    simulation: {
      type: 'string',
      description: 'Load a simulation from an existing JS file.'
    }
  })
  .alias('h', 'help')
  .alias('v', 'version').argv

global.profile = argv.profile
global.model = argv.model

let profile = argv.profile
let simulation = null

if (argv.simulation) {
  simulation = require(`../simulations/${argv.simulation}`)
  profile = simulation.profile

  global.model = global.model || simulation.model
}

global.bot = require('./bot')

global.bot.load(profile)

let appName = argv.window ? 'window' : 'simple'

const app = require(`./${appName}-mode`)

if (argv.simulation) {
  const runner = require('./simulation-runner')

  runner(app, simulation)
}
