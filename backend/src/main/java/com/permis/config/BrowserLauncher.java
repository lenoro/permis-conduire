package com.permis.config;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class BrowserLauncher implements ApplicationListener<ApplicationReadyEvent> {

    private final Environment env;

    public BrowserLauncher(Environment env) {
        this.env = env;
    }

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        // Ouvrir le navigateur uniquement en mode demo
        if (!Arrays.asList(env.getActiveProfiles()).contains("demo")) return;

        String port = env.getProperty("server.port", "8080");
        String url = "http://localhost:" + port;

        try {
            new ProcessBuilder("cmd", "/c", "start", url).start();
        } catch (Exception e) {
            System.out.println("Ouvrez votre navigateur sur : " + url);
        }
    }
}
