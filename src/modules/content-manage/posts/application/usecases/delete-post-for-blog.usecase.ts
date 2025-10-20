import { FindPostByIdDto } from '../../api/input-dto/post.domain.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../infrastructure/postRepository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class DeletePostForBlogCommand {
  constructor(
    public readonly id: FindPostByIdDto,
    public readonly blogId: string,
  ) {}
}

@CommandHandler(DeletePostForBlogCommand)
export class DeletePostForBlogUseCase
  implements ICommandHandler<DeletePostForBlogCommand, void>
{
  constructor(private postRepository: PostRepository) {}

  async execute(command: DeletePostForBlogCommand): Promise<void> {
    // Проверяем, что пост существует и принадлежит указанному блогу
    const post = await this.postRepository.findById(command.id);
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
        field: 'Post',
      });
    }

    if (post.blog_id !== command.blogId) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found in this blog',
        field: 'Post',
      });
    }

    // Удаляем пост
    await this.postRepository.deletePost(command.id.id);
  }
}
