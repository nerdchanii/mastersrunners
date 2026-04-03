import { Module } from "@nestjs/common";

import { BlockModule } from "../block/block.module.js";
import { FollowModule } from "../follow/follow.module.js";

import { PostRepository } from "./repositories/post.repository.js";
import { PostsController } from "./posts.controller.js";
import { PostsService } from "./posts.service.js";

@Module({
  imports: [BlockModule, FollowModule],
  controllers: [PostsController],
  providers: [PostsService, PostRepository],
  exports: [PostRepository],
})
export class PostsModule {}
