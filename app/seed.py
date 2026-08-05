
import asyncio
from datetime import date
 
from sqlalchemy import select
 
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.models import Department, Employee, RoleEnum
 
 
DEPARTMENTS = [
    {"dept_name": "Engineering", "dept_description": "Software development and infrastructure"},
    {"dept_name": "Human Resources", "dept_description": "Recruitment, payroll, and employee relations"},
    {"dept_name": "Sales", "dept_description": "Client acquisition and account management"},
    {"dept_name": "Finance", "dept_description": "Accounting, budgeting, and financial planning"},
    {"dept_name": "Marketing", "dept_description": "Branding, campaigns, and communications"},
    {"dept_name": "Operations", "dept_description": "Logistics, facilities, and day-to-day operations"},
]
 
# Each employee references its department by dept_name so we can
# resolve the real dept_id after departments are created/fetched.
EMPLOYEES = [
    # Engineering
    dict(emp_name="Alice Admin", dob=date(1990, 1, 1), phone="03001234567",
         hire_date=date(2022, 1, 1), email="admin@ems.com", password="admin123",
         role=RoleEnum.ADMIN, dept_name="Engineering"),
    dict(emp_name="Sana Staff", dob=date(1995, 4, 4), phone="03001234570",
         hire_date=date(2023, 4, 1), email="staff@ems.com", password="staff123",
         role=RoleEnum.STAFF, dept_name="Engineering", staff_grade="Grade 2"),
    dict(emp_name="Malik Manager", dob=date(1988, 3, 3), phone="03001234569",
         hire_date=date(2021, 3, 1), email="manager@ems.com", password="manager123",
         role=RoleEnum.MANAGER, dept_name="Engineering"),
    dict(emp_name="Bilal Baig", dob=date(1993, 6, 12), phone="03001234571",
         hire_date=date(2022, 6, 15), email="bilal.baig@ems.com", password="staff123",
         role=RoleEnum.STAFF, dept_name="Engineering", staff_grade="Grade 1"),
    dict(emp_name="Zara Khan", dob=date(1996, 9, 23), phone="03001234572",
         hire_date=date(2023, 9, 1), email="zara.khan@ems.com", password="staff123",
         role=RoleEnum.STAFF, dept_name="Engineering", staff_grade="Grade 3"),
    dict(emp_name="Usman Tariq", dob=date(1992, 11, 5), phone="03001234573",
         hire_date=date(2021, 11, 1), email="usman.tariq@ems.com", password="staff123",
         role=RoleEnum.STAFF, dept_name="Engineering", staff_grade="Grade 2"),
 
    # Human Resources
    dict(emp_name="Hina HR", dob=date(1991, 2, 2), phone="03001234568",
         hire_date=date(2022, 2, 1), email="hr@ems.com", password="hr123",
         role=RoleEnum.HR, dept_name="Human Resources"),
    dict(emp_name="Ayesha Noor", dob=date(1994, 5, 17), phone="03001234574",
         hire_date=date(2022, 5, 10), email="ayesha.noor@ems.com", password="hr123",
         role=RoleEnum.HR, dept_name="Human Resources"),
    dict(emp_name="Kamran Sheikh", dob=date(1989, 7, 30), phone="03001234575",
         hire_date=date(2020, 7, 1), email="kamran.sheikh@ems.com", password="manager123",
         role=RoleEnum.MANAGER, dept_name="Human Resources"),
    dict(emp_name="Nida Farooq", dob=date(1997, 8, 8), phone="03001234576",
         hire_date=date(2023, 8, 1), email="nida.farooq@ems.com", password="staff123",
         role=RoleEnum.STAFF, dept_name="Human Resources", staff_grade="Grade 1"),
 
    # Sales
    dict(emp_name="Tariq Aslam", dob=date(1987, 1, 20), phone="03001234577",
         hire_date=date(2019, 1, 15), email="tariq.aslam@ems.com", password="manager123",
         role=RoleEnum.MANAGER, dept_name="Sales"),
    dict(emp_name="Mehwish Ali", dob=date(1993, 3, 3), phone="03001234578",
         hire_date=date(2022, 3, 1), email="mehwish.ali@ems.com", password="staff123",
         role=RoleEnum.STAFF, dept_name="Sales", staff_grade="Grade 2"),
    dict(emp_name="Fahad Rashid", dob=date(1995, 12, 12), phone="03001234579",
         hire_date=date(2023, 1, 5), email="fahad.rashid@ems.com", password="staff123",
         role=RoleEnum.STAFF, dept_name="Sales", staff_grade="Grade 3"),
    dict(emp_name="Sarah Yousaf", dob=date(1998, 2, 14), phone="03001234580",
         hire_date=date(2024, 2, 1), email="sarah.yousaf@ems.com", password="staff123",
         role=RoleEnum.STAFF, dept_name="Sales", staff_grade="Grade 1"),
 
    # Finance
    dict(emp_name="Imran Qureshi", dob=date(1986, 4, 4), phone="03001234581",
         hire_date=date(2018, 4, 1), email="imran.qureshi@ems.com", password="manager123",
         role=RoleEnum.MANAGER, dept_name="Finance"),
    dict(emp_name="Rabia Idrees", dob=date(1992, 6, 6), phone="03001234582",
         hire_date=date(2021, 6, 1), email="rabia.idrees@ems.com", password="staff123",
         role=RoleEnum.STAFF, dept_name="Finance", staff_grade="Grade 2"),
    dict(emp_name="Hamza Latif", dob=date(1994, 10, 10), phone="03001234583",
         hire_date=date(2022, 10, 1), email="hamza.latif@ems.com", password="staff123",
         role=RoleEnum.STAFF, dept_name="Finance", staff_grade="Grade 1"),
 
    # Marketing
    dict(emp_name="Sadia Karim", dob=date(1990, 9, 9), phone="03001234584",
         hire_date=date(2020, 9, 1), email="sadia.karim@ems.com", password="manager123",
         role=RoleEnum.MANAGER, dept_name="Marketing"),
    dict(emp_name="Waqas Ahmed", dob=date(1996, 1, 1), phone="03001234585",
         hire_date=date(2023, 1, 1), email="waqas.ahmed@ems.com", password="staff123",
         role=RoleEnum.STAFF, dept_name="Marketing", staff_grade="Grade 3"),
    dict(emp_name="Iqra Siddiqui", dob=date(1997, 7, 7), phone="03001234586",
         hire_date=date(2023, 7, 1), email="iqra.siddiqui@ems.com", password="staff123",
         role=RoleEnum.STAFF, dept_name="Marketing", staff_grade="Grade 2"),
 
    # Operations
    dict(emp_name="Junaid Malik", dob=date(1985, 5, 5), phone="03001234587",
         hire_date=date(2017, 5, 1), email="junaid.malik@ems.com", password="manager123",
         role=RoleEnum.MANAGER, dept_name="Operations"),
    dict(emp_name="Nimra Basit", dob=date(1993, 8, 18), phone="03001234588",
         hire_date=date(2021, 8, 1), email="nimra.basit@ems.com", password="staff123",
         role=RoleEnum.STAFF, dept_name="Operations", staff_grade="Grade 1"),
    dict(emp_name="Ali Hassan", dob=date(1999, 3, 21), phone="03001234589",
         hire_date=date(2024, 3, 1), email="ali.hassan@ems.com", password="staff123",
         role=RoleEnum.STAFF, dept_name="Operations", staff_grade="Grade 2"),
]
 
 
async def get_or_create_departments(db):
    dept_map = {}
    for d in DEPARTMENTS:
        result = await db.execute(select(Department).where(Department.dept_name == d["dept_name"]))
        existing = result.scalar_one_or_none()
        if existing:
            dept_map[d["dept_name"]] = existing
        else:
            dept = Department(dept_name=d["dept_name"], dept_description=d["dept_description"])
            db.add(dept)
            dept_map[d["dept_name"]] = dept
    await db.commit()
    for d in DEPARTMENTS:
        await db.refresh(dept_map[d["dept_name"]])
    return dept_map
 
 
async def seed():
    async with SessionLocal() as db:
        dept_map = await get_or_create_departments(db)
 
        # Fetch existing employee emails so re-runs don't duplicate/crash
        result = await db.execute(select(Employee.email))
        existing_emails = {row[0] for row in result.all()}
 
        new_employees = []
        for e in EMPLOYEES:
            if e["email"] in existing_emails:
                continue
            new_employees.append(
                Employee(
                    emp_name=e["emp_name"],
                    dob=e["dob"],
                    phone=e["phone"],
                    hire_date=e["hire_date"],
                    email=e["email"],
                    hashed_password=hash_password(e["password"]),
                    role=e["role"],
                    dept_id=dept_map[e["dept_name"]].dept_id,
                    staff_grade=e.get("staff_grade"),
                )
            )
 
        if not new_employees:
            print("All seed employees already exist, nothing to insert.")
            return
 
        db.add_all(new_employees)
        await db.commit()
        print(f"Inserted {len(new_employees)} employees across {len(DEPARTMENTS)} departments.")
 
 
if __name__ == "__main__":
    asyncio.run(seed())