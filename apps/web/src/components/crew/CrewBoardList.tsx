import { Skeleton } from "@/components/ui/skeleton";
import { useBoards } from "@/hooks/useCrewBoards";

import { BoardPostComposer } from "./CrewBoardComposerEntry";
import { CrewBoardRoot, type CrewBoardRoutedPostHandler } from "./CrewBoardRoot";
import { useCrewBoardNavigation } from "./useCrewBoardNavigation";

interface Props {
  crewId: string;
  canOpenBoardPosts: boolean;
  isAuthenticated: boolean;
  isMember: boolean;
  isAdmin: boolean;
  onRequireAuth: () => void;
  defaultSelectedBoardId?: string;
  defaultSelectedPostId?: string;
  defaultSelectedBoardType?: string;
  composerDefaultBoardType?: string;
  allowedBoardTypes?: string[];
  routedBoardId?: string;
  routedPostId?: string;
  composerNonce?: number;
  hideBoardHeader?: boolean;
  showInlineCreateAction?: boolean;
  isActive?: boolean;
  onCloseRoutedPost?: () => void;
  onSelectRoutedPost?: CrewBoardRoutedPostHandler;
  onComposerHandled?: () => void;
}

export default function CrewBoardList({
  crewId,
  canOpenBoardPosts,
  isAuthenticated,
  isMember,
  isAdmin,
  onRequireAuth,
  defaultSelectedBoardId,
  defaultSelectedPostId,
  defaultSelectedBoardType,
  composerDefaultBoardType,
  allowedBoardTypes,
  routedBoardId,
  routedPostId,
  composerNonce = 0,
  hideBoardHeader = false,
  showInlineCreateAction = true,
  isActive = true,
  onCloseRoutedPost,
  onSelectRoutedPost,
  onComposerHandled,
}: Props) {
  const { data: boards, isLoading } = useBoards(crewId);
  const navigation = useCrewBoardNavigation({
    boards,
    isMember,
    isAdmin,
    defaultSelectedBoardId,
    defaultSelectedPostId,
    defaultSelectedBoardType,
    composerDefaultBoardType,
    allowedBoardTypes,
    routedBoardId,
    routedPostId,
    composerNonce,
    isActive,
    onCloseRoutedPost,
    onSelectRoutedPost,
    onComposerHandled,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <CrewBoardRoot
      crewId={crewId}
      canOpenBoardPosts={canOpenBoardPosts}
      isAuthenticated={isAuthenticated}
      isMember={isMember}
      isAdmin={isAdmin}
      onRequireAuth={onRequireAuth}
      defaultSelectedBoardId={defaultSelectedBoardId}
      defaultSelectedBoardType={defaultSelectedBoardType}
      routedBoardId={routedBoardId}
      routedPostId={routedPostId}
      hideBoardHeader={hideBoardHeader}
      showInlineCreateAction={showInlineCreateAction}
      navigation={navigation}
    />
  );
}

export { BoardPostComposer };
