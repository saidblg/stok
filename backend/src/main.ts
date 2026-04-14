import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/$/, '');
}

function isLocalDevOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return ['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]'].includes(hostname);
  } catch {
    return false;
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  const nodeEnv = configService.get<string>('NODE_ENV') || process.env.NODE_ENV;
  const configuredOrigins = (corsOrigin || '')
    .split(',')
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);
  const enableSwaggerEnv = configService.get<string>('ENABLE_SWAGGER');
  const shouldEnableSwagger =
    enableSwaggerEnv !== undefined
      ? enableSwaggerEnv === 'true'
      : nodeEnv !== 'production';

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = normalizeOrigin(origin);
      const isConfiguredOrigin = configuredOrigins.includes(normalizedOrigin);
      const isAllowedLocalDevOrigin =
        nodeEnv !== 'production' && isLocalDevOrigin(normalizedOrigin);

      callback(
        isConfiguredOrigin || isAllowedLocalDevOrigin
          ? null
          : new Error(`Origin ${normalizedOrigin} is not allowed by CORS`),
        isConfiguredOrigin || isAllowedLocalDevOrigin,
      );
    },
    credentials: true,
  });

  // Serve static files from uploads directory
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  if (shouldEnableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('Stok ve Müşteri Cari Takip API')
      .setDescription('Stok yönetimi ve müşteri cari takip sistemi için RESTful API')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'JWT token ile kimlik doğrulama',
          in: 'header',
        },
        'JWT',
      )
      .addTag('auth', 'Kimlik doğrulama ve yetkilendirme işlemleri')
      .addTag('users', 'Kullanıcı yönetimi')
      .addTag('products', 'Ürün yönetimi')
      .addTag('customers', 'Müşteri yönetimi')
      .addTag('transactions', 'İşlem yönetimi (satış ve tahsilat)')
      .addTag('invoices', 'Fatura kayıt ve yönetimi')
      .addTag('dashboard', 'Dashboard ve istatistikler')
      .addTag('uploads', 'Dosya yükleme işlemleri')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
      customSiteTitle: 'Stok ve Cari Takip API Dokümantasyonu',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
      },
    });
  }

  const port = Number(process.env.PORT || configService.get<number>('PORT') || 3000);
  const baseUrl = configService.get<string>('BASE_URL') || `http://0.0.0.0:${port}`;
  await app.listen(port);

  console.log(`🚀 Server is running on: ${baseUrl}`);
  if (shouldEnableSwagger) {
    console.log(`📚 API Documentation: ${baseUrl}/api-docs`);
  }
}

bootstrap();
