import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { log } from 'console';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('TShop API')
      .setDescription('TShop backend API documentation')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'header',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // apply global security so Swagger UI shows the auth lock for all endpoints
    (document as any).security = [{ 'access-token': [] }];

    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // register global interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());
  // parse cookies so controllers can read refresh token cookie
  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3000);
  const port = process.env.PORT ?? 3000;
  console.log(`Application running at: http://localhost:${port}`);
}

bootstrap();
