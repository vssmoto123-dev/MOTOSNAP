package com.motosnap.workshop.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.boot.web.server.MimeMappings;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;

import java.util.concurrent.TimeUnit;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve _next static assets (JS, CSS, etc.) - this must come first and be most specific
        registry.addResourceHandler("/_next/**")
                .addResourceLocations("classpath:/static/_next/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic());

        // Also handle _next assets when accessed from nested paths
        registry.addResourceHandler("/dashboard/_next/**")
                .addResourceLocations("classpath:/static/_next/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic());

        registry.addResourceHandler("/dashboard/admin/_next/**")
                .addResourceLocations("classpath:/static/_next/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic());

        // Handle all other static assets (but exclude _next paths)
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.maxAge(1, TimeUnit.HOURS))
                .resourceChain(false);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Handle client-side routing - serve appropriate HTML files
        registry.addViewController("/dashboard/admin").setViewName("forward:/dashboard/admin.html");
        registry.addViewController("/dashboard/admin/**").setViewName("forward:/dashboard/admin.html");
        registry.addViewController("/dashboard").setViewName("forward:/dashboard.html");
        registry.addViewController("/login").setViewName("forward:/login.html");
        registry.addViewController("/register").setViewName("forward:/register.html");
        registry.addViewController("/").setViewName("forward:/index.html");
    }

    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> webServerFactoryCustomizer() {
        return factory -> {
            MimeMappings mappings = new MimeMappings(MimeMappings.DEFAULT);
            mappings.add("js", "application/javascript");
            mappings.add("css", "text/css");
            mappings.add("json", "application/json");
            mappings.add("html", "text/html");
            mappings.add("txt", "text/plain");
            factory.setMimeMappings(mappings);
        };
    }
}