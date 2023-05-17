module.exports = async function (app, simulation) {
  for (const message of simulation.messages) {
    await app.sendMessage({ message, simulation: true, useStream: true })
  }
}
