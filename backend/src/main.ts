import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as crypto from 'crypto';

// Polyfill crypto.randomUUID for older Node environments
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', {
    value: { randomUUID: crypto.randomUUID.bind(crypto) },
  });
}

async function bootstrap() {
  // rawBody: true stores the raw request body on req.rawBody — required for
  // correct Razorpay webhook HMAC signature verification.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.setGlobalPrefix('/api/v1');

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: false,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`QuickPed backend running on http://localhost:${port}/api/v1`);
}
bootstrap();

