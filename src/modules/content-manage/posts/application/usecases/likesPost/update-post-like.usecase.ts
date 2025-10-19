// import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { Injectable } from '@nestjs/common';
// import { PostLikeRepository } from '../../../infrastructure/post-like.repository';
// import { PostRepository } from '../../../infrastructure/postRepository';
// import { LikePostInputDto } from '../../../api/input-dto/likesPost/like-post.input.dto';
// import { LikeStatus } from '../../../domain/dto/likesPost/like-status.enum';
// import { UsersRepository } from '../../../../../auth-manage/user-accounts/infrastructure/user.repository';
//
// export class UpdatePostLikeCommand {
//   constructor(
//     public readonly postId: string,
//     public readonly userId: string,
//     public readonly dto: LikePostInputDto,
//   ) {}
// }
//
// /**
//  * Use case для обновления лайка поста
//  * Обрабатывает все операции: лайк, дизлайк, удаление лайка
//  */
// @CommandHandler(UpdatePostLikeCommand)
// @Injectable()
// export class UpdatePostLikeUseCase
//   implements ICommandHandler<UpdatePostLikeCommand, void>
// {
//   constructor(
//     private postLikeRepository: PostLikeRepository,
//     private userRepository: UsersRepository,
//     private postRepository: PostRepository,
//   ) {}
//
//   async execute(command: UpdatePostLikeCommand): Promise<void> {
//     const { postId, userId, dto } = command;
//
//     // Валидация: проверяем существование поста
//     await this.postRepository.findOrNotFoundFail({ id: postId });
//
//     if (dto.likeStatus === LikeStatus.None) {
//       await this.removeUserReaction(postId, userId);
//       return;
//     }
//
//     // Получаем пользователя для получения login
//     const user = await this.userRepository.findOrNotFoundFail({ id: userId });
//
//     const existingReaction = await this.postLikeRepository.findUserReaction({
//       userId,
//       postId,
//     });
//
//     if (existingReaction) {
//       await this.postLikeRepository.updateReactionStatus({
//         userId,
//         postId,
//         newStatus: dto.likeStatus,
//       });
//     } else {
//       await this.postLikeRepository.createReaction({
//         userId,
//         userLogin: user.login,
//         postId,
//         status: dto.likeStatus,
//       });
//     }
//   }
//
//   /**
//    * Удаляет реакцию пользователя на пост
//    */
//   private async removeUserReaction(
//     postId: string,
//     userId: string,
//   ): Promise<void> {
//     await this.postLikeRepository.removeReaction({
//       userId,
//       postId,
//     });
//   }
// }
