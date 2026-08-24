package Springboot_cmu.cmu_springboot.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "\"role\"")
public class Role {

    @Id
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 255)
    private String descriptions;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private Role parentRole;

    public Role() {}

    public Role(Long id, String name, String descriptions, Role parentRole) {
        this.id = id;
        this.name = name;
        this.descriptions = descriptions;
        this.parentRole = parentRole;
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

    public String getDescriptions() {
        return descriptions;
    }

    public void setDescriptions(String descriptions) {
        this.descriptions = descriptions;
    }

    public Role getParentRole() {
        return parentRole;
    }

    public void setParentRole(Role parentRole) {
        this.parentRole = parentRole;
    }
}
