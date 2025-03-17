import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../profile/profile.entity';
import { LoginDto } from './dto/auth.dto';
import { RegisterDto } from './dto/auth.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
  ) { }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  private checkPassword(password: string, hashedPassword: string): boolean {
    const hash = this.hashPassword(password);
    return hash === hashedPassword;
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.profileRepository.findOne({
      where: { email: registerDto.email }
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hashedPassword = this.hashPassword(registerDto.password);

    const newUser = this.profileRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      avatar: '',
      about: '',
      birthDate: new Date(1, 1, 1900),
      phone: '',
      firstName: '',
      lastName: '',
    });

    const savedUser = await this.profileRepository.save(newUser);

    const payload = { id: savedUser.id, sub: savedUser.id };

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        avatar: savedUser.avatar,
        about: savedUser.about,
        birthDate: savedUser.birthDate,
        phone: savedUser.phone,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName
      },
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' })
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.profileRepository.findOne({
      where: { email: loginDto.email }
    });

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = this.checkPassword(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const payload = { id: user.id, sub: user.id };

    return {
      user: {
        id: user.id,
        email: user.email,
        avatar: user.avatar,
        about: user.about,
        birthDate: user.birthDate,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName
      },
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' })
    };
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      return null;
    }
  }
}
