'use strict';

const settings = require('./config/settings')
const axios = require('axios')
const AWS = require('aws-sdk')
const cheerio = require('cheerio')

const dynamoDB = new AWS.DynamoDB.DocumentClient()

const uuid = require('uuid')

class Handler {
  static async main(event) {
    console.log('at', new Date().toISOString(), JSON.stringify(event, null, 2))
    const { data } = await axios.get(settings.commitMEssageUrl)
    const $ = cheerio.load(data)
    const [commitMessage] = await $("#content").text().trim().split('\n')
    console.log("Message:", commitMessage)
    const params = {
      TableName: settings.dbTableName,
      Item: {
        id: uuid.v4(),
        commitMessage,
        createdAt: new Date().toString()
      }
    }
    await dynamoDB.put(params).promise()
    return {
      statusCode: 200
    }
  }
}

module.exports = {
  scheduler: Handler.main

};
