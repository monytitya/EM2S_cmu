=-- 1. Roles
CREATE TABLE "role" (
    "id" BIGINT PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL,
    "descriptions" VARCHAR(255),
    "role_id" BIGINT,
    CONSTRAINT "fk_role_parent" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE SET NULL
);

-- 2. Users
CREATE TABLE "user" (
    "id" BIGINT PRIMARY KEY,
    "username" VARCHAR(50) NOT NULL UNIQUE,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password" UUID NOT NULL,
    "role_id" BIGINT,
    "is_active" BOOLEAN DEFAULT true,
    "last_login" TIMESTAMPTZ,
    CONSTRAINT "fk_user_role" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE SET NULL
);

-- 3. Positions
CREATE TABLE "positions" (
    "id" BIGINT PRIMARY KEY,
    "name" VARCHAR(50),
    "code" BIGINT,
    "manger_id" BIGINT,
    "positions" BIGINT,
    "title" VARCHAR(100),
    "min_salary" NUMERIC(12,2),
    "mas_salary" NUMERIC(12,2),
    CONSTRAINT "fk_positions_parent" FOREIGN KEY ("positions") REFERENCES "positions"("id") ON DELETE SET NULL
);

-- 4. Departments
CREATE TABLE "department" (
    "id" BIGINT PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL,
    "code" BIGINT,
    "manger_id" BIGINT,
    "positions" BIGINT,
    "title" VARCHAR(100),
    "min_salary" NUMERIC(12,2),
    "mas_salary" NUMERIC(12,2),
    CONSTRAINT "fk_department_position" FOREIGN KEY ("positions") REFERENCES "positions"("id") ON DELETE SET NULL
);

-- 5. Employees
CREATE TABLE "employee" (
    "id" BIGINT PRIMARY KEY,
    "user_id" BIGINT UNIQUE,
    "employee_code" BIGINT UNIQUE,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "gender" VARCHAR(20),
    "dob" DATE,
    "phone" VARCHAR(20),
    "address" TEXT,
    "department_id" BIGINT,
    "positoin_id" BIGINT,
    CONSTRAINT "fk_employee_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL,
    CONSTRAINT "fk_employee_department" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE SET NULL,
    CONSTRAINT "fk_employee_position" FOREIGN KEY ("positoin_id") REFERENCES "positions"("id") ON DELETE SET NULL
);

-- Add missing Manager Foreign Keys after employee table exists
ALTER TABLE "department" 
    ADD CONSTRAINT "fk_department_manager" FOREIGN KEY ("manger_id") REFERENCES "employee"("id") ON DELETE SET NULL;

ALTER TABLE "positions" 
    ADD CONSTRAINT "fk_positions_manager" FOREIGN KEY ("manger_id") REFERENCES "employee"("id") ON DELETE SET NULL;

-- 6. Salaries
CREATE TABLE "salaries" (
    "id" BIGINT PRIMARY KEY,
    "employee_id" BIGINT NOT NULL,
    "basic_salary" NUMERIC(12,2) NOT NULL,
    "allowances" NUMERIC(12,2) DEFAULT 0.00,
    "deductions_percentage" NUMERIC(5,2) DEFAULT 0.00,
    "effective_date" DATE NOT NULL,
    CONSTRAINT "fk_salaries_employee" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE CASCADE
);

-- 7. Payroll
CREATE TABLE "payroll" (
    "id" BIGINT PRIMARY KEY,
    "employee_id" BIGINT NOT NULL,
    "salary_id" BIGINT,
    "pay_period_start" DATE NOT NULL,
    "pay_period_end" DATE NOT NULL,
    "gross_pay" NUMERIC(12,2) NOT NULL,
    "net_pay" NUMERIC(12,2) NOT NULL,
    "tax_amount" NUMERIC(12,2) DEFAULT 0.00,
    "unpaid_leave_deductions" NUMERIC(12,2) DEFAULT 0.00,
    "payment_status" VARCHAR(20) DEFAULT 'PENDING',
    "paid_at" TIMESTAMPTZ,
    CONSTRAINT "fk_payroll_employee" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_payroll_salary" FOREIGN KEY ("salary_id") REFERENCES "salaries"("id") ON DELETE SET NULL
);

-- 8. Leave Types
CREATE TABLE "leave_type" (
    "leave_type" BIGINT PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "default_days_per_year" INT NOT NULL
);

