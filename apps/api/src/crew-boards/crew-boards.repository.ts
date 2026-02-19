import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service.js";

@Injectable()
export class CrewBoardsRepository {
  constructor(private readonly db: DatabaseService) {}

  // ============ Boards ============

  async createBoard(crewId: string, data: { name: string; type?: string; writePermission?: string; sortOrder?: number }) {
    return this.db.prisma.crewBoard.create({
      data: { crewId, ...data },
    });
  }

  async findBoards(crewId: string) {
    return this.db.prisma.crewBoard.findMany({
      where: { crewId },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { posts: { where: { deletedAt: null } } } } },
    });
  }

  async findBoardById(boardId: string) {
    return this.db.prisma.crewBoard.findUnique({ where: { id: boardId } });
  }

  async updateBoard(boardId: string, data: { name?: string; writePermission?: string; sortOrder?: number }) {
    return this.db.prisma.crewBoard.update({ where: { id: boardId }, data });
  }

  async deleteBoard(boardId: string) {
    return this.db.prisma.crewBoard.delete({ where: { id: boardId } });
  }

  // ============ Posts ============

  async createPost(boardId: string, authorId: string, data: { title: string; content: string; images?: string[] }) {
    return this.db.prisma.crewBoardPost.create({
      data: {
        boardId,
        authorId,
        title: data.title,
        content: data.content,
        ...(data.images?.length && {
          images: {
            create: data.images.map((url, i) => ({ url, order: i })),
          },
        }),
      },
      include: {
        author: { select: { id: true, name: true, profileImage: true } },
        images: { orderBy: { order: "asc" } },
        _count: { select: { comments: { where: { deletedAt: null } }, likes: true } },
      },
    });
  }

  async findPosts(boardId: string, opts?: { cursor?: string; limit?: number }) {
    const limit = opts?.limit ?? 20;
    return this.db.prisma.crewBoardPost.findMany({
      where: { boardId, deletedAt: null },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: limit + 1,
      ...(opts?.cursor && { skip: 1, cursor: { id: opts.cursor } }),
      include: {
        author: { select: { id: true, name: true, profileImage: true } },
        images: { orderBy: { order: "asc" }, take: 1 },
        _count: { select: { comments: { where: { deletedAt: null } }, likes: true } },
      },
    });
  }

  async findPostById(postId: string) {
    return this.db.prisma.crewBoardPost.findFirst({
      where: { id: postId, deletedAt: null },
      include: {
        author: { select: { id: true, name: true, profileImage: true } },
        images: { orderBy: { order: "asc" } },
        comments: {
          where: { deletedAt: null, parentId: null },
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, name: true, profileImage: true } },
            replies: {
              where: { deletedAt: null },
              orderBy: { createdAt: "asc" },
              include: {
                author: { select: { id: true, name: true, profileImage: true } },
              },
            },
          },
        },
        _count: { select: { comments: { where: { deletedAt: null } }, likes: true } },
      },
    });
  }

  async updatePost(postId: string, data: { title?: string; content?: string }) {
    return this.db.prisma.crewBoardPost.update({ where: { id: postId }, data });
  }

  async deletePost(postId: string) {
    return this.db.prisma.crewBoardPost.update({
      where: { id: postId },
      data: { deletedAt: new Date() },
    });
  }

  async togglePin(postId: string, isPinned: boolean) {
    return this.db.prisma.crewBoardPost.update({
      where: { id: postId },
      data: { isPinned },
    });
  }

  // ============ Comments ============

  async createComment(postId: string, authorId: string, content: string, parentId?: string) {
    return this.db.prisma.crewBoardComment.create({
      data: { postId, authorId, content, parentId },
      include: {
        author: { select: { id: true, name: true, profileImage: true } },
      },
    });
  }

  async findCommentById(commentId: string) {
    return this.db.prisma.crewBoardComment.findUnique({ where: { id: commentId } });
  }

  async deleteComment(commentId: string) {
    return this.db.prisma.crewBoardComment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });
  }

  // ============ Likes ============

  async toggleLike(postId: string, userId: string): Promise<{ liked: boolean }> {
    const existing = await this.db.prisma.crewBoardPostLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });
    if (existing) {
      await this.db.prisma.crewBoardPostLike.delete({ where: { id: existing.id } });
      return { liked: false };
    }
    await this.db.prisma.crewBoardPostLike.create({ data: { postId, userId } });
    return { liked: true };
  }

  async isLiked(postId: string, userId: string): Promise<boolean> {
    const like = await this.db.prisma.crewBoardPostLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });
    return !!like;
  }
}
