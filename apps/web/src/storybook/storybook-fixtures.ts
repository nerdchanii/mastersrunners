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
    status: "ACTIVE",
    joinedAt: "2026-03-18T06:40:00.000Z",
    user: {
      id: "user-3",
      name: "박지구력",
      profileImage: null,
    },
  },
] as const;

export const storybookPendingCrewMembers = [
  {
    id: "pending-member-1",
    userId: "user-3",
    role: "MEMBER",
    status: "PENDING",
    joinedAt: "2026-04-06T12:00:00.000Z",
    user: {
      id: "user-3",
      name: "박지구력",
      profileImage: null,
    },
  },
  {
    id: "pending-member-2",
    userId: "user-4",
    role: "MEMBER",
    status: "PENDING",
    joinedAt: "2026-04-09T02:30:00.000Z",
    user: {
      id: "user-4",
      name: "최지속",
      profileImage: null,
    },
  },
] as const;

export const storybookAllCrewMembers = [
  ...storybookCrewMembers,
  ...storybookPendingCrewMembers,
] as const;

export const storybookCrewAttendance = [
  {
    id: "attendance-1",
    userId: storybookUser.id,
    user: {
      id: storybookUser.id,
      name: storybookUser.name,
      profileImage: storybookUser.profileImage,
    },
    checkedInAt: "2026-04-08T06:02:00.000Z",
  },
  {
    id: "attendance-2",
    userId: "user-2",
    user: {
      id: "user-2",
      name: "이페이서",
      profileImage: null,
    },
    checkedInAt: "2026-04-08T06:04:00.000Z",
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
      activityIcon: "🏃",
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
      activityIcon: null,
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
  summary: {
    overallRate: 77,
    activityCount: 10,
    totalEligible: 146,
    totalCheckedIn: 113,
    totalNoShow: 18,
  },
  activities: [
    {
      id: "activity-1",
      title: "수요일 아침 템포런",
      activityDate: "2026-04-10T21:30:00.000Z",
      activityType: "OFFICIAL",
      activityIcon: "🏃",
      location: "서울숲 문화예술공원 입구",
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
      activityIcon: null,
      location: "잠실대교 남단 한강공원",
      total: 14,
      checkedIn: 11,
      noShow: 3,
      rate: 79,
    },
    {
      id: "activity-3",
      title: "토요일 장거리 정기런",
      activityDate: "2026-04-19T21:00:00.000Z",
      activityType: "OFFICIAL",
      activityIcon: "🏃",
      location: "한강공원 반포지구",
      total: 16,
      checkedIn: 12,
      noShow: 2,
      rate: 75,
    },
    {
      id: "activity-4",
      title: "수요 저녁 번개",
      activityDate: "2026-04-23T10:30:00.000Z",
      activityType: "POP_UP",
      activityIcon: null,
      location: "성수 서울숲역 3번 출구",
      total: 12,
      checkedIn: 9,
      noShow: 1,
      rate: 75,
    },
    {
      id: "activity-5",
      title: "월말 기록주 정기런",
      activityDate: "2026-04-30T21:30:00.000Z",
      activityType: "OFFICIAL",
      activityIcon: "🔥",
      location: "잠실종합운동장 보조트랙",
      total: 20,
      checkedIn: 17,
      noShow: 2,
      rate: 85,
    },
    {
      id: "activity-6",
      title: "어린이날 새벽 번개",
      activityDate: "2026-05-05T20:50:00.000Z",
      activityType: "POP_UP",
      activityIcon: null,
      location: "여의도공원 문화의마당",
      total: 10,
      checkedIn: 6,
      noShow: 2,
      rate: 60,
    },
    {
      id: "activity-7",
      title: "수요일 아침 페이스런",
      activityDate: "2026-05-14T21:30:00.000Z",
      activityType: "OFFICIAL",
      activityIcon: "🏃",
      location: "서울숲 가족마당",
      total: 15,
      checkedIn: 11,
      noShow: 1,
      rate: 73,
    },
    {
      id: "activity-8",
      title: "금요일 야식 번개런",
      activityDate: "2026-05-22T11:20:00.000Z",
      activityType: "POP_UP",
      activityIcon: null,
      location: "뚝섬한강공원 수변무대",
      total: 13,
      checkedIn: 10,
      noShow: 2,
      rate: 77,
    },
    {
      id: "activity-9",
      title: "초여름 브릭 정기런",
      activityDate: "2026-06-04T21:10:00.000Z",
      activityType: "OFFICIAL",
      activityIcon: "🌤️",
      location: "광나루 한강공원 만남의광장",
      total: 17,
      checkedIn: 14,
      noShow: 1,
      rate: 82,
    },
    {
      id: "activity-10",
      title: "금요일 리커버리 번개",
      activityDate: "2026-06-13T11:00:00.000Z",
      activityType: "POP_UP",
      activityIcon: null,
      location: "잠원 한강공원 체력단련장 앞",
      total: 11,
      checkedIn: 8,
      noShow: 1,
      rate: 73,
    },
  ],
  members: [
    {
      userId: storybookUser.id,
      user: {
        id: storybookUser.id,
        name: storybookUser.name,
        profileImage: storybookUser.profileImage,
      },
      totalEligible: 26,
      checkedIn: 22,
      noShow: 2,
      rate: 85,
      lastActivityAt: "2026-06-13T11:00:00.000Z",
      lastCheckedInAt: "2026-06-13T11:04:00.000Z",
    },
    {
      userId: "user-2",
      user: {
        id: "user-2",
        name: "이페이서",
        profileImage: null,
      },
      totalEligible: 24,
      checkedIn: 18,
      noShow: 4,
      rate: 75,
      lastActivityAt: "2026-06-13T11:00:00.000Z",
      lastCheckedInAt: "2026-06-04T21:12:00.000Z",
    },
    {
      userId: "user-3",
      user: {
        id: "user-3",
        name: "박지구력",
        profileImage: null,
      },
      totalEligible: 18,
      checkedIn: 11,
      noShow: 6,
      rate: 61,
      lastActivityAt: "2026-06-13T11:00:00.000Z",
      lastCheckedInAt: "2026-05-22T11:22:00.000Z",
    },
  ],
} as const;

export const storybookCrewAttendanceHistoryByUser = {
  [storybookUser.id]: {
    member: storybookCrewAttendanceStats.members[0],
    history: [
      {
        id: "attendance-history-1",
        activityId: "activity-2",
        title: "금요일 야간 번개",
        activityDate: "2026-04-12T11:00:00.000Z",
        activityType: "POP_UP",
        activityIcon: null,
        status: "CHECKED_IN",
        checkedAt: "2026-04-12T11:03:00.000Z",
        rsvpAt: "2026-04-10T08:00:00.000Z",
      },
      {
        id: "attendance-history-2",
        activityId: "activity-1",
        title: "수요일 아침 템포런",
        activityDate: "2026-04-10T21:30:00.000Z",
        activityType: "OFFICIAL",
        activityIcon: "🏃",
        status: "NO_SHOW",
        checkedAt: null,
        rsvpAt: "2026-04-08T06:00:00.000Z",
      },
    ],
  },
  "user-2": {
    member: storybookCrewAttendanceStats.members[1],
    history: [
      {
        id: "attendance-history-3",
        activityId: "activity-1",
        title: "수요일 아침 템포런",
        activityDate: "2026-04-10T21:30:00.000Z",
        activityType: "OFFICIAL",
        activityIcon: "🏃",
        status: "CHECKED_IN",
        checkedAt: "2026-04-10T21:34:00.000Z",
        rsvpAt: "2026-04-08T06:10:00.000Z",
      },
    ],
  },
  "user-3": {
    member: storybookCrewAttendanceStats.members[2],
    history: [
      {
        id: "attendance-history-4",
        activityId: "activity-2",
        title: "금요일 야간 번개",
        activityDate: "2026-04-12T11:00:00.000Z",
        activityType: "POP_UP",
        activityIcon: null,
        status: "NO_SHOW",
        checkedAt: null,
        rsvpAt: "2026-04-10T10:00:00.000Z",
      },
      {
        id: "attendance-history-5",
        activityId: "activity-1",
        title: "수요일 아침 템포런",
        activityDate: "2026-04-10T21:30:00.000Z",
        activityType: "OFFICIAL",
        activityIcon: "🏃",
        status: "NO_SHOW",
        checkedAt: null,
        rsvpAt: "2026-04-08T05:40:00.000Z",
      },
    ],
  },
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
      id: "board-post-announcement-1",
      boardId: "board-1",
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

export const storybookFreeBoardPosts = {
  items: [
    {
      id: "board-post-1",
      boardId: "board-2",
      title: "토요일 잠실 집결 같이 가실 분",
      content: "아침 7시에 잠실나루역에서 만나서 천천히 들어가요.",
      isPinned: false,
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
  ...storybookFreeBoardPosts.items[0],
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
