package Springboot_cmu.cmu_springboot;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class EmployeeService implements EmployeeInterface{

    private final EmployeeRepo employeeRepo;
    public EmployeeService(EmployeeRepo employeeRepo) {
        this.employeeRepo = employeeRepo;
    }

    @Override
    public List<Employee> findAll() {
        return employeeRepo.findAll();  // Built in findAll of JpaRepository
    }
    @Override
    public Optional<Employee> findById(Integer id) {
        return employeeRepo.findById(id);   // Built-in findById of JpaRepository and return Optional
    }

    @Override
    public Employee findByEmail(String email) {
        return employeeRepo.findByEmail(email);
    }

    @Override
    public Employee addEmp(Employee employee) {
        employee.setEmployeeCode(UUID.randomUUID().toString());
        return employeeRepo.save(employee);
    }

    @Override
    public Employee updateById(Employee employee) {
         boolean existById = employeeRepo.existsById(employee.getId());
         if(!existById){ throw new IllegalStateException("id= "+ employee.getId() + " not found.");}
         return employeeRepo.save(employee);
    }

    @Override
    public void deleteById(Integer id) {
        boolean existsById = employeeRepo.existsById(id);
        if(!existsById){    throw new IllegalStateException("id = " + id + " not found.");        }
        employeeRepo.deleteById(id);
    }
}
