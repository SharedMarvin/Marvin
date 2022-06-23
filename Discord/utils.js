const axios = require('axios');

module.exports = {
    instance: axios.create({ baseURL: `http://${process.env.JENKINS_ID}:${process.env.JENKINS_API_TOKEN}@${process.env.JENKINS_HOST}:8080/` })
}
