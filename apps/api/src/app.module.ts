import { Module } from "@nestjs/common";
import { APP_FILTER, APP_GUARD, Reflector } from "@nestjs/core";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter.js";
import { ConfigModule } from "@nestjs/config";
import {
  ThrottlerModule,
  ThrottlerGuard,
  ThrottlerStorage,
  getOptionsToken,
  type ThrottlerModuleOptions,
} from "@nestjs/throttler";
import { DatabaseModule } from "./database/database.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { FeedModule } from "./feed/feed.module.js";
import { WorkoutsModule } from "./workouts/workouts.module.js";
import { ProfileModule } from "./profile/profile.module.js";
import { WorkoutTypesModule } from "./workout-types/workout-types.module.js";
import { ShoesModule } from "./shoes/shoes.module.js";
import { PostsModule } from "./posts/posts.module.js";
import { BlockModule } from "./block/block.module.js";
import { FollowModule } from "./follow/follow.module.js";
import { WorkoutSocialModule } from "./workout-social/workout-social.module.js";
import { PostSocialModule } from "./post-social/post-social.module.js";
import { CrewsModule } from "./crews/crews.module.js";
import { CrewBoardsModule } from "./crew-boards/crew-boards.module.js";
import { ChallengesModule } from "./challenges/challenges.module.js";
import { EventsModule } from "./events/events.module.js";
import { UploadsModule } from "./uploads/uploads.module.js";
import { HealthModule } from "./health/health.module.js";
import { ConversationsModule } from "./conversations/conversations.module.js";
import { NotificationsModule } from "./notifications/notifications.module.js";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard.js";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "../../.env",
    }),
    DatabaseModule,
    AuthModule,
    FeedModule,
    WorkoutsModule,
    WorkoutTypesModule,
    ShoesModule,
    PostsModule,
    BlockModule,
    FollowModule,
    WorkoutSocialModule,
    PostSocialModule,
    CrewsModule,
    CrewBoardsModule,
    ChallengesModule,
    EventsModule,
    UploadsModule,
    ProfileModule,
    HealthModule,
    ConversationsModule,
    NotificationsModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useFactory: (
        options: ThrottlerModuleOptions,
        storage: ThrottlerStorage,
        reflector: Reflector,
      ) => new ThrottlerGuard(options, storage, reflector),
      inject: [getOptionsToken(), ThrottlerStorage, Reflector],
    },
  ],
})
export class AppModule {}
