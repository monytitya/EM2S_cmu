package Springboot_cmu.cmu_springboot.controller;

import Springboot_cmu.cmu_springboot.entity.Positions;
import Springboot_cmu.cmu_springboot.repository.PositionsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/positions")
public class PositionsController {

    private final PositionsRepository positionsRepository;

    public PositionsController(PositionsRepository positionsRepository) {
        this.positionsRepository = positionsRepository;
    }

    @GetMapping
    public List<Positions> getAllPositions() {
        return positionsRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Positions> getPositionById(@PathVariable Long id) {
        return positionsRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Positions createPosition(@RequestBody Positions position) {
        return positionsRepository.save(position);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Positions> updatePosition(@PathVariable Long id, @RequestBody Positions details) {
        return positionsRepository.findById(id).map(pos -> {
            pos.setName(details.getName());
            pos.setCode(details.getCode());
            pos.setManagerId(details.getManagerId());
            pos.setPositions(details.getPositions());
            pos.setTitle(details.getTitle());
            pos.setMinSalary(details.getMinSalary());
            pos.setMaxSalary(details.getMaxSalary());
            return ResponseEntity.ok(positionsRepository.save(pos));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePosition(@PathVariable Long id) {
        return positionsRepository.findById(id).map(pos -> {
            positionsRepository.delete(pos);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}

