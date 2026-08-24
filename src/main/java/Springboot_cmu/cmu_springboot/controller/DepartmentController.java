package Springboot_cmu.cmu_springboot.controller;

import Springboot_cmu.cmu_springboot.entity.Department;
import Springboot_cmu.cmu_springboot.repository.DepartmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    public DepartmentController(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @GetMapping
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Department> getDepartmentById(@PathVariable Long id) {
        return departmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Department createDepartment(@RequestBody Department dept) {
        return departmentRepository.save(dept);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Department> updateDepartment(@PathVariable Long id, @RequestBody Department details) {
        return departmentRepository.findById(id).map(dept -> {
            dept.setName(details.getName());
            dept.setCode(details.getCode());
            dept.setManagerId(details.getManagerId());
            dept.setPositions(details.getPositions());
            dept.setTitle(details.getTitle());
            dept.setMinSalary(details.getMinSalary());
            dept.setMaxSalary(details.getMaxSalary());
            return ResponseEntity.ok(departmentRepository.save(dept));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long id) {
        return departmentRepository.findById(id).map(dept -> {
            departmentRepository.delete(dept);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}

