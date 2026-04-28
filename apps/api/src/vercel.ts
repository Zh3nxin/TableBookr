import "reflect-metadata";
import "dotenv/config";

import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";

import { AppModule } from "./app.module";
import { configureApp } from "./app.factory";

const express = require("express");

let cachedApp: ((req: unknown, res: unknown) => void) | null = null;

async function createExpressApp() {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  configureApp(app);
  await app.init();

  return expressApp;
}

export default async function handler(req: unknown, res: unknown) {
  cachedApp ??= await createExpressApp();
  return cachedApp!(req, res);
}
