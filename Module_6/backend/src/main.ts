import 'dotenv/config'
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app/app.module';
import { testConnection } from './db/database';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Allow the React frontend to connect
  app.enableCors({
    origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',  // local dev
    'http://localhost',       // Docker frontend default host
    'http://localhost:5006',  // Docker frontend new port
  ],
  credentials: true,
});

  // Serve uploaded files as static assets
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // Verify DB is reachable before accepting traffic
  await testConnection();

  const port = process.env.PORT || 3006;
  await app.listen(port);
  console.log(`\n[Server] Running on http://localhost:${port}`);
}

bootstrap();