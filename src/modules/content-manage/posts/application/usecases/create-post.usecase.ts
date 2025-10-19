import { CreatePostInputDto } from '../../api/input-dto/create-post.input.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../infrastructure/postRepository';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { BlogRepository } from '../../../blogs/infrastructure/blog.repository';
import { ExtendedLikesInfoViewDto } from '../../api/view-dto/likesPost/extended-likes-info.view-dto';

export class CreatePostCommand {
  constructor(
    public readonly dto: CreatePostInputDto,
    public readonly userId?: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase
  implements ICommandHandler<CreatePostCommand, PostViewDto>
{
  constructor(
    private postRepository: PostRepository,
    private blogRepository: BlogRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<PostViewDto> {
    await this.blogRepository.findOrNotFoundFail({
      id: command.dto.blogId,
    });

    const post = await this.postRepository.createPost({
      title: command.dto.title,
      shortDescription: command.dto.shortDescription,
      content: command.dto.content,
      blogId: command.dto.blogId,
    });

    // Заглушка для лайков (пока не реализуем)
    const extendedLikesInfo: ExtendedLikesInfoViewDto = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None' as any,
      newestLikes: [],
    };

    return PostViewDto.mapToView(post, extendedLikesInfo);
  }
}
