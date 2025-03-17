export class CreatePostDto {
  readonly text: string;
  readonly existingImages?: string[];
}
