import type { User } from "@/lib/auth-context";

function createStorySvgDataUri(label: string, fill: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <rect width="1200" height="800" fill="${fill}" />
      <text
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        fill="white"
        font-family="system-ui, sans-serif"
        font-size="56"
        font-weight="700"
      >
        ${label}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const storybookUser: User = {
  id: "story-user-1",
  email: "runner@mastersrunners.app",
  name: "김러너",
  profileImage: createStorySvgDataUri("Runner", "#ec4899"),
  backgroundImage: createStorySvgDataUri("Sunrise", "#f97316"),
  bio: "새벽 러닝과 장거리 LSD를 좋아하는 서울 러너",
  isPrivate: false,
  workoutSharingDefault: "PUBLIC",
  region: "서울",
  subRegion: "성동구",
  pb5kSeconds: 1245,
  pb10kSeconds: 2670,
  pbHalfMarathonSeconds: 6120,
  pbMarathonSeconds: null,
  createdAt: "2026-03-01T08:00:00.000Z",
};

export const storybookGuestUser = null;

export const storybookMedia = {
  feedCover: createStorySvgDataUri("Community Run", "#0f766e"),
  workoutMap: createStorySvgDataUri("Route Preview", "#0284c7"),
  crewBadge: createStorySvgDataUri("Crew", "#7c3aed"),
  postGalleryOne: createStorySvgDataUri("Tempo Night", "#0891b2"),
  postGalleryTwo: createStorySvgDataUri("Recovery Loop", "#059669"),
};

export const storybookWorkout = {
  id: "workout-1",
  distance: 12.4,
  duration: 4020,
  pace: 324,
  date: "2026-04-08T06:20:00.000Z",
  visibility: "PUBLIC",
  memo: "호흡이 안정적이어서 마지막 3km는 조금 더 끌어올렸습니다.",
  createdAt: "2026-04-08T08:30:00.000Z",
  encodedPolyline: "}_seFf~ejVg@tCgBzDmBfCuCnB{A",
  user: {
    id: storybookUser.id,
    name: storybookUser.name,
    profileImage: storybookUser.profileImage,
  },
  _count: {
    likes: 18,
    comments: 4,
  },
  isLiked: true,
} as const;

export const storybookPost = {
  id: "post-1",
  content: "퇴근 후 8km 템포런. 차가운 공기 덕분에 리듬이 잘 맞았습니다.",
  visibility: "PUBLIC",
  hashtags: ["템포런", "성수러닝"],
  createdAt: "2026-04-08T10:30:00.000Z",
  user: {
    id: storybookUser.id,
    name: storybookUser.name,
    profileImage: storybookUser.profileImage,
  },
  _count: {
    likes: 12,
    comments: 3,
  },
  isLiked: true,
  images: [
    { id: "image-1", url: storybookMedia.postGalleryOne, order: 1 },
    { id: "image-2", url: storybookMedia.postGalleryTwo, order: 2 },
  ],
  workouts: [
    {
      workout: {
        id: storybookWorkout.id,
        distance: storybookWorkout.distance,
        duration: storybookWorkout.duration,
        pace: storybookWorkout.pace,
        date: storybookWorkout.date,
      },
    },
  ],
} as const;

export const storybookProfileStats = {
  postCount: 42,
  followerCount: 318,
  followingCount: 167,
  workoutCount: 121,
  crewCount: 4,
} as const;

export const storybookProfileTabs = {
  posts: [
    storybookPost,
    {
      ...storybookPost,
      id: "post-2",
      content: "토요일 장거리 전에 5km 회복 조깅. 다리는 무거웠지만 리듬은 부드러웠습니다.",
      createdAt: "2026-04-06T10:10:00.000Z",
      _count: {
        likes: 7,
        comments: 1,
      },
    },
  ],
  workouts: [
    storybookWorkout,
    {
      ...storybookWorkout,
      id: "workout-2",
      distance: 8.2,
      duration: 2664,
      pace: 325,
      date: "2026-04-05T20:10:00.000Z",
      memo: "업다운이 있는 코스였지만 마지막까지 페이스를 유지했습니다.",
      _count: {
        likes: 9,
        comments: 2,
      },
    },
  ],
  crews: [
    {
      id: "crew-1",
      name: "서울 새벽 러너스",
      description: "한강과 서울숲을 중심으로 아침 러닝을 이어가는 크루",
      memberCount: 28,
      imageUrl: storybookMedia.crewBadge,
    },
    {
      id: "crew-2",
      name: "성수 템포 클럽",
      description: "평일 저녁 템포런과 주말 롱런을 함께 이어가는 도심 크루",
      memberCount: 41,
      imageUrl: null,
    },
  ],
} as const;

export const storybookComments = [
  {
    id: "comment-1",
    content: "페이스가 정말 안정적이네요!",
    createdAt: "2026-04-08T11:00:00.000Z",
    user: {
      id: "user-2",
      name: "이페이서",
      profileImage: null,
    },
    replies: [
      {
        id: "comment-1-reply-1",
        content: "@김러너 다음엔 같이 달려요.",
        createdAt: "2026-04-08T11:05:00.000Z",
        user: {
          id: "user-3",
          name: "박지구력",
          profileImage: null,
        },
      },
    ],
  },
] as const;

export const storybookNotifications = [
  {
    id: "notif-1",
    type: "DM_RECEIVED",
    isRead: false,
    createdAt: "2026-04-08T09:30:00.000Z",
    actor: {
      id: "user-2",
      name: "이페이서",
      profileImage: null,
    },
    referenceId: "conversation-1",
    referenceType: "CONVERSATION",
    message: "새 메시지가 도착했습니다.",
  },
] as const;

export const storybookConversations = [
  {
    id: "conversation-1",
    participants: [
      {
        id: storybookUser.id,
        name: storybookUser.name,
        profileImage: storybookUser.profileImage,
      },
      {
        id: "user-2",
        name: "이페이서",
        profileImage: null,
      },
    ],
    lastMessage: {
      id: "message-1",
      content: "내일 6시에 서울숲에서 만나요.",
      createdAt: "2026-04-08T09:29:00.000Z",
    },
    updatedAt: "2026-04-08T09:29:00.000Z",
    unreadCount: 2,
  },
] as const;

export const storybookChallenge = {
  id: "challenge-1",
  title: "4월 120km 챌린지",
  description: "한 달 동안 꾸준히 거리 목표를 쌓아보는 개인 챌린지",
  type: "DISTANCE",
  targetValue: 120,
  startDate: "2026-04-01T00:00:00.000Z",
  endDate: "2026-04-30T23:59:59.000Z",
  isPublic: true,
  _count: { participants: 148 },
  myProgress: 54.2,
} as const;

export const storybookChallengeTeams = [
  {
    id: "team-1",
    name: "서울 러닝 클럽",
    _count: { members: 12 },
    members: [
      {
        id: storybookUser.id,
        name: storybookUser.name,
        profileImage: storybookUser.profileImage,
      },
      {
        id: "user-2",
        name: "이페이서",
        profileImage: null,
      },
    ],
    aggregateProgress: 482.4,
  },
  {
    id: "team-2",
    name: "한강 마일러스",
    _count: { members: 9 },
    members: [
      {
        id: "user-3",
        name: "박지구력",
        profileImage: null,
      },
    ],
    aggregateProgress: 398.1,
  },
] as const;

export const storybookChallengeLeaderboard = [
  {
    rank: 1,
    teamId: "team-1",
    teamName: "서울 러닝 클럽",
    memberCount: 12,
    aggregateProgress: 482.4,
  },
  {
    rank: 2,
    teamId: "team-2",
    teamName: "한강 마일러스",
    memberCount: 9,
    aggregateProgress: 398.1,
  },
] as const;

export const storybookEvent = {
  id: "event-1",
  title: "서울숲 10K 기록회",
  description: "함께 10K 기록을 점검하는 봄 시즌 이벤트",
  date: "2026-04-20T07:00:00.000Z",
  location: "서울숲",
  distance: 10,
  participantCount: 84,
  isJoined: true,
  organizer: {
    id: storybookUser.id,
    name: storybookUser.name,
    profileImage: storybookUser.profileImage,
  },
} as const;

export const storybookEventResults = [
  {
    id: "result-1",
    resultRank: 1,
    recordedTime: 2310,
    user: {
      id: "user-2",
      name: "이페이서",
      profileImage: null,
    },
  },
] as const;

export const storybookCrew = {
  id: "crew-1",
  name: "서울 새벽 러너스",
  description: "아침 러닝과 주말 롱런을 함께하는 도시형 크루",
  memberCount: 28,
  imageUrl: storybookMedia.crewBadge,
  region: "서울",
  isOwner: true,
} as const;

export const storybookCrewMembers = [
  {
    id: "member-1",
    userId: storybookUser.id,
    role: "OWNER",
    status: "ACTIVE",
    joinedAt: "2026-02-03T06:30:00.000Z",
    user: {
      id: storybookUser.id,
      name: storybookUser.name,
      profileImage: storybookUser.profileImage,
    },
  },
  {
    id: "member-2",
    userId: "user-2",
    role: "MEMBER",
    status: "ACTIVE",
    joinedAt: "2026-03-10T07:00:00.000Z",
    user: {
      id: "user-2",
      name: "이페이서",
      profileImage: null,
    },
  },
  {
    id: "member-3",
    userId: "user-3",
    role: "ADMIN",
    status: "PENDING",
    joinedAt: "2026-04-06T12:00:00.000Z",
    user: {
      id: "user-3",
      name: "박지구력",
      profileImage: null,
    },
  },
] as const;

export const storybookCrewAttendance = [
  {
    id: "attendance-1",
    user: {
      id: storybookUser.id,
      name: storybookUser.name,
      profileImage: storybookUser.profileImage,
    },
    checkedInAt: "2026-04-08T06:02:00.000Z",
  },
] as const;

export const storybookCrewTags = [
  {
    id: "tag-1",
    name: "롱런팀",
    color: "#10b981",
    createdAt: "2026-04-01T00:00:00.000Z",
    members: [storybookCrewMembers[0]],
  },
  {
    id: "tag-2",
    name: "페이스메이커",
    color: "#3b82f6",
    createdAt: "2026-04-03T00:00:00.000Z",
    members: [storybookCrewMembers[1]],
  },
] as const;

export const storybookCrewActivities = {
  items: [
    {
      id: "activity-1",
      crewId: storybookCrew.id,
      title: "수요일 아침 템포런",
      description: "서울숲 8km 템포런 후 커피 브리핑",
      activityDate: "2026-04-10T21:30:00.000Z",
      location: "서울숲 문화예술공원 입구",
      latitude: 37.5446,
      longitude: 127.0377,
      createdBy: storybookUser.id,
      createdAt: "2026-04-08T06:20:00.000Z",
      qrCode: "crew-activity-1",
      activityType: "OFFICIAL",
      status: "SCHEDULED",
      completedAt: null,
      workoutTypeId: null,
      attendances: [
        {
          id: "attendance-item-1",
          userId: storybookUser.id,
          status: "RSVP",
          method: null,
          rsvpAt: "2026-04-08T06:30:00.000Z",
          checkedAt: null,
          checkedBy: null,
        },
      ],
    },
    {
      id: "activity-2",
      crewId: storybookCrew.id,
      title: "금요일 야간 번개",
      description: "반포 한강공원 5km 가볍게",
      activityDate: "2026-04-12T11:00:00.000Z",
      location: "반포 한강공원",
      latitude: 37.5101,
      longitude: 126.9953,
      createdBy: "user-2",
      createdAt: "2026-04-08T10:40:00.000Z",
      qrCode: "crew-activity-2",
      activityType: "POP_UP",
      status: "ACTIVE",
      completedAt: null,
      workoutTypeId: null,
      attendances: [
        {
          id: "attendance-item-2",
          userId: "user-2",
          status: "CHECKED_IN",
          method: "QR",
          rsvpAt: "2026-04-08T11:00:00.000Z",
          checkedAt: "2026-04-12T11:03:00.000Z",
          checkedBy: storybookUser.id,
        },
      ],
    },
  ],
  nextCursor: null,
} as const;

export const storybookCrewAttendanceStats = {
  overallRate: 82,
  activities: [
    {
      id: "activity-1",
      title: "수요일 아침 템포런",
      activityDate: "2026-04-10T21:30:00.000Z",
      activityType: "OFFICIAL",
      total: 18,
      checkedIn: 15,
      noShow: 3,
      rate: 83,
    },
    {
      id: "activity-2",
      title: "금요일 야간 번개",
      activityDate: "2026-04-12T11:00:00.000Z",
      activityType: "POP_UP",
      total: 14,
      checkedIn: 11,
      noShow: 3,
      rate: 79,
    },
  ],
  memberStats: [
    {
      userId: storybookUser.id,
      user: {
        id: storybookUser.id,
        name: storybookUser.name,
        profileImage: storybookUser.profileImage,
      },
      total: 9,
      checkedIn: 8,
      noShow: 1,
      rate: 89,
    },
    {
      userId: "user-2",
      user: {
        id: "user-2",
        name: "이페이서",
        profileImage: null,
      },
      total: 7,
      checkedIn: 5,
      noShow: 2,
      rate: 71,
    },
  ],
} as const;

export const storybookCrewBoards = [
  {
    id: "board-1",
    crewId: storybookCrew.id,
    name: "공지",
    type: "ANNOUNCEMENT",
    writePermission: "ADMINS",
    sortOrder: 0,
    _count: { posts: 4 },
  },
  {
    id: "board-2",
    crewId: storybookCrew.id,
    name: "자유 게시판",
    type: "FREE",
    writePermission: "ALL_MEMBERS",
    sortOrder: 1,
    _count: { posts: 12 },
  },
] as const;

export const storybookCrewBoardPosts = {
  items: [
    {
      id: "board-post-1",
      boardId: "board-2",
      title: "이번 주말 롱런 페이스 제안",
      content: "초반 10km는 5:30, 후반은 컨디션 보고 정리해보죠.",
      isPinned: true,
      authorId: storybookUser.id,
      author: {
        id: storybookUser.id,
        name: storybookUser.name,
        profileImage: storybookUser.profileImage,
      },
      createdAt: "2026-04-08T07:00:00.000Z",
      updatedAt: "2026-04-08T07:00:00.000Z",
      images: [],
      _count: { comments: 3, likes: 8 },
      liked: true,
    },
  ],
  nextCursor: null,
} as const;

export const storybookCrewBoardPostDetail = {
  ...storybookCrewBoardPosts.items[0],
  comments: [
    {
      id: "board-comment-1",
      content: "좋아요. 보급은 7km, 14km쯤 잡으면 될 것 같아요.",
      authorId: "user-2",
      author: {
        id: "user-2",
        name: "이페이서",
        profileImage: null,
      },
      parentId: null,
      createdAt: "2026-04-08T07:12:00.000Z",
      replies: [],
    },
  ],
} as const;

export const storybookCrewPosts = {
  items: [
    {
      id: "crew-post-1",
      userId: storybookUser.id,
      crewId: storybookCrew.id,
      content: "토요일 롱런 브리핑입니다. 급수 지점은 잠실대교 아래로 맞출게요.",
      visibility: "CREW",
      createdAt: "2026-04-08T05:30:00.000Z",
      user: {
        id: storybookUser.id,
        name: storybookUser.name,
        profileImage: storybookUser.profileImage,
      },
      images: [
        {
          id: "crew-post-image-1",
          imageUrl: storybookMedia.feedCover,
          sortOrder: 0,
        },
      ],
      _count: { likes: 6, comments: 2 },
    },
  ],
  nextCursor: null,
} as const;

export const storybookCrewChat = {
  conversation: {
    id: "conversation-crew-1",
    type: "GROUP",
    name: "서울 새벽 러너스",
    crewId: storybookCrew.id,
    activityId: null,
    participants: [
      {
        userId: storybookUser.id,
        lastReadAt: "2026-04-08T08:30:00.000Z",
        joinedAt: "2026-03-01T08:00:00.000Z",
        user: {
          id: storybookUser.id,
          name: storybookUser.name,
          profileImage: storybookUser.profileImage,
        },
      },
      {
        userId: "user-2",
        lastReadAt: null,
        joinedAt: "2026-03-02T08:00:00.000Z",
        user: {
          id: "user-2",
          name: "이페이서",
          profileImage: null,
        },
      },
    ],
  },
  messages: [
    {
      id: "group-message-1",
      content: "내일 6시 출발로 확정할게요.",
      senderId: "user-2",
      sender: {
        id: "user-2",
        name: "이페이서",
        profileImage: null,
      },
      createdAt: "2026-04-08T08:15:00.000Z",
      deletedAt: null,
    },
    {
      id: "group-message-2",
      content: "좋아요. 집결지는 뚝섬 유원지 입구로요.",
      senderId: storybookUser.id,
      sender: {
        id: storybookUser.id,
        name: storybookUser.name,
        profileImage: storybookUser.profileImage,
      },
      createdAt: "2026-04-08T08:19:00.000Z",
      deletedAt: null,
    },
  ],
  nextCursor: null,
} as const;

export const storybookWorkoutTrack = [
  {
    index: 0,
    lat: 37.5447,
    lon: 127.0378,
    distanceMeters: 0,
    distanceKm: 0,
    elapsedSeconds: 0,
    elevation: 14,
    heartRate: 136,
    cadence: 166,
    timestamp: "2026-04-08T06:20:00.000Z",
  },
  {
    index: 1,
    lat: 37.5452,
    lon: 127.0402,
    distanceMeters: 1200,
    distanceKm: 1.2,
    elapsedSeconds: 365,
    elevation: 19,
    heartRate: 142,
    cadence: 170,
    timestamp: "2026-04-08T06:26:05.000Z",
  },
  {
    index: 2,
    lat: 37.5431,
    lon: 127.0435,
    distanceMeters: 2400,
    distanceKm: 2.4,
    elapsedSeconds: 735,
    elevation: 21,
    heartRate: 148,
    cadence: 172,
    timestamp: "2026-04-08T06:32:15.000Z",
  },
  {
    index: 3,
    lat: 37.5404,
    lon: 127.0451,
    distanceMeters: 3600,
    distanceKm: 3.6,
    elapsedSeconds: 1100,
    elevation: 18,
    heartRate: 154,
    cadence: 174,
    timestamp: "2026-04-08T06:38:20.000Z",
  },
  {
    index: 4,
    lat: 37.5376,
    lon: 127.0426,
    distanceMeters: 5000,
    distanceKm: 5,
    elapsedSeconds: 1520,
    elevation: 16,
    heartRate: 158,
    cadence: 176,
    timestamp: "2026-04-08T06:45:20.000Z",
  },
] as const;

export const storybookWorkoutLaps = [
  {
    lapNumber: 1,
    distance: 1000,
    duration: 320,
    pace: 320,
    avgHeartRate: 142,
    avgCadence: 169,
    startIndex: 0,
    endIndex: 1,
    startDistanceMeters: 0,
    endDistanceMeters: 1000,
    startDistanceKm: 0,
    endDistanceKm: 1,
  },
  {
    lapNumber: 2,
    distance: 1000,
    duration: 305,
    pace: 305,
    avgHeartRate: 149,
    avgCadence: 172,
    startIndex: 1,
    endIndex: 2,
    startDistanceMeters: 1000,
    endDistanceMeters: 2000,
    startDistanceKm: 1,
    endDistanceKm: 2,
  },
  {
    lapNumber: 3,
    distance: 1000,
    duration: 298,
    pace: 298,
    avgHeartRate: 155,
    avgCadence: 175,
    startIndex: 2,
    endIndex: 3,
    startDistanceMeters: 2000,
    endDistanceMeters: 3000,
    startDistanceKm: 2,
    endDistanceKm: 3,
  },
] as const;

export const storybookPublicRuntimeConfig = {
  authProviders: {
    google: true,
    kakao: true,
  },
  features: {
    challenges: true,
    events: true,
  },
} as const;
