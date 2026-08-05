Employee Management System (EMS)

App overview:
A role-based Employee Management System web app. Users log in with their email/password, and based on their role (detected from their account, not manually selected), they're automatically routed to a distinct portal experience tailored to their responsibilities. Four roles exist: Staff, Manager, HR, Admin — each with a completely different dashboard and navigation, sharing one clean, professional, corporate design language (soft neutral palette, card-based layouts, sidebar navigation).

Global flow
Login screen — single form (email, password), no role selector visible to the user. On successful login, the system reads the account's role internally and redirects automatically to that role's dashboard.
Shared shell — every portal after login uses the same layout skeleton: a left sidebar (nav links specific to that role), a top bar (user's name, role badge, logout), and a main content area.
Role badge — top bar always shows which role the logged-in user has (e.g. "Manager" pill/tag) so it's clear which portal they're in.
Portal 1: Staff Dashboard

Landing view: Summary cards — today's attendance status, remaining leave balance, latest payslip amount.

Mark Attendance

A simple check-in/check-out screen — big button to "Check In" (captures current time + date), later "Check Out" once checked in
Below it, a small table/list showing recent attendance history (date, check-in time, check-out time, status)

View Payroll

List of monthly payslips (month, basic salary, deductions, net salary)
Clicking one expands/opens a detailed payslip view — a clean, formatted slip layout (like a real payslip document) with breakdown of basic salary, deductions, and net pay, plus generated date

Submit Leave

A form: leave type (dropdown, e.g. Sick/Casual/Annual), start date, end date, reason (optional text)
Below the form, a list/table of their own past leave requests with status badges (Pending — yellow, Approved — green, Rejected — red)
A small "leave balance" widget showing days remaining per leave type

Dependents (view/manage own)

List of added dependents (name, relationship) with an "Add Dependent" button opening a small form (name, relationship type)
Portal 2: Manager Dashboard

Landing view: Summary cards — team size, pending leave approvals count, team attendance rate today.

Monitor Attendance

A table listing all team members with today's attendance status (or a date-range filter), columns: employee name, check-in, check-out, status
Ability to filter/search by employee name

Approve Leaves

A queue/list view of pending leave requests from their team — each row shows employee name, leave type, dates requested, reason
Each row has "Approve" / "Reject" action buttons
A secondary tab/filter to view leave history (already approved/rejected) for the team
Portal 3: HR Dashboard

Landing view: Summary cards — total employees, pending payroll runs, upcoming leave balance resets.

Generate Payroll

A form/screen to generate payroll: select employee (or "generate for all"), select month, system auto-calculates based on basic salary and deductions
A table showing all generated payroll records (employee, month, net salary, generated date) with the ability to view/edit a specific record

Manage Profile Data

Full employee directory — searchable/filterable table (name, department, role, email)
Clicking an employee opens their full profile — editable fields (name, phone, DOB, department, role, hire date)
"Add New Employee" button opening a full creation form

Track Dependents

A view (per employee, accessible from their profile, or a standalone searchable list) showing dependents linked to each employee — add/edit/remove dependents on behalf of any employee

Maintain Leave Balances

A table of all employees with their current leave balances per leave type
Ability to manually adjust/top-up a specific employee's balance (e.g. after annual reset)
Portal 4: Admin Dashboard

Landing view: Summary cards — total system users, active sessions/roles breakdown, recent system activity count.

System Governance

User/credential management: a table of all system users (employees) with their role, account status (active/inactive) — ability to change a user's role, deactivate/reactivate accounts, reset credentials
Department management: CRUD screen for departments (add/edit/delete departments, see employee count per department)
System-wide logs: a searchable/filterable audit log table — columns: timestamp, employee who performed the action, action type (create/update/delete/approve), table affected — read-only view, most recent first
Design notes
Use consistent status color coding throughout: green = approved/active/present, yellow = pending, red = rejected/absent/inactive
All list/table views should have empty states ("No records found") and loading states
Forms should show inline validation errors
Keep the visual language identical across all 4 portals — only the sidebar menu items and page content differ per role, reinforcing that this is one unified system with role-based views, not four separate apps