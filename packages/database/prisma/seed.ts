import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Either DIRECT_URL or DATABASE_URL must be set for Prisma seed");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const now = new Date("2026-05-06T09:00:00.000Z");

const WORKOUT_TYPE_SEEDS = [
  { category: "LONG_RUN", name: "LSD", description: "느린 장거리 달리기", sortOrder: 0 },
  { category: "LONG_RUN", name: "SUSTAINED", description: "일정 페이스 장거리", sortOrder: 1 },
  { category: "LONG_RUN", name: "TIME_BASED", description: "시간 기준 장거리", sortOrder: 2 },
  {
    category: "SPEED",
    name: "INTERVAL",
    description: "고정 거리 반복 (예: 1000m x 5)",
    sortOrder: 0,
  },
  {
    category: "SPEED",
    name: "VARIABLE_INTERVAL",
    description: "혼합 거리 반복 (예: 200/400/800/400/200)",
    sortOrder: 1,
  },
  { category: "SPEED", name: "FARTLEK", description: "비구조화 스피드 변화", sortOrder: 2 },
  { category: "THRESHOLD", name: "TEMPO_RUN", description: "LT 페이스 달리기", sortOrder: 0 },
  { category: "EASY", name: "EASY_RUN", description: "편안한 페이스 달리기", sortOrder: 0 },
  { category: "EASY", name: "RECOVERY", description: "회복 목적 저강도", sortOrder: 1 },
  { category: "EASY", name: "JOG", description: "가볍게 달리기", sortOrder: 2 },
  { category: "RACE", name: "RACE", description: "대회 레이스", sortOrder: 0 },
  { category: "TRAIL", name: "TRAIL_RUN", description: "트레일 러닝", sortOrder: 0 },
  {
    category: "CROSS_TRAINING",
    name: "CROSS_TRAINING",
    description: "러닝 외 보조 운동",
    sortOrder: 0,
  },
];

const USER_SEEDS = [
  {
    email: "dev@mastersrunners.local",
    name: "개발 테스터",
    profileImage: "https://api.dicebear.com/9.x/initials/svg?seed=MR",
    bio: "모바일 UI 캡처를 위한 개발용 계정입니다.",
    region: "서울",
    subRegion: "마포",
    pb5kSeconds: 1240,
    pb10kSeconds: 2580,
    pbHalfMarathonSeconds: 5980,
    pbMarathonSeconds: 12840,
  },
  {
    email: "minji.park@mastersrunners.local",
    name: "박민지",
    profileImage: "https://api.dicebear.com/9.x/initials/svg?seed=MJ",
    bio: "한강 조깅과 회복주를 좋아합니다.",
    region: "서울",
    subRegion: "송파",
    pb5kSeconds: 1185,
    pb10kSeconds: 2470,
    pbHalfMarathonSeconds: 5710,
    pbMarathonSeconds: 12360,
  },
  {
    email: "coach.lee@mastersrunners.local",
    name: "이준호 코치",
    profileImage: "https://api.dicebear.com/9.x/initials/svg?seed=JL",
    bio: "마스터즈 러너를 위한 주간 훈련을 설계합니다.",
    region: "서울",
    subRegion: "강남",
    pb5kSeconds: 1010,
    pb10kSeconds: 2140,
    pbHalfMarathonSeconds: 4960,
    pbMarathonSeconds: 10820,
  },
  {
    email: "trail.kim@mastersrunners.local",
    name: "김도윤",
    profileImage: "https://api.dicebear.com/9.x/initials/svg?seed=DY",
    bio: "주말에는 산으로 갑니다.",
    region: "경기",
    subRegion: "성남",
    pb5kSeconds: 1320,
    pb10kSeconds: 2760,
    pbHalfMarathonSeconds: 6400,
    pbMarathonSeconds: 13980,
  },
  {
    email: "private.runner@mastersrunners.local",
    name: "비공개 러너",
    profileImage: "https://api.dicebear.com/9.x/initials/svg?seed=PV",
    bio: "승인된 팔로워에게만 운동 기록을 공개합니다.",
    region: "인천",
    subRegion: "연수",
    isPrivate: true,
  },
];

