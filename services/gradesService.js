const fs = require('fs')
const path = require('path')
const gradesData = require('../data/gradesData')

module.exports = {
  getStudentGradesReportById,
  generateCourseGradesReport
}

//so the gradesData become available before hand
gradesData.fetchGrades()

const gradesReportFilePath = path.resolve(__dirname, '../data/static/gradesReport.json')

async function getStudentGradesReportById(studentId) {
  const grades = await gradesData.fetchGrades()
  if (!grades) return
  const studentGrades = grades.filter((gradeRecord) => gradeRecord.id === studentId)
  return studentGrades
}

async function generateCourseGradesReport() {
  // Check if the report exists in the static file
  if (doesFileExist(gradesReportFilePath)) {
    const gradesReport = require(gradesReportFilePath)
    return gradesReport
  }

  const grades = await gradesData.fetchGrades();
  if (!grades) return [];

  const summary = {};
  const batchSize = 10000;

  const result = await new Promise((resolve) => {
    const processBatch = function (data) {
      if (!data || !data.length) {
        const result = Object.entries(summary)
          .map(([course, stats]) => {
            const [highestGrade, lowestGrade, totalSum, totalCount] = stats;
            return {
              course,
              highestGrade,
              lowestGrade,
              averageGrade: Math.round(totalSum / totalCount)
            };
          })
          .sort((a, b) => a.course.localeCompare(b.course));
        
        resolve(result);
        return;
      }

      data.slice(0, batchSize).forEach(item => {
        const [highestGrade, lowestGrade, totalSum, totalCount] = summary[item.course] || [0, 0, 0, 0];

        summary[item.course] = [
          Math.max(highestGrade, item.grade),
          Math.min(lowestGrade, item.grade),
          totalSum + item.grade,
          totalCount + 1
        ];
      });

      setImmediate(() => processBatch(data.slice(batchSize)));
    };

    processBatch(grades);
  });

  // Save the generated report to the static file
  saveToFile(gradesReportFilePath, result);

  return result;
}

function doesFileExist(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

function saveToFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
