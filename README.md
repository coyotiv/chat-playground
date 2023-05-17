# Chat Playground - A Chatbot Test Environment

[![Coverage Status](https://coveralls.io/repos/github/coyotiv/chat-playground/badge.svg?branch=main)](https://coveralls.io/github/coyotiv/chat-playground?branch=main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/coyotiv/chat-playground/blob/master/LICENSE)


Chat Playground is a chatbot test environment designed for rapid experimentation with OpenAI GPT models. It provides a command-line interface and a windowed mode for interaction. The chatbot's behavior can be customized by loading different profiles, which can modify the initial message, the transformation of messages and replies, and the title of the bot. The application also supports running simulations, which are predefined sequences of messages. This allows for quick testing and iteration of different chatbot behaviors and responses.

## Motivation

The motivation behind Chat Playground is to provide a flexible and easy-to-use platform for experimenting with chatbot behaviors and responses. It allows developers and researchers to quickly test different scenarios and profiles, and see how the chatbot responds. This can be particularly useful for developing and refining chatbot applications, as well as for exploring the capabilities and limitations of the OpenAI GPT models.

## Installation

1. Clone the repository.
2. Run `npm install` to install the dependencies.

## Usage

You can run the chatbot in two modes: simple and window.

### Simple Mode

In simple mode, you interact with the chatbot via the command line. To start the chatbot in simple mode, run:

```bash
node index.js
```

### Window Mode

In window mode, the chatbot runs in a command-line interface but with a windowed interface for easier inspection and interaction. To start the chatbot in window mode, run:

```bash
node index.js -w
```

### Profiles

You can customize the behavior of the chatbot by loading different profiles. A profile is a JavaScript file located under the `profiles` folder that exports an object with the following properties. By default, the application uses `default.js`:

- `initialMessage`: The initial message that the chatbot sends when it starts.
- `transformMessage`: A function that transforms the user's message before it is sent to the chatbot.
- `transformReply`: A function that transforms the chatbot's reply before it is sent to the user.
- `title`: The title of the chatbot.
- `model`: The OpenAI model to use.

To load a profile, use the `--profile` option followed by the name of the profile:

```bash
node index.js --profile my-profile
```

Here is an example of a profile:

```javascript
// profiles/my-profile.js
module.exports = {
  initialMessage: {
    role: 'system',
    content: 'You are a famous copywriter.'
  },
  transformMessage: async function(history, message) {
    return message
  },
  transformReply: async function(history, reply) {
    return reply
  },
  title: 'My Profile',
  model: 'gpt-3.5-turbo'
}
```

### Simulations

You can run a simulation, which is a predefined sequence of messages. A simulation is a JavaScript file that exports an object with the following properties:

- `profile`: The name of the profile to load for the simulation.
- `model`: The OpenAI model to use for the simulation.
- `messages`: An array of messages to send to the chatbot.

To run a simulation, use the `simulate` command followed by the name of the simulation:

```bash
node index.js simulate my-simulation
```

Here is an example of a simulation:

```javascript
// simulations/my-simulation.js
module.exports = {
  profile: 'my-profile',
  model: 'gpt-3.5-turbo',
  messages: [
    'Hello, bot!',
    'Tell me a joke.',
    'Goodbye, bot!'
  ]
}
```

### Complex Usage Scenario

You can combine multiple command-line arguments to customize your interaction with the chatbot. Here is an example of a complex usage scenario:

```bash
node index.js -w --profile my-profile -m gpt-3.5-turbo simulate my-simulation
```

In this scenario, the chatbot loads the `my-profile` profile, uses the `gpt-3.5-turbo` model, runs the `my-simulation` simulation in window mode.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


