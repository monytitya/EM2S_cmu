package Springboot_cmu.cmu_springboot.repository;

import Springboot_cmu.cmu_springboot.entity.Employee;
import Springboot_cmu.cmu_springboot.dto.EmployeeDetailsProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    @Query(value = "SELECT " +
            "e.id AS employeeId, " +
            "e.employee_code AS employeeCode, " +
            "e.first_name || ' ' || e.last_name AS employeeFullName, " +
            "e.gender AS gender, " +
            "e.dob AS dob, " +
            "e.phone AS phone, " +
            "e.address AS address, " +
            "u.id AS userId, " +
            "u.username AS username, " +
            "u.email AS email, " +
            "u.is_active AS userIsActive, " +
            "u.last_login AS lastLogin, " +
            "r.id AS roleId, " +
            "r.name AS roleName, " +
            "r.descriptions AS roleDescription, " +
            "parent_role.name AS parentRoleName, " +
            "d.id AS departmentId, " +
            "d.name AS departmentName, " +
            "d.code AS departmentCode, " +
            "dept_mgr.first_name || ' ' || dept_mgr.last_name AS departmentManagerName, " +
            "p.id AS positionId, " +
            "p.title AS positionTitle, " +
            "p.code AS positionCode, " +
            "p.min_salary AS positionMinSalary, " +
            "p.mas_salary AS positionMaxSalary, " +
            "pos_mgr.first_name || ' ' || pos_mgr.last_name AS positionManagerName, " +
            "parent_pos.title AS parentPositionTitle, " +
            "s.id AS salaryId, " +
            "s.basic_salary AS basicSalary, " +
            "s.allowances AS allowances, " +
            "s.deductions_percentage AS deductionsPercentage, " +
            "s.effective_date AS salaryEffectiveDate, " +
            "pay.id AS payrollId, " +
            "pay.pay_period_start AS payPeriodStart, " +
            "pay.pay_period_end AS payPeriodEnd, " +
            "pay.gross_pay AS grossPay, " +
            "pay.net_pay AS netPay, " +
            "pay.tax_amount AS taxAmount, " +
            "pay.unpaid_leave_deductions AS unpaidLeaveDeductions, " +
            "pay.payment_status AS paymentStatus, " +
            "pay.paid_at AS paidAt, " +
            "l.id AS leaveId, " +
            "lt.name AS leaveTypeName, " +
            "lt.default_days_per_year AS defaultDaysPerYear, " +
            "l.start_date AS leaveStartDate, " +
            "l.end_date AS leaveEndDate, " +
            "l.total_days AS leaveTotalDays, " +
            "appr.first_name || ' ' || appr.last_name AS leaveApprovedByName " +
            "FROM \"employee\" e " +
            "LEFT JOIN \"user\" u ON e.user_id = u.id " +
            "LEFT JOIN \"role\" r ON u.role_id = r.id " +
            "LEFT JOIN \"role\" parent_role ON r.role_id = parent_role.id " +
            "LEFT JOIN \"department\" d ON e.department_id = d.id " +
            "LEFT JOIN \"employee\" dept_mgr ON d.manger_id = dept_mgr.id " +
            "LEFT JOIN \"positions\" p ON e.positoin_id = p.id " +
            "LEFT JOIN \"employee\" pos_mgr ON p.manger_id = pos_mgr.id " +
            "LEFT JOIN \"positions\" parent_pos ON p.positions = parent_pos.id " +
            "LEFT JOIN \"salaries\" s ON e.id = s.employee_id " +
            "LEFT JOIN \"payroll\" pay ON e.id = pay.employee_id AND s.id = pay.salary_id " +
            "LEFT JOIN \"leave\" l ON e.id = l.employee_id " +
            "LEFT JOIN \"leave_type\" lt ON l.leave_type = lt.leave_type " +
            "LEFT JOIN \"employee\" appr ON l.approve_by = appr.id",
            nativeQuery = true)
    List<EmployeeDetailsProjection> findAllEmployeeDetails();
}

