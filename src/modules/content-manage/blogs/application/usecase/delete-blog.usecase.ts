import { FindByIdDto } from '../../domain/dto/blog.domain.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogRepository } from '../../infrastructure/blog.repository';

export class DeleteBlogCommand {
  constructor(public blogId: FindByIdDto) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase
  implements ICommandHandler<DeleteBlogCommand, void>
{
  constructor(private blogRepository: BlogRepository) {}
  async execute(command: DeleteBlogCommand): Promise<void> {
    const blog = await this.blogRepository.findOrNotFoundFail({
      id: command.blogId.id,
    });
    blog.makeDeleted();
    await this.blogRepository.save(blog);
  }
}
