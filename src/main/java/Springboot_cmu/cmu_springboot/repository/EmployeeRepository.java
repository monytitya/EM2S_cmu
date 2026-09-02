package Springboot_cmu.cmu_springboot.repository;

import Springboot_cmu.cmu_springboot.dto.EmployeeOverviewProjection;
import Springboot_cmu.cmu_springboot.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    @Query("""
        SELECT
            e.id AS employeeId,
            CONCAT(e.firstName, ' ', e.lastName) AS employeeFullName,
            e.gender AS gender,
            d.name AS departmentName,
            p.title AS positionTitle,
            s.basicSalary AS basicSalary,
            pay.netPay AS netPay,
            pay.paymentStatus AS paymentStatus,
            lt.name AS leaveTypeName,
            COALESCE(l.totalDays, 0) AS leaveTotalDays
        FROM Employee e
        LEFT JOIN Department d ON d.id = e.departmentId
        LEFT JOIN Positions p ON p.id = e.positionId
        LEFT JOIN Salaries s ON s.employeeId = e.id
        LEFT JOIN Payroll pay ON pay.employeeId = e.id AND pay.salaryId = s.id
        LEFT JOIN Leave l ON l.employeeId = e.id
        LEFT JOIN LeaveType lt ON lt.leaveType = l.leaveType
    """)
    List<EmployeeOverviewProjection> findEmployeeOverview();
}

