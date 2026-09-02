package Springboot_cmu.cmu_springboot.dto;

import java.math.BigDecimal;

public interface EmployeeOverviewProjection {
    Long getEmployeeId();
    String getEmployeeFullName();
    String getGender();
    String getDepartmentName();
    String getPositionTitle();
    BigDecimal getBasicSalary();
    BigDecimal getNetPay();
    String getPaymentStatus();
    String getLeaveTypeName();
    Integer getLeaveTotalDays();
}
