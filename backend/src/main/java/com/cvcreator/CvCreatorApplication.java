package com.cvcreator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class CvCreatorApplication {
    public static void main(String[] args) {
        SpringApplication.run(CvCreatorApplication.class, args);
    }
}
