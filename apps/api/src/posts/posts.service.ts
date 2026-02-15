import { Injectable } from "@nestjs/common";
import { PostRepository } from "./repositories/post.repository.js";
import type { CreatePostDto } from "./dto/create-post.dto.js";
import type { UpdatePostDto } from "./dto/update-post.dto.js";

@Injectable()
export class PostsService {
  constructor(private readonly postRepo: PostRepository) {}

  async create(userId: string, dto: CreatePostDto) {
    const postData = {
      userId,
      content: dto.content || null,
      visibility: dto.visibility || "FOLLOWERS",
      hashtags: dto.hashtags || [],
    };

    return this.postRepo.createWithRelations(
      postData,
      dto.workoutIds,
      dto.imageUrls,
    );
  }

  async findById(id: string) {
    return this.postRepo.findById(id);
  }

  async findByUser(userId: string, cursor?: string, limit?: number) {
    return this.postRepo.findByUser(userId, { cursor, limit });
  }

  async update(id: string, dto: UpdatePostDto) {
    return this.postRepo.update(id, dto);
  }

  async softDelete(id: string, userId: string) {
    const post = await this.postRepo.findById(id);
    if (!post) {
      throw new Error("게시글을 찾을 수 없습니다.");
    }
    if (post.userId !== userId) {
      throw new Error("본인의 게시글만 삭제할 수 있습니다.");
    }
    return this.postRepo.softDelete(id);
  }
}
