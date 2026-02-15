import { Module } from "@nestjs/common";
import { PostSocialController } from "./post-social.controller.js";
import { PostSocialService } from "./post-social.service.js";
import { PostSocialRepository } from "./repositories/post-social.repository.js";

@Module({
  controllers: [PostSocialController],
  providers: [PostSocialService, PostSocialRepository],
  exports: [PostSocialRepository],
})
export class PostSocialModule {}
