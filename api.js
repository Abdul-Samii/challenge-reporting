const knex = require('./db')
const studentService = require('./services/studentService')
const { notFound, badRequest, serverError } = require('./utils/errorHandling')

module.exports = {
  getHealth,
  getStudent,
  getStudentGradesReport,
  getCourseGradesReport
}

async function getHealth (req, res, next) {
  try {
    await knex('students').first()
    res.json({ success: true })
  } catch (e) {
    console.log(e)
    res.status(500).end()
  }
}

async function getStudent (req, res, next) {
  try {
    const { id } = req.params
    if (!/^\d+$/.test(id) || !parseInt(id) > 0) return next(badRequest('Provide a valid student id'))
    const student = await studentService.getStudentById(id)
    if (!student) return next(notFound("Student not found with this id"))
    res.status(200).json(student);
  } catch (error) {
    return next(serverError('Internal Server Error'))
  }
}

async function getStudentGradesReport (req, res, next) {
  throw new Error('This method has not been implemented yet.')
}

async function getCourseGradesReport (req, res, next) {
  throw new Error('This method has not been implemented yet.')
}