const imageUrl = (seed: string) => `https://picsum.photos/seed/masters-${seed}/960/640`;

function kstDate(year: number, month: number, day: number, hour = 21) {
  return new Date(Date.UTC(year, month - 1, day, hour - 9, 0, 0, 0));
}

function daysAgo(days: number, hour = 21) {
  const date = kstDate(2026, 5, 6, hour);
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

function requireWorkoutTypeId(typeByName: Map<string, string>, key: string) {
  const workoutTypeId = typeByName.get(key);

  if (!workoutTypeId) {
    throw new Error(`Missing workout type seed for ${key}`);
  }

  return workoutTypeId;
}

async function seedWorkoutTypes() {
  for (const seed of WORKOUT_TYPE_SEEDS) {
    await prisma.workoutType.upsert({
      where: { category_name: { category: seed.category, name: seed.name } },
      update: { description: seed.description, sortOrder: seed.sortOrder, isActive: true },
      create: seed,
    });
  }
}

async function seedUsers() {
  const users: Record<string, { id: string }> = {};

  for (const seed of USER_SEEDS) {
    users[seed.email] = await prisma.user.upsert({
      where: { email: seed.email },
      update: {
        name: seed.name,
        profileImage: seed.profileImage,
        bio: seed.bio,
        region: seed.region,
        subRegion: seed.subRegion,
        isPrivate: seed.isPrivate ?? false,
        pb5kSeconds: seed.pb5kSeconds,
        pb10kSeconds: seed.pb10kSeconds,
        pbHalfMarathonSeconds: seed.pbHalfMarathonSeconds,
        pbMarathonSeconds: seed.pbMarathonSeconds,
        deletedAt: null,
      },
      create: {
        email: seed.email,
        name: seed.name,
        profileImage: seed.profileImage,
        bio: seed.bio,
        region: seed.region,
        subRegion: seed.subRegion,
        isPrivate: seed.isPrivate ?? false,
        pb5kSeconds: seed.pb5kSeconds,
        pb10kSeconds: seed.pb10kSeconds,
        pbHalfMarathonSeconds: seed.pbHalfMarathonSeconds,
        pbMarathonSeconds: seed.pbMarathonSeconds,
        emailVerified: now,
      },
    });
  }

  await prisma.account.upsert({
    where: { provider_providerAccountId: { provider: "dev", providerAccountId: "dev-1" } },
    update: {
      userId: users["dev@mastersrunners.local"].id,
      access_token: "dev-access-token",
      refresh_token: "dev-refresh-token",
    },
    create: {
      userId: users["dev@mastersrunners.local"].id,
      type: "oauth",
      provider: "dev",
      providerAccountId: "dev-1",
      access_token: "dev-access-token",
      refresh_token: "dev-refresh-token",
    },
  });

  return users;
}

async function upsertFollow(followerId: string, followingId: string, status = "ACCEPTED") {
  return prisma.follow.upsert({
    where: { followerId_followingId: { followerId, followingId } },
    update: { status },
    create: { followerId, followingId, status },
  });
}

async function seedSocialGraph(users: Record<string, { id: string }>) {
  const dev = users["dev@mastersrunners.local"];
  const minji = users["minji.park@mastersrunners.local"];
  const coach = users["coach.lee@mastersrunners.local"];
  const trail = users["trail.kim@mastersrunners.local"];
  const privateRunner = users["private.runner@mastersrunners.local"];

  await upsertFollow(dev.id, minji.id);
  await upsertFollow(dev.id, coach.id);
  await upsertFollow(dev.id, trail.id);
  await upsertFollow(minji.id, dev.id);
  await upsertFollow(coach.id, dev.id);
  await upsertFollow(trail.id, dev.id);
  await upsertFollow(dev.id, privateRunner.id, "PENDING");
}

async function seedWorkouts(users: Record<string, { id: string }>) {
  const types = await prisma.workoutType.findMany();
  const typeByName = new Map(types.map((type) => [`${type.category}:${type.name}`, type.id]));
  const dev = users["dev@mastersrunners.local"];
  const minji = users["minji.park@mastersrunners.local"];
  const coach = users["coach.lee@mastersrunners.local"];
  const trail = users["trail.kim@mastersrunners.local"];

  const shoes = {
    dev: await prisma.shoe.upsert({
      where: { id: "seed-shoe-dev-pegasus" },
      update: {
        userId: dev.id,
        brand: "Nike",
        model: "Pegasus 41",
        nickname: "출근 조깅화",
        imageUrl: imageUrl("shoe-dev"),
        totalDistance: 184000,
        maxDistance: 700000,
        isRetired: false,
      },
      create: {
        id: "seed-shoe-dev-pegasus",
        userId: dev.id,
        brand: "Nike",
        model: "Pegasus 41",
        nickname: "출근 조깅화",
        imageUrl: imageUrl("shoe-dev"),
        totalDistance: 184000,
        maxDistance: 700000,
      },
    }),
    minji: await prisma.shoe.upsert({
      where: { id: "seed-shoe-minji-novablast" },
      update: {
        userId: minji.id,
        brand: "ASICS",
        model: "Novablast 5",
        nickname: "한강용",
        imageUrl: imageUrl("shoe-minji"),
        totalDistance: 98000,
        maxDistance: 650000,
        isRetired: false,
      },
      create: {
        id: "seed-shoe-minji-novablast",
        userId: minji.id,
        brand: "ASICS",
        model: "Novablast 5",
        nickname: "한강용",
        imageUrl: imageUrl("shoe-minji"),
        totalDistance: 98000,
        maxDistance: 650000,
      },
    }),
  };

  const workoutSeeds = [
    {
      id: "seed-workout-dev-tempo",
      userId: dev.id,
      title: "퇴근 후 템포런 8K",
      workoutTypeId: requireWorkoutTypeId(typeByName, "THRESHOLD:TEMPO_RUN"),
      distance: 8200,
      duration: 2520,
      movingTime: 2470,
      pace: 301,
      bestPace: 274,
      avgHeartRate: 158,
      maxHeartRate: 176,
      avgCadence: 178,
      calories: 620,
      avgTemperature: 16,
      elevationGain: 42,
      startLat: 37.5267,
      startLng: 126.9342,
      endLat: 37.5278,
      endLng: 126.939,
      hasGps: true,
      date: daysAgo(1, 12),
      memo: "마지막 2km는 살짝 밀어붙였습니다.",
      visibility: "PUBLIC",
      shoeId: shoes.dev.id,
      encodedPolyline: "}_seFoyljWmBq@e@uAkCk@u@aBeBuAmC",
    },
    {
      id: "seed-workout-minji-easy",
      userId: minji.id,
      title: "석촌호수 이지런",
      workoutTypeId: requireWorkoutTypeId(typeByName, "EASY:EASY_RUN"),
      distance: 6400,
      duration: 2310,
      movingTime: 2260,
      pace: 361,
      bestPace: 330,
      avgHeartRate: 137,
      maxHeartRate: 151,
      avgCadence: 170,
      calories: 410,
      avgTemperature: 13,
      elevationGain: 18,
      startLat: 37.5112,
      startLng: 127.0982,
      endLat: 37.5067,
      endLng: 127.101,
      hasGps: true,
      date: daysAgo(2, 22),
      memo: "대화 가능한 페이스로 편하게.",
      visibility: "PUBLIC",
      shoeId: shoes.minji.id,
      encodedPolyline: "q`vdFesmeWcA_@m@iAi@kBo@_B",
    },
    {
      id: "seed-workout-coach-interval",
      userId: coach.id,
      title: "1000m x 5 인터벌",
      workoutTypeId: requireWorkoutTypeId(typeByName, "SPEED:INTERVAL"),
      distance: 10500,
      duration: 3480,
      movingTime: 3310,
      pace: 316,
      bestPace: 238,
      avgHeartRate: 166,
      maxHeartRate: 188,
      avgCadence: 184,
      calories: 790,
      avgTemperature: 15,
      elevationGain: 28,
      startLat: 37.5145,
      startLng: 127.0732,
      endLat: 37.5145,
      endLng: 127.0732,
      hasGps: true,
      date: daysAgo(3, 11),
      memo: "회복 조깅 400m 포함. 4세트부터 호흡 관리.",
      visibility: "PUBLIC",
      encodedPolyline: "oawdF_ateW_Aa@k@cBg@eBf@aB",
    },
    {
      id: "seed-workout-trail-long",
      userId: trail.id,
      title: "불암산 트레일 롱런",
      workoutTypeId: requireWorkoutTypeId(typeByName, "TRAIL:TRAIL_RUN"),
      sport: "TRAIL_RUN",
      distance: 15800,
      duration: 6620,
      movingTime: 6310,
      pace: 419,
      bestPace: 318,
      avgHeartRate: 148,
      maxHeartRate: 171,
      avgCadence: 162,
      calories: 1120,
      avgTemperature: 11,
      elevationGain: 620,
      elevationLoss: 612,
      startLat: 37.6609,
      startLng: 127.0808,
      endLat: 37.6601,
      endLng: 127.0821,
      hasGps: true,
      date: daysAgo(4, 0),
      memo: "다운힐 구간은 안전하게, 정상 바람 강함.",
      visibility: "PUBLIC",
      encodedPolyline: "g~yeFicpeWaBcAc@mCiAuB",
    },
  ];

  const workouts: Record<string, { id: string; userId: string }> = {};
  for (const seed of workoutSeeds) {
    workouts[seed.id] = await prisma.workout.upsert({
      where: { id: seed.id },
      update: { ...seed, deletedAt: null },
      create: seed,
    });
  }

  await prisma.workoutPhoto.deleteMany({ where: { workoutId: { in: Object.keys(workouts) } } });
  await prisma.workoutPhoto.createMany({
    data: [
      {
        workoutId: "seed-workout-dev-tempo",
        imageUrl: imageUrl("tempo-river"),
        caption: "여의도 야간 러닝",
        orderIndex: 0,
      },
      {
        workoutId: "seed-workout-minji-easy",
        imageUrl: imageUrl("easy-lake"),
        caption: "석촌호수 한 바퀴",
        orderIndex: 0,
      },
      {
        workoutId: "seed-workout-trail-long",
        imageUrl: imageUrl("trail-long"),
        caption: "불암산 능선",
        orderIndex: 0,
      },
    ],
  });

  return workouts;
}

async function seedPosts(
  users: Record<string, { id: string }>,
  workouts: Record<string, { id: string }>,
) {
  const postSeeds = [
    {
      id: "seed-post-dev-tempo",
      userId: users["dev@mastersrunners.local"].id,
      content:
        "오늘 템포런은 5분/km 근처에서 안정적으로 마무리했습니다. 다음 주 10K 테스트가 기대됩니다.",
      visibility: "PUBLIC",
      hashtags: ["템포런", "한강러닝", "10K준비"],
      workoutId: workouts["seed-workout-dev-tempo"].id,
      createdAt: daysAgo(1, 13),
    },
    {
      id: "seed-post-minji-easy",
      userId: users["minji.park@mastersrunners.local"].id,
      content: "회복주는 기록보다 컨디션 확인이 먼저. 오늘은 호흡이 편해서 좋았어요.",
      visibility: "PUBLIC",
      hashtags: ["회복주", "석촌호수", "러닝친구"],
      workoutId: workouts["seed-workout-minji-easy"].id,
      createdAt: daysAgo(2, 23),
    },
    {
      id: "seed-post-coach-interval",
      userId: users["coach.lee@mastersrunners.local"].id,
      content: "인터벌은 빠르게 뛰는 시간보다 회복 구간을 얼마나 일정하게 가져가는지가 핵심입니다.",
      visibility: "PUBLIC",
      hashtags: ["인터벌", "훈련팁", "마스터즈러너"],
      workoutId: workouts["seed-workout-coach-interval"].id,
      createdAt: daysAgo(3, 12),
    },
  ];

  for (const seed of postSeeds) {
    await prisma.post.upsert({
      where: { id: seed.id },
      update: {
        userId: seed.userId,
        content: seed.content,
        visibility: seed.visibility,
        hashtags: seed.hashtags,
        deletedAt: null,
        createdAt: seed.createdAt,
      },
      create: {
        id: seed.id,
        userId: seed.userId,
        content: seed.content,
        visibility: seed.visibility,
        hashtags: seed.hashtags,
        createdAt: seed.createdAt,
      },
    });
  }

  await prisma.postWorkout.deleteMany({
    where: { postId: { in: postSeeds.map((post) => post.id) } },
  });
  await prisma.postWorkout.createMany({
    data: postSeeds.map((post) => ({ postId: post.id, workoutId: post.workoutId })),
  });

  await prisma.postImage.deleteMany({
    where: { postId: { in: postSeeds.map((post) => post.id) } },
  });
  await prisma.postImage.createMany({
    data: [
      { postId: "seed-post-dev-tempo", imageUrl: imageUrl("post-tempo"), sortOrder: 0 },
      { postId: "seed-post-minji-easy", imageUrl: imageUrl("post-easy"), sortOrder: 0 },
      { postId: "seed-post-coach-interval", imageUrl: imageUrl("post-track"), sortOrder: 0 },
    ],
  });

  await prisma.postLike.upsert({
    where: {
      userId_postId: {
        userId: users["minji.park@mastersrunners.local"].id,
        postId: "seed-post-dev-tempo",
      },
    },
    update: {},
    create: { userId: users["minji.park@mastersrunners.local"].id, postId: "seed-post-dev-tempo" },
  });
  await prisma.postLike.upsert({
    where: {
      userId_postId: {
        userId: users["dev@mastersrunners.local"].id,
        postId: "seed-post-minji-easy",
      },
    },
    update: {},
    create: { userId: users["dev@mastersrunners.local"].id, postId: "seed-post-minji-easy" },
  });

  await prisma.postComment.upsert({
    where: { id: "seed-post-comment-1" },
    update: {
      userId: users["coach.lee@mastersrunners.local"].id,
      postId: "seed-post-dev-tempo",
      content: "페이스가 정말 안정적이네요. 다음 주 테스트 응원합니다!",
      deletedAt: null,
      createdAt: daysAgo(1, 14),
    },
    create: {
      id: "seed-post-comment-1",
      userId: users["coach.lee@mastersrunners.local"].id,
      postId: "seed-post-dev-tempo",
      content: "페이스가 정말 안정적이네요. 다음 주 테스트 응원합니다!",
      createdAt: daysAgo(1, 14),
    },
  });
}

async function seedCrews(users: Record<string, { id: string }>) {
  const dev = users["dev@mastersrunners.local"];
  const minji = users["minji.park@mastersrunners.local"];
  const coach = users["coach.lee@mastersrunners.local"];
  const trail = users["trail.kim@mastersrunners.local"];

  const crews = {
    river: await prisma.crew.upsert({
      where: { id: "seed-crew-hanriver" },
      update: {
        creatorId: coach.id,
        name: "한강 새벽 러너스",
        description: "평일 새벽 한강 남단을 함께 달리는 크루입니다.",
        imageUrl: imageUrl("crew-river"),
        coverImageUrl: imageUrl("crew-river-cover"),
        location: "여의도 한강공원",
        region: "서울",
        subRegion: "영등포",
        maxMembers: 80,
        isPublic: true,
        deletedAt: null,
      },
      create: {
        id: "seed-crew-hanriver",
        name: "한강 새벽 러너스",
        description: "평일 새벽 한강 남단을 함께 달리는 크루입니다.",
        imageUrl: imageUrl("crew-river"),
        coverImageUrl: imageUrl("crew-river-cover"),
        location: "여의도 한강공원",
        region: "서울",
        subRegion: "영등포",
        creatorId: coach.id,
        maxMembers: 80,
      },
    }),
    trail: await prisma.crew.upsert({
      where: { id: "seed-crew-trail" },
      update: {
        creatorId: trail.id,
        name: "주말 트레일 클럽",
        description: "서울 근교 산길을 안전하게 즐기는 트레일 러닝 크루입니다.",
        imageUrl: imageUrl("crew-trail"),
        coverImageUrl: imageUrl("crew-trail-cover"),
        location: "불암산 둘레길",
        region: "경기",
        subRegion: "성남",
        maxMembers: 45,
        isPublic: true,
        deletedAt: null,
      },
      create: {
        id: "seed-crew-trail",
        name: "주말 트레일 클럽",
        description: "서울 근교 산길을 안전하게 즐기는 트레일 러닝 크루입니다.",
        imageUrl: imageUrl("crew-trail"),
        coverImageUrl: imageUrl("crew-trail-cover"),
        location: "불암산 둘레길",
        region: "경기",
        subRegion: "성남",
        creatorId: trail.id,
        maxMembers: 45,
      },
    }),
  };

  for (const member of [
    { crewId: crews.river.id, userId: coach.id, role: "OWNER" },
    { crewId: crews.river.id, userId: dev.id, role: "ADMIN" },
    { crewId: crews.river.id, userId: minji.id, role: "MEMBER" },
    { crewId: crews.trail.id, userId: trail.id, role: "OWNER" },
    { crewId: crews.trail.id, userId: dev.id, role: "MEMBER" },
  ]) {
    await prisma.crewMember.upsert({
      where: { crewId_userId: { crewId: member.crewId, userId: member.userId } },
      update: { role: member.role, status: "ACTIVE", joinedAt: daysAgo(20, 2) },
      create: { ...member, status: "ACTIVE", joinedAt: daysAgo(20, 2) },
    });
  }

  for (const tag of [
    { crewId: crews.river.id, name: "초보환영", color: "#22C55E" },
    { crewId: crews.river.id, name: "새벽런", color: "#2563EB" },
    { crewId: crews.trail.id, name: "트레일", color: "#F97316" },
  ]) {
    await prisma.crewTag.upsert({
      where: { crewId_name: { crewId: tag.crewId, name: tag.name } },
      update: { color: tag.color },
      create: tag,
    });
  }

  const board = await prisma.crewBoard.upsert({
    where: { id: "seed-board-hanriver-general" },
    update: {
      crewId: crews.river.id,
      name: "자유게시판",
      type: "GENERAL",
      writePermission: "ALL_MEMBERS",
      sortOrder: 1,
    },
    create: {
      id: "seed-board-hanriver-general",
      crewId: crews.river.id,
      name: "자유게시판",
      type: "GENERAL",
      writePermission: "ALL_MEMBERS",
      sortOrder: 1,
    },
  });

  await prisma.crewBoardPost.upsert({
    where: { id: "seed-board-post-meetup" },
    update: {
      boardId: board.id,
      authorId: coach.id,
      title: "이번 주 토요일 7시 여의나루 집결",
      content: "6km 조깅 후 커피까지 가볍게 갑니다. 처음 오시는 분도 환영합니다.",
      isPinned: true,
      deletedAt: null,
      createdAt: daysAgo(1, 3),
    },
    create: {
      id: "seed-board-post-meetup",
      boardId: board.id,
      authorId: coach.id,
      title: "이번 주 토요일 7시 여의나루 집결",
      content: "6km 조깅 후 커피까지 가볍게 갑니다. 처음 오시는 분도 환영합니다.",
      isPinned: true,
      createdAt: daysAgo(1, 3),
    },
  });

  await prisma.crewBoardComment.upsert({
    where: { id: "seed-board-comment-meetup" },
    update: {
      postId: "seed-board-post-meetup",
      authorId: dev.id,
      content: "참석합니다. 새로 오시는 분 챙길게요.",
      deletedAt: null,
      createdAt: daysAgo(1, 4),
    },
    create: {
      id: "seed-board-comment-meetup",
      postId: "seed-board-post-meetup",
      authorId: dev.id,
      content: "참석합니다. 새로 오시는 분 챙길게요.",
      createdAt: daysAgo(1, 4),
    },
  });

  const activity = await prisma.crewActivity.upsert({
    where: { id: "seed-activity-hanriver-saturday" },
    update: {
      crewId: crews.river.id,
      title: "토요일 한강 10K 페이스런",
      description: "5:40/km 그룹과 6:20/km 그룹으로 나눠 진행합니다.",
      activityDate: daysAgo(-3, 22),
      location: "여의나루역 2번 출구",
      latitude: 37.5272,
      longitude: 126.9326,
      createdBy: coach.id,
      activityType: "OFFICIAL",
      status: "SCHEDULED",
      qrCode: "MR-SEED-HANRIVER-10K",
    },
    create: {
      id: "seed-activity-hanriver-saturday",
      crewId: crews.river.id,
      title: "토요일 한강 10K 페이스런",
      description: "5:40/km 그룹과 6:20/km 그룹으로 나눠 진행합니다.",
      activityDate: daysAgo(-3, 22),
      location: "여의나루역 2번 출구",
      latitude: 37.5272,
      longitude: 126.9326,
      createdBy: coach.id,
      activityType: "OFFICIAL",
      status: "SCHEDULED",
      qrCode: "MR-SEED-HANRIVER-10K",
    },
  });

  for (const attendance of [
    {
      activityId: activity.id,
      userId: dev.id,
      status: "RSVP",
      method: null,
      checkedAt: null,
      checkedBy: null,
    },
    {
      activityId: activity.id,
      userId: minji.id,
      status: "CHECKED_IN",
      method: "QR",
      checkedAt: daysAgo(-3, 21),
      checkedBy: null,
    },
  ]) {
    await prisma.crewAttendance.upsert({
      where: {
        activityId_userId: { activityId: attendance.activityId, userId: attendance.userId },
      },
      update: attendance,
      create: attendance,
    });
  }

  return crews;
}

async function seedConversations(
  users: Record<string, { id: string }>,
  crewId: string,
  activityId: string,
) {
  const dev = users["dev@mastersrunners.local"];
  const minji = users["minji.park@mastersrunners.local"];
  const coach = users["coach.lee@mastersrunners.local"];

  const conversations = [
    {
      id: "seed-conversation-direct-minji",
      type: "DIRECT",
      name: null,
      participantIds: [dev.id, minji.id],
    },
    {
      id: "seed-conversation-crew-hanriver",
      type: "CREW",
      name: "한강 새벽 러너스",
      crewId,
      participantIds: [dev.id, minji.id, coach.id],
    },
    {
      id: "seed-conversation-activity-hanriver",
      type: "ACTIVITY",
      name: "토요일 한강 10K 페이스런",
      crewId,
      activityId,
      participantIds: [dev.id, minji.id, coach.id],
    },
  ];

  for (const seed of conversations) {
    await prisma.conversation.upsert({
      where: { id: seed.id },
      update: {
        type: seed.type,
        name: seed.name,
        crewId: seed.crewId,
        activityId: seed.activityId,
      },
      create: {
        id: seed.id,
        type: seed.type,
        name: seed.name,
        crewId: seed.crewId,
        activityId: seed.activityId,
      },
    });
    for (const userId of seed.participantIds) {
      await prisma.conversationParticipant.upsert({
        where: { conversationId_userId: { conversationId: seed.id, userId } },
        update: {
          leftAt: null,
          lastReadAt: userId === dev.id ? daysAgo(1, 8) : now,
        },
        create: {
          conversationId: seed.id,
          userId,
          lastReadAt: userId === dev.id ? daysAgo(1, 8) : now,
        },
      });
    }
  }

  await prisma.crew.update({
    where: { id: crewId },
    data: { chatConversationId: "seed-conversation-crew-hanriver" },
  });
  await prisma.crewActivity.update({
    where: { id: activityId },
    data: { chatConversationId: "seed-conversation-activity-hanriver" },
  });

  const messages = [
    {
      id: "seed-message-direct-1",
      conversationId: "seed-conversation-direct-minji",
      senderId: minji.id,
      content: "내일 아침 6시 반에 한강 가능하세요?",
      createdAt: daysAgo(1, 8),
    },
    {
      id: "seed-message-direct-2",
      conversationId: "seed-conversation-direct-minji",
      senderId: dev.id,
      content: "좋아요. 6km 정도 회복주로 갈게요.",
      createdAt: daysAgo(1, 8),
    },
    {
      id: "seed-message-direct-3",
      conversationId: "seed-conversation-direct-minji",
      senderId: minji.id,
      content: "그럼 여의나루 2번 출구에서 볼게요.",
      createdAt: daysAgo(1, 9),
    },
    {
      id: "seed-message-crew-1",
      conversationId: "seed-conversation-crew-hanriver",
      senderId: coach.id,
      content: "토요일 페이스 그룹은 현장에서 나눕니다.",
      createdAt: daysAgo(0, 1),
    },
    {
      id: "seed-message-crew-2",
      conversationId: "seed-conversation-crew-hanriver",
      senderId: minji.id,
      content: "처음 오시는 분 있으면 제가 스트레칭 같이 진행할게요.",
      createdAt: daysAgo(0, 2),
    },
    {
      id: "seed-message-activity-1",
      conversationId: "seed-conversation-activity-hanriver",
      senderId: coach.id,
      content: "QR 체크인은 집결 15분 전부터 열어둘게요.",
      createdAt: daysAgo(0, 3),
    },
  ];

  for (const message of messages) {
    await prisma.message.upsert({
      where: { id: message.id },
      update: {
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        deletedAt: null,
        createdAt: message.createdAt,
      },
      create: message,
    });
  }
}

async function seedNotifications(users: Record<string, { id: string }>) {
  const dev = users["dev@mastersrunners.local"];
  const minji = users["minji.park@mastersrunners.local"];
  const coach = users["coach.lee@mastersrunners.local"];

  const notifications = [
    {
      id: "seed-notification-like",
      userId: dev.id,
      actorId: minji.id,
      type: "LIKE",
      referenceType: "POST",
      referenceId: "seed-post-dev-tempo",
      message: "박민지님이 회원님의 게시글을 좋아합니다.",
      isRead: false,
      createdAt: daysAgo(0, 4),
    },
    {
      id: "seed-notification-comment",
      userId: dev.id,
      actorId: coach.id,
      type: "COMMENT",
      referenceType: "POST",
      referenceId: "seed-post-dev-tempo",
      message: "이준호 코치님이 댓글을 남겼습니다.",
      isRead: false,
      createdAt: daysAgo(0, 5),
    },
    {
      id: "seed-notification-crew",
      userId: dev.id,
      actorId: coach.id,
      type: "CREW_JOIN",
      referenceType: "CREW",
      referenceId: "seed-crew-hanriver",
      message: "한강 새벽 러너스 이번 주 활동 일정이 등록되었습니다.",
      isRead: true,
      createdAt: daysAgo(2, 2),
    },
  ];

  for (const notification of notifications) {
    await prisma.notification.upsert({
      where: { id: notification.id },
      update: notification,
      create: notification,
    });
  }
}

async function main() {
  console.log("Seeding Masters Runners demo data...");

  await seedWorkoutTypes();
  const users = await seedUsers();
  await seedSocialGraph(users);
  const workouts = await seedWorkouts(users);
  await seedPosts(users, workouts);
  const crews = await seedCrews(users);
  await seedConversations(users, crews.river.id, "seed-activity-hanriver-saturday");
  await seedNotifications(users);

  console.log(`Seeded ${WORKOUT_TYPE_SEEDS.length} workout types.`);
  console.log(
    `Seeded ${USER_SEEDS.length} users with demo workouts, posts, crews, messages, and notifications.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
