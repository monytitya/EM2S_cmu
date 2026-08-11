package Springboot_cmu.cmu_springboot;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/emp")
public class EmployeeController {

    private final EmployeeService employeeService;
    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping("/find/all")
    public List<Employee> findAllEmployee() {
        return employeeService.findAll();
    }
    @GetMapping("/find/{id}")
    public ResponseEntity<Optional<Employee>> findEmployeeById(@PathVariable("id") Integer id){
        Optional<Employee> employee = employeeService.findById(id);
        return new ResponseEntity<>(employee, HttpStatus.OK);
    }
    @GetMapping("/find/mail/{email}")   // "/find/{email}" is not work because of overlapping path with "/find/{id}"
    public ResponseEntity<Employee> findEmployeeByEmail(@PathVariable("email") String email){
        Employee employee = employeeService.findByEmail(email);
        return new ResponseEntity<>(employee, HttpStatus.OK);
    }

    @PostMapping("/add")
    public ResponseEntity<Employee> addEmployee(@RequestBody Employee employee){
        Employee addEmployee = employeeService.addEmp(employee);
        return new ResponseEntity<>(addEmployee, HttpStatus.CREATED);
    }

    @PutMapping("/update")
    public ResponseEntity<Employee> updateEmployeeById(@RequestBody Employee employee){
        Employee employee1 = employeeService.updateById(employee);
        return new ResponseEntity<>(employee1, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteEmployeeById(@PathVariable("id") Integer id){
        employeeService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
