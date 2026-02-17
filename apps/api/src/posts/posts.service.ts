import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PostRepository } from "./repositories/post.repository.js";
import { BlockRepository } from "../block/repositories/block.repository.js";
import type { CreatePostDto } from "./dto/create-post.dto.js";
import type { UpdatePostDto } from "./dto/update-post.dto.js";

@Injectable()
export class PostsService {
  constructor(
    private readonly postRepo: PostRepository,
    private readonly blockRepo: BlockRepository,
  ) {}

  extractHashtags(content: string | null | undefined): string[] {
    if (!content) return [];
    const matches = content.match(/#[\w가-힣]+/g) || [];
    const tags = matches.map((tag) => tag.slice(1));
    return [...new Set(tags)];
  }

  async create(userId: string, dto: CreatePostDto) {
    const hashtags = dto.hashtags?.length
      ? dto.hashtags
      : this.extractHashtags(dto.content ?? null);

    const postData = {
      userId,
      content: dto.content || null,
      visibility: dto.visibility || "FOLLOWERS",
      hashtags,
    };

    return this.postRepo.createWithRelations(
      postData,
      dto.workoutIds,
      dto.imageUrls,
    );
  }

  async findById(id: string, currentUserId?: string) {
    const post = await this.postRepo.findById(id);
    if (post && currentUserId && post.userId !== currentUserId) {
      const blocked = await this.blockRepo.isBlocked(currentUserId, post.userId);
      if (blocked) {
        throw new ForbiddenException("차단된 사용자의 게시글입니다.");
      }
    }
    return post;
  }

  async findByUser(userId: string, currentUserId?: string, cursor?: string, limit?: number) {
    if (currentUserId && userId !== currentUserId) {
      const blocked = await this.blockRepo.isBlocked(currentUserId, userId);
      if (blocked) {
        throw new ForbiddenException("차단된 사용자입니다.");
      }
    }
    return this.postRepo.findByUser(userId, { cursor, limit });
  }

  async update(id: string, dto: UpdatePostDto) {
    return this.postRepo.update(id, dto);
  }

  async findByHashtag(tag: string, currentUserId: string, cursor?: string, limit?: number) {
    const blockedUserIds = await this.blockRepo.getBlockedUserIds(currentUserId);
    return this.postRepo.findByHashtag(tag, { blockedUserIds, cursor, limit });
  }

  async getPopularHashtags(limit = 20) {
    return this.postRepo.getPopularHashtags(limit);
  }

  async softDelete(id: string, userId: string) {
    const post = await this.postRepo.findById(id);
    if (!post) {
      throw new NotFoundException("게시글을 찾을 수 없습니다.");
    }
    if (post.userId !== userId) {
      throw new ForbiddenException("본인의 게시글만 삭제할 수 있습니다.");
    }
    return this.postRepo.softDelete(id);
  }
}
