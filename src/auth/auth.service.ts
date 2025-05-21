// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const verificationToken = randomBytes(20).toString('hex');
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 72); // Set expiry to 72 hours from now

    const user = this.userRepo.create({
      ...dto,
      password: hashed,
      verificationToken,
      verificationTokenExpiry: expiryDate,
      role: UserRole.USER,
    });

    await this.userRepo.save(user);

    await this.sendVerificationEmail(user.email, verificationToken);
    return {
      message:
        'Signup successful. Please check your email to verify your account.',
    };
  }

  async sendVerificationEmail(email: string, token: string) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const verifyUrl = `http://localhost:3000/auth/verify-email?token=${token}`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Verify your email',
      html: `<p>Click to verify your email: <a href="${verifyUrl}">${verifyUrl}</a></p>`,
    });
  }

  async verifyEmail(token: string) {
    const user = await this.userRepo.findOne({
      where: { verificationToken: token },
    });
    if (!user) throw new BadRequestException('Invalid or expired token');

    if (user.verificationTokenExpiry < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await this.userRepo.save(user);
    return { message: 'Email successfully verified!' };
  }

  async login(dto: LoginDto) {
    console.log('Login attempt:', dto.email);
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      console.error('User not found');
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      console.error('Password mismatch');
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      console.error('Email not verified');
      throw new UnauthorizedException('Email not verified');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });
    console.log('Login successful:', payload);

    return { access_token };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new BadRequestException('User not found');

    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const verificationToken = randomBytes(20).toString('hex');
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 72); // Set expiry to 72 hours from now

    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = expiryDate;
    await this.userRepo.save(user);

    await this.sendVerificationEmail(user.email, verificationToken);
    return {
      message: 'Verification email resent. Please check your email.',
    };
  }
}
