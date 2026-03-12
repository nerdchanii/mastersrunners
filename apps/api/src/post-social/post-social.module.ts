import { Module } from "@nestjs/common";

import { BlockModule } from "../block/block.module.js";
import { NotificationsModule } from "../notifications/notifications.module.js";

import { PostSocialRepository } from "./repositories/post-social.repository.js";
import { PostSocialController } from "./post-social.controller.js";
import { PostSocialService } from "./post-social.service.js";

@Module({
  imports: [BlockModule, NotificationsModule],
  controllers: [PostSocialController],
  providers: [PostSocialService, PostSocialRepository],
  exports: [PostSocialRepository],
})
export class PostSocialModule {}
