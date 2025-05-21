import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { logger } from './helpers/logger';
import * as fs from 'fs';

function setupSwagger(app: INestApplication) {
  // Swagger for Users
  const userConfig = new DocumentBuilder()
    .setTitle('User API')
    .setDescription(
      `API documentation for users\n\n---\n\n## WebSocket Chat Gateway\n\n- **WebSocket URL:** ws://https://nest-api-project-tlex.onrender.com\n\n### Events\n- \`register\`: { token }\n- \`privateMessage\`: { to, message }\n- \`groupMessage\`: { group, message }\n- \`joinGroup\`: { group }\n- \`leaveGroup\`: { group }\n- \`fetchPrivateHistory\`: { recipient }\n- \`fetchGroupHistory\`: { group }\n\nSee REST API docs for authentication and user management.\n\nYou can use browser clients or Socket.IO tools to interact with these events.\n\n---\n`,
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const userDocument = SwaggerModule.createDocument(app, userConfig, {
    include: [UsersModule, AuthModule],
  });
  SwaggerModule.setup('/api/docs/user', app, userDocument);

  // Swagger for Admins
  const adminConfig = new DocumentBuilder()
    .setTitle('Admin API')
    .setDescription(
      `API documentation for users\n\n---\n\n## WebSocket Chat Gateway\n\n- **WebSocket URL:** ws://localhost:3000\n\n### Events\n- \`register\`: { token }\n- \`privateMessage\`: { to, message }\n- \`groupMessage\`: { group, message }\n- \`joinGroup\`: { group }\n- \`leaveGroup\`: { group }\n- \`fetchPrivateHistory\`: { recipient }\n- \`fetchGroupHistory\`: { group }\n\nSee REST API docs for authentication and user management.\n\nYou can use browser clients or Socket.IO tools to interact with these events.\n\n---\n`,
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const adminDocument = SwaggerModule.createDocument(app, adminConfig, {
    include: [AdminModule, AuthModule],
  });
  SwaggerModule.setup('/api/docs/admin', app, adminDocument);
}

async function bootstrap() {
  // Ensure logs directory exists
  if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
  }
  const app = await NestFactory.create(AppModule, {
    logger: false, // Disable Nest's default logger
  });
  // Global logger middleware
  app.use((req, res, next) => {
    res.on('finish', () => {
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode}`);
    });
    next();
  });

  // Enable CORS for all origins (for development/testing)
  app.enableCors({
    origin: true, // or use '*' for all origins
    credentials: true,
  });

  // Setup Swagger
  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
