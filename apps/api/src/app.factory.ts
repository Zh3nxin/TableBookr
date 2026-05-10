import { INestApplication, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

export function getAllowedOrigins() {
  const configuredOrigins = process.env.FRONTEND_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins && configuredOrigins.length > 0) {
    return configuredOrigins;
  }

  return ["http://localhost:3001", "http://127.0.0.1:3001"];
}

export function configureApp(app: INestApplication) {
  app.enableCors({
    origin: getAllowedOrigins(),
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  return app;
}

export async function createApp() {
  const app = await NestFactory.create(AppModule);
  return configureApp(app);
}
