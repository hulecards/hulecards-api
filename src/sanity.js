const sanityClient = require('@sanity/client')
require("dotenv").config();

const client = sanityClient({
    apiVersion: '2022-04-29',
    projectId: "mz1j66r1",
    dataset: "production",
    token: process.env.SANITY_TOKEN,
    useCdn: true
})

module.exports = {
  client
}