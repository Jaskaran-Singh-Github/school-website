(function () {
  const app = document.getElementById("app");
  const overlay = document.getElementById("overlay");
  const navConfig = {
    admin: [
      ["dashboard", "Overview", "⌂"], ["students", "Students", "♙"], ["teachers", "Teachers", "♧"],
      ["classes", "Classes", "▦"], ["subjects", "Subjects", "▤"], ["attendance", "Attendance", "◷"],
      ["results", "Exams & results", "▣"], ["timetable", "Timetable", "◫"], ["fees", "Fees", "₹"], ["notices", "Notice board", "▤"], ["profile", "My profile", "◉"]
    ],
    teacher: [
      ["dashboard", "My overview", "⌂"], ["my-students", "My students", "♙"], ["attendance", "Attendance", "◷"],
      ["results", "Marks & results", "▣"], ["timetable", "My timetable", "◫"], ["notices", "Notice board", "▤"], ["profile", "My profile", "◉"]
    ],
    student: [
      ["dashboard", "My overview", "⌂"], ["attendance", "My attendance", "◷"], ["results", "My results", "▣"],
      ["timetable", "My timetable", "◫"], ["fees", "My fees", "₹"], ["notices", "Notice board", "▤"], ["profile", "My profile", "◉"]
    ]
  };
  const pageTitles = {
    dashboard: ["Overview", "A clear view of your school, all in one place."], students: ["Students", "Manage enrollment, profiles and student records."],
    teachers: ["Teachers", "Your teaching team and class assignments."], classes: ["Classes & sections", "Organize grade levels and classroom assignments."],
    subjects: ["Subjects", "The curriculum and subject teacher assignments."], attendance: ["Attendance", "Daily attendance and student presence."],
    results: ["Exams & results", "Assessments, marks and academic progress."], timetable: ["Timetable", "Weekly classes, teachers and room schedules."],
    fees: ["Fees management", "Track fee accounts, payments and receipts."], notices: ["Notice board", "School updates, events and announcements."],
    profile: ["My profile", "Your personal information and account settings."], "my-students": ["My students", "Students in your assigned teaching classes."]
  };
  let page = "dashboard";
  let loginRole = "admin";
  let authView = "login";
  let modalLastFocusedControl = null;

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }
  function initials(name) {
    return String(name || "?").trim().split(/\s+/).slice(0, 2).map(function (part) { return part.charAt(0); }).join("").toUpperCase();
  }
  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value + "T00:00:00");
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }
  function money(value) {
    return "₹" + Number(value || 0).toLocaleString("en-IN");
  }
  function badge(text, variant) {
    return '<span class="badge ' + (variant ? "badge-" + variant : "") + '">' + esc(text) + '</span>';
  }
  function statCard(label, value, icon, note, modifier) {
    return '<article class="card stat-card"><div class="stat-top"><span>' + esc(label) + '</span><span class="stat-icon">' + esc(icon) + '</span></div><strong class="stat-value">' + esc(value) + '</strong><span class="stat-note">' + (modifier ? '<span class="' + modifier + '">↗ </span>' : "") + esc(note || "") + '</span></article>';
  }
  function toast(message, type) {
    const region = document.getElementById("toast-region");
    const element = document.createElement("div");
    element.className = "toast " + (type || "success");
    element.textContent = message;
    region.appendChild(element);
    window.setTimeout(function () { element.remove(); }, 3400);
  }
  window.esc = esc;
  window.initials = initials;
  window.formatDate = formatDate;
  window.money = money;
  window.badge = badge;
  window.statCard = statCard;
  window.toast = toast;

  function roleName(role) { return role.charAt(0).toUpperCase() + role.slice(1); }
  function demoCredentials(role) {
    if (role === "admin") {
      const account = Store.get("adminAccounts").find(function (item) { return item.email.toLowerCase() === "admin@northstar.edu"; });
      return ["admin@northstar.edu", Store.get("settings").adminPassword || account && account.password || "admin123"];
    }
    if (role === "teacher") {
      const account = Store.get("teachers").find(function (item) { return item.email.toLowerCase() === "teacher@northstar.edu"; });
      return ["teacher@northstar.edu", account ? account.password : "teach123"];
    }
    const account = Store.get("students").find(function (item) { return item.id === "STU-1042"; });
    return ["STU-1042", account ? account.password : "student123"];
  }
  function renderLogin(role, errorText) {
    loginRole = role;
    authView = "login";
    const demo = demoCredentials(role);
    const identityLabel = role === "student" ? "Email address or Student ID" : "Email address";
    app.innerHTML = '<div class="login-screen"><section class="login-story"><div class="brand"><span class="brand-mark">✦</span>Northstar <span style="font-weight:500;opacity:.72">Academy</span></div><div class="story-copy"><span class="eyebrow">A brighter way to learn</span><h1>Everything school, in one place.</h1><p>Bring your school community together with a thoughtful, connected experience for students, teachers, and administrators.</p></div><div class="story-foot">© 2026 Northstar Academy · Learn. Grow. Thrive.</div></section><section class="login-panel"><div class="login-card"><div class="eyebrow">Welcome to Northstar</div><h2>Sign in to your portal</h2><p class="login-subtitle">Choose your account type to continue.</p><div class="role-picker">' +
      ["admin", "teacher", "student"].map(function (item) { return '<button class="role-option ' + (role === item ? "active" : "") + '" type="button" data-role="' + item + '">' + (item === "admin" ? "◇" : item === "teacher" ? "♧" : "♙") + " " + roleName(item) + '</button>'; }).join("") +
      '</div><form id="login-form" novalidate><div class="field"><label for="identity">' + identityLabel + '</label><input id="identity" name="identity" autocomplete="username" required placeholder="' + (role === "student" ? "student@school.edu or student ID" : "name@northstar.edu") + '"></div><div class="field"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required placeholder="Enter your password"></div><div id="login-error" class="login-error">' + esc(errorText || "") + '</div><button class="btn btn-block" type="submit">Sign in to ' + roleName(role) + ' portal <span>→</span></button></form><div class="auth-links"><button class="text-action" type="button" data-action="forgot-password">Forgot password?</button><a href="' + (role === "admin" ? "signup.html" : role === "teacher" ? "signup-teacher.html" : "signup-student.html") + '">Create ' + (role === "admin" ? "an administrator" : "a " + role) + ' account</a></div><div class="demo-box"><strong>DEMO ACCOUNT <button class="text-action" type="button" data-demo="' + role + '" style="float:right">Use demo login →</button></strong><div class="demo-credentials"><span><span>' + (role === "student" ? "Student ID" : "Email address") + '</span><b>' + demo[0] + '</b></span><span><span>Password</span><b>' + demo[1] + '</b></span></div></div></div></section></div>';
  }
  function renderSignup(errorText, selectedRole) {
    const role = selectedRole || document.body.dataset.loginRole || "admin";
    loginRole = role;
    authView = "signup";
    const classes = Store.get("classes");
    const classOptions = '<option value="">Select a class</option>' + classes.map(function (item) { return '<option value="' + esc(item.name) + '">' + esc(item.name) + '</option>'; }).join("");
    const commonFields = '<div class="field"><label for="signup-name">Full name</label><input id="signup-name" name="name" autocomplete="name" required minlength="2" placeholder="Your name"></div><div class="field"><label for="signup-email">Email address</label><input id="signup-email" name="email" type="email" autocomplete="email" required placeholder="you@school.edu"></div>';
    const passwordFields = '<div class="field"><label for="signup-password">Password</label><input id="signup-password" name="password" type="password" autocomplete="new-password" minlength="8" required placeholder="At least 8 characters"></div><div class="field"><label for="signup-confirm">Confirm password</label><input id="signup-confirm" name="confirmPassword" type="password" autocomplete="new-password" minlength="8" required placeholder="Re-enter your password"></div>';
    let fields = commonFields;
    let heading = "Administrator registration";
    let description = "Create an administrator account to manage the school. Your unique email can only be registered once.";
    if (role === "teacher") {
      heading = "Teacher registration";
      description = "Register with your teacher ID and assigned class. Your account will be linked to your teacher record.";
      fields += '<div class="field"><label for="signup-phone">Phone number</label><input id="signup-phone" name="phone" type="tel" autocomplete="tel" required placeholder="Your phone number"></div><div class="field"><label for="signup-teacher-id">Teacher ID</label><input id="signup-teacher-id" name="teacherId" required placeholder="For example, TCH-301"></div><div class="field"><label for="signup-subject">Subject</label><input id="signup-subject" name="subject" required placeholder="Your teaching subject"></div><div class="field"><label for="signup-class">Assigned class</label><select id="signup-class" name="className" required>' + classOptions + '</select></div>';
    } else if (role === "student") {
      heading = "Student registration";
      description = "Create your student portal account with your school enrollment details.";
      fields += '<div class="field"><label for="signup-student-id">Student ID</label><input id="signup-student-id" name="studentId" required placeholder="For example, STU-2042"></div><div class="field"><label for="signup-class">Class</label><select id="signup-class" name="className" required>' + classOptions + '</select></div><div class="field"><label for="signup-section">Section</label><select id="signup-section" name="section" required><option value="">Select a class first</option></select></div><div class="field"><label for="signup-roll">Roll number</label><input id="signup-roll" name="roll" required placeholder="Your roll number"></div><div class="field"><label for="signup-guardian-phone">Parent / guardian phone</label><input id="signup-guardian-phone" name="guardianPhone" type="tel" autocomplete="tel" required placeholder="Parent or guardian phone"></div>';
    }
    app.innerHTML = '<div class="login-screen"><section class="login-story"><div class="brand"><span class="brand-mark">✦</span>Northstar <span style="font-weight:500;opacity:.72">Academy</span></div><div class="story-copy"><span class="eyebrow">A connected school community</span><h1>Your school. Your space.</h1><p>' + esc(description) + '</p></div><div class="story-foot">© 2026 Northstar Academy · Learn. Grow. Thrive.</div></section><section class="login-panel"><div class="login-card"><div class="eyebrow">' + heading + '</div><h2>Create your account</h2><p class="login-subtitle">' + esc(description) + '</p><form id="signup-form" novalidate>' + fields + passwordFields + '<div id="signup-error" class="login-error">' + esc(errorText || "") + '</div><button class="btn btn-block" type="submit">Create ' + role + ' account <span>→</span></button></form><div class="auth-links"><a href="' + (role === "admin" ? "admin.html" : role === "teacher" ? "teacher.html" : "student.html") + '">← Back to sign in</a></div><div class="demo-box"><strong>Already registered?</strong><div class="demo-credentials">Sign in with your existing email and password. Duplicate email and school ID registrations are not allowed.</div></div></div></section></div>';
    if (role === "student") {
      const classSelect = document.getElementById("signup-class");
      if (classSelect) classSelect.value = "";
    }
  }
  function renderForgot(role, errorText) {
    loginRole = role;
    authView = "forgot";
    const identityLabel = role === "student" ? "Student email address" : "Account email address";
    app.innerHTML = '<div class="login-screen"><section class="login-story"><div class="brand"><span class="brand-mark">✦</span>Northstar <span style="font-weight:500;opacity:.72">Academy</span></div><div class="story-copy"><span class="eyebrow">Account recovery</span><h1>Back to your school day.</h1><p>Set a new password for an account saved in this browser.</p></div><div class="story-foot">© 2026 Northstar Academy · Learn. Grow. Thrive.</div></section><section class="login-panel"><div class="login-card"><div class="eyebrow">Forgot password</div><h2>Reset your password</h2><p class="login-subtitle">Select your portal and enter the email on your account.</p><div class="role-picker">' +
      ["admin", "teacher", "student"].map(function (item) { return '<button class="role-option ' + (role === item ? "active" : "") + '" type="button" data-role="' + item + '">' + roleName(item) + '</button>'; }).join("") +
      '</div><form id="forgot-form" novalidate><input type="hidden" name="role" value="' + role + '"><div class="field"><label for="forgot-email">' + identityLabel + '</label><input id="forgot-email" name="email" type="email" autocomplete="email" required placeholder="name@northstar.edu"></div><div class="field"><label for="forgot-password">New password</label><input id="forgot-password" name="password" type="password" minlength="8" autocomplete="new-password" required placeholder="At least 8 characters"></div><div class="field"><label for="forgot-confirm">Confirm new password</label><input id="forgot-confirm" name="confirmPassword" type="password" minlength="8" autocomplete="new-password" required placeholder="Re-enter your password"></div><div class="login-error" id="forgot-error">' + esc(errorText || "") + '</div><button class="btn btn-block" type="submit">Save new password</button></form><p class="recovery-note">Browser-only recovery changes the password in local data; it does not verify account ownership by email.</p><div class="auth-links"><button class="text-action" data-action="back-to-login" type="button">← Back to sign in</button></div></div></section></div>';
  }
  function navItems(user) {
    return navConfig[user.role].map(function (item) {
      return '<button class="nav-link ' + (page === item[0] ? "active" : "") + '" data-nav="' + item[0] + '"><span class="nav-icon">' + item[2] + '</span>' + item[1] + '</button>';
    }).join("");
  }
  function pageContent(user) {
    if (page === "dashboard") return user.role === "admin" ? AdminViews.dashboard() : user.role === "teacher" ? TeacherViews.dashboard(user) : StudentViews.dashboard(user);
    if (page === "students" && user.role === "admin") return AdminViews.entityPage("students");
    if (page === "teachers" && user.role === "admin") return AdminViews.entityPage("teachers");
    if (page === "classes" && user.role === "admin") return AdminViews.entityPage("classes");
    if (page === "subjects" && user.role === "admin") return AdminViews.entityPage("subjects");
    if (page === "my-students" && user.role === "teacher") return teacherStudents(user);
    if (page === "attendance") return Attendance.page(user);
    if (page === "results") return Results.page(user);
    if (page === "fees") return Fees.page(user);
    if (page === "timetable") return AdminViews.timetable(user);
    if (page === "notices") return AdminViews.notices(user);
    if (page === "profile") return AdminViews.profile(user);
    return '<div class="card empty-state"><strong>Page unavailable</strong>Your account cannot access this section.</div>';
  }
  function renderApp() {
    const user = Auth.current();
    if (!user) { renderLogin("admin"); return; }
    if (!navConfig[user.role].some(function (item) { return item[0] === page; })) page = "dashboard";
    const title = page === "fees" && user.role === "student" ? ["My fees", "Review your fee balance and recorded payments."] : pageTitles[page] || pageTitles.dashboard;
    const body = pageContent(user);
    app.innerHTML = '<div class="app-shell"><aside class="sidebar" id="sidebar"><div class="brand"><span class="brand-mark">✦</span>Northstar</div><div class="school-label">' + roleName(user.role) + ' portal</div><nav class="nav-list" aria-label="Main navigation">' + navItems(user) + '</nav><div class="sidebar-bottom"><button class="nav-link" data-action="theme">◐ <span>Appearance</span></button><button class="nav-link" data-action="logout">↪ <span>Sign out</span></button><div class="profile-mini"><div class="avatar">' + initials(user.name) + '</div><div><strong>' + esc(user.name) + '</strong><small>' + roleName(user.role) + ' account</small></div></div></div></aside><section class="main-area"><header class="topbar"><div class="topbar-left"><button class="icon-btn mobile-menu" data-action="mobile-menu" aria-label="Open menu">☰</button><div class="page-heading"><h1>' + esc(title[0]) + '</h1><p>' + esc(title[1]) + '</p></div></div><div class="topbar-actions"><div class="search-wrap"><label class="search-box"><span>⌕</span><input id="global-search" type="search" placeholder="Search students, staff, notices…"></label><div id="search-results" class="search-results" hidden></div></div><button class="icon-btn notification-dot" data-nav="notices" aria-label="View announcements">♧</button><button class="icon-btn" data-action="theme" aria-label="Toggle dark mode">◐</button></div></header><main class="page-content">' + body + '</main></section></div>';
    const mobileSearch = document.createElement("button");
    mobileSearch.className = "icon-btn mobile-search";
    mobileSearch.dataset.action = "mobile-search";
    mobileSearch.setAttribute("aria-label", "Search");
    mobileSearch.textContent = "⌕";
    document.querySelector(".topbar-actions").insertBefore(mobileSearch, document.querySelector(".topbar-actions").firstChild);
    document.body.classList.toggle("dark", Store.get("settings").theme === "dark");
    drawCharts();
  }
  function teacherStudents(user) {
    const teacher = Store.get("teachers").find(function (item) { return item.id === user.id; });
    const classes = teacher ? teacher.classes.split(",").map(function (item) { return item.trim(); }) : [];
    const students = Store.get("students").filter(function (item) { return classes.indexOf(item.className) !== -1; });
    return '<div class="toolbar"><div class="toolbar-left"><input id="entity-search" type="search" placeholder="Search your students…"></div><div class="toolbar-right"><span class="badge">' + students.length + ' students</span><button class="btn" data-action="add-students">＋ Add student</button></div></div><div class="table-wrap"><table class="table" id="entity-table"><thead><tr><th>Student</th><th>Student ID</th><th>Class</th><th>Roll</th><th>Guardian</th><th>Guardian contact</th></tr></thead><tbody>' +
      (students.length ? students.map(function (item) { return '<tr data-search="' + esc((item.name + " " + item.id + " " + item.className).toLowerCase()) + '"><td><div class="person"><div class="avatar">' + initials(item.name) + '</div><div><strong>' + esc(item.name) + '</strong><small>' + esc(item.email || "Student") + '</small></div></div></td><td>' + esc(item.id) + '</td><td>' + esc(item.className) + ' · ' + esc(item.section) + '</td><td>' + esc(item.roll) + '</td><td>' + esc(item.guardian) + '</td><td>' + esc(item.guardianPhone) + '</td></tr>'; }).join("") : '<tr><td colspan="6" class="empty-state">No students are assigned to your classes.</td></tr>') +
      '</tbody></table></div>';
  }
  function showGlobalSearch(query) {
    const results = document.getElementById("search-results");
    if (!results) return;
    const user = Auth.current(), term = query.toLowerCase();
    if (!term) { results.hidden = true; return; }
    let matches = [];
    if (user.role === "admin") {
      matches = matches.concat(Store.get("students").filter(function (item) { return (item.name + " " + item.id + " " + item.className).toLowerCase().indexOf(term) !== -1; }).map(function (item) { return { title: item.name, detail: "Student · " + item.id + " · " + item.className, page: "students" }; }));
      matches = matches.concat(Store.get("teachers").filter(function (item) { return (item.name + " " + item.email + " " + item.subject).toLowerCase().indexOf(term) !== -1; }).map(function (item) { return { title: item.name, detail: "Teacher · " + item.subject, page: "teachers" }; }));
      matches = matches.concat(Store.get("classes").filter(function (item) { return item.name.toLowerCase().indexOf(term) !== -1; }).map(function (item) { return { title: item.name, detail: "Class · " + item.sections + " sections", page: "classes" }; }));
    } else if (user.role === "teacher") {
      const teacher = Store.get("teachers").find(function (item) { return item.id === user.id; });
      const assigned = teacher ? teacher.classes.split(",").map(function (item) { return item.trim(); }) : [];
      matches = Store.get("students").filter(function (item) { return assigned.indexOf(item.className) !== -1 && (item.name + " " + item.id + " " + item.className).toLowerCase().indexOf(term) !== -1; }).map(function (item) { return { title: item.name, detail: "Student · " + item.id + " · " + item.className, page: "my-students" }; });
    } else {
      matches = Store.get("notices").filter(function (item) { return (item.title + " " + item.description).toLowerCase().indexOf(term) !== -1; }).map(function (item) { return { title: item.title, detail: "School announcement · " + formatDate(item.date), page: "notices" }; });
    }
    matches = matches.concat(Store.get("notices").filter(function (item) { return (item.title + " " + item.description).toLowerCase().indexOf(term) !== -1; }).map(function (item) { return { title: item.title, detail: "Announcement · " + formatDate(item.date), page: "notices" }; }));
    const unique = matches.filter(function (item, index, list) { return list.findIndex(function (match) { return match.title === item.title && match.page === item.page; }) === index; }).slice(0, 6);
    results.innerHTML = unique.length ? unique.map(function (item) { return '<button class="search-result" data-nav="' + esc(item.page) + '"><strong>' + esc(item.title) + '</strong><small>' + esc(item.detail) + '</small></button>'; }).join("") : '<div class="search-empty">No matching records found.</div>';
    results.hidden = false;
  }

  function drawCharts() {
    const performance = document.getElementById("performance-chart");
    if (performance) {
      const results = Store.get("results");
      const subjects = Array.from(new Set(results.map(function (item) { return item.subject; }))).slice(0, 5);
      const values = subjects.map(function (subject) {
        const rows = results.filter(function (item) { return item.subject === subject; });
        return rows.length ? rows.reduce(function (sum, item) { return sum + Number(item.marks) / Number(item.maxMarks || 100) * 100; }, 0) / rows.length : 0;
      });
      drawBarChart(performance, subjects.length ? subjects : ["No marks yet"], values.length ? values : [0], "#4263eb");
    }
    const attendance = document.getElementById("attendance-chart");
    if (attendance) {
      const byDate = {};
      Object.keys(Store.get("attendance")).forEach(function (key) {
        const date = key.split("|")[0];
        if (!byDate[date]) byDate[date] = { present: 0, total: 0 };
        Store.get("attendance")[key].forEach(function (row) {
          byDate[date].total++;
          if (row.status === "Present") byDate[date].present++;
        });
      });
      const dates = Object.keys(byDate).sort().slice(-6);
      const labels = dates.map(function (date) { return new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" }); });
      const values = dates.map(function (date) { return Math.round(byDate[date].present / (byDate[date].total || 1) * 100); });
      drawLineChart(attendance, values, labels);
    }
  }
  function canvasContext(canvas) {
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));
    const context = canvas.getContext("2d");
    context.scale(ratio, ratio);
    return { ctx: context, width: rect.width, height: rect.height };
  }
  function drawBarChart(canvas, labels, values, color) {
    const surface = canvasContext(canvas);
    const ctx = surface.ctx, width = surface.width, height = surface.height;
    const styles = getComputedStyle(document.body);
    const muted = styles.getPropertyValue("--muted").trim() || "#8290a5";
    const line = styles.getPropertyValue("--line").trim() || "#e9edf4";
    const pad = { left: 34, right: 12, top: 10, bottom: 36 };
    const plotH = height - pad.top - pad.bottom, plotW = width - pad.left - pad.right;
    ctx.font = "10px DM Sans"; ctx.fillStyle = muted; ctx.strokeStyle = line; ctx.lineWidth = 1;
    for (let mark = 0; mark <= 100; mark += 25) {
      const y = pad.top + plotH * (1 - mark / 100);
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
      ctx.fillText(mark + "%", 0, y + 3);
    }
    const slot = plotW / Math.max(labels.length, 1), barWidth = Math.min(42, slot * .46);
    labels.forEach(function (label, index) {
      const x = pad.left + slot * index + (slot - barWidth) / 2;
      const value = Math.max(0, Math.min(Number(values[index]) || 0, 100));
      const barH = plotH * value / 100;
      ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, pad.top + plotH - barH, barWidth, barH, 5); ctx.fill();
      ctx.fillStyle = muted; ctx.textAlign = "center"; ctx.fillText(label.length > 12 ? label.slice(0, 11) + "…" : label, x + barWidth / 2, height - 12);
      if (value) { ctx.fillStyle = color; ctx.fillText(Math.round(value) + "%", x + barWidth / 2, pad.top + plotH - barH - 5); }
    });
  }
  function drawLineChart(canvas, values, labels) {
    const surface = canvasContext(canvas);
    const ctx = surface.ctx, width = surface.width, height = surface.height;
    const styles = getComputedStyle(document.body);
    const muted = styles.getPropertyValue("--muted").trim() || "#8290a5";
    const line = styles.getPropertyValue("--line").trim() || "#e9edf4";
    const pad = { left: 33, right: 12, top: 14, bottom: 28 };
    const plotH = height - pad.top - pad.bottom, plotW = width - pad.left - pad.right;
    ctx.font = "10px DM Sans"; ctx.fillStyle = muted; ctx.strokeStyle = line; ctx.lineWidth = 1;
    [0, 25, 50, 75, 100].forEach(function (value) {
      const y = pad.top + plotH * (1 - value / 100);
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
      ctx.fillText(value + "%", 0, y + 3);
    });
    const days = labels.length ? labels : ["No records"];
    const points = values.length ? values : [0];
    function pointX(index) { return pad.left + plotW * (points.length === 1 ? .5 : index / (points.length - 1)); }
    ctx.beginPath();
    points.forEach(function (value, index) {
      const x = pointX(index);
      const y = pad.top + plotH * (1 - value / 100);
      if (!index) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      ctx.fillStyle = muted; ctx.textAlign = "center"; ctx.fillText(days[index], x, height - 7);
    });
    ctx.strokeStyle = "#4263eb"; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.lineTo(pointX(points.length - 1), pad.top + plotH); ctx.lineTo(pointX(0), pad.top + plotH); ctx.closePath();
    ctx.fillStyle = "#4263eb15"; ctx.fill();
    points.forEach(function (value, index) {
      const x = pointX(index), y = pad.top + plotH * (1 - value / 100);
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fillStyle = "#4263eb"; ctx.fill();
    });
  }

  function openModal(title, subtitle, fields, values, action, id) {
    const formFields = fields.map(function (field) { return modalField(field, values); }).join("");
    const editing = action.indexOf("edit-") === 0;
    overlay.innerHTML = '<section class="modal' + (editing ? ' modal-edit' : '') + '" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header class="modal-header"><div><span class="modal-eyebrow">' + (editing ? "EDIT RECORD" : "RECORD DETAILS") + '</span><h2 id="modal-title">' + esc(title) + '</h2><p>' + esc(subtitle || "") + '</p></div><button class="modal-close" type="button" data-action="close-modal" aria-label="Close dialog">×</button></header><form id="modal-form" data-action="' + esc(action) + '" data-id="' + esc(id || "") + '" novalidate><div class="form-grid">' + formFields + '</div><div class="modal-actions"><button class="btn btn-light" type="button" data-action="close-modal">' + (editing ? "Discard changes" : "Cancel") + '</button><button class="btn" type="submit">' + (editing ? "Update record" : "Save changes") + '</button></div></form></section>';
    overlay.hidden = false;
    const first = overlay.querySelector("input,select,textarea");
    modalLastFocusedControl = first;
    if (first) first.focus();
  }
  function entityFields(key) { return AdminViews.entityConfig[key].fields; }
  function openForAction(action, id) {
    const addMatch = action.match(/^(add|edit)-(students|teachers|classes|subjects)$/);
    if (addMatch) {
      const operation = addMatch[1], entity = addMatch[2];
      const activeUser = Auth.current();
      const assignedTeacher = activeUser && activeUser.role === "teacher" ? Store.get("teachers").find(function (item) { return item.id === activeUser.id; }) : null;
      if (entity === "students" && operation === "add" && activeUser && activeUser.role === "teacher" &&
        (!assignedTeacher || !assignedTeacher.classes.split(",").map(function (item) { return item.trim(); }).some(Boolean))) {
        toast("No classes are assigned to your teacher account.", "error");
        return;
      }
      const record = operation === "edit" ? Store.get(entity).find(function (item) { return item.id === id; }) : null;
      const fields = entityFields(entity).map(function (field) {
        if (entity === "students" && operation === "add" && activeUser && activeUser.role === "teacher") {
          if (field[0] === "className") return [field[0], "Assigned class", "select:teacher-classes", field[3]];
          if (field[0] === "password") return [field[0], "Student login password (at least 8 characters)", field[2], field[3], false, 8];
        }
        return operation === "edit" && field[0] === "password" ? [field[0], "New login password (optional)", field[2], false] : field;
      });
      const values = record ? Object.assign({}, record) : null;
      if (operation === "edit" && values) delete values.password;
      openModal((operation === "edit" ? "Edit " : "Add ") + (entity === "students" ? "student" : entity === "teachers" ? "teacher" : entity === "classes" ? "class" : "subject"),
        operation === "edit" ? (entity === "students" || entity === "teachers" ? "Update the details below. Leave the password blank to keep the current one." : "Review and update the details below.") : "Information is saved locally in this browser.", fields, values, action, id);
      return;
    }
    if (action === "new-exam") openModal("Create examination", "Add an assessment to the school calendar.", [
      ["name", "Examination name", "text", true], ["className", "Class", "select:classes", true], ["date", "Examination date", "date", true], ["maxMarks", "Maximum marks", "number", true]
    ], { maxMarks: "100" }, action);
    else if (action === "add-result" || action === "edit-result") {
      const record = action === "edit-result" ? Store.get("results").find(function (item) { return item.id === id; }) : null;
      openModal(action === "edit-result" ? "Edit student marks" : "Enter student marks", "Grades and pass status are calculated from the marks entered.", [
        ["studentId", "Student", "select:students", true, true], ["exam", "Examination", "select:exams", true], ["subject", "Subject", "select:subjects", true],
        ["marks", "Marks obtained", "number", true], ["maxMarks", "Maximum marks", "number", true]
      ], record || { maxMarks: "100" }, action, id);
    }
    else if (action === "add-fee") openModal("Add fee record", "Create a fee account for a student.", [
      ["studentId", "Student", "select:students", true, true], ["amount", "Total fee amount (₹)", "number", true], ["paid", "Amount already paid (₹)", "number", true], ["dueDate", "Due date", "date", true]
    ], { amount: "24000", paid: "0", dueDate: Store.today }, action);
    else if (action === "pay-fee") {
      const fee = Store.get("fees").find(function (item) { return item.id === id; });
      if (!fee) return;
      const balance = Number(fee.amount) - Number(fee.paid);
      openModal("Record fee payment", fee.studentName + " · outstanding " + money(balance), [
        ["amount", "Payment amount (₹)", "number", true], ["method", "Payment method", "select:methods", true]
      ], { amount: String(balance), method: "Online transfer" }, action, id);
      overlay.querySelector('[name="method"]').innerHTML = ["Cash", "Online transfer", "Card", "Cheque"].map(function (method) { return '<option>' + method + '</option>'; }).join("");
    } else if (action === "add-notice") openModal("Publish announcement", "Share a school update with teachers and students.", [
      ["title", "Announcement title", "text", true, true], ["date", "Publish date", "date", true], ["description", "Description", "textarea", true, true], ["important", "Important notice", "checkbox", false]
    ], { date: Store.today }, action);
    else if (action === "add-timetable") openModal("Add timetable slot", "Add a class to the weekly schedule.", [
      ["className", "Class", "select:classes", true], ["section", "Section", "select:sections", true], ["day", "Day", "select:days", true], ["time", "Start time", "time", true],
      ["subject", "Subject", "select:subjects", true], ["teacher", "Teacher name", "text", true], ["room", "Room number", "text", true]
    ], { day: "Monday" }, action);
    else if (action === "change-password") openModal("Change password", "Use a password you have not used elsewhere.", [
      ["currentPassword", "Current password", "password", true], ["newPassword", "New password (at least 6 characters)", "password", true], ["confirmPassword", "Confirm new password", "password", true]
    ], {}, action);
  }
  function modalField(field, values) {
    const name = field[0], label = field[1], type = field[2], required = field[3], current = values && values[name] != null ? values[name] : "";
    if (type === "textarea") return '<div class="field wide"><label for="modal-' + name + '">' + esc(label) + '</label><textarea id="modal-' + name + '" name="' + name + '" ' + (required ? "required" : "") + '>' + esc(current) + '</textarea></div>';
    if (type === "checkbox") return '<div class="field"><label>' + esc(label) + '</label><label><input type="checkbox" name="' + name + '" ' + (current ? "checked" : "") + '> Important</label></div>';
    if (type === "select:days") {
      const options = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return '<div class="field"><label for="modal-' + name + '">' + esc(label) + '</label><select id="modal-' + name + '" name="' + name + '" required>' + options.map(function (item) { return '<option ' + (item === current ? "selected" : "") + '>' + item + '</option>'; }).join("") + '</select></div>';
    }
    if (type === "select:methods") {
      return '<div class="field"><label for="modal-' + name + '">' + esc(label) + '</label><select id="modal-' + name + '" name="' + name + '" required>' + ["Cash", "Online transfer", "Card", "Cheque"].map(function (item) { return '<option ' + (item === current ? "selected" : "") + '>' + item + '</option>'; }).join("") + '</select></div>';
    }
    if (type === "select:teacher-classes") {
      const user = Auth.current();
      const teacher = user && user.role === "teacher" ? Store.get("teachers").find(function (item) { return item.id === user.id; }) : null;
      const assigned = teacher ? teacher.classes.split(",").map(function (item) { return item.trim(); }) : [];
      return '<div class="field"><label for="modal-' + name + '">' + esc(label) + '</label><select id="modal-' + name + '" name="' + name + '" required><option value="">Select an assigned class</option>' + Store.get("classes").filter(function (item) { return assigned.indexOf(item.name) !== -1; }).map(function (item) { return '<option ' + (current === item.name ? "selected" : "") + '>' + esc(item.name) + '</option>'; }).join("") + '</select></div>';
    }
    if (type === "select:classes") return '<div class="field"><label for="modal-' + name + '">' + esc(label) + '</label><select id="modal-' + name + '" name="' + name + '" ' + (required ? "required" : "") + '><option value="">Select a class</option>' + Store.get("classes").map(function (item) { return '<option ' + (current === item.name ? "selected" : "") + '>' + esc(item.name) + '</option>'; }).join("") + '</select></div>';
    if (type === "select:sections") {
      const cls = Store.get("classes").find(function (item) { return item.name === (values && values.className); });
      const sections = cls ? cls.sections.split(",").map(function (item) { return item.trim(); }) : ["A", "B"];
      return '<div class="field"><label for="modal-' + name + '">' + esc(label) + '</label><select id="modal-' + name + '" name="' + name + '" ' + (required ? "required" : "") + '><option value="">Select section</option>' + sections.map(function (item) { return '<option ' + (current === item ? "selected" : "") + '>' + esc(item) + '</option>'; }).join("") + '</select></div>';
    }
    if (type === "select:gender") return '<div class="field"><label for="modal-' + name + '">' + esc(label) + '</label><select id="modal-' + name + '" name="' + name + '"><option value="">Select</option>' + ["Female", "Male", "Other"].map(function (item) { return '<option ' + (current === item ? "selected" : "") + '>' + item + '</option>'; }).join("") + '</select></div>';
    if (type === "select:students") {
      const active = Auth.current();
      const teacher = active && active.role === "teacher" ? Store.get("teachers").find(function (item) { return item.id === active.id; }) : null;
      const assigned = teacher ? teacher.classes.split(",").map(function (item) { return item.trim(); }) : null;
      const eligible = Store.get("students").filter(function (item) { return !assigned || assigned.indexOf(item.className) !== -1; });
      return '<div class="field wide"><label for="modal-' + name + '">' + esc(label) + '</label><select id="modal-' + name + '" name="' + name + '" required><option value="">Select a student</option>' + eligible.map(function (item) { return '<option value="' + esc(item.id) + '" ' + (current === item.id ? "selected" : "") + '>' + esc(item.name + " · " + item.id) + '</option>'; }).join("") + '</select></div>';
    }
    if (type === "select:exams") return '<div class="field"><label for="modal-' + name + '">' + esc(label) + '</label><select id="modal-' + name + '" name="' + name + '" required><option value="">Select examination</option>' + Store.get("exams").map(function (item) { return '<option ' + (current === item.name ? "selected" : "") + '>' + esc(item.name) + '</option>'; }).join("") + '</select></div>';
    if (type === "select:subjects") {
      const active = Auth.current();
      const teacher = active && active.role === "teacher" ? Store.get("teachers").find(function (item) { return item.id === active.id; }) : null;
      const options = Store.get("subjects").filter(function (item) { return !teacher || item.teacher === teacher.name || item.name === teacher.subject; });
      if (teacher && !options.some(function (item) { return item.name === teacher.subject; })) options.push({ name: teacher.subject });
      return '<div class="field"><label for="modal-' + name + '">' + esc(label) + '</label><select id="modal-' + name + '" name="' + name + '" required><option value="">Select subject</option>' + options.map(function (item) { return '<option ' + (current === item.name ? "selected" : "") + '>' + esc(item.name) + '</option>'; }).join("") + '</select></div>';
    }
    return '<div class="field ' + (field[4] ? "wide" : "") + '"><label for="modal-' + name + '">' + esc(label) + '</label><input id="modal-' + name + '" name="' + name + '" type="' + type + '" value="' + (type === "file" ? "" : esc(current)) + '" ' + (required ? "required" : "") + (field[5] ? ' minlength="' + field[5] + '"' : "") + (type === "file" ? ' accept="image/*"' : "") + (name === "password" && !required ? ' placeholder="Leave blank to keep current password"' : "") + '></div>';
  }

  function saveEntity(action, id, data) {
    const match = action.match(/^(add|edit)-(students|teachers|classes|subjects)$/);
    if (!match) return false;
    const operation = match[1], entity = match[2], rows = Store.get(entity);
    if (entity === "students" && operation === "add") data.id = Store.nextId("STU-", rows);
    if (entity === "teachers" && operation === "add") data.id = Store.nextId("TCH-", rows);
    if (entity === "classes" && operation === "add") data.id = Store.nextId("CLS-", rows);
    if (entity === "subjects" && operation === "add") data.id = Store.nextId("SUB-", rows);
    if (operation === "edit") {
      const index = rows.findIndex(function (item) { return item.id === id; });
      if (index < 0) { toast("Record not found.", "error"); return true; }
      if (entity === "students" && data.photo === undefined) data.photo = rows[index].photo || "";
      if (data.password === "") delete data.password;
      rows[index] = Object.assign({}, rows[index], data);
    } else rows.push(data);
    Store.set(entity, rows);
    Store.activity((operation === "add" ? "New " : "Updated ") + entity.slice(0, -1) + (data.name ? ": " + data.name : ""));
    toast(operation === "add" ? "Record added successfully." : "Changes saved successfully.", "success");
    return true;
  }
  async function submitModal(form) {
    const action = form.dataset.action, id = form.dataset.id;
    const focusControl = modalLastFocusedControl && form.contains(modalLastFocusedControl) ? modalLastFocusedControl : document.activeElement;
    const selection = focusControl && /^(text|search|tel|url|password|email)$/.test(focusControl.type) && typeof focusControl.selectionStart === "number"
      ? [focusControl.selectionStart, focusControl.selectionEnd]
      : null;
    if (!isAllowed(action, Auth.current())) { toast("Your account does not have permission for this action.", "error"); return; }
    if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form).entries());
    form.querySelectorAll('input[type="checkbox"]').forEach(function (input) { values[input.name] = input.checked; });
    const file = form.querySelector('input[type="file"]');
    if (file && file.files && file.files[0] && file.files[0].size) {
      if (file.files[0].size > 1024 * 1024) { toast("Choose a profile photo smaller than 1 MB.", "error"); return; }
      values[file.name] = await new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.onload = function () { resolve(reader.result); };
        reader.onerror = function () { reject(new Error("Could not read the selected photo.")); };
        reader.readAsDataURL(file.files[0]);
      });
    } else if (file) delete values[file.name];
    if (action === "add-students") {
      const activeUser = Auth.current();
      const teacher = activeUser.role === "teacher" ? Store.get("teachers").find(function (item) { return item.id === activeUser.id; }) : null;
      const classRecord = Store.get("classes").find(function (item) { return item.name === values.className; });
      const sections = classRecord ? classRecord.sections.split(",").map(function (item) { return item.trim().toLowerCase(); }) : [];
      if (teacher) {
        const assigned = teacher.classes.split(",").map(function (item) { return item.trim(); });
        if (assigned.indexOf(values.className) === -1) { toast("You can only add students to your assigned classes.", "error"); return; }
        if (String(values.password || "").length < 8) { toast("Student login password must be at least 8 characters.", "error"); return; }
      }
      if (!classRecord || sections.indexOf(String(values.section || "").trim().toLowerCase()) === -1) {
        toast("Choose a valid class and section.", "error");
        return;
      }
      const roll = String(values.roll || "").trim().toLowerCase();
      if (Store.get("students").some(function (student) {
        return student.className === classRecord.name && String(student.section).toLowerCase() === String(values.section).trim().toLowerCase() && String(student.roll).trim().toLowerCase() === roll;
      })) {
        toast("That roll number is already assigned in this class and section.", "error");
        return;
      }
      const email = String(values.email || "").trim().toLowerCase();
      if (email && Store.get("students").concat(Store.get("teachers"), Store.get("adminAccounts")).some(function (account) {
        return String(account.email || "").trim().toLowerCase() === email;
      })) {
        toast("An account already uses this email address.", "error");
        return;
      }
      const classTeacher = Store.get("teachers").find(function (item) { return item.name === classRecord.teacher; });
      values.teacherId = teacher ? teacher.id : classTeacher ? classTeacher.id : "";
      values.className = classRecord.name;
      values.email = email;
    }
    if (/^(add|edit)-(students|teachers|classes|subjects)$/.test(action)) {
      saveEntity(action, id, values);
    } else if (action === "new-exam") {
      values.id = Store.nextId("EX-", Store.get("exams")); Store.get("exams").push(values); Store.set("exams", Store.get("exams"));
      Store.activity("Examination scheduled: " + values.name); toast("Examination created.", "success");
    } else if (action === "add-result" || action === "edit-result") {
      const student = Store.get("students").find(function (item) { return item.id === values.studentId; });
      const marks = Number(values.marks), max = Number(values.maxMarks);
      if (!student || marks > max || marks < 0 || max <= 0) { toast("Enter valid marks within the maximum score.", "error"); return; }
      const active = Auth.current();
      const teacher = active.role === "teacher" ? Store.get("teachers").find(function (item) { return item.id === active.id; }) : null;
      if (teacher && teacher.classes.split(",").map(function (item) { return item.trim(); }).indexOf(student.className) === -1) { toast("You can only enter marks for students in your assigned classes.", "error"); return; }
      const exam = Store.get("exams").find(function (item) { return item.name === values.exam; });
      if (exam && exam.className !== student.className) { toast("Choose an examination assigned to the student's class.", "error"); return; }
      if (teacher) {
        const validSubjects = Store.get("subjects").filter(function (item) { return item.teacher === teacher.name; }).map(function (item) { return item.name; });
        if (validSubjects.indexOf(teacher.subject) === -1) validSubjects.push(teacher.subject);
        if (validSubjects.indexOf(values.subject) === -1) { toast("You can only enter marks for your assigned subjects.", "error"); return; }
      }
      const results = Store.get("results");
      const duplicate = action === "add-result" ? results.find(function (item) { return item.studentId === student.id && item.exam === values.exam && item.subject === values.subject; }) : null;
      const result = { id: action === "edit-result" ? id : duplicate ? duplicate.id : Store.nextId("RES-", results), studentId: student.id, studentName: student.name, className: student.className, exam: values.exam, subject: values.subject, marks: marks, maxMarks: max };
      if (action === "edit-result") {
        const index = results.findIndex(function (item) { return item.id === id; });
        if (index < 0) { toast("Result record not found.", "error"); return; }
        results[index] = result;
      } else if (duplicate) {
        const index = results.findIndex(function (item) { return item.id === duplicate.id; });
        results[index] = result;
      } else results.push(result);
      Store.set("results", results); Store.activity("Marks updated for " + student.name); toast(duplicate ? "Existing subject marks updated." : "Student marks saved.", "success");
    } else if (action === "add-fee") {
      const student = Store.get("students").find(function (item) { return item.id === values.studentId; });
      const amount = Number(values.amount), paid = Number(values.paid);
      if (!student || amount <= 0 || paid < 0 || paid > amount) { toast("Enter a valid fee total and payment amount.", "error"); return; }
      Store.get("fees").push({ id: Store.nextId("FEE-", Store.get("fees")), studentId: student.id, studentName: student.name, className: student.className, amount: amount, paid: paid, dueDate: values.dueDate });
      Store.set("fees", Store.get("fees")); toast("Fee record added.", "success");
    } else if (action === "pay-fee") {
      const fee = Store.get("fees").find(function (item) { return item.id === id; }), amount = Number(values.amount);
      if (!fee || amount <= 0 || amount > Number(fee.amount) - Number(fee.paid)) { toast("Payment must be greater than zero and no more than the outstanding balance.", "error"); return; }
      fee.paid = Number(fee.paid) + amount; Store.set("fees", Store.get("fees"));
      const payments = Store.get("payments"); payments.push({ id: Store.nextId("RCT-", payments), feeId: fee.id, studentName: fee.studentName, amount: amount, date: Store.today, method: values.method });
      Store.set("payments", payments); toast("Payment recorded. Receipt is ready to print.", "success");
    } else if (action === "add-notice") {
      const notices = Store.get("notices"); notices.push({ id: Store.nextId("NOT-", notices), title: values.title, date: values.date, description: values.description, important: !!values.important, author: Auth.current().name });
      Store.set("notices", notices); Store.activity("Announcement published: " + values.title); toast("Announcement published.", "success");
    } else if (action === "add-timetable") {
      const rows = Store.get("timetable"); rows.push(Object.assign({ id: Store.nextId("TT-", rows) }, values));
      Store.set("timetable", rows); toast("Timetable slot added.", "success");
    } else if (action === "change-password") {
      const user = Auth.current();
      const recordList = user.role === "student" ? Store.get("students") : user.role === "teacher" ? Store.get("teachers") : Store.get("adminAccounts");
      const record = recordList && recordList.find(function (item) { return item.id === user.id; });
      const current = user.role === "admin" && user.email.toLowerCase() === "admin@northstar.edu" ? Store.get("settings").adminPassword || (record && record.password) : record && record.password;
      if (values.currentPassword !== current) { toast("Current password is incorrect.", "error"); return; }
      if (values.newPassword.length < 6 || values.newPassword !== values.confirmPassword) { toast("New passwords must match and contain at least 6 characters.", "error"); return; }
      if (record) {
        record.password = values.newPassword;
        const key = user.role === "student" ? "students" : user.role === "teacher" ? "teachers" : "adminAccounts";
        Store.set(key, recordList);
        if (user.role === "admin" && user.email.toLowerCase() === "admin@northstar.edu") {
          const settings = Store.get("settings"); settings.adminPassword = values.newPassword; Store.set("settings", settings);
        }
      }
      toast("Password changed successfully.", "success");
    }
    if (/^edit-(students|teachers|classes|subjects)$/.test(action)) {
      document.querySelector(".page-content").innerHTML = pageContent(Auth.current());
      drawCharts();
      overlay.querySelector(".modal-header p").textContent = "Changes saved. Continue editing or close when you're done.";
      if (focusControl && focusControl.isConnected) {
        focusControl.focus();
        if (selection) focusControl.setSelectionRange(selection[0], selection[1]);
      }
      return;
    }
    overlay.hidden = true;
    renderApp();
  }
  function deleteRecord(action, id) {
    if (action === "delete-result") {
      const active = Auth.current();
      const results = Store.get("results");
      const record = results.find(function (item) { return item.id === id; });
      if (!record || !window.confirm("Delete this student result? This cannot be undone.")) return true;
      if (active.role === "teacher") {
        const teacher = Store.get("teachers").find(function (item) { return item.id === active.id; });
        const classes = teacher ? teacher.classes.split(",").map(function (item) { return item.trim(); }) : [];
        const subjects = teacher ? Store.get("subjects").filter(function (item) { return item.teacher === teacher.name; }).map(function (item) { return item.name; }) : [];
        if (teacher && subjects.indexOf(teacher.subject) === -1) subjects.push(teacher.subject);
        if (!teacher || classes.indexOf(record.className) === -1 || subjects.indexOf(record.subject) === -1) { toast("You can only change results for your assigned classes and subjects.", "error"); return true; }
      }
      Store.set("results", results.filter(function (item) { return item.id !== id; }));
      toast("Result deleted.", "success"); renderApp(); return true;
    }
    const match = action.match(/^delete-(students|teachers|classes|subjects|notice)$/);
    if (!match) return false;
    const entity = match[1] === "notice" ? "notices" : match[1];
    const record = Store.get(entity).find(function (item) { return item.id === id; });
    if (!record || !window.confirm("Delete this " + (entity === "notices" ? "announcement" : entity.slice(0, -1)) + "? This cannot be undone.")) return true;
    Store.set(entity, Store.get(entity).filter(function (item) { return item.id !== id; }));
    if (entity === "students") {
      Store.set("results", Store.get("results").filter(function (item) { return item.studentId !== id; }));
      Store.set("fees", Store.get("fees").filter(function (item) { return item.studentId !== id; }));
      const attendance = Store.get("attendance");
      Object.keys(attendance).forEach(function (key) { attendance[key] = attendance[key].filter(function (item) { return item.studentId !== id; }); });
      Store.set("attendance", attendance);
    }
    if (entity === "teachers") Store.set("timetable", Store.get("timetable").filter(function (item) { return item.teacher !== record.name; }));
    if (entity === "classes") {
      Store.set("students", Store.get("students").map(function (item) { return item.className === record.name ? Object.assign({}, item, { className: "" }) : item; }));
      Store.set("subjects", Store.get("subjects").filter(function (item) { return item.className !== record.name; }));
      Store.set("timetable", Store.get("timetable").filter(function (item) { return item.className !== record.name; }));
    }
    toast("Record deleted.", "success"); renderApp(); return true;
  }
  function exportRows(rows, filename) {
    if (!rows.length) { toast("There is no data to export.", "error"); return; }
    const columns = Object.keys(rows[0]).filter(function (key) { return key !== "password" && key !== "photo"; });
    const csv = [columns.join(",")].concat(rows.map(function (row) {
      return columns.map(function (key) { return '"' + String(row[key] == null ? "" : row[key]).replace(/"/g, '""') + '"'; }).join(",");
    })).join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
    link.download = filename; link.click(); URL.revokeObjectURL(link.href); toast("CSV report downloaded.", "success");
  }
  function exportAction(action) {
    const mappings = {
      "export-students": ["students", "students.csv"], "export-teachers": ["teachers", "teachers.csv"],
      "export-classes": ["classes", "classes.csv"], "export-subjects": ["subjects", "subjects.csv"],
      "export-results": ["results", "results.csv"], "export-fees": ["fees", "fees.csv"]
    };
    if (!mappings[action]) return false;
    exportRows(Store.get(mappings[action][0]), mappings[action][1]); return true;
  }
  function printReceipt(id) {
    const fee = Store.get("fees").find(function (item) { return item.id === id; });
    if (!fee) return;
    const payment = Store.get("payments").filter(function (item) { return item.feeId === id; }).slice(-1)[0];
    const content = '<!doctype html><html><head><title>Northstar fee receipt</title><style>body{font:15px Arial,sans-serif;color:#17243b;padding:48px;max-width:760px;margin:auto}.receipt{border:1px solid #dfe5ef;border-radius:12px;padding:32px}.top{display:flex;justify-content:space-between;border-bottom:1px solid #e8ecf3;padding-bottom:20px}h1{font-size:23px;margin:0 0 5px}small{color:#69788e}.row{display:flex;justify-content:space-between;padding:15px 0;border-bottom:1px solid #eef0f4}.total{font-weight:bold;font-size:19px}button{margin-top:24px;padding:10px 18px;background:#4263eb;color:#fff;border:0;border-radius:8px}@media print{button{display:none}}</style></head><body><div class="receipt"><div class="top"><div><h1>Northstar Academy</h1><small>Official fee payment receipt</small></div><div>Receipt: ' + esc(payment ? payment.id : fee.id) + '<br>' + esc(formatDate(payment ? payment.date : Store.today)) + '</div></div><div class="row"><span>Student</span><b>' + esc(fee.studentName) + '</b></div><div class="row"><span>Student ID · Class</span><b>' + esc(fee.studentId + " · " + fee.className) + '</b></div><div class="row"><span>Payment received</span><b>' + money(payment ? payment.amount : fee.paid) + '</b></div><div class="row"><span>Method</span><b>' + esc(payment ? payment.method : "Account payment") + '</b></div><div class="row"><span>Fee balance</span><b>' + money(Number(fee.amount) - Number(fee.paid)) + '</b></div><p class="row total"><span>Thank you</span><span>Northstar Academy</span></p><button onclick="window.print()">Print receipt</button></div></body></html>';
    const printWindow = window.open("", "_blank");
    if (!printWindow) { toast("Allow pop-ups to print this receipt.", "error"); return; }
    printWindow.document.write(content); printWindow.document.close();
  }

  function isAllowed(action, user) {
    if (!user) return false;
    const adminOnly = /^(add|edit|delete)-(teachers|classes|subjects|notice)$/.test(action) ||
      /^(edit|delete)-students$/.test(action) ||
      ["new-exam", "add-fee", "pay-fee", "fee-receipt", "add-notice", "add-timetable", "export-students", "export-teachers", "export-classes", "export-subjects", "export-fees", "view-student"].indexOf(action) !== -1;
    if (adminOnly && user.role !== "admin") return false;
    if (action === "add-students" && user.role !== "admin" && user.role !== "teacher") return false;
    if (user.role === "student" && ["add-result", "edit-result", "delete-result", "export-results", "save-attendance", "attendance-all-present", "export-attendance"].indexOf(action) !== -1) return false;
    if (user.role !== "admin" && user.role !== "teacher" && ["add-result", "edit-result", "delete-result", "export-results", "save-attendance", "attendance-all-present", "export-attendance"].indexOf(action) !== -1) return false;
    return true;
  }
  function handleAction(action, id) {
    if (!action) return;
    const active = Auth.current();
    if (active && !isAllowed(action, active)) { toast("Your account does not have permission for this action.", "error"); return; }
    if (action === "close-modal") { overlay.hidden = true; return; }
    if (action === "forgot-password") { renderForgot(loginRole); return; }
    if (action === "back-to-login") { renderLogin(loginRole); return; }
    if (action === "logout") { Auth.logout(); page = "dashboard"; renderLogin("admin"); return; }
    if (action === "mobile-menu") { const sidebar = document.getElementById("sidebar"); sidebar.classList.toggle("open"); return; }
    if (action === "mobile-search") {
      const search = document.querySelector(".search-wrap");
      search.classList.toggle("open");
      if (search.classList.contains("open")) document.getElementById("global-search").focus();
      return;
    }
    if (action === "theme") {
      const settings = Store.get("settings"); settings.theme = settings.theme === "dark" ? "light" : "dark"; Store.set("settings", settings); renderApp(); return;
    }
    if (action === "save-attendance") { Attendance.save(); return; }
    if (action === "export-attendance") { Attendance.exportMonthly(); return; }
    if (action === "attendance-all-present") {
      document.querySelectorAll('.attendance-row input[value="Present"]').forEach(function (input) { input.checked = true; }); return;
    }
    if (action === "view-student") {
      const student = Store.get("students").find(function (item) { return item.id === id; });
      if (!student) return;
      openModal("Student profile", "Student and guardian information", [
        ["Student ID", "Student ID", "text", false], ["name", "Student name", "text", false], ["className", "Class", "text", false], ["section", "Section", "text", false],
        ["teacherName", "Class teacher", "text", false], ["guardian", "Parent / guardian", "text", false], ["guardianPhone", "Guardian phone", "text", false], ["email", "Student email", "text", false], ["phone", "Student phone", "text", false]
      ].map(function (field) { field[2] = "text"; return field; }), Object.assign({}, student, { "Student ID": student.id, teacherName: AdminViews.studentTeacher(student) || "Not assigned" }), "profile-view", id);
      const form = overlay.querySelector("form");
      form.querySelectorAll("input").forEach(function (input) { input.readOnly = true; });
      form.querySelector('button[type="submit"]').remove(); return;
    }
    if (action.indexOf("export-") === 0 && exportAction(action)) return;
    if (action === "fee-receipt") { printReceipt(id); return; }
    if (action.indexOf("delete-") === 0 || action === "delete-result") { deleteRecord(action, id); return; }
    if (/^(add|edit)-|^(new-exam|add-result|edit-result|add-fee|pay-fee|add-notice|add-timetable|change-password)$/.test(action)) { openForAction(action, id); return; }
    if (action === "print") { window.print(); return; }
  }
  document.addEventListener("click", function (event) {
    const nav = event.target.closest("[data-nav]");
    if (nav) {
      page = nav.dataset.nav; renderApp(); return;
    }
    const demo = event.target.closest("[data-demo]");
    if (demo) {
      const role = demo.dataset.demo;
      const credentials = demoCredentials(role);
      renderLogin(role);
      document.getElementById("identity").value = credentials[0]; document.getElementById("password").value = credentials[1]; return;
    }
    const role = event.target.closest("[data-role]");
    if (role) {
      if (authView === "forgot") renderForgot(role.dataset.role);
      else renderLogin(role.dataset.role);
      return;
    }
    const actionButton = event.target.closest("[data-action]");
    if (actionButton && actionButton.tagName !== "FORM") { handleAction(actionButton.dataset.action, actionButton.dataset.id); return; }
  });
  document.addEventListener("focusin", function (event) {
    if (overlay.contains(event.target) && event.target.matches("input,select,textarea")) modalLastFocusedControl = event.target;
  });
  document.addEventListener("submit", function (event) {
    if (event.target.id === "signup-form") {
      event.preventDefault();
      const form = event.target;
      if (!form.reportValidity()) return;
      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      const password = form.elements.password.value;
      if (password !== form.elements.confirmPassword.value) { document.getElementById("signup-error").textContent = "The passwords do not match."; return; }
      let result;
      if (loginRole === "teacher") {
        result = Auth.registerTeacher({
          name: name, email: email, password: password, confirmPassword: form.elements.confirmPassword.value,
          phone: form.elements.phone.value, teacherId: form.elements.teacherId.value,
          subject: form.elements.subject.value, className: form.elements.className.value
        });
      } else if (loginRole === "student") {
        result = Auth.registerStudent({
          name: name, email: email, password: password, confirmPassword: form.elements.confirmPassword.value,
          studentId: form.elements.studentId.value, className: form.elements.className.value,
          section: form.elements.section.value, roll: form.elements.roll.value,
          guardianPhone: form.elements.guardianPhone.value
        });
      } else {
        result = Auth.registerAdmin(name, email, password);
      }
      if (!result.ok) { document.getElementById("signup-error").textContent = result.error; return; }
      const portal = loginRole === "teacher" ? "teacher.html" : loginRole === "student" ? "student.html" : "admin.html";
      window.location.href = portal + "?registered=" + encodeURIComponent(email);
    } else if (event.target.id === "forgot-form") {
      event.preventDefault();
      const form = event.target;
      if (!form.reportValidity()) return;
      const password = form.elements.password.value;
      if (password !== form.elements.confirmPassword.value) { document.getElementById("forgot-error").textContent = "The new passwords do not match."; return; }
      if (!Auth.resetPassword(form.elements.role.value, form.elements.email.value, password)) {
        document.getElementById("forgot-error").textContent = "No account with that email exists in this portal on this browser.";
        return;
      }
      const role = form.elements.role.value, email = form.elements.email.value;
      renderLogin(role);
      document.getElementById("identity").value = email;
      toast("Password reset. Sign in with your new password.", "success");
    } else if (event.target.id === "login-form") {
      event.preventDefault();
      const role = document.querySelector(".role-option.active").dataset.role;
      const identity = event.target.elements.identity.value.trim();
      const password = event.target.elements.password.value;
      if (!Auth.login(role, identity, password)) { document.getElementById("login-error").textContent = "We couldn't verify those details. Please try again."; return; }
      page = "dashboard"; renderApp(); toast("Welcome to your " + role + " portal.", "success");
    } else if (event.target.id === "modal-form") {
      event.preventDefault(); submitModal(event.target).catch(function (error) { console.error("Could not save this form.", error); toast("The form could not be saved.", "error"); });
    }
  });
  document.addEventListener("input", function (event) {
    if (event.target.id === "global-search" || event.target.id === "entity-search" || event.target.id === "fee-search") {
      const query = event.target.value.trim().toLowerCase();
      document.querySelectorAll("#entity-table tbody tr, #fees-table tbody tr").forEach(function (row) {
        const text = (row.dataset.search || row.textContent).toLowerCase();
        row.hidden = query && text.indexOf(query) === -1;
      });
      if (event.target.id === "global-search") showGlobalSearch(query);
    }
  });
  document.addEventListener("change", function (event) {
    if (["attendance-class", "attendance-section", "attendance-date", "attendance-month"].indexOf(event.target.id) !== -1) Attendance.refresh();
    if (event.target.name === "className") {
      const sectionSelect = document.querySelector('#modal-form [name="section"], #signup-form [name="section"]');
      const selectedClass = Store.get("classes").find(function (item) { return item.name === event.target.value; });
      if (sectionSelect && selectedClass) {
        const sections = selectedClass.sections.split(",").map(function (item) { return item.trim(); });
        sectionSelect.innerHTML = '<option value="">Select a section</option>' + sections.map(function (item) { return '<option value="' + esc(item) + '">' + esc(item) + '</option>'; }).join("");
      }
    }
    if (event.target.id === "results-exam-filter") {
      const filter = event.target.value;
      document.querySelectorAll("#results-table tbody tr").forEach(function (row) { row.hidden = !!filter && row.children[2] && row.children[2].textContent !== filter; });
    }
    if (event.target.id === "timetable-filter") {
      const filter = event.target.value;
      document.querySelectorAll(".timetable tbody tr").forEach(function (row) { row.hidden = !!filter && row.dataset.class !== filter; });
    }
    if (event.target.id === "entity-filter") {
      const filter = event.target.value;
      document.querySelectorAll("#entity-table tbody tr").forEach(function (row) { row.hidden = !!filter && row.textContent.indexOf(filter) === -1; });
    }
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !overlay.hidden) overlay.hidden = true;
  });
  window.addEventListener("resize", function () { drawCharts(); });
  function init() {
    const active = Auth.current();
    if (active) renderApp();
    else if (document.body.dataset.authView === "signup") renderSignup();
    else {
      renderLogin(document.body.dataset.loginRole || "admin");
      const registeredEmail = new URLSearchParams(window.location.search).get("registered");
      if (registeredEmail) {
        const role = new URLSearchParams(window.location.search).get("role") || document.body.dataset.loginRole || "admin";
        renderLogin(role);
        document.getElementById("identity").value = registeredEmail;
        toast(roleName(role) + " account created. Sign in with your new credentials.", "success");
      }
    }
  }
  window.renderApp = renderApp;
  init();
})();
