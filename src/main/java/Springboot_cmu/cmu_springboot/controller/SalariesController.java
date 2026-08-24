package Springboot_cmu.cmu_springboot.controller;

import Springboot_cmu.cmu_springboot.entity.Salaries;
import Springboot_cmu.cmu_springboot.repository.SalariesRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salaries")
public class SalariesController {

    private final SalariesRepository salariesRepository;

    public SalariesController(SalariesRepository salariesRepository) {
        this.salariesRepository = salariesRepository;
    }

    @GetMapping
    public List<Salaries> getAllSalaries() {
        return salariesRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Salaries> getSalaryById(@PathVariable Long id) {
        return salariesRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Salaries createSalary(@RequestBody Salaries salary) {
        return salariesRepository.save(salary);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Salaries> updateSalary(@PathVariable Long id, @RequestBody Salaries details) {
        return salariesRepository.findById(id).map(sal -> {
            sal.setEmployeeId(details.getEmployeeId());
            sal.setBasicSalary(details.getBasicSalary());
            sal.setAllowances(details.getAllowances());
            sal.setDeductionsPercentage(details.getDeductionsPercentage());
            sal.setEffectiveDate(details.getEffectiveDate());
            return ResponseEntity.ok(salariesRepository.save(sal));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSalary(@PathVariable Long id) {
        return salariesRepository.findById(id).map(sal -> {
            salariesRepository.delete(sal);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}

