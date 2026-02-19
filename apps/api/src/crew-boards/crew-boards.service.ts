import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { CrewBoardsRepository } from "./crew-boards.repository.js";
import { DatabaseService } from "../database/database.service.js";

@Injectable()
export class CrewBoardsService {
  constructor(
    private readonly repo: CrewBoardsRepository,
    private readonly db: DatabaseService,
  ) {}

  private async getMemberRole(crewId: string, userId: string): Promise<string | null> {
    const member = await this.db.prisma.crewMember.findFirst({
      where: { crewId, userId, status: "ACTIVE" },
    });
    return member?.role ?? null;
  }

  private isAdmin(role: string | null): boolean {
    return role === "OWNER" || role === "ADMIN";
  }

  // ============ Boards ============

  async createBoard(crewId: string, userId: string, data: { name: string; type?: string; writePermission?: string }) {
    const role = await this.getMemberRole(crewId, userId);
    if (!this.isAdmin(role)) throw new ForbiddenException("관리자만 채널을 생성할 수 있습니다.");

    const boards = await this.repo.findBoards(crewId);
    return this.repo.createBoard(crewId, { ...data, sortOrder: boards.length });
  }

  async getBoards(crewId: string) {
    return this.repo.findBoards(crewId);
  }

  async updateBoard(crewId: string, boardId: string, userId: string, data: { name?: string; writePermission?: string; sortOrder?: number }) {
    const role = await this.getMemberRole(crewId, userId);
    if (!this.isAdmin(role)) throw new ForbiddenException("관리자만 채널을 수정할 수 있습니다.");

    const board = await this.repo.findBoardById(boardId);
    if (!board || board.crewId !== crewId) throw new NotFoundException("채널을 찾을 수 없습니다.");

    return this.repo.updateBoard(boardId, data);
  }

  async deleteBoard(crewId: string, boardId: string, userId: string) {
    const role = await this.getMemberRole(crewId, userId);
    if (!this.isAdmin(role)) throw new ForbiddenException("관리자만 채널을 삭제할 수 있습니다.");

    const board = await this.repo.findBoardById(boardId);
    if (!board || board.crewId !== crewId) throw new NotFoundException("채널을 찾을 수 없습니다.");
    if (board.type === "ANNOUNCEMENT") throw new BadRequestException("기본 공지 채널은 삭제할 수 없습니다.");

    return this.repo.deleteBoard(boardId);
  }

  async createDefaultBoard(crewId: string) {
    return this.repo.createBoard(crewId, {
      name: "공지",
      type: "ANNOUNCEMENT",
      writePermission: "ADMIN_ONLY",
      sortOrder: 0,
    });
  }

  // ============ Posts ============

  async createPost(crewId: string, boardId: string, userId: string, data: { title: string; content: string; images?: string[] }) {
    const board = await this.repo.findBoardById(boardId);
    if (!board || board.crewId !== crewId) throw new NotFoundException("채널을 찾을 수 없습니다.");

    const role = await this.getMemberRole(crewId, userId);
    if (!role) throw new ForbiddenException("크루 멤버만 글을 작성할 수 있습니다.");
    if (board.writePermission === "ADMIN_ONLY" && !this.isAdmin(role)) {
      throw new ForbiddenException("이 채널에서는 관리자만 글을 작성할 수 있습니다.");
    }

    return this.repo.createPost(boardId, userId, data);
  }

  async getPosts(crewId: string, boardId: string, opts?: { cursor?: string; limit?: number }) {
    const board = await this.repo.findBoardById(boardId);
    if (!board || board.crewId !== crewId) throw new NotFoundException("채널을 찾을 수 없습니다.");

    const posts = await this.repo.findPosts(boardId, opts);
    const limit = opts?.limit ?? 20;
    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, limit) : posts;

    return {
      items,
      nextCursor: hasMore ? items[items.length - 1].id : null,
    };
  }

  async getPost(crewId: string, boardId: string, postId: string, userId?: string) {
    const post = await this.repo.findPostById(postId);
    if (!post || post.boardId !== boardId) throw new NotFoundException("글을 찾을 수 없습니다.");

    const board = await this.repo.findBoardById(boardId);
    if (!board || board.crewId !== crewId) throw new NotFoundException("채널을 찾을 수 없습니다.");

    const liked = userId ? await this.repo.isLiked(postId, userId) : false;

    return { ...post, liked };
  }

  async updatePost(crewId: string, boardId: string, postId: string, userId: string, data: { title?: string; content?: string }) {
    const post = await this.repo.findPostById(postId);
    if (!post || post.boardId !== boardId) throw new NotFoundException("글을 찾을 수 없습니다.");

    const role = await this.getMemberRole(crewId, userId);
    if (post.authorId !== userId && !this.isAdmin(role)) {
      throw new ForbiddenException("작성자 또는 관리자만 수정할 수 있습니다.");
    }

    return this.repo.updatePost(postId, data);
  }

  async deletePost(crewId: string, boardId: string, postId: string, userId: string) {
    const post = await this.repo.findPostById(postId);
    if (!post || post.boardId !== boardId) throw new NotFoundException("글을 찾을 수 없습니다.");

    const role = await this.getMemberRole(crewId, userId);
    if (post.authorId !== userId && !this.isAdmin(role)) {
      throw new ForbiddenException("작성자 또는 관리자만 삭제할 수 있습니다.");
    }

    return this.repo.deletePost(postId);
  }

  async togglePin(crewId: string, boardId: string, postId: string, userId: string) {
    const post = await this.repo.findPostById(postId);
    if (!post || post.boardId !== boardId) throw new NotFoundException("글을 찾을 수 없습니다.");

    const role = await this.getMemberRole(crewId, userId);
    if (!this.isAdmin(role)) throw new ForbiddenException("관리자만 고정할 수 있습니다.");

    return this.repo.togglePin(postId, !post.isPinned);
  }

  // ============ Comments ============

  async createComment(crewId: string, postId: string, userId: string, content: string, parentId?: string) {
    const role = await this.getMemberRole(crewId, userId);
    if (!role) throw new ForbiddenException("크루 멤버만 댓글을 작성할 수 있습니다.");

    if (parentId) {
      const parent = await this.repo.findCommentById(parentId);
      if (!parent || parent.postId !== postId) throw new BadRequestException("잘못된 부모 댓글입니다.");
      if (parent.parentId) throw new BadRequestException("대댓글에는 답글을 달 수 없습니다.");
    }

    return this.repo.createComment(postId, userId, content, parentId);
  }

  async deleteComment(crewId: string, commentId: string, userId: string) {
    const comment = await this.repo.findCommentById(commentId);
    if (!comment) throw new NotFoundException("댓글을 찾을 수 없습니다.");

    const role = await this.getMemberRole(crewId, userId);
    if (comment.authorId !== userId && !this.isAdmin(role)) {
      throw new ForbiddenException("작성자 또는 관리자만 삭제할 수 있습니다.");
    }

    return this.repo.deleteComment(commentId);
  }

  // ============ Likes ============

  async toggleLike(crewId: string, postId: string, userId: string) {
    const role = await this.getMemberRole(crewId, userId);
    if (!role) throw new ForbiddenException("크루 멤버만 좋아요할 수 있습니다.");

    return this.repo.toggleLike(postId, userId);
  }
}
