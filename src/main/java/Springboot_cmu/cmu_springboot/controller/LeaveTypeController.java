package Springboot_cmu.cmu_springboot.controller;

import Springboot_cmu.cmu_springboot.entity.LeaveType;
import Springboot_cmu.cmu_springboot.repository.LeaveTypeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leave-types")
public class LeaveTypeController {

    private final LeaveTypeRepository leaveTypeRepository;

    public LeaveTypeController(LeaveTypeRepository leaveTypeRepository) {
        this.leaveTypeRepository = leaveTypeRepository;
    }

    @GetMapping
    public List<LeaveType> getAllLeaveTypes() {
        return leaveTypeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveType> getLeaveTypeById(@PathVariable Long id) {
        return leaveTypeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public LeaveType createLeaveType(@RequestBody LeaveType leaveType) {
        return leaveTypeRepository.save(leaveType);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<LeaveType> updateLeaveType(@PathVariable Long id, @RequestBody LeaveType details) {
        return leaveTypeRepository.findById(id).map(lt -> {
            lt.setName(details.getName());
            lt.setDefaultDaysPerYear(details.getDefaultDaysPerYear());
            return ResponseEntity.ok(leaveTypeRepository.save(lt));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLeaveType(@PathVariable Long id) {
        return leaveTypeRepository.findById(id).map(lt -> {
            leaveTypeRepository.delete(lt);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}

