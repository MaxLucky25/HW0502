import { FindPostByIdDto } from '../../api/input-dto/post.domain.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../infrastructure/postRepository';

export class DeletePostCommand {
  constructor(public readonly id: FindPostByIdDto) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase
  implements ICommandHandler<DeletePostCommand, void>
{
  constructor(private postRepository: PostRepository) {}

  async execute(command: DeletePostCommand): Promise<void> {
    // Удаляем пост (включает проверку существования)
    await this.postRepository.deletePost(command.id.id);
  }
}
