(function () {
  function grade(percent) {
    if (percent >= 90) return "A+";
    if (percent >= 80) return "A";
    if (percent >= 70) return "B";
    if (percent >= 60) return "C";
    if (percent >= 50) return "D";
    return "F";
  }
  function resultPage(user) {
    const student = user.role === "student" ? Store.get("students").find(function (item) { return item.id === user.id; }) : null;
    let rows = Store.get("results");
    if (student) rows = rows.filter(function (item) { return item.studentId === student.id; });
    if (user.role === "teacher") {
      const teacher = Store.get("teachers").find(function (item) { return item.id === user.id; });
      const assigned = teacher ? teacher.classes.split(",").map(function (item) { return item.trim(); }) : [];
      const subjects = teacher ? Store.get("subjects").filter(function (item) { return item.teacher === teacher.name; }).map(function (item) { return item.name; }) : [];
      if (teacher && subjects.indexOf(teacher.subject) === -1) subjects.push(teacher.subject);
      rows = rows.filter(function (item) { return assigned.indexOf(item.className) !== -1 && subjects.indexOf(item.subject) !== -1; });
    }
    const canManage = user.role !== "student";
    const examNames = Array.from(new Set(rows.map(function (item) { return item.exam; })));
    const htmlRows = rows.map(function (item) {
      const percent = Math.round((Number(item.marks) / Number(item.maxMarks || 100)) * 100);
      const actions = canManage ? '<td><div class="table-action"><button class="icon-btn" title="Edit marks" data-action="edit-result" data-id="' + esc(item.id) + '">✎</button><button class="icon-btn" title="Delete result" data-action="delete-result" data-id="' + esc(item.id) + '">×</button></div></td>' : "";
      return '<tr data-result="' + esc(item.id) + '"><td>' + esc(item.studentName) + '<small class="muted-cell">' + esc(item.studentId) + '</small></td><td>' + esc(item.className) + '</td><td>' + esc(item.exam) + '</td><td>' + esc(item.subject) + '</td><td><strong>' + esc(item.marks) + '</strong> / ' + esc(item.maxMarks) + '</td><td>' + percent + '%</td><td>' + badge(grade(percent), percent >= 50 ? "success" : "danger") + '</td><td>' + badge(percent >= 50 ? "Pass" : "Fail", percent >= 50 ? "success" : "danger") + '</td>' + actions + '</tr>';
    }).join("");
    const totals = {};
    rows.forEach(function (item) {
      const key = item.exam + "|" + item.className + "|" + item.studentId;
      if (!totals[key]) totals[key] = { exam: item.exam, className: item.className, studentName: item.studentName, total: 0, max: 0 };
      totals[key].total += Number(item.marks);
      totals[key].max += Number(item.maxMarks || 100);
    });
    const summaryRows = Object.keys(totals).map(function (key) { return totals[key]; });
    const summary = student ? '<section class="card" style="padding:18px;margin-bottom:18px"><div class="section-head"><div><h2>Exam summaries</h2><p>Total marks across all subjects in each examination.</p></div></div><div class="table-wrap"><table class="table"><thead><tr><th>Examination</th><th>Total marks</th><th>Percentage</th><th>Grade</th><th>Status</th></tr></thead><tbody>' +
      (summaryRows.length ? summaryRows.map(function (item) { const pct = Math.round(item.total / (item.max || 1) * 100); return '<tr><td>' + esc(item.exam) + '</td><td><strong>' + item.total + '</strong> / ' + item.max + '</td><td>' + pct + '%</td><td>' + badge(grade(pct), pct >= 50 ? "success" : "danger") + '</td><td>' + badge(pct >= 50 ? "Pass" : "Fail", pct >= 50 ? "success" : "danger") + '</td></tr>'; }).join("") : '<tr><td colspan="5" class="empty-state">No marks available for summaries.</td></tr>') + '</tbody></table></div></section>' : "";
    const classSummaries = {};
    summaryRows.forEach(function (item) {
      const key = item.exam + "|" + item.className;
      if (!classSummaries[key]) classSummaries[key] = { exam: item.exam, className: item.className, students: 0, percent: 0, passed: 0 };
      const percent = item.total / (item.max || 1) * 100;
      classSummaries[key].students++;
      classSummaries[key].percent += percent;
      if (percent >= 50) classSummaries[key].passed++;
    });
    const classReport = canManage ? '<div class="section-head" style="margin-top:24px"><div><h2>Class-wise performance</h2><p>Average scores and pass counts by class and examination.</p></div></div><div class="table-wrap"><table class="table"><thead><tr><th>Class</th><th>Examination</th><th>Students</th><th>Average score</th><th>Passed</th></tr></thead><tbody>' +
      (Object.keys(classSummaries).length ? Object.keys(classSummaries).map(function (key) { const item = classSummaries[key]; return '<tr><td>' + esc(item.className) + '</td><td>' + esc(item.exam) + '</td><td>' + item.students + '</td><td>' + Math.round(item.percent / item.students) + '%</td><td>' + item.passed + ' / ' + item.students + '</td></tr>'; }).join("") : '<tr><td colspan="5" class="empty-state">Class reports appear after marks are entered.</td></tr>') + '</tbody></table></div>' : "";
    return (student ? '<div class="profile-banner card"><div class="avatar">' + initials(student.name) + '</div><div><h2>' + esc(student.name) + '</h2><p>' + esc(student.id) + ' · ' + esc(student.className) + ' · Academic results</p></div></div>' : "") + summary +
      '<div class="toolbar"><div class="toolbar-left"><select id="results-exam-filter" aria-label="Filter results by exam"><option value="">All examinations</option>' + examNames.map(function (name) { return '<option>' + esc(name) + '</option>'; }).join("") + '</select></div><div class="toolbar-right">' +
      (canManage ? '<button class="btn btn-light" data-action="new-exam">＋ New examination</button><button class="btn" data-action="add-result">＋ Enter marks</button>' : '<button class="btn btn-light" data-action="print">⇩ Print report card</button>') +
      '</div></div><div class="section-head"><div><h2>' + (student ? "Examination results" : "Results & examinations") + '</h2><p>Grades and pass status are calculated automatically from marks.</p></div>' + (canManage ? '<button class="btn btn-light" data-action="export-results">Export CSV</button>' : "") + '</div>' +
      '<div class="table-wrap"><table class="table" id="results-table"><thead><tr><th>Student</th><th>Class</th><th>Examination</th><th>Subject</th><th>Marks</th><th>Score</th><th>Grade</th><th>Status</th>' + (canManage ? '<th>Actions</th>' : "") + '</tr></thead><tbody>' +
      (htmlRows || '<tr><td colspan="' + (canManage ? 9 : 8) + '" class="empty-state">No examination results are available yet.</td></tr>') + '</tbody></table></div>' + classReport +
      (canManage ? '<div class="section-head" style="margin-top:24px"><div><h2>Examination calendar</h2><p>Upcoming school assessments</p></div></div><div class="notice-list">' + Store.get("exams").map(function (exam) {
        return '<article class="card notice-card"><h3>' + esc(exam.name) + '</h3><div class="notice-meta"><span>' + esc(exam.className) + '</span><span>' + esc(formatDate(exam.date)) + '</span><span>Maximum ' + esc(exam.maxMarks) + ' marks</span></div></article>';
      }).join("") + '</div>' : "");
  }
  window.Results = { page: resultPage, grade: grade };
})();
