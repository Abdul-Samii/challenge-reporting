const https = require('https')
const JSONStream = require('JSONStream')
const cache = require('../cache/cache')

module.exports = {
  fetchGrades
}

const gradesURL = 'https://outlier-coding-test-data.onrender.com/grades.json'

async function fetchGrades() {
  const grades = cache.get('grades')
  if (grades) return grades

  return new Promise((resolve, reject) => {
    https.get(gradesURL, (res) => {

      if (res.statusCode !== 200) reject(new Error('Error fetching grades'))
      
      const stream = res.pipe(JSONStream.parse('*'))
      const data = []

      stream.on('data', jsonData => data.push(jsonData))
      stream.on('end', () => {
        cache.set('grades', data)
        const grades = cache.get('grades')
        resolve(grades)
      })
      stream.on('error', e => reject(e))
    })
  })
}
