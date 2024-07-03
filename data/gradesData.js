const fs = require('fs')
const https = require('https')
const path = require('path')
const JSONStream = require('JSONStream')
const cache = require('../cache/cache')

module.exports = {
  fetchGrades
}

const gradesURL = 'https://outlier-coding-test-data.onrender.com/grades.json'
const gradesFilePath = path.resolve(__dirname, './static/grades.json')

async function fetchGrades() {
  // Check if grades are in cache
  let grades = cache.get('grades')
  if (grades) return grades

  // Check if grades are in the static file
  if (doesFileExist(gradesFilePath)) {
    grades = require(gradesFilePath)
    cache.set('grades', grades) // Cache the grades
    return grades
  }

  // Fetch grades from the remote API
  return new Promise((resolve, reject) => {
    https.get(gradesURL, (res) => {
      if (res.statusCode !== 200) return reject(new Error('Error fetching grades'))
      
      const stream = res.pipe(JSONStream.parse('*'))
      const data = []

      stream.on('data', jsonData => data.push(jsonData))
      stream.on('end', () => {
        cache.set('grades', data)
        saveToFile(gradesFilePath, data) // Save fetched data to the static file
        resolve(data)
      })
      stream.on('error', e => reject(e))
    })
  })
}

function doesFileExist(filePath) {
  try {
    return fs.existsSync(filePath)
  } catch (err) {
    return false
  }
}

function saveToFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}
