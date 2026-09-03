package Springboot_cmu.cmu_springboot.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Object> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String detail = ex.getMostSpecificCause().getMessage();
        String message = "Employee data violates a database constraint.";
        if (detail != null) {
            if (detail.contains("employee_code")) {
                message = "Employee code already exists. Enter a different code.";
            } else if (detail.contains("department_id")) {
                message = "Department ID does not exist. Enter a valid department ID.";
            } else if (detail.contains("position_id")) {
                message = "Position ID does not exist. Enter a valid position ID.";
            }
        }
        Map<String, Object> body = new HashMap<>();
        body.put("error", "Data conflict");
        body.put("message", message);
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleAllExceptions(Exception ex, WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", "Internal Server Error");
        body.put("message", ex.getMessage());
        
        Throwable cause = ex.getCause();
        if (cause != null) {
            body.put("cause", cause.getMessage());
            while (cause.getCause() != null) {
                cause = cause.getCause();
            }
            body.put("root_cause", cause.getMessage());
        }

        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

