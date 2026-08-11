package Springboot_cmu.cmu_springboot;


import java.util.List;
import java.util.Optional;

public interface EmployeeInterface {
    public List<Employee> findAll();
    public Optional<Employee> findById(Integer id);
    public Employee findByEmail(String email);
    public Employee addEmp(Employee employee);
    public Employee updateById(Employee employee);
    public void deleteById(Integer id);
}
