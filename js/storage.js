(function () {
  const KEY = "northstar-school-v1";
  const today = new Date().toISOString().slice(0, 10);
  const sample = {
    students: [
      { id: "STU-1042", name: "Aarav Sharma", className: "Grade 8", section: "A", roll: "01", gender: "Male", dob: "2012-04-15", email: "aarav@example.com", phone: "+91 98765 12001", guardian: "Rohan Sharma", guardianPhone: "+91 98765 12002", photo: "", password: "student123" },
      { id: "STU-1043", name: "Anaya Kapoor", className: "Grade 8", section: "A", roll: "02", gender: "Female", dob: "2012-08-22", email: "anaya@example.com", phone: "+91 98765 12003", guardian: "Neha Kapoor", guardianPhone: "+91 98765 12004", photo: "", password: "student123" },
      { id: "STU-1044", name: "Kabir Mehta", className: "Grade 8", section: "A", roll: "03", gender: "Male", dob: "2012-01-19", email: "kabir@example.com", phone: "+91 98765 12005", guardian: "Amit Mehta", guardianPhone: "+91 98765 12006", photo: "", password: "student123" },
      { id: "STU-1045", name: "Diya Iyer", className: "Grade 8", section: "A", roll: "04", gender: "Female", dob: "2012-06-02", email: "diya@example.com", phone: "+91 98765 12007", guardian: "Meera Iyer", guardianPhone: "+91 98765 12008", photo: "", password: "student123" },
      { id: "STU-1046", name: "Ishaan Rao", className: "Grade 7", section: "B", roll: "01", gender: "Male", dob: "2013-10-11", email: "ishaan@example.com", phone: "+91 98765 12009", guardian: "Kiran Rao", guardianPhone: "+91 98765 12010", photo: "", password: "student123" },
      { id: "STU-1047", name: "Sara Khan", className: "Grade 7", section: "B", roll: "02", gender: "Female", dob: "2013-03-27", email: "sara@example.com", phone: "+91 98765 12011", guardian: "Farah Khan", guardianPhone: "+91 98765 12012", photo: "", password: "student123" },
      { id: "STU-1048", name: "Vivaan Patel", className: "Grade 6", section: "A", roll: "01", gender: "Male", dob: "2014-12-09", email: "vivaan@example.com", phone: "+91 98765 12013", guardian: "Jay Patel", guardianPhone: "+91 98765 12014", photo: "", password: "student123" },
      { id: "STU-1049", name: "Mira Das", className: "Grade 6", section: "A", roll: "02", gender: "Female", dob: "2014-07-14", email: "mira@example.com", phone: "+91 98765 12015", guardian: "Soma Das", guardianPhone: "+91 98765 12016", photo: "", password: "student123" }
    ],
    teachers: [
      { id: "TCH-201", name: "Priya Menon", email: "teacher@northstar.edu", phone: "+91 98200 44001", subject: "Mathematics", classes: "Grade 8, Grade 7", qualification: "M.Sc. Mathematics", password: "teach123" },
      { id: "TCH-202", name: "Rohan Desai", email: "rohan@northstar.edu", phone: "+91 98200 44002", subject: "Science", classes: "Grade 8, Grade 6", qualification: "M.Sc. Physics", password: "teach123" },
      { id: "TCH-203", name: "Leena Thomas", email: "leena@northstar.edu", phone: "+91 98200 44003", subject: "English", classes: "Grade 7, Grade 6", qualification: "M.A. English", password: "teach123" }
    ],
    classes: [],
    subjects: [
      { id: "SUB-01", name: "Mathematics", code: "MATH-08", className: "Grade 8", teacher: "Priya Menon" },
      { id: "SUB-02", name: "Science", code: "SCI-08", className: "Grade 8", teacher: "Rohan Desai" },
      { id: "SUB-03", name: "English", code: "ENG-07", className: "Grade 7", teacher: "Leena Thomas" },
      { id: "SUB-04", name: "Social Studies", code: "SST-08", className: "Grade 8", teacher: "Leena Thomas" },
      { id: "SUB-05", name: "Computer Science", code: "CS-06", className: "Grade 6", teacher: "Rohan Desai" }
    ],
    attendance: {},
    exams: [{ id: "EX-01", name: "Mid-term Assessment", className: "Grade 8", date: "2026-11-18", maxMarks: "100" }],
    results: [
      { id: "RES-01", studentId: "STU-1042", studentName: "Aarav Sharma", className: "Grade 8", exam: "Mid-term Assessment", subject: "Mathematics", marks: 88, maxMarks: 100 },
      { id: "RES-02", studentId: "STU-1042", studentName: "Aarav Sharma", className: "Grade 8", exam: "Mid-term Assessment", subject: "Science", marks: 92, maxMarks: 100 },
      { id: "RES-03", studentId: "STU-1043", studentName: "Anaya Kapoor", className: "Grade 8", exam: "Mid-term Assessment", subject: "Mathematics", marks: 95, maxMarks: 100 },
      { id: "RES-04", studentId: "STU-1044", studentName: "Kabir Mehta", className: "Grade 8", exam: "Mid-term Assessment", subject: "Mathematics", marks: 71, maxMarks: 100 },
      { id: "RES-05", studentId: "STU-1045", studentName: "Diya Iyer", className: "Grade 8", exam: "Mid-term Assessment", subject: "Science", marks: 84, maxMarks: 100 }
    ],
    fees: [
      { id: "FEE-1042", studentId: "STU-1042", studentName: "Aarav Sharma", className: "Grade 8", amount: 24000, paid: 24000, dueDate: "2026-10-15" },
      { id: "FEE-1043", studentId: "STU-1043", studentName: "Anaya Kapoor", className: "Grade 8", amount: 24000, paid: 16000, dueDate: "2026-11-15" },
      { id: "FEE-1044", studentId: "STU-1044", studentName: "Kabir Mehta", className: "Grade 8", amount: 24000, paid: 12000, dueDate: "2026-11-15" },
      { id: "FEE-1045", studentId: "STU-1045", studentName: "Diya Iyer", className: "Grade 8", amount: 24000, paid: 24000, dueDate: "2026-10-15" },
      { id: "FEE-1046", studentId: "STU-1046", studentName: "Ishaan Rao", className: "Grade 7", amount: 22000, paid: 10000, dueDate: "2026-11-15" }
    ],
    payments: [],
    notices: [
      { id: "NOT-01", title: "Annual Sports Day", description: "Join us on the main field for a full day of friendly competition, team events, and family activities.", date: "2026-11-14", author: "School Administration", important: true },
      { id: "NOT-02", title: "Mid-term assessment schedule", description: "The mid-term assessment period begins November 18. Students should review the published timetable.", date: "2026-11-08", author: "Academic Office", important: true },
      { id: "NOT-03", title: "Library hours extended", description: "The library will remain open until 4:30 PM this month to support exam preparation.", date: "2026-11-02", author: "School Administration", important: false }
    ],
    timetable: [
      { id: "TT-01", className: "Grade 8", section: "A", day: "Monday", time: "09:00", subject: "Mathematics", teacher: "Priya Menon", room: "201" },
      { id: "TT-02", className: "Grade 8", section: "A", day: "Monday", time: "10:00", subject: "Science", teacher: "Rohan Desai", room: "201" },
      { id: "TT-03", className: "Grade 8", section: "A", day: "Tuesday", time: "09:00", subject: "English", teacher: "Leena Thomas", room: "201" },
      { id: "TT-04", className: "Grade 8", section: "A", day: "Wednesday", time: "09:00", subject: "Mathematics", teacher: "Priya Menon", room: "201" },
      { id: "TT-05", className: "Grade 7", section: "B", day: "Monday", time: "09:00", subject: "English", teacher: "Leena Thomas", room: "105" },
      { id: "TT-06", className: "Grade 6", section: "A", day: "Tuesday", time: "10:00", subject: "Science", teacher: "Rohan Desai", room: "103" }
    ],
    activities: [
      { text: "Anaya Kapoor's marks were updated", time: "Today, 10:42 AM" },
      { text: "Attendance saved for Grade 8 · Section A", time: "Today, 9:15 AM" },
      { text: "Annual Sports Day announcement published", time: "Yesterday, 3:20 PM" }
    ],
    settings: { theme: "light" },
    adminAccounts: [{ id: "ADM-001", name: "Morgan Ellis", email: "admin@northstar.edu", password: "admin123" }]
  };
  const classNames = ["Nursery", "LKG", "UKG"].concat(Array.from({ length: 12 }, function (_, index) { return "Grade " + (index + 1); }));
  sample.classes = classNames.map(function (name, index) {
    const assigned = name === "Grade 8" || name === "Grade 7" ? "Priya Menon" : name === "Grade 6" ? "Rohan Desai" : "";
    const roomByGrade = { "Grade 8": "201", "Grade 7": "105", "Grade 6": "103" };
    return { id: "CLS-" + String(index + 1).padStart(3, "0"), name: name, sections: "A, B", teacher: assigned, room: roomByGrade[name] || String(101 + index) };
  });
  for (let offset = 4; offset >= 0; offset--) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const day = date.toISOString().slice(0, 10);
    ["Grade 8|A", "Grade 7|B", "Grade 6|A"].forEach(function (group, groupIndex) {
      const parts = group.split("|");
      const records = sample.students.filter(function (student) { return student.className === parts[0] && student.section === parts[1]; }).map(function (student, index) {
        const status = (index + offset + groupIndex) % 13 === 0 ? "Absent" : "Present";
        return { studentId: student.id, studentName: student.name, roll: student.roll, status: status };
      });
      sample.attendance[[day, parts[0], parts[1]].join("|")] = records;
    });
  }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function read() {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(sample));
      return clone(sample);
    }
    try {
      const saved = JSON.parse(raw);
      const data = Object.assign(clone(sample), saved);
      const existingClassNames = new Set((data.classes || []).map(function (item) { return item.name.toLowerCase(); }));
      sample.classes.forEach(function (item) {
        if (!existingClassNames.has(item.name.toLowerCase())) data.classes.push(clone(item));
      });
      if (!Array.isArray(data.adminAccounts)) data.adminAccounts = clone(sample.adminAccounts);
      if (!data.adminAccounts.some(function (item) { return item.email.toLowerCase() === "admin@northstar.edu"; })) data.adminAccounts.unshift(clone(sample.adminAccounts[0]));
      localStorage.setItem(KEY, JSON.stringify(data));
      return data;
    } catch (error) {
      console.error("Could not read saved school data.", error);
      return clone(sample);
    }
  }
  let state = read();
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      console.error("Could not save school data to LocalStorage.", error);
      if (window.toast) window.toast("Unable to save. Browser storage may be full.", "error");
      return false;
    }
  }
  const Store = {
    get(key) { return state[key]; },
    set(key, value) { state[key] = value; return save(); },
    all() { return state; },
    reset() { state = clone(sample); save(); },
    nextId(prefix, list) {
      const max = list.reduce((value, item) => {
        const match = String(item.id || "").match(/(\d+)$/);
        return match ? Math.max(value, Number(match[1])) : value;
      }, 0);
      return prefix + String(max + 1).padStart(3, "0");
    },
    activity(text) {
      state.activities.unshift({ text: text, time: "Just now" });
      state.activities = state.activities.slice(0, 8);
      save();
    },
    today: today
  };
  window.Store = Store;
})();
