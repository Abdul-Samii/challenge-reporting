const tape = require('tape')
const jsonist = require('jsonist')

const port = (process.env.PORT = process.env.PORT || require('get-port-sync')())
const endpoint = `http://localhost:${port}`

const server = require('./server')

tape('health', async function (t) {
  const url = `${endpoint}/health`
  try {
    const { data, response } = await jsonist.get(url)
    if (response.statusCode !== 200) {
      throw new Error('Error connecting to sqlite database; did you initialize it by running `npm run init-db`?')
    }
    t.ok(data.success, 'should have successful healthcheck')
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('/student/:id', async function (t) {
  const url = `${endpoint}/student`;

  {
    const { response, body } = await new Promise((resolve, reject) => {
      jsonist.get(`${url}/bad-path`, (err, body, response) => {
        if (err) reject(err);
        resolve({ response, body });
      });
    });
    t.equal(response.statusCode, 400, 'Should return 400 error and fail request');
    t.equal(body.error, 'Provide a valid student id');
  }

  {
    const { body } = await new Promise((resolve, reject) => {
      jsonist.get(`${url}/1`, (err, body, response) => {
        if (err) reject(err);
        resolve({ response, body });
      });
    });
    t.ok(body, 'Should return students data');
    t.equal(body.id, 1, 'Should return details of student with id 1');
  }

  {
    const { response, body } = await new Promise((resolve, reject) => {
      jsonist.get(`${url}/9990909090909090909090`, (err, body, response) => {
        if (err) reject(err);
        resolve({ response, body });
      });
    });
    t.equal(response.statusCode, 404, 'Should return not found for this student id');
    t.equal(body.error, 'Student not found with this id');
  }

  t.end();
});

tape('cleanup', function (t) {
  server.closeDB()
  server.close()
  t.end()
})
