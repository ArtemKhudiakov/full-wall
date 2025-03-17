import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Profile } from '../profile/profile.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) { }

  async getPosts(limit = 5, offset = 0, sort = 'DESC', userId?: number): Promise<Post[]> {
    const queryOptions: any = {
      order: { createdAt: sort as 'ASC' | 'DESC' },
      take: limit,
      skip: offset,
      relations: ['author'],
    };

    if (userId) {
      queryOptions.where = { author: { id: userId } };
    }

    return this.postsRepository.find(queryOptions);
  }

  async createPost(author: Profile, dto: CreatePostDto, images: string[]): Promise<Post> {
    const post = this.postsRepository.create({
      text: dto.text,
      images,
      author,
    });
    return this.postsRepository.save(post);
  }

  async updatePost(id: number, dto: UpdatePostDto, images?: string[]): Promise<Post> {
    const post = await this.postsRepository.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Пост не найден');
    if (dto.text !== undefined) post.text = dto.text;
    if (images !== undefined) post.images = images;
    return this.postsRepository.save(post);
  }

  async deletePost(id: number): Promise<void> {
    await this.postsRepository.delete(id);
  }
}
