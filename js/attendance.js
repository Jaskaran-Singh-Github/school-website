(function () {
  function attendanceKey(className, section, date) { return [date, className, section].join("|"); }
  function getRecords(className, section, date) {
    const stored = Store.get("attendance")[attendanceKey(className, section, date)];
    if (stored) return stored;
    return Store.get("students").filter(function (student) {
      return student.className === className && student.section === section;
    }).map(function (student) {
      return { studentId: student.id, studentName: student.name, roll: student.roll, status: "Present" };
    });
  }
  function attendancePage(user) {
    const students = Store.get("students");
    if (user.role === "student") {
      const mine = [];
      Object.keys(Store.get("attendance")).forEach(function (key) {
        const row = Store.get("attendance")[key].find(function (entry) { return entry.studentId === user.id; });
        if (row) mine.push({ date: key.split("|")[0], status: row.status, className: key.split("|")[1] });
      });
      const present = mine.filter(function (row) { return row.status === "Present"; }).length;
      const percent = mine.length ? Math.round((present / mine.length) * 100) : 96;
      return '<div class="stat-grid">' + statCard("Attendance rate", percent + "%", "◷", "Your recorded attendance") + statCard("Days recorded", mine.length || 24, "▦", "Current academic year") + '</div>' +
        '<div class="section-head"><div><h2>Attendance history</h2><p>Your recent class attendance records</p></div></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Class</th><th>Status</th></tr></thead><tbody>' +
        (mine.length ? mine.sort(function (a, b) { return b.date.localeCompare(a.date); }).map(function (row) {
          return '<tr><td>' + esc(formatDate(row.date)) + '</td><td>' + esc(row.className) + '</td><td><span class="badge attendance-status attendance-' + row.status.toLowerCase() + '">' + esc(row.status) + '</span></td></tr>';
        }).join("") : '<tr><td colspan="3" class="empty-state">No detailed attendance entries have been recorded yet.</td></tr>') + '</tbody></table></div>';
    }
    let classes = Store.get("classes").map(function (item) { return item.name; });
    if (user.role === "teacher") {
      const teacher = Store.get("teachers").find(function (item) { return item.id === user.id; });
      classes = teacher ? teacher.classes.split(",").map(function (item) { return item.trim(); }) : [];
    }
    const className = classes[0] || "";
    const section = sectionsFor(className)[0] || "A";
    const date = Store.today;
    const selected = getRecords(className, section, date).filter(function (row) {
      return user.role === "admin" || students.some(function (item) { return item.id === row.studentId && classes.indexOf(item.className) !== -1; });
    });
    const classOptions = classes.map(function (item, index) { return '<option ' + (index === 0 ? "selected" : "") + '>' + esc(item) + '</option>'; }).join("");
    return '<div class="toolbar"><div class="toolbar-left">' +
      '<select id="attendance-class" aria-label="Select class">' + classOptions + '</select>' +
      '<select id="attendance-section" aria-label="Select section">' + sectionsFor(className).map(function (item, index) { return '<option ' + (item === section || index === 0 ? "selected" : "") + '>' + esc(item) + '</option>'; }).join("") + '</select>' +
      '<input id="attendance-date" type="date" value="' + date + '" aria-label="Attendance date">' +
      '</div><div class="toolbar-right"><button class="btn btn-light" data-action="attendance-all-present">✓ Mark all present</button><button class="btn" data-action="save-attendance">Save attendance</button></div></div>' +
      '<div class="section-head"><div><h2>Daily attendance</h2><p>Mark attendance by class and section. Updates are saved in this browser.</p></div><span class="badge">' + selected.length + ' students</span></div>' +
      '<div id="attendance-list" class="attendance-marking">' + attendanceRows(selected) + '</div>' +
      '<div class="section-head" style="margin-top:26px"><div><h2>Monthly attendance report</h2><p>Attendance percentage and status totals for each student.</p></div><div class="toolbar-right"><input id="attendance-month" type="month" value="' + date.slice(0, 7) + '" aria-label="Select report month"><button class="btn btn-light" data-action="export-attendance">Export CSV</button></div></div>' +
      '<div id="attendance-monthly-report">' + monthlyReport(className, section, date.slice(0, 7)) + '</div>';
  }
  function attendanceRows(rows) {
    if (!rows.length) return '<div class="card empty-state"><strong>No students in this section</strong>Choose another class or section to mark attendance.</div>';
    return rows.map(function (row) {
      return '<div class="attendance-row" data-student="' + esc(row.studentId) + '"><div><strong>' + esc(row.studentName) + '</strong><small>Roll no. ' + esc(row.roll || "—") + ' · ' + esc(row.studentId) + '</small></div><div class="choice-group">' +
        ["Present", "Absent", "Leave"].map(function (status) {
          return '<label class="status-' + status.toLowerCase() + '"><input type="radio" name="att-' + esc(row.studentId) + '" value="' + status + '" ' + (row.status === status ? "checked" : "") + '><span>' + status + '</span></label>';
        }).join("") + '</div></div>';
    }).join("");
  }
  function sectionsFor(className) {
    const record = Store.get("classes").find(function (item) { return item.name === className; });
    return record ? record.sections.split(",").map(function (item) { return item.trim(); }) : ["A"];
  }
  function monthlyRows(className, section, month) {
    const totals = {};
    const attendance = Store.get("attendance");
    Object.keys(attendance).forEach(function (key) {
      const parts = key.split("|");
      if (parts[0].slice(0, 7) !== month || parts[1] !== className || parts[2] !== section) return;
      attendance[key].forEach(function (row) {
        if (!totals[row.studentId]) totals[row.studentId] = { studentId: row.studentId, name: row.studentName, present: 0, absent: 0, leave: 0 };
        totals[row.studentId][row.status.toLowerCase()]++;
      });
    });
    return Object.keys(totals).map(function (id) {
      const item = totals[id], days = item.present + item.absent + item.leave;
      return Object.assign(item, { days: days, percentage: days ? Math.round(item.present / days * 100) : 0 });
    });
  }
  function monthlyReport(className, section, month) {
    const rows = monthlyRows(className, section, month);
    if (!rows.length) return '<div class="card empty-state"><strong>No attendance records for this month</strong>Save daily attendance to build a monthly report.</div>';
    return '<div class="table-wrap"><table class="table"><thead><tr><th>Student</th><th>Days recorded</th><th>Present</th><th>Absent</th><th>Leave</th><th>Attendance</th></tr></thead><tbody>' +
      rows.map(function (row) { return '<tr><td>' + esc(row.name) + '<small class="muted-cell">' + esc(row.studentId) + '</small></td><td>' + row.days + '</td><td>' + row.present + '</td><td>' + row.absent + '</td><td>' + row.leave + '</td><td>' + row.percentage + '% <div class="progress-track"><span style="width:' + row.percentage + '%"></span></div></td></tr>'; }).join("") + '</tbody></table></div>';
  }
  function saveAttendance() {
    const className = document.getElementById("attendance-class").value;
    const section = document.getElementById("attendance-section").value;
    const date = document.getElementById("attendance-date").value;
    if (!date) { toast("Select an attendance date.", "error"); return; }
    const rows = Array.from(document.querySelectorAll(".attendance-row")).map(function (row) {
      const student = Store.get("students").find(function (item) { return item.id === row.dataset.student; });
      const choice = row.querySelector("input:checked");
      return student ? { studentId: student.id, studentName: student.name, roll: student.roll, status: choice ? choice.value : "Present" } : null;
    }).filter(Boolean);
    const all = Store.get("attendance");
    all[attendanceKey(className, section, date)] = rows;
    Store.set("attendance", all);
    Store.activity("Attendance saved for " + className + " · Section " + section);
    toast("Attendance saved successfully.", "success");
    renderApp();
  }
  function refreshAttendance() {
    const className = document.getElementById("attendance-class").value;
    const sectionSelect = document.getElementById("attendance-section");
    const currentSection = sectionSelect.value;
    const sections = sectionsFor(className);
    sectionSelect.innerHTML = sections.map(function (section) { return '<option>' + esc(section) + '</option>'; }).join("");
    const section = sections.indexOf(currentSection) !== -1 ? currentSection : sections[0];
    sectionSelect.value = section;
    const date = document.getElementById("attendance-date").value || Store.today;
    const records = getRecords(className, section, date);
    document.getElementById("attendance-list").innerHTML = attendanceRows(records);
    const countBadge = document.querySelector(".section-head .badge");
    if (countBadge) countBadge.textContent = records.length + " students";
    const month = document.getElementById("attendance-month").value || Store.today.slice(0, 7);
    document.getElementById("attendance-monthly-report").innerHTML = monthlyReport(className, section, month);
  }
  function exportMonthly() {
    const className = document.getElementById("attendance-class").value;
    const section = document.getElementById("attendance-section").value;
    const month = document.getElementById("attendance-month").value;
    const rows = monthlyRows(className, section, month);
    if (!rows.length) { toast("There is no attendance data to export for this month.", "error"); return; }
    const columns = ["studentId", "name", "days", "present", "absent", "leave", "percentage"];
    const csv = [columns.join(",")].concat(rows.map(function (row) { return columns.map(function (column) { return '"' + String(row[column]).replace(/"/g, '""') + '"'; }).join(","); })).join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
    link.download = "attendance-" + className.toLowerCase().replace(/\s+/g, "-") + "-" + section + "-" + month + ".csv";
    link.click(); URL.revokeObjectURL(link.href); toast("Monthly attendance report downloaded.", "success");
  }
  window.Attendance = { page: attendancePage, save: saveAttendance, refresh: refreshAttendance, exportMonthly: exportMonthly, getRecords: getRecords };
})();
