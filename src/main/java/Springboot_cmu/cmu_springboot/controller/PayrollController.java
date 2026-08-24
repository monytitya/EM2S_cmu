package Springboot_cmu.cmu_springboot.controller;

import Springboot_cmu.cmu_springboot.entity.Payroll;
import Springboot_cmu.cmu_springboot.repository.PayrollRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payrolls")
public class PayrollController {

    private final PayrollRepository payrollRepository;

    public PayrollController(PayrollRepository payrollRepository) {
        this.payrollRepository = payrollRepository;
    }

    @GetMapping
    public List<Payroll> getAllPayrolls() {
        return payrollRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payroll> getPayrollById(@PathVariable Long id) {
        return payrollRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Payroll createPayroll(@RequestBody Payroll payroll) {
        return payrollRepository.save(payroll);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Payroll> updatePayroll(@PathVariable Long id, @RequestBody Payroll details) {
        return payrollRepository.findById(id).map(pay -> {
            pay.setEmployeeId(details.getEmployeeId());
            pay.setSalaryId(details.getSalaryId());
            pay.setPayPeriodStart(details.getPayPeriodStart());
            pay.setPayPeriodEnd(details.getPayPeriodEnd());
            pay.setGrossPay(details.getGrossPay());
            pay.setNetPay(details.getNetPay());
            pay.setTaxAmount(details.getTaxAmount());
            pay.setUnpaidLeaveDeductions(details.getUnpaidLeaveDeductions());
            pay.setPaymentStatus(details.getPaymentStatus());
            pay.setPaidAt(details.getPaidAt());
            return ResponseEntity.ok(payrollRepository.save(pay));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePayroll(@PathVariable Long id) {
        return payrollRepository.findById(id).map(pay -> {
            payrollRepository.delete(pay);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}

