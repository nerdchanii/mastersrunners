import { Controller, Get, Post, Patch, Delete, Param, Body, Req, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { CrewBoardsService } from "./crew-boards.service.js";

@ApiTags("Crew Boards")
@Controller("crews")
export class CrewBoardsController {
  constructor(private readonly service: CrewBoardsService) {}

  // ============ Boards ============

  @Post(":id/boards")
  createBoard(@Param("id") id: string, @Req() req: Request, @Body() body: { name: string; type?: string; writePermission?: string }) {
    const { userId } = req.user as { userId: string };
    return this.service.createBoard(id, userId, body);
  }

  @Get(":id/boards")
  getBoards(@Param("id") id: string) {
    return this.service.getBoards(id);
  }

  @Patch(":id/boards/:boardId")
  updateBoard(@Param("id") id: string, @Param("boardId") boardId: string, @Req() req: Request, @Body() body: { name?: string; writePermission?: string; sortOrder?: number }) {
    const { userId } = req.user as { userId: string };
    return this.service.updateBoard(id, boardId, userId, body);
  }

  @Delete(":id/boards/:boardId")
  deleteBoard(@Param("id") id: string, @Param("boardId") boardId: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.service.deleteBoard(id, boardId, userId);
  }

  // ============ Posts ============

  @Post(":id/boards/:boardId/posts")
  createPost(@Param("id") id: string, @Param("boardId") boardId: string, @Req() req: Request, @Body() body: { title: string; content: string; images?: string[] }) {
    const { userId } = req.user as { userId: string };
    return this.service.createPost(id, boardId, userId, body);
  }

  @Get(":id/boards/:boardId/posts")
  getPosts(@Param("id") id: string, @Param("boardId") boardId: string, @Query("cursor") cursor?: string, @Query("limit") limit?: string) {
    return this.service.getPosts(id, boardId, { cursor, limit: limit ? parseInt(limit, 10) : undefined });
  }

  @Get(":id/boards/:boardId/posts/:postId")
  getPost(@Param("id") id: string, @Param("boardId") boardId: string, @Param("postId") postId: string, @Req() req: Request) {
    const user = req.user as { userId: string } | undefined;
    return this.service.getPost(id, boardId, postId, user?.userId);
  }

  @Patch(":id/boards/:boardId/posts/:postId")
  updatePost(@Param("id") id: string, @Param("boardId") boardId: string, @Param("postId") postId: string, @Req() req: Request, @Body() body: { title?: string; content?: string }) {
    const { userId } = req.user as { userId: string };
    return this.service.updatePost(id, boardId, postId, userId, body);
  }

  @Delete(":id/boards/:boardId/posts/:postId")
  deletePost(@Param("id") id: string, @Param("boardId") boardId: string, @Param("postId") postId: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.service.deletePost(id, boardId, postId, userId);
  }

  @Patch(":id/boards/:boardId/posts/:postId/pin")
  togglePin(@Param("id") id: string, @Param("boardId") boardId: string, @Param("postId") postId: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.service.togglePin(id, boardId, postId, userId);
  }

  // ============ Comments ============

  @Post(":id/boards/:boardId/posts/:postId/comments")
  createComment(@Param("id") id: string, @Param("postId") postId: string, @Req() req: Request, @Body() body: { content: string; parentId?: string }) {
    const { userId } = req.user as { userId: string };
    return this.service.createComment(id, postId, userId, body.content, body.parentId);
  }

  @Delete(":id/boards/:boardId/posts/:postId/comments/:commentId")
  deleteComment(@Param("id") id: string, @Param("commentId") commentId: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.service.deleteComment(id, commentId, userId);
  }

  // ============ Likes ============

  @Post(":id/boards/:boardId/posts/:postId/like")
  like(@Param("id") id: string, @Param("postId") postId: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.service.toggleLike(id, postId, userId);
  }

  @Delete(":id/boards/:boardId/posts/:postId/like")
  unlike(@Param("id") id: string, @Param("postId") postId: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.service.toggleLike(id, postId, userId);
  }
}
