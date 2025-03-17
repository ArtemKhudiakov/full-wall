import { Controller, Get, Post as HttpPost, Put, Delete, Param, Query, Body, Req, UseGuards, UploadedFiles, UseInterceptors, UnauthorizedException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';

@Controller('posts')
@UseGuards(AuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @Get()
  async getPosts(
    @Query('limit') limit,
    @Query('offset') offset,
    @Query('sort') sort,
    @Query('userId') userId,
  ) {
    return this.postsService.getPosts(+limit || 5, +offset || 0, sort || 'DESC', userId ? +userId : undefined);
  }

  @HttpPost()
  @UseInterceptors(FilesInterceptor('images', 10, { dest: './uploads' }))
  async createPost(@Req() req, @Body() dto: CreatePostDto, @UploadedFiles() files) {
    const uploadedImages = files?.map(file => file.filename) || [];

    const allImages = [...(dto.existingImages || []), ...uploadedImages];

    if (!req.user) {
      throw new UnauthorizedException('Для создания поста требуется аутентификация');
    }

    return this.postsService.createPost(req.user, dto, allImages);
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor('images', 10, { dest: './uploads' }))
  async updatePost(@Req() req, @Param('id') id: number, @Body() dto: UpdatePostDto, @UploadedFiles() files) {
    if (!req.user) {
      throw new UnauthorizedException('Для обновления поста требуется аутентификация');
    }

    const uploadedImages = files?.map(file => file.filename) || [];

    const allImages = [...(dto.existingImages || []), ...uploadedImages];

    return this.postsService.updatePost(+id, dto, allImages);
  }

  @Delete(':id')
  async deletePost(@Req() req, @Param('id') id: number) {
    if (!req.user) {
      throw new UnauthorizedException('Для удаления поста требуется аутентификация');
    }

    return this.postsService.deletePost(+id);
  }
}
