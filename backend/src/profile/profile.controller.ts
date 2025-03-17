import { Controller, Get, Put, Post, Body, Param, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '../auth/auth.guard';

const getExtensionFromMimeType = (mimeType: string): string => {
  const mimeToExt = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/bmp': '.bmp',
  };

  return mimeToExt[mimeType] || '.jpg';
};

const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

    const extension = getExtensionFromMimeType(file.mimetype);

    const finalExtension = extension || extname(file.originalname) || '.jpg';

    callback(null, `${uniqueSuffix}${finalExtension}`);
  },
});

@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @Post()
  async createProfile(@Body() dto: CreateProfileDto) {
    try {
      const result = await this.profileService.createProfile(dto);
      return result;
    } catch (error) {
      console.error('Ошибка при создании профиля:', error);
      throw error;
    }
  }
  @Get(':id')
  async getProfile(@Param('id') id: number) {
    return this.profileService.getProfile(+id);
  }

  @Put(':id')
  async updateProfile(@Param('id') id: number, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(+id, dto);
  }

  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage,
    fileFilter: (req, file, callback) => {
      // Проверяем, что загружается изображение
      if (!file.mimetype.match(/^image\//)) {
        return callback(new Error('Можно загружать только изображения'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // Ограничение размера файла (5MB)
    }
  }))
  async updateAvatar(@Param('id') id: number, @UploadedFile() file) {
    return this.profileService.updateAvatar(+id, file.filename);
  }
}
