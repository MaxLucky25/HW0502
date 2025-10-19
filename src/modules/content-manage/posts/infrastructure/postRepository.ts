import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../core/database/database.service';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import {
  CreatePostDomainDto,
  FindPostByIdDto,
} from '../api/input-dto/post.domain.dto';
import { RawPostRow } from '../../../../core/database/types/sql.types';
import { randomUUID } from 'crypto';

@Injectable()
export class PostRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(dto: FindPostByIdDto): Promise<RawPostRow | null> {
    const query = `
      SELECT * FROM posts 
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const result = await this.databaseService.query<RawPostRow>(query, [
      dto.id,
    ]);
    return result.rows[0] || null;
  }

  async findOrNotFoundFail(id: FindPostByIdDto): Promise<RawPostRow> {
    const post = await this.findById(id);
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
        field: 'Post',
      });
    }

    return post;
  }

  async createPost(dto: CreatePostDomainDto): Promise<RawPostRow> {
    const postId = randomUUID();
    const query = `
      INSERT INTO posts (
        id, title, short_description, content, blog_id,
        created_at, deleted_at
      ) VALUES (
        $1, $2, $3, $4, $5, NOW(), $6
      )
      RETURNING *
    `;
    const result = await this.databaseService.query<RawPostRow>(query, [
      postId,
      dto.title,
      dto.shortDescription,
      dto.content,
      dto.blogId,
      null, // deleted_at
    ]);
    return result.rows[0];
  }

  async updatePost(id: string, dto: CreatePostDomainDto): Promise<RawPostRow> {
    const query = `
      UPDATE posts 
      SET title = $2, short_description = $3, content = $4, blog_id = $5
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await this.databaseService.query<RawPostRow>(query, [
      id,
      dto.title,
      dto.shortDescription,
      dto.content,
      dto.blogId,
    ]);
    return result.rows[0];
  }

  async deletePost(id: string): Promise<RawPostRow> {
    const query = `
      UPDATE posts 
      SET deleted_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await this.databaseService.query<RawPostRow>(query, [id]);
    return result.rows[0];
  }
}
