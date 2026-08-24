package Springboot_cmu.cmu_springboot.repository;

import Springboot_cmu.cmu_springboot.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
}

