(function () {
  function dashboard(user) {
    const student = Store.get("students").find(function (item) { return item.id === user.id; });
    if (!student) return '<div class="card empty-state"><strong>Student profile unavailable</strong>Please contact your school office.</div>';
    const attendanceRows = [];
    Object.keys(Store.get("attendance")).forEach(function (key) {
      const record = Store.get("attendance")[key].find(function (row) { return row.studentId === student.id; });
      if (record) attendanceRows.push(record);
    });
    const present = attendanceRows.filter(function (row) { return row.status === "Present"; }).length;
    const attendancePct = attendanceRows.length ? Math.round(present / attendanceRows.length * 100) : 0;
    const results = Store.get("results").filter(function (row) { return row.studentId === student.id; });
    const average = results.length ? Math.round(results.reduce(function (sum, row) { return sum + Number(row.marks) / Number(row.maxMarks || 100) * 100; }, 0) / results.length) : 0;
    const schedule = Store.get("timetable").filter(function (row) { return row.className === student.className && row.section === student.section; });
    const classTeacher = AdminViews.studentTeacher(student);
    const announcements = Store.get("notices").slice(0, 2);
    return '<div class="card profile-banner"><div class="avatar">' + (student.photo ? '<img src="' + esc(student.photo) + '" alt="">' : initials(student.name)) + '</div><div><h2>Good morning, ' + esc(student.name.split(" ")[0]) + '</h2><p>' + esc(student.id) + ' · ' + esc(student.className) + ' · Section ' + esc(student.section) + ' · Roll ' + esc(student.roll) + (classTeacher ? ' · Class teacher: ' + esc(classTeacher) : '') + '</p></div><button class="btn btn-light" data-nav="profile" style="margin-left:auto">My profile</button></div>' +
      '<div class="stat-grid">' + statCard("Attendance", attendancePct + "%", "◷", "Your attendance this year") + statCard("Subjects", Store.get("subjects").filter(function (subject) { return subject.className === student.className; }).length, "▤", "In your curriculum") + statCard("Assessment average", results.length ? average + "%" : "—", "↗", results.length + " marks recorded") + statCard("Upcoming exams", Store.get("exams").filter(function (exam) { return exam.className === student.className && exam.date >= Store.today; }).length, "▦", "Check your exam schedule") + '</div>' +
      '<div class="dashboard-grid"><section class="card"><div class="card-head"><div><h3>Recent results</h3><p>Your latest marks and grades</p></div><button class="text-action" data-nav="results">See all →</button></div>' +
      '<div class="activity-list">' + (results.length ? results.slice(-4).reverse().map(function (row) {
        const pct = Math.round(Number(row.marks) / Number(row.maxMarks || 100) * 100);
        return '<div class="activity-item"><span class="activity-mark"></span><div style="width:100%"><strong>' + esc(row.subject) + '<span style="float:right">' + esc(row.marks) + '/' + esc(row.maxMarks) + '</span></strong><small>' + esc(row.exam) + ' · ' + Results.grade(pct) + ' grade</small></div></div>';
      }).join("") : '<div class="empty-state">Your examination results will appear here.</div>') + '</div></section>' +
      '<section class="card"><div class="card-head"><div><h3>School announcements</h3><p>Latest news from your school</p></div><button class="text-action" data-nav="notices">All notices →</button></div><div class="activity-list">' +
      announcements.map(function (notice) { return '<div class="activity-item"><span class="activity-mark"></span><div><strong>' + esc(notice.title) + '</strong><small>' + esc(formatDate(notice.date)) + '</small></div></div>'; }).join("") +
      '</div></section></div><div class="section-head"><div><h2>Your weekly timetable</h2><p>' + esc(student.className) + ' · Section ' + esc(student.section) + '</p></div><button class="btn btn-light" data-nav="timetable">Full timetable</button></div>' +
      (schedule.length ? '<div class="table-wrap"><table class="table"><thead><tr><th>Day</th><th>Time</th><th>Subject</th><th>Teacher</th><th>Room</th></tr></thead><tbody>' +
        schedule.map(function (row) { return '<tr><td>' + esc(row.day) + '</td><td>' + esc(row.time) + '</td><td><strong>' + esc(row.subject) + '</strong></td><td>' + esc(row.teacher) + '</td><td>' + esc(row.room) + '</td></tr>'; }).join("") + '</tbody></table></div>' :
        '<div class="card empty-state">Your class timetable has not been published yet.</div>');
  }
  window.StudentViews = { dashboard: dashboard };
})();
