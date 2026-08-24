package Springboot_cmu.cmu_springboot.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "\"leave_type\"")
public class LeaveType {

    @Id
    @Column(name = "leave_type")
    private Long leaveType;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "default_days_per_year", nullable = false)
    private Integer defaultDaysPerYear;

    public LeaveType() {}

    public LeaveType(Long leaveType, String name, Integer defaultDaysPerYear) {
        this.leaveType = leaveType;
        this.name = name;
        this.defaultDaysPerYear = defaultDaysPerYear;
    }

    public Long getLeaveType() {
        return leaveType;
    }

    public void setLeaveType(Long leaveType) {
        this.leaveType = leaveType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getDefaultDaysPerYear() {
        return defaultDaysPerYear;
    }

    public void setDefaultDaysPerYear(Integer defaultDaysPerYear) {
        this.defaultDaysPerYear = defaultDaysPerYear;
    }
}

