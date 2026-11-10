(function () {
  function dashboard(user) {
    const teacher = Store.get("teachers").find(function (item) { return item.id === user.id; });
    if (!teacher) return '<div class="card empty-state"><strong>Teacher profile unavailable</strong>Please contact your school administrator.</div>';
    const classes = teacher.classes.split(",").map(function (item) { return item.trim(); });
    const students = Store.get("students").filter(function (student) { return classes.indexOf(student.className) !== -1; });
    const lessons = Store.get("timetable").filter(function (row) { return row.teacher === teacher.name; });
    const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const todayLessons = lessons.filter(function (row) { return row.day === todayName; });
    return '<div class="card profile-banner"><div class="avatar">' + initials(teacher.name) + '</div><div><h2>Welcome back, ' + esc(teacher.name.split(" ")[0]) + '</h2><p>' + esc(teacher.subject) + ' · ' + esc(teacher.qualification || "Teaching staff") + '</p></div><button class="btn btn-light" data-nav="profile" style="margin-left:auto">View profile</button></div>' +
      '<div class="stat-grid">' + statCard("Assigned classes", classes.length, "▦", classes.join(" · ")) + statCard("Your students", students.length, "♙", "Across assigned classes") + statCard("Subject", teacher.subject, "▤", "Primary assignment") + statCard("Today’s lessons", todayLessons.length || "—", "◷", todayName) + '</div>' +
      '<div class="dashboard-grid"><section class="card"><div class="card-head"><div><h3>Today&#39;s timetable</h3><p>Your scheduled classes for ' + esc(todayName) + '</p></div></div>' +
      '<div class="activity-list">' + (todayLessons.length ? todayLessons.map(function (row) {
        return '<div class="activity-item"><span class="activity-mark"></span><div><strong>' + esc(row.time) + ' · ' + esc(row.subject) + '</strong><small>' + esc(row.className) + ' · Section ' + esc(row.section) + ' · Room ' + esc(row.room) + '</small></div></div>';
      }).join("") : '<div class="empty-state">No lessons scheduled today. Check your weekly timetable for upcoming classes.</div>') + '</div></section>' +
      '<section class="card"><div class="card-head"><div><h3>Quick actions</h3><p>Keep your class records up to date</p></div></div><div class="activity-list"><div class="activity-item"><span class="activity-mark"></span><div><strong><button class="text-action" data-nav="attendance">Take class attendance →</button></strong><small>Record daily attendance by class</small></div></div><div class="activity-item"><span class="activity-mark"></span><div><strong><button class="text-action" data-nav="results">Enter examination marks →</button></strong><small>Update student assessment results</small></div></div></div></section></div>' +
      '<div class="section-head"><div><h2>Assigned students</h2><p>Students in your teaching classes</p></div><div class="toolbar-right"><span class="badge">' + students.length + ' students</span><button class="btn" data-action="add-students">＋ Add student</button></div></div>' +
      '<div class="table-wrap"><table class="table"><thead><tr><th>Student</th><th>Student ID</th><th>Class</th><th>Roll</th><th>Guardian</th></tr></thead><tbody>' +
      students.map(function (item) { return '<tr><td><div class="person"><div class="avatar">' + initials(item.name) + '</div><div><strong>' + esc(item.name) + '</strong><small>' + esc(item.email || "Student") + '</small></div></div></td><td>' + esc(item.id) + '</td><td>' + esc(item.className) + ' · ' + esc(item.section) + '</td><td>' + esc(item.roll) + '</td><td>' + esc(item.guardian) + '</td></tr>'; }).join("") +
      '</tbody></table></div>';
  }
  window.TeacherViews = { dashboard: dashboard };
})();
