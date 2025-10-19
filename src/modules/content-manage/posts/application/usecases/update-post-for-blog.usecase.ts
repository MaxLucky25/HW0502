import { UpdatePostForBlogInputDto } from '../../api/input-dto/update-post-for-blog.input.dto';
import { FindPostByIdDto } from '../../api/input-dto/post.domain.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../infrastructure/postRepository';

export class UpdatePostForBlogCommand {
  constructor(
    public readonly id: FindPostByIdDto,
    public readonly blogId: string,
    public readonly dto: UpdatePostForBlogInputDto,
  ) {}
}

@CommandHandler(UpdatePostForBlogCommand)
export class UpdatePostForBlogUseCase
  implements ICommandHandler<UpdatePostForBlogCommand, void>
{
  constructor(private postRepository: PostRepository) {}

  async execute(command: UpdatePostForBlogCommand): Promise<void> {
    // Проверяем, что пост существует
    await this.postRepository.findOrNotFoundFail(command.id);

    // Обновляем пост через новый метод репозитория
    await this.postRepository.updatePost(command.id.id, {
      title: command.dto.title,
      shortDescription: command.dto.shortDescription,
      content: command.dto.content,
      blogId: command.blogId,
    });
  }
}
