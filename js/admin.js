(function () {
  const entityConfig = {
    students: { title: "Students", description: "Manage student records, guardians, enrollment and class assignments.", icon: "♙", fields: [
      ["name", "Student name", "text", true], ["className", "Class", "select:classes", true], ["section", "Section", "select:sections", true], ["roll", "Roll number", "text", true],
      ["gender", "Gender", "select:gender", false], ["dob", "Date of birth", "date", false], ["email", "Student email", "email", false], ["phone", "Student phone", "tel", false],
      ["guardian", "Parent / guardian", "text", true], ["guardianPhone", "Guardian phone", "tel", true], ["password", "Login password", "password", true], ["photo", "Profile photo", "file", false]
    ], columns: ["Student", "Student ID", "Class", "Section", "Roll", "Guardian", "Contact", "Teacher", "Actions"] },
    teachers: { title: "Teachers", description: "Manage teaching staff, subject expertise and class assignments.", icon: "♙", fields: [
      ["name", "Full name", "text", true], ["email", "Email address", "email", true], ["phone", "Phone number", "tel", false], ["subject", "Primary subject", "text", true],
      ["classes", "Assigned classes (comma separated)", "text", true], ["qualification", "Qualification", "text", false], ["password", "Login password", "password", true]
    ], columns: ["Teacher", "Staff ID", "Subject", "Assigned classes", "Email", "Phone", "Actions"] },
    classes: { title: "Classes & sections", description: "Organize grade levels, sections, class teachers and classrooms.", icon: "▦", fields: [
      ["name", "Class name", "text", true], ["sections", "Sections (comma separated)", "text", true], ["teacher", "Class teacher", "text", false], ["room", "Room number", "text", false]
    ], columns: ["Class", "Sections", "Class teacher", "Room", "Students", "Actions"] },
    subjects: { title: "Subjects", description: "Manage the academic curriculum and subject teacher assignments.", icon: "▤", fields: [
      ["name", "Subject name", "text", true], ["code", "Subject code", "text", true], ["className", "Class", "select:classes", true], ["teacher", "Assigned teacher", "text", false]
    ], columns: ["Subject", "Code", "Class", "Teacher", "Actions"] }
  };
  function entityPage(key) {
    const config = entityConfig[key];
    const records = Store.get(key);
    const rows = records.map(function (item) {
      if (key === "students") return '<tr data-search="' + esc((item.name + " " + item.id + " " + item.guardian + " " + (studentTeacher(item) || "")).toLowerCase()) + '"><td><div class="person"><div class="avatar">' + (item.photo ? '<img src="' + esc(item.photo) + '" alt="">' : initials(item.name)) + '</div><div><strong>' + esc(item.name) + '</strong><small>' + esc(item.email || "No email") + '</small></div></div></td><td>' + esc(item.id) + '</td><td>' + esc(item.className) + '</td><td>' + esc(item.section) + '</td><td>' + esc(item.roll) + '</td><td>' + esc(item.guardian) + '</td><td>' + esc(item.guardianPhone) + '</td><td>' + esc(studentTeacher(item) || "Not assigned") + '</td><td>' + actions(item.id, key, true) + '</td></tr>';
      if (key === "teachers") return '<tr data-search="' + esc((item.name + " " + item.id + " " + item.subject + " " + item.email).toLowerCase()) + '"><td><div class="person"><div class="avatar">' + initials(item.name) + '</div><div><strong>' + esc(item.name) + '</strong><small>' + esc(item.qualification || "Teaching staff") + '</small></div></div></td><td>' + esc(item.id) + '</td><td>' + esc(item.subject) + '</td><td>' + esc(item.classes) + '</td><td>' + esc(item.email) + '</td><td>' + esc(item.phone) + '</td><td>' + actions(item.id, key, false) + '</td></tr>';
      if (key === "classes") {
        const count = Store.get("students").filter(function (student) { return student.className === item.name; }).length;
        return '<tr data-search="' + esc(item.name.toLowerCase()) + '"><td><strong>' + esc(item.name) + '</strong></td><td>' + esc(item.sections) + '</td><td>' + esc(item.teacher || "—") + '</td><td>' + esc(item.room || "—") + '</td><td>' + count + ' students</td><td>' + actions(item.id, key, false) + '</td></tr>';
      }
      return '<tr data-search="' + esc((item.name + " " + item.code + " " + item.className).toLowerCase()) + '"><td><strong>' + esc(item.name) + '</strong></td><td>' + esc(item.code) + '</td><td>' + esc(item.className) + '</td><td>' + esc(item.teacher || "—") + '</td><td>' + actions(item.id, key, false) + '</td></tr>';
    }).join("");
    const csvAction = key === "students" ? "export-students" : key === "teachers" ? "export-teachers" : "export-" + key;
    return '<div class="toolbar"><div class="toolbar-left"><input id="entity-search" type="search" placeholder="Search ' + config.title.toLowerCase() + '…" aria-label="Search ' + config.title + '"><select id="entity-filter" aria-label="Filter by class"><option value="">All classes</option>' + Store.get("classes").map(function (item) { return '<option>' + esc(item.name) + '</option>'; }).join("") + '</select></div><div class="toolbar-right"><button class="btn btn-light" data-action="' + csvAction + '">Export CSV</button><button class="btn" data-action="add-' + key + '">＋ Add ' + (key === "students" ? "student" : key === "teachers" ? "teacher" : key === "classes" ? "class" : "subject") + '</button></div></div>' +
      '<div class="section-head"><div><h2>' + config.title + ' directory</h2><p>' + config.description + '</p></div><span class="badge">' + records.length + ' records</span></div>' +
      '<div class="table-wrap"><table class="table" id="entity-table"><thead><tr>' + config.columns.map(function (column) { return '<th>' + column + '</th>'; }).join("") + '</tr></thead><tbody>' + (rows || '<tr><td colspan="' + config.columns.length + '" class="empty-state">No records yet. Add your first ' + config.title.toLowerCase().replace(/s$/, "") + '.</td></tr>') + '</tbody></table></div>';
  }
  function actions(id, entity, profile) {
    return '<div class="table-action">' + (profile ? '<button class="icon-btn" title="View profile" data-action="view-student" data-id="' + esc(id) + '">↗</button>' : "") + '<button class="icon-btn" title="Edit" data-action="edit-' + entity + '" data-id="' + esc(id) + '">✎</button><button class="icon-btn" title="Delete" data-action="delete-' + entity + '" data-id="' + esc(id) + '">×</button></div>';
  }
  function studentTeacher(student) {
    const teachers = Store.get("teachers");
    const linkedTeacher = teachers.find(function (teacher) { return teacher.id === student.teacherId; });
    if (linkedTeacher) return linkedTeacher.name;
    const classRecord = Store.get("classes").find(function (item) { return item.name === student.className; });
    const classTeacher = classRecord && teachers.find(function (teacher) { return teacher.name === classRecord.teacher; });
    if (classTeacher) return classTeacher.name;
    const assignedTeacher = teachers.find(function (teacher) {
      return teacher.classes.split(",").map(function (item) { return item.trim(); }).indexOf(student.className) !== -1;
    });
    return assignedTeacher ? assignedTeacher.name : "";
  }
  function dashboard() {
    const students = Store.get("students");
    const teachers = Store.get("teachers");
    const classes = Store.get("classes");
    const present = Object.keys(Store.get("attendance")).filter(function (key) { return key.indexOf(Store.today + "|") === 0; }).reduce(function (sum, key) {
      return sum + Store.get("attendance")[key].filter(function (row) { return row.status === "Present"; }).length;
    }, 0);
    const pending = Store.get("fees").reduce(function (sum, item) { return sum + Number(item.amount) - Number(item.paid); }, 0);
    return '<div class="stat-grid">' +
      statCard("Total students", students.length, "♙", "Across all grade levels", "positive") +
      statCard("Teaching staff", teachers.length, "♧", "Active teachers") +
      statCard("Classes", classes.length, "▦", "Across the school") +
      statCard("Subjects", Store.get("subjects").length, "▤", "In the current curriculum") +
      statCard("Present today", present || "—", "◷", present ? "Recorded attendance" : "Attendance not recorded yet") +
      statCard("Fees outstanding", money(pending), "₹", "Pending across fee records") +
      '</div><div class="dashboard-grid"><section class="card"><div class="card-head"><div><h3>Student performance</h3><p>Average marks by subject · recent assessment</p></div><div class="chart-legend"><span>Average score</span></div></div><div class="chart-wrap"><canvas id="performance-chart" aria-label="Student performance chart"></canvas></div></section>' +
      '<section class="card"><div class="card-head"><div><h3>School activity</h3><p>Latest updates from your campus</p></div><span class="badge badge-success">Live</span></div><div class="activity-list">' + Store.get("activities").slice(0, 5).map(function (activity) {
        return '<div class="activity-item"><span class="activity-mark"></span><div><strong>' + esc(activity.text) + '</strong><small>' + esc(activity.time) + '</small></div></div>';
      }).join("") + '</div></section></div>' +
      '<div class="dashboard-grid"><section class="card"><div class="card-head"><div><h3>Attendance overview</h3><p>Weekly attendance summary</p></div><div class="chart-legend"><span>Present</span><span class="legend-green">Absent</span></div></div><div class="chart-wrap"><canvas id="attendance-chart" aria-label="Attendance statistics chart"></canvas></div></section>' +
      '<section class="card"><div class="card-head"><div><h3>Upcoming examinations</h3><p>Academic calendar</p></div><button class="icon-btn" data-nav="results" aria-label="View examinations">→</button></div><div class="activity-list">' +
      Store.get("exams").map(function (exam) { return '<div class="activity-item"><span class="activity-mark"></span><div><strong>' + esc(exam.name) + ' <span class="badge">' + esc(exam.type || "Exam") + '</span></strong><small>' + esc(exam.className) + (exam.subject ? ' · ' + esc(exam.subject) : "") + ' · ' + esc(formatDate(exam.date)) + (exam.teacherName ? ' · By ' + esc(exam.teacherName) : "") + '</small></div></div>'; }).join("") +
      '</div></section></div><div class="section-head"><div><h2>Recently enrolled students</h2><p>Latest student records</p></div><button class="btn btn-light" data-nav="students">View all students</button></div>' +
      '<div class="table-wrap"><table class="table"><thead><tr><th>Student</th><th>Student ID</th><th>Class</th><th>Guardian</th><th>Contact</th></tr></thead><tbody>' +
      students.slice(-4).reverse().map(function (item) { return '<tr><td><div class="person"><div class="avatar">' + initials(item.name) + '</div><div><strong>' + esc(item.name) + '</strong><small>' + esc(item.email || "Student") + '</small></div></div></td><td>' + esc(item.id) + '</td><td>' + esc(item.className) + ' · ' + esc(item.section) + '</td><td>' + esc(item.guardian) + '</td><td>' + esc(item.guardianPhone) + '</td></tr>'; }).join("") +
      '</tbody></table></div>';
  }
  function timetablePage(user) {
    const teacher = user.role === "teacher" ? Store.get("teachers").find(function (item) { return item.id === user.id; }) : null;
    const student = user.role === "student" ? Store.get("students").find(function (item) { return item.id === user.id; }) : null;
    let rows = Store.get("timetable");
    if (teacher) rows = rows.filter(function (row) { return row.teacherId ? row.teacherId === teacher.id : row.teacher === teacher.name; });
    if (student) rows = rows.filter(function (row) { return row.className === student.className && row.section === student.section; });
    const filterClasses = teacher ? teacher.classes.split(",").map(function (item) { return item.trim(); }) : Store.get("classes").map(function (item) { return item.name; });
    const filter = user.role === "student" ? "" : '<div class="toolbar-left"><select id="timetable-filter" aria-label="Filter timetable by class"><option value="">All classes</option>' + Store.get("classes").filter(function (item) { return !teacher || filterClasses.indexOf(item.name) !== -1; }).map(function (item) { return '<option>' + esc(item.name) + '</option>'; }).join("") + '</select></div>';
    return '<div class="toolbar">' + filter +
      (user.role === "admin" ? '<div class="toolbar-right"><button class="btn" data-action="add-timetable">＋ Add timetable slot</button></div>' : "") + '</div>' +
      '<div class="section-head"><div><h2>Weekly timetable</h2><p>' + (teacher ? "Your assigned teaching schedule" : student ? "Your class schedule" : "Class and teacher schedule overview") + '</p></div></div>' +
      (rows.length ? '<div class="table-wrap"><table class="timetable"><thead><tr><th>Day</th><th>Time</th><th>Class</th><th>Subject</th><th>Teacher</th><th>Room</th></tr></thead><tbody>' +
        rows.map(function (row) { return '<tr data-class="' + esc(row.className) + '"><td>' + esc(row.day) + '</td><td>' + esc(row.time) + '</td><td>' + esc(row.className) + ' · ' + esc(row.section) + '</td><td><span class="period">' + esc(row.subject) + '</span></td><td>' + esc(row.teacher) + '</td><td>' + esc(row.room) + '</td></tr>'; }).join("") + '</tbody></table></div>' :
        '<div class="card empty-state"><strong>Timetable is ready to build</strong>Administrators can add weekly class slots using the action above.</div>');
  }
  function noticesPage(user) {
    return '<div class="toolbar"><div class="toolbar-left"><span class="badge">' + Store.get("notices").length + ' announcements</span></div>' +
      (user.role === "admin" ? '<div class="toolbar-right"><button class="btn" data-action="add-notice">＋ Publish announcement</button></div>' : "") + '</div>' +
      '<div class="section-head"><div><h2>School notice board</h2><p>Important updates, events and announcements.</p></div></div><div class="notice-list">' +
      (Store.get("notices").length ? Store.get("notices").slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).map(function (notice) {
        return '<article class="card notice-card"><div class="section-head" style="margin-bottom:8px"><h3>' + esc(notice.title) + '</h3>' + (notice.important ? '<span class="badge badge-warning">Important</span>' : "") + '</div><p>' + esc(notice.description) + '</p><div class="notice-meta"><span>' + esc(formatDate(notice.date)) + '</span><span>By ' + esc(notice.author || "School Administration") + '</span>' + (user.role === "admin" ? '<button class="text-action" data-action="delete-notice" data-id="' + esc(notice.id) + '">Delete</button>' : "") + '</div></article>';
      }).join("") : '<div class="card empty-state"><strong>No announcements yet</strong>New school notices will appear here.</div>') + '</div>';
  }
  function profilePage(user) {
    const profile = user.role === "student" ? Store.get("students").find(function (item) { return item.id === user.id; }) : user.role === "teacher" ? Store.get("teachers").find(function (item) { return item.id === user.id; }) : { name: user.name, id: user.id, email: user.email, phone: "—", role: "School administrator" };
    if (!profile) return '<div class="card empty-state">Profile information is unavailable.</div>';
    const props = user.role === "student" ? [["Student ID", profile.id], ["Class & section", profile.className + " · " + profile.section], ["Class teacher", studentTeacher(profile) || "Not assigned"], ["Roll number", profile.roll], ["Parent / guardian", profile.guardian], ["Guardian contact", profile.guardianPhone], ["Student email", profile.email || "—"], ["Date of birth", profile.dob || "—"]] :
      [["Staff ID", profile.id], ["Email address", profile.email], ["Phone number", profile.phone || "—"], ["Primary subject", profile.subject || profile.role], ["Assigned classes", profile.classes || "—"], ["Qualification", profile.qualification || "—"]];
    return '<div class="card profile-banner"><div class="avatar">' + initials(profile.name) + '</div><div><h2>' + esc(profile.name) + '</h2><p>' + esc(user.role.charAt(0).toUpperCase() + user.role.slice(1)) + ' profile · Northstar Academy</p></div><button class="btn btn-light" data-action="change-password" style="margin-left:auto">Change password</button></div><div class="card" style="padding:18px"><div class="section-head"><div><h2>Personal information</h2><p>Profile details associated with your account</p></div></div><div class="detail-grid">' +
      props.map(function (pair) { return '<div class="detail-item"><small>' + esc(pair[0]) + '</small><strong>' + esc(pair[1] || "—") + '</strong></div>'; }).join("") + '</div></div>';
  }
  window.AdminViews = { entityConfig: entityConfig, entityPage: entityPage, dashboard: dashboard, timetable: timetablePage, notices: noticesPage, profile: profilePage, studentTeacher: studentTeacher };
})();
