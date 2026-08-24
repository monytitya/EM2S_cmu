package Springboot_cmu.cmu_springboot.repository;

import Springboot_cmu.cmu_springboot.entity.Positions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PositionsRepository extends JpaRepository<Positions, Long> {
}

