package Springboot_cmu.cmu_springboot.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "\"positions\"")
public class Positions {

    @Id
    private Long id;

    @Column(length = 50)
    private String name;

    private Long code;

    @Column(name = "manger_id")
    private Long managerId;

    private Long positions; // self-referencing hierarchy key

    @Column(length = 100)
    private String title;

    @Column(name = "min_salary")
    private BigDecimal minSalary;

    @Column(name = "mas_salary")
    private BigDecimal maxSalary; // mapped to mas_salary from SQL schema

    public Positions() {}

    public Positions(Long id, String name, Long code, Long managerId, Long positions, String title, BigDecimal minSalary, BigDecimal maxSalary) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.managerId = managerId;
        this.positions = positions;
        this.title = title;
        this.minSalary = minSalary;
        this.maxSalary = maxSalary;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getCode() {
        return code;
    }

    public void setCode(Long code) {
        this.code = code;
    }

    public Long getManagerId() {
        return managerId;
    }

    public void setManagerId(Long managerId) {
        this.managerId = managerId;
    }

    public Long getPositions() {
        return positions;
    }

    public void setPositions(Long positions) {
        this.positions = positions;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public BigDecimal getMinSalary() {
        return minSalary;
    }

    public void setMinSalary(BigDecimal minSalary) {
        this.minSalary = minSalary;
    }

    public BigDecimal getMaxSalary() {
        return maxSalary;
    }

    public void setMaxSalary(BigDecimal maxSalary) {
        this.maxSalary = maxSalary;
    }
}

