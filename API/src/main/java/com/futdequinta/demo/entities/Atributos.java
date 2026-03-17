package com.futdequinta.demo.entities;

import jakarta.persistence.Embeddable;

@Embeddable
public class Atributos {

    private Integer attack;
    private Integer defense;
    private Integer shot;
    private Integer pass;
    private Integer physical;
    private Integer pace;

    public Atributos() {}

    public Integer getAttack() { return attack; }
    public void setAttack(Integer attack) { this.attack = attack; }

    public Integer getDefense() { return defense; }
    public void setDefense(Integer defense) { this.defense = defense; }

    public Integer getShot() { return shot; }
    public void setShot(Integer shot) { this.shot = shot; }

    public Integer getPass() { return pass; }
    public void setPass(Integer pass) { this.pass = pass; }

    public Integer getPhysical() { return physical; }
    public void setPhysical(Integer physical) { this.physical = physical; }

    public Integer getPace() { return pace; }
    public void setPace(Integer pace) { this.pace = pace; }
}
