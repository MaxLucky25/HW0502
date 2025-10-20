import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../../core/database/database.service';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { RawPostRow } from '../../../../../core/database/types/sql.types';
import { ExtendedLikesInfoViewDto } from '../../api/view-dto/likesPost/extended-likes-info.view-dto';
import { LikeStatus } from '../../domain/dto/likesPost/like-status.enum';
import { POST_SORT_FIELD_MAP } from '../../api/input-dto/post-sort-by';

@Injectable()
export class PostQueryRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getByIdNotFoundFail(id: string, userId?: string): Promise<PostViewDto> {
    const query = `
      SELECT p.*, b.name as blog_name
      FROM posts p
      JOIN blogs b ON p.blog_id = b.id
      WHERE p.id = $1 AND p.deleted_at IS NULL AND b.deleted_at IS NULL 
    `;
    const result = await this.databaseService.query<
      RawPostRow & { blog_name: string }
    >(query, [id]);

    if (result.rows.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
        field: 'Post',
      });
    }

    // Заглушка для лайков (пока не реализуем)
    const extendedLikesInfo = this.getEmptyLikesInfo();

    return PostViewDto.mapToView(result.rows[0], extendedLikesInfo);
  }

  async getAllPost(
    query: GetPostsQueryParams,
    userId?: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const searchTitleTerm = query.searchTitleTerm || null;

    // Маппинг полей для PostgreSQL
    const orderBy = POST_SORT_FIELD_MAP[query.sortBy];
    const direction = query.sortDirection.toUpperCase();

    const limit = query.pageSize;
    const offset = query.calculateSkip();

    // Строим WHERE условия динамически
    let whereConditions = 'WHERE p.deleted_at IS NULL AND b.deleted_at IS NULL';
    const queryParams: (string | number)[] = [];
    let paramIndex = 1;

    if (searchTitleTerm) {
      whereConditions += ` AND p.title ILIKE $${paramIndex}`;
      queryParams.push(`%${searchTitleTerm}%`);
      paramIndex++;
    }

    const postsQuery = `
      SELECT p.*, b.name as blog_name
      FROM posts p
      JOIN blogs b ON p.blog_id = b.id
      ${whereConditions}
      ORDER BY ${orderBy} ${direction}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*)
      FROM posts p
      JOIN blogs b ON p.blog_id = b.id
      ${whereConditions}
    `;

    // Добавляем limit и offset к параметрам для postsQuery
    const postsQueryParams = [...queryParams, limit, offset];

    try {
      const [postsResult, countResult] = await Promise.all([
        this.databaseService.query<RawPostRow & { blog_name: string }>(
          postsQuery,
          postsQueryParams,
        ),
        this.databaseService.query<{ count: string }>(countQuery, queryParams),
      ]);

      const totalCount = parseInt(countResult.rows[0].count);

      // Заглушка для лайков (пока не реализуем)
      const items = postsResult.rows.map((post) => {
        const extendedLikesInfo = this.getEmptyLikesInfo();
        return PostViewDto.mapToView(post, extendedLikesInfo);
      });

      return PaginatedViewDto.mapToView({
        items,
        totalCount,
        page: query.pageNumber,
        size: query.pageSize,
      });
    } catch (error) {
      throw error;
    }
  }

  async getAllPostForBlog(
    blogId: string,
    query: GetPostsQueryParams,
    userId?: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const searchTitleTerm = query.searchTitleTerm || null;

    // Маппинг полей для PostgreSQL
    const orderBy = POST_SORT_FIELD_MAP[query.sortBy];
    const direction = query.sortDirection.toUpperCase();

    const limit = query.pageSize;
    const offset = query.calculateSkip();

    // Строим WHERE условия динамически
    let whereConditions =
      'WHERE p.deleted_at IS NULL AND b.deleted_at IS NULL AND p.blog_id = $1';
    const queryParams: (string | number)[] = [blogId];
    let paramIndex = 2;

    if (searchTitleTerm) {
      whereConditions += ` AND p.title ILIKE $${paramIndex}`;
      queryParams.push(`%${searchTitleTerm}%`);
      paramIndex++;
    }

    const postsQuery = `
      SELECT p.*, b.name as blog_name
      FROM posts p
      JOIN blogs b ON p.blog_id = b.id
      ${whereConditions}
      ORDER BY ${orderBy} ${direction}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*)
      FROM posts p
      JOIN blogs b ON p.blog_id = b.id
      ${whereConditions}
    `;

    // Добавляем limit и offset к параметрам для postsQuery
    const postsQueryParams = [...queryParams, limit, offset];

    const [postsResult, countResult] = await Promise.all([
      this.databaseService.query<RawPostRow & { blog_name: string }>(
        postsQuery,
        postsQueryParams,
      ),
      this.databaseService.query<{ count: string }>(countQuery, queryParams),
    ]);

    const totalCount = parseInt(countResult.rows[0].count);

    // Заглушка для лайков (пока не реализуем)
    const items = postsResult.rows.map((post) => {
      const extendedLikesInfo = this.getEmptyLikesInfo();
      return PostViewDto.mapToView(post, extendedLikesInfo);
    });

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  private getEmptyLikesInfo(): ExtendedLikesInfoViewDto {
    return {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
      newestLikes: [],
    };
  }
}
