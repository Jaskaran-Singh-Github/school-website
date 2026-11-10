(function () {
  const ADMIN = { email: "admin@northstar.edu", password: "admin123", name: "Morgan Ellis" };
  const SESSION_KEY = "northstar-user";
  function normalizedEmail(email) { return String(email || "").trim().toLowerCase(); }
  function emailInUse(email) {
    const target = normalizedEmail(email);
    return Store.get("adminAccounts").some(function (item) { return normalizedEmail(item.email) === target; }) ||
      Store.get("teachers").some(function (item) { return normalizedEmail(item.email) === target; }) ||
      Store.get("students").some(function (item) { return normalizedEmail(item.email) === target; });
  }
  function validRegistration(data) {
    if (!data.name || data.name.trim().length < 2) return "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail(data.email))) return "Enter a valid email address.";
    if (!data.password || data.password.length < 8) return "Use a password with at least 8 characters.";
    if (data.password !== data.confirmPassword) return "The passwords do not match.";
    return "";
  }
  function finishRegistration(key, records, record) {
    records.push(record);
    if (!Store.set(key, records)) {
      records.pop();
      return { ok: false, error: "Your account could not be saved in this browser." };
    }
    return { ok: true };
  }
  function login(role, identity, password) {
    let user;
    const email = normalizedEmail(identity);
    if (role === "admin") {
      const account = Store.get("adminAccounts").find(function (item) { return item.email.toLowerCase() === email; });
      const savedPassword = email === ADMIN.email ? Store.get("settings").adminPassword || (account && account.password) : account && account.password;
      if (account && password === savedPassword) user = { role: "admin", id: account.id, name: account.name, email: account.email };
    } else if (role === "teacher") {
      const teacher = Store.get("teachers").find(function (item) { return item.email.toLowerCase() === email && item.password === password; });
      if (teacher) user = { role: "teacher", id: teacher.id, name: teacher.name, email: teacher.email };
    } else if (role === "student") {
      const student = Store.get("students").find(function (item) {
        return (item.id.toLowerCase() === String(identity).trim().toLowerCase() || normalizedEmail(item.email) === email) && item.password === password;
      });
      if (student) user = { role: "student", id: student.id, name: student.name, email: student.email };
    }
    if (!user) return false;
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); }
    catch (error) { console.error("Could not save the login session.", error); return false; }
    return true;
  }
  function registerAdmin(name, email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    const validation = validRegistration({ name: name, email: normalizedEmail, password: password, confirmPassword: password });
    if (validation) return { ok: false, error: validation };
    if (emailInUse(normalizedEmail)) return { ok: false, error: "An account already uses this email address. Sign in instead." };
    const accounts = Store.get("adminAccounts");
    return finishRegistration("adminAccounts", accounts, { id: Store.nextId("ADM-", accounts), name: name.trim(), email: normalizedEmail, password: password });
  }
  function registerTeacher(data) {
    const validation = validRegistration(data);
    if (validation) return { ok: false, error: validation };
    if (!String(data.phone || "").trim()) return { ok: false, error: "Enter your phone number." };
    if (emailInUse(data.email)) return { ok: false, error: "An account already uses this email address." };
    const teacherId = String(data.teacherId || "").trim();
    if (!teacherId) return { ok: false, error: "Enter your teacher ID." };
    const teachers = Store.get("teachers");
    if (teachers.some(function (item) { return String(item.id).toLowerCase() === teacherId.toLowerCase(); })) {
      return { ok: false, error: "This teacher ID is already registered. Contact your school administrator." };
    }
    const classRecord = Store.get("classes").find(function (item) { return item.name === data.className; });
    if (!classRecord || !String(data.subject || "").trim()) return { ok: false, error: "Choose an assigned class and enter a subject." };
    return finishRegistration("teachers", teachers, {
      id: teacherId, name: data.name.trim(), email: normalizedEmail(data.email), password: data.password,
      phone: String(data.phone || "").trim(), subject: data.subject.trim(), classes: classRecord.name,
      qualification: "Teaching staff"
    });
  }
  function registerStudent(data) {
    const validation = validRegistration(data);
    if (validation) return { ok: false, error: validation };
    if (emailInUse(data.email)) return { ok: false, error: "An account already uses this email address." };
    const studentId = String(data.studentId || "").trim();
    if (!studentId) return { ok: false, error: "Enter your student ID." };
    const students = Store.get("students");
    if (students.some(function (item) { return String(item.id).toLowerCase() === studentId.toLowerCase(); })) {
      return { ok: false, error: "This student ID is already registered. Contact your school administrator." };
    }
    const classRecord = Store.get("classes").find(function (item) { return item.name === data.className; });
    const section = String(data.section || "").trim();
    if (!classRecord || classRecord.sections.split(",").map(function (item) { return item.trim().toLowerCase(); }).indexOf(section.toLowerCase()) === -1) {
      return { ok: false, error: "Choose a valid class and section." };
    }
    const roll = String(data.roll || "").trim();
    const guardianPhone = String(data.guardianPhone || "").trim();
    if (!roll || !guardianPhone) return { ok: false, error: "Enter your roll number and parent / guardian phone." };
    if (students.some(function (item) { return item.className === classRecord.name && String(item.section).toLowerCase() === section.toLowerCase() && String(item.roll).toLowerCase() === roll.toLowerCase(); })) {
      return { ok: false, error: "That roll number is already assigned in this class and section." };
    }
    const record = {
      id: studentId, name: data.name.trim(), email: normalizedEmail(data.email), password: data.password,
      className: classRecord.name, section: section, roll: roll,
      guardian: "Parent / Guardian", guardianPhone: guardianPhone, phone: guardianPhone, gender: "",
      dob: "", photo: ""
    };
    return finishRegistration("students", students, record);
  }
  function resetPassword(role, email, password) {
    if (["admin", "teacher", "student"].indexOf(role) === -1) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail(email)) || !password || password.length < 8) return false;
    const emailNormalized = normalizedEmail(email);
    if (role === "admin") {
      const accounts = Store.get("adminAccounts");
      const account = accounts.find(function (item) { return item.email.toLowerCase() === emailNormalized; });
      if (!account) return false;
      account.password = password;
      if (emailNormalized === ADMIN.email) {
        const settings = Store.get("settings");
        settings.adminPassword = password;
        Store.set("settings", settings);
      }
      return Store.set("adminAccounts", accounts);
    }
    const key = role === "teacher" ? "teachers" : "students";
    const accounts = Store.get(key);
    const account = accounts.find(function (item) { return item.email && item.email.toLowerCase() === emailNormalized; });
    if (!account) return false;
    account.password = password;
    return Store.set(key, accounts);
  }
  function current() {
    const data = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (!data) return null;
    try {
      const user = JSON.parse(data);
      let exists = false;
      if (user.role === "admin") exists = Store.get("adminAccounts").some(function (item) { return item.id === user.id; });
      else if (user.role === "teacher") exists = Store.get("teachers").some(function (item) { return item.id === user.id; });
      else if (user.role === "student") exists = Store.get("students").some(function (item) { return item.id === user.id; });
      if (!exists) { logout(); return null; }
      return user;
    }
    catch (error) { console.error("Could not read the active user session.", error); logout(); return null; }
  }
  function logout() { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); }
  window.Auth = { login: login, registerAdmin: registerAdmin, registerTeacher: registerTeacher, registerStudent: registerStudent, resetPassword: resetPassword, current: current, logout: logout };
})();
