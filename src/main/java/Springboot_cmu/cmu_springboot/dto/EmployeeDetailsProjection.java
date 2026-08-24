package Springboot_cmu.cmu_springboot.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public interface EmployeeDetailsProjection {
    // 1. Employee Details
    Long getEmployeeId();
    Long getEmployeeCode();
    String getEmployeeFullName();
    String getGender();
    LocalDate getDob();
    String getPhone();
    String getAddress();

    // 2. User Account & Role Info
    Long getUserId();
    String getUsername();
    String getEmail();
    Boolean getUserIsActive();
    OffsetDateTime getLastLogin();
    Long getRoleId();
    String getRoleName();
    String getRoleDescription();
    String getParentRoleName();

    // 3. Department Info & Department Manager
    Long getDepartmentId();
    String getDepartmentName();
    Long getDepartmentCode();
    String getDepartmentManagerName();

    // 4. Position Info, Position Manager & Position Hierarchy
    Long getPositionId();
    String getPositionTitle();
    Long getPositionCode();
    BigDecimal getPositionMinSalary();
    BigDecimal getPositionMaxSalary();
    String getPositionManagerName();
    String getParentPositionTitle();

    // 5. Salary Information
    Long getSalaryId();
    BigDecimal getBasicSalary();
    BigDecimal getAllowances();
    BigDecimal getDeductionsPercentage();
    LocalDate getSalaryEffectiveDate();

    // 6. Payroll Information
    Long getPayrollId();
    LocalDate getPayPeriodStart();
    LocalDate getPayPeriodEnd();
    BigDecimal getGrossPay();
    BigDecimal getNetPay();
    BigDecimal getTaxAmount();
    BigDecimal getUnpaidLeaveDeductions();
    String getPaymentStatus();
    OffsetDateTime getPaidAt();

    // 7. Leave & Leave Type Information
    Long getLeaveId();
    String getLeaveTypeName();
    Integer getDefaultDaysPerYear();
    LocalDate getLeaveStartDate();
    LocalDate getLeaveEndDate();
    Integer getLeaveTotalDays();
    String getLeaveApprovedByName();
}

