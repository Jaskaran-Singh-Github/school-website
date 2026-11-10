(function () {
  function feePage(user) {
    if (user && user.role === "student") {
      const student = Store.get("students").find(function (item) { return item.id === user.id; });
      if (!student) return '<div class="card empty-state"><strong>Student fee account unavailable</strong>Please contact your school office.</div>';
      const records = Store.get("fees").filter(function (item) { return item.studentId === student.id; });
      const total = records.reduce(function (sum, item) { return sum + Number(item.amount); }, 0);
      const paid = records.reduce(function (sum, item) { return sum + Number(item.paid); }, 0);
      const due = total - paid;
      const payments = Store.get("payments").filter(function (item) { return records.some(function (fee) { return fee.id === item.feeId; }); }).slice().reverse();
      return '<div class="card profile-banner"><div class="avatar">' + initials(student.name) + '</div><div><h2>' + esc(student.name) + '</h2><p>' + esc(student.id) + ' · ' + esc(student.className) + ' · Fee account</p></div></div>' +
        '<div class="stat-grid">' + statCard("Total fees", money(total), "₹", records.length + " fee records") + statCard("Paid to date", money(paid), "✓", "Payments received") + statCard("Outstanding balance", money(due), "◷", due ? "Please contact the school office" : "Your account is up to date") + statCard("Payment status", due ? "Pending" : "Paid", "▤", due ? "Payment is due" : "No balance due") + '</div>' +
        '<div class="section-head"><div><h2>Your fee records</h2><p>Payment details for your student account.</p></div></div>' +
        (records.length ? '<div class="table-wrap"><table class="table"><thead><tr><th>Fee record</th><th>Total</th><th>Paid</th><th>Balance</th><th>Due date</th><th>Status</th></tr></thead><tbody>' +
          records.map(function (fee) { const balance = Number(fee.amount) - Number(fee.paid); return '<tr><td>' + esc(fee.id) + '</td><td>' + money(fee.amount) + '</td><td>' + money(fee.paid) + '</td><td><strong>' + money(balance) + '</strong></td><td>' + esc(formatDate(fee.dueDate)) + '</td><td>' + badge(balance === 0 ? "Paid" : "Pending", balance === 0 ? "success" : "warning") + '</td></tr>'; }).join("") + '</tbody></table></div>' :
          '<div class="card empty-state"><strong>No fee record yet</strong>Your school will add fee details to your account here.</div>') +
        '<div class="section-head" style="margin-top:24px"><div><h2>Payment history</h2><p>Payments recorded by your school.</p></div></div>' +
        (payments.length ? '<div class="table-wrap"><table class="table"><thead><tr><th>Receipt</th><th>Amount</th><th>Date</th><th>Method</th></tr></thead><tbody>' +
          payments.map(function (item) { return '<tr><td>' + esc(item.id) + '</td><td>' + money(item.amount) + '</td><td>' + esc(formatDate(item.date)) + '</td><td>' + esc(item.method) + '</td></tr>'; }).join("") + '</tbody></table></div>' :
          '<div class="card empty-state">Payment history will appear here after a payment is recorded.</div>');
    }
    const fees = Store.get("fees");
    const total = fees.reduce(function (sum, fee) { return sum + Number(fee.amount); }, 0);
    const paid = fees.reduce(function (sum, fee) { return sum + Number(fee.paid); }, 0);
    const due = total - paid;
    return '<div class="stat-grid">' + statCard("Fees collected", money(paid), "₹", "Across all student accounts") + statCard("Pending balance", money(due), "◷", "Outstanding fee amount") + statCard("Collection rate", (total ? Math.round(paid / total * 100) : 0) + "%", "↗", "Against recorded fees") + statCard("Fee accounts", fees.length, "▤", "Students with fee records") + '</div>' +
      '<div class="toolbar"><div class="toolbar-left"><input id="fee-search" type="search" placeholder="Search student or ID…"></div><div class="toolbar-right"><button class="btn btn-light" data-action="export-fees">Export CSV</button><button class="btn" data-action="add-fee">＋ Add fee record</button></div></div>' +
      '<div class="section-head"><div><h2>Student fee records</h2><p>Record payments and print receipts for each transaction.</p></div></div>' +
      '<div class="table-wrap"><table class="table" id="fees-table"><thead><tr><th>Student</th><th>Class</th><th>Total fee</th><th>Paid</th><th>Balance</th><th>Due date</th><th>Status</th><th>Action</th></tr></thead><tbody>' +
      (fees.length ? fees.map(function (fee) {
        const balance = Number(fee.amount) - Number(fee.paid);
        return '<tr data-search="' + esc((fee.studentName + " " + fee.studentId).toLowerCase()) + '"><td><div class="person"><div class="avatar">' + initials(fee.studentName) + '</div><div><strong>' + esc(fee.studentName) + '</strong><small>' + esc(fee.studentId) + '</small></div></div></td><td>' + esc(fee.className) + '</td><td>' + money(fee.amount) + '</td><td>' + money(fee.paid) + '</td><td><strong>' + money(balance) + '</strong></td><td>' + esc(formatDate(fee.dueDate)) + '</td><td>' + badge(balance === 0 ? "Paid" : "Pending", balance === 0 ? "success" : "warning") + '</td><td><div class="table-action">' + (balance ? '<button class="icon-btn" title="Record payment" data-action="pay-fee" data-id="' + esc(fee.id) + '">₹</button>' : "") + '<button class="icon-btn" title="Print receipt" data-action="fee-receipt" data-id="' + esc(fee.id) + '">▤</button></div></td></tr>';
      }).join("") : '<tr><td colspan="8" class="empty-state">No fee records yet.</td></tr>') +
      '</tbody></table></div><div class="section-head" style="margin-top:24px"><div><h2>Recent payment history</h2><p>Recorded fee collections</p></div></div>' +
      (Store.get("payments").length ? '<div class="table-wrap"><table class="table"><thead><tr><th>Receipt</th><th>Student</th><th>Amount</th><th>Date</th><th>Method</th></tr></thead><tbody>' +
        Store.get("payments").slice().reverse().map(function (payment) { return '<tr><td>' + esc(payment.id) + '</td><td>' + esc(payment.studentName) + '</td><td>' + money(payment.amount) + '</td><td>' + esc(formatDate(payment.date)) + '</td><td>' + esc(payment.method) + '</td></tr>'; }).join("") +
        '</tbody></table></div>' : '<div class="card empty-state">Payment history will appear here after a payment is recorded.</div>');
  }
  window.Fees = { page: feePage };
})();
