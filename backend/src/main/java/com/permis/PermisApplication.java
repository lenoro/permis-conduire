package com.permis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PermisApplication {
    public static void main(String[] args) {
        boolean isDemo = java.util.Arrays.asList(args).contains("--spring.profiles.active=demo")
            || "demo".equals(System.getProperty("spring.profiles.active"));
        if (!isDemo) {
            LicenceChecker.check();
        }
        SpringApplication.run(PermisApplication.class, args);
    }
}
