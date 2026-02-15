import { Module } from "@nestjs/common";
import { PostsController } from "./posts.controller.js";
import { PostsService } from "./posts.service.js";
import { PostRepository } from "./repositories/post.repository.js";
import { BlockModule } from "../block/block.module.js";

@Module({
  imports: [BlockModule],
  controllers: [PostsController],
  providers: [PostsService, PostRepository],
  exports: [PostRepository],
})
export class PostsModule {}
