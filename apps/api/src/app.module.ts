import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, Reflector } from "@nestjs/core";
import {
  getOptionsToken,
  ThrottlerGuard,
  ThrottlerModule,
  type ThrottlerModuleOptions,
  ThrottlerStorage,
} from "@nestjs/throttler";

import { AuthModule } from "./auth/auth.module.js";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard.js";
import { BlockModule } from "./block/block.module.js";
import { ChallengesModule } from "./challenges/challenges.module.js";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter.js";
import { FeatureFlagGuard } from "./common/guards/feature-flag.guard.js";
import { RequestLoggingInterceptor } from "./common/logging/request-logging.interceptor.js";
import { StructuredLoggerService } from "./common/logging/structured-logger.service.js";
import { MonitoringService } from "./common/monitoring/monitoring.service.js";
import { FeatureFlagsService } from "./config/feature-flags.service.js";
import { runtimeEnvFilePaths } from "./config/load-env.js";
import { PublicConfigController } from "./config/public-config.controller.js";
import { ConversationsModule } from "./conversations/conversations.module.js";
import { CrewBoardsModule } from "./crew-boards/crew-boards.module.js";
import { CrewsModule } from "./crews/crews.module.js";
import { DatabaseModule } from "./database/database.module.js";
import { EventsModule } from "./events/events.module.js";
import { FeedModule } from "./feed/feed.module.js";
import { FollowModule } from "./follow/follow.module.js";
import { HealthModule } from "./health/health.module.js";
import { NotificationsModule } from "./notifications/notifications.module.js";
import { PostSocialModule } from "./post-social/post-social.module.js";
import { PostsModule } from "./posts/posts.module.js";
import { ProfileModule } from "./profile/profile.module.js";
import { ShoesModule } from "./shoes/shoes.module.js";
import { UploadsModule } from "./uploads/uploads.module.js";
import { WorkoutSocialModule } from "./workout-social/workout-social.module.js";
import { WorkoutTypesModule } from "./workout-types/workout-types.module.js";
import { WorkoutsModule } from "./workouts/workouts.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ...(runtimeEnvFilePaths.length ? { envFilePath: runtimeEnvFilePaths } : {}),
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
  controllers: [PublicConfigController],
  providers: [
    StructuredLoggerService,
    MonitoringService,
    FeatureFlagsService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: FeatureFlagGuard,
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
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor,
    },
  ],
})
export class AppModule {}
