module.exports = {
  notFound,
  badRequest,
  serverError
}

function notFound(errorMessage) {
  const error = new Error(errorMessage)
  error.statusCode = 404
  return error
}

function badRequest(errorMessage) {
  const error = new Error(errorMessage)
  error.statusCode = 400
  return error
}

function serverError(errorMessage) {
  const error = new Error(errorMessage)
  error.statusCode = 500
  return error
}
