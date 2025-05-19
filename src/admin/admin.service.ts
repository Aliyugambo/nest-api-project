import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async addAdmin(createUserDto: CreateAdminDto) {
    const existingUser = await this.userRepo.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const verificationToken = randomBytes(20).toString('hex');
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 72); // 72 hours from now

    const admin = this.userRepo.create({
      ...createUserDto,
      password: hashedPassword,
      role: UserRole.ADMIN,
      verificationToken,
      verificationTokenExpiry: expirationDate,
    });

    await this.userRepo.save(admin);

    // Send verification email
    await this.sendVerificationEmail(admin.email, verificationToken);

    return { message: 'Admin added successfully. Verification email sent.' };
  }

  async sendVerificationEmail(email: string, token: string) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.mailersend.net',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'MS_0XPI6e@test-y7zpl9886z545vx6.mlsender.net', // Replace with your MailSend username
        pass: 'mssp.qSL4GgL.vywj2lpkonjg7oqz.rXTxXtJ', // Replace with your MailSend password
      },
    });

    const verifyUrl = `http://localhost:3000/auth/verify-email?token=${token}`;

    await transporter.sendMail({
      from: 'no-reply@test-y7zpl9886z545vx6.mlsender.net', // Replace with a valid sender email
      to: email,
      subject: 'Verify your Admin account email',
      html: `<p>Click to verify your email: <a href="${verifyUrl}">${verifyUrl}</a></p>`,
    });
  }
}
