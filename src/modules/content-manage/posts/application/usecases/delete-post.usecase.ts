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
    // Проверяем, что пост существует
    await this.postRepository.findOrNotFoundFail(command.id);

    // Удаляем пост через новый метод репозитория
    await this.postRepository.deletePost(command.id.id);
  }
}
