import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface CreateProfileData {
  email: string;
  avatar?: string;
  about?: string;
  birthDate?: Date;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
  ) { }

  async getProfile(userId: number): Promise<Profile | null> {
    return this.profileRepository.findOne({ where: { id: userId } });
  }

  async createProfile(data: CreateProfileData): Promise<Profile> {
    const newProfile = this.profileRepository.create(data);
    const savedProfile = await this.profileRepository.save(newProfile);
    return savedProfile;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<Profile | null> {
    await this.profileRepository.update(userId, dto);
    return this.getProfile(userId);
  }

  async updateAvatar(userId: number, filename: string): Promise<Profile | null> {
    await this.profileRepository.update(userId, { avatar: filename });
    return this.getProfile(userId);
  }
}
