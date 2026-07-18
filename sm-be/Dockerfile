# syntax=docker/dockerfile:1

# --- Build stage ---
# gradle 내장 이미지 사용 (소스에 unix gradlew 가 없어도 빌드 가능)
FROM gradle:8.5-jdk17 AS build
COPY --chown=gradle:gradle . /home/gradle/project
WORKDIR /home/gradle/project
RUN gradle clean bootJar -x test --no-daemon

# --- Runtime stage ---
FROM eclipse-temurin:17-jre
WORKDIR /app

# 비루트 사용자로 실행 (보안)
RUN useradd -r -u 1001 appuser
COPY --from=build /home/gradle/project/build/libs/*.jar app.jar
USER appuser

EXPOSE 7080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
