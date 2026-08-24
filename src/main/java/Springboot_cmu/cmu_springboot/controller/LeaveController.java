package Springboot_cmu.cmu_springboot.controller;

import Springboot_cmu.cmu_springboot.entity.Leave;
import Springboot_cmu.cmu_springboot.repository.LeaveRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveRepository leaveRepository;

    public LeaveController(LeaveRepository leaveRepository) {
        this.leaveRepository = leaveRepository;
    }

    @GetMapping
    public List<Leave> getAllLeaves() {
        return leaveRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Leave> getLeaveById(@PathVariable Long id) {
        return leaveRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Leave createLeave(@RequestBody Leave leave) {
        return leaveRepository.save(leave);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Leave> updateLeave(@PathVariable Long id, @RequestBody Leave details) {
        return leaveRepository.findById(id).map(l -> {
            l.setEmployeeId(details.getEmployeeId());
            l.setLeaveType(details.getLeaveType());
            l.setStartDate(details.getStartDate());
            l.setEndDate(details.getEndDate());
            l.setTotalDays(details.getTotalDays());
            l.setApproveBy(details.getApproveBy());
            return ResponseEntity.ok(leaveRepository.save(l));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLeave(@PathVariable Long id) {
        return leaveRepository.findById(id).map(l -> {
            leaveRepository.delete(l);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}

