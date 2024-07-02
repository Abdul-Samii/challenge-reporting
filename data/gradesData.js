const https = require('https')
const JSONStream = require('JSONStream')

module.exports = {
  fetchGrades
}

const gradesURL = 'https://outlier-coding-test-data.onrender.com/grades.json'

//the grades will be cache here when the server is started 
//because the data is static in our case, its not changing.
let grades

async function fetchGrades() {
  if (grades) return grades

  return new Promise((resolve, reject) => {
    https.get(gradesURL, (res) => {

      if (res.statusCode !== 200) reject(new Error('Error fetching grades'))
      
      const stream = res.pipe(JSONStream.parse('*'))
      const data = []

      stream.on('data', jsonData => data.push(jsonData))
      stream.on('end', () => {
        grades = data
        resolve(grades)
      })
      stream.on('error', e => reject(e))
    })
  })
}
