@echo off
set JAVA_HOME=C:\Users\MohdRadhiFauzan\Desktop\spring_boot_env\jdk-17.0.10+7
set MAVEN_HOME=C:\Users\MohdRadhiFauzan\Desktop\spring_boot_env\apache-maven-3.9.10-bin\apache-maven-3.9.10
set PATH=%MAVEN_HOME%\bin;%JAVA_HOME%\bin;%PATH%

REM Load environment variables from .env.local
set SPRING_PROFILES_ACTIVE=dev
set JWT_SECRET=development-secret-key-32-characters-long-for-local-testing

cd C:\Users\MohdRadhiFauzan\Desktop\MOTOSNAP\workshop
cmd