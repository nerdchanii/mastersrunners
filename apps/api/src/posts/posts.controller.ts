import { Controller, Get, Post, Patch, Delete, Param, Body, Req, Query, ForbiddenException, NotFoundException } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import type { Request } from "express";
import { PostsService } from "./posts.service.js";
import { CreatePostDto } from "./dto/create-post.dto.js";
import { UpdatePostDto } from "./dto/update-post.dto.js";

@ApiTags("Posts")
@SkipThrottle()
@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreatePostDto) {
    const { userId } = req.user as { userId: string };
    return this.postsService.create(userId, dto);
  }

  @Get()
  findAll(
    @Req() req: Request,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
  ) {
    const { userId } = req.user as { userId: string };
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.postsService.findByUser(userId, userId, cursor, parsedLimit);
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    const post = await this.postsService.findById(id, userId);
    if (!post) throw new NotFoundException("게시글을 찾을 수 없습니다.");
    return post;
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Req() req: Request, @Body() dto: UpdatePostDto) {
    const { userId } = req.user as { userId: string };
    const post = await this.postsService.findById(id, userId);
    if (!post) throw new NotFoundException("게시글을 찾을 수 없습니다.");
    if (post.userId !== userId) throw new ForbiddenException("본인의 게시글만 수정할 수 있습니다.");
    return this.postsService.update(id, dto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.postsService.softDelete(id, userId);
  }
}
