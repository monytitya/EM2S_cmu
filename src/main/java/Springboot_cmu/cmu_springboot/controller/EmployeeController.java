package Springboot_cmu.cmu_springboot.controller;

import Springboot_cmu.cmu_springboot.dto.EmployeeOverviewProjection;
import Springboot_cmu.cmu_springboot.entity.Employee;
import Springboot_cmu.cmu_springboot.repository.EmployeeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;

    public EmployeeController(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @GetMapping("/details")
    public ResponseEntity<List<EmployeeOverviewProjection>> getEmployeeDetails() {
        return ResponseEntity.ok(employeeRepository.findEmployeeOverview());
    }

    // CRUD: Create Employee (Only Admin)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Employee> createEmployee(@RequestBody Employee employee) {
        Employee saved = employeeRepository.save(employee);
        return ResponseEntity.ok(saved);
    }

    // CRUD: Get Employee by ID
    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        return employeeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // CRUD: Update Employee (Only Admin)
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Long id, @RequestBody Employee employeeDetails) {
        return employeeRepository.findById(id).map(employee -> {
            employee.setFirstName(employeeDetails.getFirstName());
            employee.setLastName(employeeDetails.getLastName());
            employee.setGender(employeeDetails.getGender());
            employee.setDob(employeeDetails.getDob());
            employee.setPhone(employeeDetails.getPhone());
            employee.setAddress(employeeDetails.getAddress());
            employee.setDepartmentId(employeeDetails.getDepartmentId());
            employee.setPositionId(employeeDetails.getPositionId());
            employee.setImageUrl(employeeDetails.getImageUrl());
            Employee updated = employeeRepository.save(employee);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    // CRUD: Delete Employee (Only Admin)
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        return employeeRepository.findById(id).map(employee -> {
            employeeRepository.delete(employee);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}

