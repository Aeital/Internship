import asyncio
from sqlalchemy import select
from app.core.database import SessionLocal
from app.models.models import Employee, Department, RoleEnum
from app.core.security import hash_password
from datetime import date
async def seed():
    async with SessionLocal() as db:
        # Check if already seeded
        result = await db.execute(select(Department).where(Department.dept_name == "Engineering"))
        existing_dept = result.scalar_one_or_none()

        if existing_dept:
            print("Seed data already exists, skipping.")
            return

        dept = Department(dept_name="Engineering", dept_description="Software team")
        db.add(dept)
        await db.commit()
        await db.refresh(dept)

        employees = [
            Employee(
                emp_name="Alice Admin", dob=date(1990, 1, 1), phone="03001234567",
                hire_date=date(2022, 1, 1), email="admin@ems.com",
                hashed_password=hash_password("admin123"), role=RoleEnum.ADMIN,
                dept_id=dept.dept_id,
            ),
            Employee(
                emp_name="Hina HR", dob=date(1991, 2, 2), phone="03001234568",
                hire_date=date(2022, 2, 1), email="hr@ems.com",
                hashed_password=hash_password("hr123"), role=RoleEnum.HR,
                dept_id=dept.dept_id,
            ),
            Employee(
                emp_name="Malik Manager", dob=date(1988, 3, 3), phone="03001234569",
                hire_date=date(2021, 3, 1), email="manager@ems.com",
                hashed_password=hash_password("manager123"), role=RoleEnum.MANAGER,
                dept_id=dept.dept_id,
            ),
            Employee(
                emp_name="Sana Staff", dob=date(1995, 4, 4), phone="03001234570",
                hire_date=date(2023, 4, 1), email="staff@ems.com",
                hashed_password=hash_password("staff123"), role=RoleEnum.STAFF,
                dept_id=dept.dept_id, staff_grade="Grade 2",
            ),
        ]
        db.add_all(employees)
        await db.commit()
        print("Seed data inserted successfully.")


if __name__ == "__main__":
    asyncio.run(seed())