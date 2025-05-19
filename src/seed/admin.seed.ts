// src/seed/admin.seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { User, UserRole } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepo = app.get('UserRepository') as Repository<User>;

  const adminExists = await userRepo.findOne({
    where: { email: 'agathinktwice123@gmail.com' },
  });
  if (!adminExists) {
    const admin = userRepo.create({
      name: 'AdminUser',
      firstName: 'Admin',
      lastName: 'User',
      email: 'agathinktwice123@gmail.com',
      password: await bcrypt.hash('admin123', 10),
      role: UserRole.ADMIN,
      country: 'Nigeria',
      isVerified: true,
    });
    await userRepo.save(admin);
    console.log('✅ Admin user seeded');
  }

  await app.close();
}

bootstrap();
