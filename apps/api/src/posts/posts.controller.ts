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

import { Public } from "../common/decorators/public.decorator.js";
import { CursorLimitQueryDto } from "../common/dto/cursor-limit-query.dto.js";
import { LimitQueryDto } from "../common/dto/limit-query.dto.js";

import { CreatePostDto } from "./dto/create-post.dto.js";
import { ListPostsQueryDto } from "./dto/list-posts-query.dto.js";
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
  findAll(@Req() req: Request, @Query() query: ListPostsQueryDto) {
    const { userId } = req.user as { userId: string };
    const viewerUserId = userId;
    const resolvedUserId = query.userId || viewerUserId;
    return this.postsService.findByUser(
      resolvedUserId,
      viewerUserId,
      query.cursor,
      query.resolveOptionalLimit(),
    );
  }

  @Get("hashtags/popular")
  getPopularHashtags(@Query() query: LimitQueryDto) {
    return this.postsService.getPopularHashtags(query.resolveOptionalLimit());
  }

  @Get("hashtag/:tag")
  findByHashtag(
    @Param("tag") tag: string,
    @Req() req: Request,
    @Query() query: CursorLimitQueryDto,
  ) {
    const { userId } = req.user as { userId: string };
    return this.postsService.findByHashtag(tag, userId, query.cursor, query.resolveOptionalLimit());
  }

  @Get(":id")
  @Public()
  async findOne(@Param("id") id: string, @Req() req: Request) {
    const userId = (req.user as { userId: string } | undefined)?.userId;
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
