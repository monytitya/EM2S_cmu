package Springboot_cmu.cmu_springboot.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "\"salaries\"")
public class Salaries {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "basic_salary", nullable = false)
    private BigDecimal basicSalary;

    private BigDecimal allowances;

    @Column(name = "deductions_percentage")
    private BigDecimal deductionsPercentage;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    public Salaries() {}

    public Salaries(Long id, Long employeeId, BigDecimal basicSalary, BigDecimal allowances, BigDecimal deductionsPercentage, LocalDate effectiveDate) {
        this.id = id;
        this.employeeId = employeeId;
        this.basicSalary = basicSalary;
        this.allowances = allowances;
        this.deductionsPercentage = deductionsPercentage;
        this.effectiveDate = effectiveDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public BigDecimal getBasicSalary() {
        return basicSalary;
    }

    public void setBasicSalary(BigDecimal basicSalary) {
        this.basicSalary = basicSalary;
    }

    public BigDecimal getAllowances() {
        return allowances;
    }

    public void setAllowances(BigDecimal allowances) {
        this.allowances = allowances;
    }

    public BigDecimal getDeductionsPercentage() {
        return deductionsPercentage;
    }

    public void setDeductionsPercentage(BigDecimal deductionsPercentage) {
        this.deductionsPercentage = deductionsPercentage;
    }

    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }

    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }
}

