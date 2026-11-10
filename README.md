# Northstar School Management

A browser-only school management demo built with HTML, CSS, and vanilla JavaScript. Open `index.html` in a modern browser, or use the dedicated `admin.html`, `teacher.html`, and `student.html` sign-in pages. Registration is available at `signup.html` (admin), `signup-teacher.html`, and `signup-student.html`.

Teacher registration requires a unique email and Teacher ID, phone, subject, and assigned class. Student registration requires a unique email and Student ID, class, section, roll number, and parent / guardian phone. Each signup creates a linked school record; registered students can sign in with their email or Student ID, while teachers and administrators use their email. New passwords must contain at least 8 characters. Accounts and remembered login sessions persist in LocalStorage until logout.

## Demo accounts

| Portal | Login | Password |
|---|---|---|
| Admin | `admin@northstar.edu` | `admin123` |
| Teacher | `teacher@northstar.edu` | `teach123` |
| Student | `STU-1042` | `student123` |

Use the **Use demo login** shortcut on each portal to fill the matching credentials. Existing demo accounts can sign in directly without registering again.

The built-in class directory includes Nursery, LKG, UKG, and Grades 1–12. Students can view their fee balances and recorded payment history in their portal.

## Data and privacy

School records, registered accounts, and remembered login sessions are stored in the browser's LocalStorage. Logging out clears the remembered session. Password recovery updates the saved password locally; it cannot verify email ownership without a backend. This is a front-end demonstration, not a production authentication system: passwords and application data are stored locally, and client-side role checks are not protected by a server.
