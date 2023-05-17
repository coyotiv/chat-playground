const runner = require('../src/simulation-runner')

jest.mock('../src/bot', () => ({
  send: jest.fn()
}))

describe('simulation runner', () => {
  test('should send messages for simulation', async () => {
    const mockApp = {
      sendMessage: jest.fn()
    }
    const mockSimulation = {
      messages: ['Hello, bot!', 'Tell me a joke.', 'Goodbye, bot!']
    }

    await runner(mockApp, mockSimulation)

    expect(mockApp.sendMessage).toHaveBeenCalledTimes(mockSimulation.messages.length)
    for (let i = 0; i < mockSimulation.messages.length; i++) {
      expect(mockApp.sendMessage).toHaveBeenNthCalledWith(i + 1, {
        message: mockSimulation.messages[i],
        simulation: true,
        useStream: true
      })
    }
  })
})
