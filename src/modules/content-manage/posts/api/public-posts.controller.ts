import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { PostViewDto } from './view-dto/post.view-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { GetPostByIdQuery } from '../application/query-usecases/get-post-by-id.usecase';
import { GetAllPostsQuery } from '../application/query-usecases/get-all-posts.usecase';
import { OptionalJwtAuthGuard } from '../../../auth-manage/guards/bearer/optional-jwt-auth-guard';
import { ExtractUserIdForJwtOptionalGuard } from '../../../auth-manage/guards/decorators/param/extract-user-id-for-jwt-optional-guard.decorator';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('posts')
@SkipThrottle()
@Controller('posts')
export class PublicPostsController {
  constructor(private queryBus: QueryBus) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get all posts' })
  @ApiQuery({ name: 'pageNumber', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortDirection', required: false })
  @ApiResponse({ status: 200, description: 'List of posts' })
  async getAll(
    @Query() query: GetPostsQueryParams,
    @ExtractUserIdForJwtOptionalGuard() userId?: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(new GetAllPostsQuery(query, userId));
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get post by id' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post found' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async getById(
    @Param('id') id: string,
    @ExtractUserIdForJwtOptionalGuard() userId?: string,
  ): Promise<PostViewDto> {
    return this.queryBus.execute(new GetPostByIdQuery(id, userId));
  }
}