-- 9. Leave Requests
CREATE TABLE "leave" (
    "id" BIGINT PRIMARY KEY,
    "employee_id" BIGINT NOT NULL,
    "leave_type" BIGINT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "total_days" INT NOT NULL,
    "approve_by" BIGINT,
    CONSTRAINT "fk_leave_employee" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_leave_type" FOREIGN KEY ("leave_type") REFERENCES "leave_type"("leave_type") ON DELETE CASCADE,
    CONSTRAINT "fk_leave_approver" FOREIGN KEY ("approve_by") REFERENCES "employee"("id") ON DELETE SET NULL
);


SELECT 
    -- 1. Employee Details
    e.id AS employee_id,
    e.employee_code,
    e.first_name || ' ' || e.last_name AS employee_full_name,
    e.gender,
    e.dob,
    e.phone,
    e.address,

    -- 2. User Account & Role Info
    u.id AS user_id,
    u.username,
    u.email,
    u.is_active AS user_is_active,
    u.last_login,
    r.id AS role_id,
    r.name AS role_name,
    r.descriptions AS role_description,
    parent_role.name AS parent_role_name,

    -- 3. Department Info & Department Manager
    d.id AS department_id,
    d.name AS department_name,
    d.code AS department_code,
    dept_mgr.first_name || ' ' || dept_mgr.last_name AS department_manager_name,

    -- 4. Position Info, Position Manager & Position Hierarchy
    p.id AS position_id,
    p.title AS position_title,
    p.code AS position_code,
    p.min_salary AS position_min_salary,
    p.mas_salary AS position_max_salary,
    pos_mgr.first_name || ' ' || pos_mgr.last_name AS position_manager_name,
    parent_pos.title AS parent_position_title,

    -- 5. Salary Information
    s.id AS salary_id,
    s.basic_salary,
    s.allowances,
    s.deductions_percentage,
    s.effective_date AS salary_effective_date,

    -- 6. Payroll Information
    pay.id AS payroll_id,
    pay.pay_period_start,
    pay.pay_period_end,
    pay.gross_pay,
    pay.net_pay,
    pay.tax_amount,
    pay.unpaid_leave_deductions,
    pay.payment_status,
    pay.paid_at,

    -- 7. Leave & Leave Type Information
    l.id AS leave_id,
    lt.name AS leave_type_name,
    lt.default_days_per_year,
    l.start_date AS leave_start_date,
    l.end_date AS leave_end_date,
    l.total_days AS leave_total_days,
    appr.first_name || ' ' || appr.last_name AS leave_approved_by_name

FROM "employee" e

-- Relationship 1: Employee -> User (1:1)
LEFT JOIN "user" u 
    ON e.user_id = u.id

-- Relationship 2: User -> Role (N:1)
LEFT JOIN "role" r 
    ON u.role_id = r.id

-- Relationship 3: Role -> Parent Role (Self-Referential Hierarchy)
LEFT JOIN "role" parent_role 
    ON r.role_id = parent_role.id

-- Relationship 4: Employee -> Department (N:1)
LEFT JOIN "department" d 
    ON e.department_id = d.id

-- Relationship 5: Department -> Department Manager Employee (N:1)
LEFT JOIN "employee" dept_mgr 
    ON d.manger_id = dept_mgr.id

-- Relationship 6: Employee -> Position (N:1)
LEFT JOIN "positions" p 
    ON e.positoin_id = p.id

-- Relationship 7: Position -> Position Manager Employee (N:1)
LEFT JOIN "positions" pos_mgr 
    ON p.manger_id = pos_mgr.id

-- Relationship 8: Position -> Parent Position (Self-Referential Hierarchy)
LEFT JOIN "positions" parent_pos 
    ON p.positions = parent_pos.id

-- Relationship 9: Employee -> Salaries (1:N)
LEFT JOIN "salaries" s 
    ON e.id = s.employee_id

-- Relationship 10: Employee & Salary -> Payroll (1:N)
LEFT JOIN "payroll" pay 
    ON e.id = pay.employee_id 
   AND s.id = pay.salary_id

-- Relationship 11: Employee -> Leave (1:N)
LEFT JOIN "leave" l 
    ON e.id = l.employee_id

-- Relationship 12: Leave -> Leave Type (N:1)
LEFT JOIN "leave_type" lt 
    ON l.leave_type = lt.leave_type

-- Relationship 13: Leave -> Approver Employee (N:1)
LEFT JOIN "employee" appr 
    ON l.approve_by = appr.id;