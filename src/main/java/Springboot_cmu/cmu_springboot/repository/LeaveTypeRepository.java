package Springboot_cmu.cmu_springboot.repository;

import Springboot_cmu.cmu_springboot.entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LeaveTypeRepository extends JpaRepository<LeaveType, Long> {
}

