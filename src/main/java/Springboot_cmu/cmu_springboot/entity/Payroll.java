package Springboot_cmu.cmu_springboot.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "\"payroll\"")
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "salary_id")
    private Long salaryId;

    @Column(name = "pay_period_start", nullable = false)
    private LocalDate payPeriodStart;

    @Column(name = "pay_period_end", nullable = false)
    private LocalDate payPeriodEnd;

    @Column(name = "gross_pay", nullable = false)
    private BigDecimal grossPay;

    @Column(name = "net_pay", nullable = false)
    private BigDecimal netPay;

    @Column(name = "tax_amount")
    private BigDecimal taxAmount;

    @Column(name = "unpaid_leave_deductions")
    private BigDecimal unpaidLeaveDeductions;

    @Column(name = "payment_status", length = 20)
    private String paymentStatus;

    @Column(name = "paid_at")
    private OffsetDateTime paidAt;

    public Payroll() {}

    public Payroll(Long id, Long employeeId, Long salaryId, LocalDate payPeriodStart, LocalDate payPeriodEnd, BigDecimal grossPay, BigDecimal netPay, BigDecimal taxAmount, BigDecimal unpaidLeaveDeductions, String paymentStatus, OffsetDateTime paidAt) {
        this.id = id;
        this.employeeId = employeeId;
        this.salaryId = salaryId;
        this.payPeriodStart = payPeriodStart;
        this.payPeriodEnd = payPeriodEnd;
        this.grossPay = grossPay;
        this.netPay = netPay;
        this.taxAmount = taxAmount;
        this.unpaidLeaveDeductions = unpaidLeaveDeductions;
        this.paymentStatus = paymentStatus;
        this.paidAt = paidAt;
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

    public Long getSalaryId() {
        return salaryId;
    }

    public void setSalaryId(Long salaryId) {
        this.salaryId = salaryId;
    }

    public LocalDate getPayPeriodStart() {
        return payPeriodStart;
    }

    public void setPayPeriodStart(LocalDate payPeriodStart) {
        this.payPeriodStart = payPeriodStart;
    }

    public LocalDate getPayPeriodEnd() {
        return payPeriodEnd;
    }

    public void setPayPeriodEnd(LocalDate payPeriodEnd) {
        this.payPeriodEnd = payPeriodEnd;
    }

    public BigDecimal getGrossPay() {
        return grossPay;
    }

    public void setGrossPay(BigDecimal grossPay) {
        this.grossPay = grossPay;
    }

    public BigDecimal getNetPay() {
        return netPay;
    }

    public void setNetPay(BigDecimal netPay) {
        this.netPay = netPay;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public BigDecimal getUnpaidLeaveDeductions() {
        return unpaidLeaveDeductions;
    }

    public void setUnpaidLeaveDeductions(BigDecimal unpaidLeaveDeductions) {
        this.unpaidLeaveDeductions = unpaidLeaveDeductions;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public OffsetDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(OffsetDateTime paidAt) {
        this.paidAt = paidAt;
    }
}

