const gradesData = require('../data/gradesData')

module.exports = {
  getStudentGradesReportById
}

//so the gradesData become available before hand
gradesData.fetchGrades()

async function getStudentGradesReportById(studentId) {
  const grades = await gradesData.fetchGrades()
  if (!grades) return
  const studentGrades = grades.filter((gradeRecord) => gradeRecord.id === studentId)
  return studentGrades
}
