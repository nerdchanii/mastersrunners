import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { CreatePostDto } from "./dto/create-post.dto.js";
import { UpdatePostDto } from "./dto/update-post.dto.js";
import { PostsService } from "./posts.service.js";

@ApiTags("Posts")
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
    @Query("userId") targetUserId?: string,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
  ) {
    const { userId } = req.user as { userId: string };
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    const viewerUserId = userId;
    const resolvedUserId = targetUserId || viewerUserId;
    return this.postsService.findByUser(resolvedUserId, viewerUserId, cursor, parsedLimit);
  }

  @Get("hashtags/popular")
  getPopularHashtags(@Query("limit") limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.postsService.getPopularHashtags(parsedLimit);
  }

  @Get("hashtag/:tag")
  findByHashtag(
    @Param("tag") tag: string,
    @Req() req: Request,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
  ) {
    const { userId } = req.user as { userId: string };
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.postsService.findByHashtag(tag, userId, cursor, parsedLimit);
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
