import { inject, injectable } from 'inversify';
import { CommentService } from './comment-service.interface.js';
import { Component } from '../../types/component.enum.js';
import { CommentEntity } from './comment.entity.js';
import { types } from '@typegoose/typegoose';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { DEFAULT_COMMENT_LIMIT, DEFAULT_COMMENT_MAX_LIMIT } from './comment.constant.js';

@injectable()
export class DefaultCommentService implements CommentService {
  constructor(
    @inject(Component.CommentModel)
    private readonly commentModel: types.ModelType<CommentEntity>,
  ) {}

  public async create(
    dto: CreateCommentDto,
  ): Promise<types.DocumentType<CommentEntity>> {
    const newComment = await this.commentModel.create(dto);
    return newComment.populate('author');
  }

  public async findByOfferId(
    offerId: string,
    count?: number,
  ): Promise<types.DocumentType<CommentEntity>[]> {
    const limit = count && count > DEFAULT_COMMENT_MAX_LIMIT
      ? DEFAULT_COMMENT_LIMIT
      : count ?? DEFAULT_COMMENT_LIMIT;

    return this.commentModel
      .find({ offerId })
      .limit(limit)
      .sort({ date: -1 })
      .exec();
  }

  public async deleteByOfferId(offerId: string): Promise<void> {
    await this.commentModel.deleteMany({ offerId }).exec();
  }
}
