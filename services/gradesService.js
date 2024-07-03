const gradesData = require('../data/gradesData')

module.exports = {
  getStudentGradesReportById,
  generateCourseGradesReport
}

//so the gradesData become available before hand
gradesData.fetchGrades()

async function getStudentGradesReportById(studentId) {
  const grades = await gradesData.fetchGrades()
  if (!grades) return
  const studentGrades = grades.filter((gradeRecord) => gradeRecord.id === studentId)
  return studentGrades
}

async function generateCourseGradesReport() {
  const grades = await gradesData.fetchGrades();
  if (!grades) return [];

  const summary = {};
  const batchSize = 10000;

  return new Promise((resolve) => {
    const processBatch = function(data) {
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
}
