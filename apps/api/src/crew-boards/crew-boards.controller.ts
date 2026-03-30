import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { CursorLimitQueryDto } from "../common/dto/cursor-limit-query.dto.js";

import { CreateBoardDto } from "./dto/create-board.dto.js";
import { CreateBoardCommentDto } from "./dto/create-board-comment.dto.js";
import { CreateBoardPostDto } from "./dto/create-board-post.dto.js";
import { UpdateBoardDto } from "./dto/update-board.dto.js";
import { UpdateBoardPostDto } from "./dto/update-board-post.dto.js";
import { CrewBoardsService } from "./crew-boards.service.js";

@ApiTags("Crew Boards")
@Controller("crews")
export class CrewBoardsController {
  constructor(private readonly service: CrewBoardsService) {}

  @Post(":id/boards")
  createBoard(@Param("id") id: string, @Req() req: Request, @Body() dto: CreateBoardDto) {
    const { userId } = req.user as { userId: string };
    return this.service.createBoard(id, userId, dto);
  }

  @Get(":id/boards")
  getBoards(@Param("id") id: string) {
    return this.service.getBoards(id);
  }

  @Patch(":id/boards/:boardId")
  updateBoard(
    @Param("id") id: string,
    @Param("boardId") boardId: string,
    @Req() req: Request,
    @Body() dto: UpdateBoardDto,
  ) {
    const { userId } = req.user as { userId: string };
    return this.service.updateBoard(id, boardId, userId, dto);
  }

  @Delete(":id/boards/:boardId")
  deleteBoard(@Param("id") id: string, @Param("boardId") boardId: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.service.deleteBoard(id, boardId, userId);
  }

  @Post(":id/boards/:boardId/posts")
  createPost(
    @Param("id") id: string,
    @Param("boardId") boardId: string,
    @Req() req: Request,
    @Body() dto: CreateBoardPostDto,
  ) {
    const { userId } = req.user as { userId: string };
    return this.service.createPost(id, boardId, userId, dto);
  }

  @Get(":id/boards/:boardId/posts")
  getPosts(
    @Param("id") id: string,
    @Param("boardId") boardId: string,
    @Query() query: CursorLimitQueryDto,
  ) {
    return this.service.getPosts(id, boardId, {
      cursor: query.cursor,
      limit: query.resolveOptionalLimit(),
    });
  }

  @Get(":id/boards/:boardId/posts/:postId")
  getPost(
    @Param("id") id: string,
    @Param("boardId") boardId: string,
    @Param("postId") postId: string,
    @Req() req: Request,
  ) {
    const user = req.user as { userId: string } | undefined;
    return this.service.getPost(id, boardId, postId, user?.userId);
  }

  @Patch(":id/boards/:boardId/posts/:postId")
  updatePost(
    @Param("id") id: string,
    @Param("boardId") boardId: string,
    @Param("postId") postId: string,
    @Req() req: Request,
    @Body() dto: UpdateBoardPostDto,
  ) {
    const { userId } = req.user as { userId: string };
    return this.service.updatePost(id, boardId, postId, userId, dto);
  }

  @Delete(":id/boards/:boardId/posts/:postId")
  deletePost(
    @Param("id") id: string,
    @Param("boardId") boardId: string,
    @Param("postId") postId: string,
    @Req() req: Request,
  ) {
    const { userId } = req.user as { userId: string };
    return this.service.deletePost(id, boardId, postId, userId);
  }

  @Patch(":id/boards/:boardId/posts/:postId/pin")
  togglePin(
    @Param("id") id: string,
    @Param("boardId") boardId: string,
    @Param("postId") postId: string,
    @Req() req: Request,
  ) {
    const { userId } = req.user as { userId: string };
    return this.service.togglePin(id, boardId, postId, userId);
  }

  @Post(":id/boards/:boardId/posts/:postId/comments")
  createComment(
    @Param("id") id: string,
    @Param("postId") postId: string,
    @Req() req: Request,
    @Body() dto: CreateBoardCommentDto,
  ) {
    const { userId } = req.user as { userId: string };
    return this.service.createComment(id, postId, userId, dto.content, dto.parentId);
  }

  @Delete(":id/boards/:boardId/posts/:postId/comments/:commentId")
  deleteComment(
    @Param("id") id: string,
    @Param("commentId") commentId: string,
    @Req() req: Request,
  ) {
    const { userId } = req.user as { userId: string };
    return this.service.deleteComment(id, commentId, userId);
  }

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
