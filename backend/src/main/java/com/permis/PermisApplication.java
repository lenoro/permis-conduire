package com.permis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PermisApplication {
    public static void main(String[] args) {
        LicenceChecker.check();
        SpringApplication.run(PermisApplication.class, args);
    }
}
