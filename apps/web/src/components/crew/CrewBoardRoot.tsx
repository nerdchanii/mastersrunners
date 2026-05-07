import type { Board } from "@/hooks/useCrewBoards";

import { CrewBoardFeed } from "./CrewBoardFeed";
import {
  BoardPostAccessGate,
  BoardPostUnavailable,
  CrewBoardPostDetail,
} from "./CrewBoardPostDetail";
import { CrewBoardPosts } from "./CrewBoardPosts";
import type { CrewBoardNavigation } from "./useCrewBoardNavigation";

export function CrewBoardRoot({
  crewId,
  canOpenBoardPosts,
  isAuthenticated,
  isMember,
  isAdmin,
  onRequireAuth,
  defaultSelectedBoardId,
  defaultSelectedBoardType,
  routedBoardId,
  routedPostId,
  hideBoardHeader = false,
  showInlineCreateAction = true,
  navigation,
}: {
  crewId: string;
  canOpenBoardPosts: boolean;
  isAuthenticated: boolean;
  isMember: boolean;
  isAdmin: boolean;
  onRequireAuth: () => void;
  defaultSelectedBoardId?: string;
  defaultSelectedBoardType?: string;
  routedBoardId?: string;
  routedPostId?: string;
  hideBoardHeader?: boolean;
  showInlineCreateAction?: boolean;
  navigation: CrewBoardNavigation;
}) {
  const {
    visibleBoards,
    announcementBoard,
    defaultComposerBoard,
    routedPostBoard,
    selectedBoard,
    selectedPost,
    closeRoutedPost,
    closeSelectedBoard,
    closeSelectedPost,
    selectBoard,
    openPost,
    composer,
  } = navigation;

  if (routedBoardId && routedPostId && !routedPostBoard) {
    return <BoardPostUnavailable showBackAction={false} />;
  }

  if (routedBoardId && routedPostId && !canOpenBoardPosts) {
    return <BoardPostAccessGate isAuthenticated={isAuthenticated} onRequireAuth={onRequireAuth} />;
  }

  if (routedPostId && routedPostBoard) {
    return (
      <CrewBoardPostDetail
        crewId={crewId}
        board={routedPostBoard}
        postId={routedPostId}
        isMember={isMember}
        onBack={closeRoutedPost}
        showUnavailableBackAction={false}
      />
    );
  }

  if (selectedPost && selectedBoard) {
    return (
      <CrewBoardPostDetail
        crewId={crewId}
        board={selectedBoard}
        postId={selectedPost}
        isMember={isMember}
        onBack={closeSelectedPost}
      />
    );
  }

  if (selectedBoard) {
    return (
      <CrewBoardPosts
        crewId={crewId}
        board={selectedBoard}
        isMember={isMember}
        isAdmin={isAdmin}
        hideBoardNavigation={!!defaultSelectedBoardId || !!defaultSelectedBoardType}
        hideBoardHeader={hideBoardHeader}
        showInlineCreateAction={showInlineCreateAction}
        announcementBoard={announcementBoard}
        composer={composer}
        onBack={closeSelectedBoard}
        onSelectBoard={selectBoard}
        onSelectPost={(postId) => openPost(selectedBoard, postId)}
      />
    );
  }

  return (
    <CrewBoardFeed
      crewId={crewId}
      boards={visibleBoards}
      defaultComposerBoard={defaultComposerBoard}
      announcementBoard={announcementBoard}
      isAuthenticated={isAuthenticated}
      isAdmin={isAdmin}
      canOpenBoardPosts={canOpenBoardPosts}
      composer={composer}
      onRequireAuth={onRequireAuth}
      onSelectPost={(post) => openPost(post.board, post.id)}
    />
  );
}

export type CrewBoardRoutedPostHandler = (board: Board, postId: string) => void;
