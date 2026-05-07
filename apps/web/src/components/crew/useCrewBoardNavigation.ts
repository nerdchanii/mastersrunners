import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Board } from "@/hooks/useCrewBoards";

interface UseCrewBoardNavigationOptions {
  boards: Board[] | undefined;
  isMember: boolean;
  isAdmin: boolean;
  defaultSelectedBoardId?: string;
  defaultSelectedPostId?: string;
  defaultSelectedBoardType?: string;
  composerDefaultBoardType?: string;
  allowedBoardTypes?: string[];
  routedBoardId?: string;
  routedPostId?: string;
  composerNonce?: number;
  isActive?: boolean;
  onCloseRoutedPost?: () => void;
  onSelectRoutedPost?: (board: Board, postId: string) => void;
  onComposerHandled?: () => void;
}

export interface CrewBoardComposerNavigation {
  showForm: boolean;
  closeCreateForm: () => void;
  toggleCreateForm: () => void;
}

export interface CrewBoardNavigation {
  visibleBoards: Board[] | undefined;
  announcementBoard: Board | null;
  defaultComposerBoard: Board | undefined;
  routedPostBoard: Board | undefined;
  selectedBoard: Board | null;
  selectedPost: string | null;
  closeRoutedPost: () => void;
  closeSelectedBoard: () => void;
  closeSelectedPost: () => void;
  selectBoard: (board: Board) => void;
  openPost: (board: Board, postId: string) => void;
  composer: CrewBoardComposerNavigation;
}

export function useCrewBoardNavigation({
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
  composerNonce = 0,
  isActive = true,
  onCloseRoutedPost,
  onSelectRoutedPost,
  onComposerHandled,
}: UseCrewBoardNavigationOptions): CrewBoardNavigation {
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [showComposerForm, setShowComposerForm] = useState(false);
  const handledComposerNonceRef = useRef(0);

  const visibleBoards = useMemo(() => {
    if (!allowedBoardTypes?.length) {
      return boards;
    }

    return boards?.filter((board) => allowedBoardTypes.includes(board.type));
  }, [allowedBoardTypes, boards]);

  const announcementBoard = visibleBoards?.find((item) => item.type === "ANNOUNCEMENT") ?? null;
  const defaultComposerBoard =
    visibleBoards?.find((item) => item.type === composerDefaultBoardType) ?? visibleBoards?.[0];
  const defaultSelectedBoard =
    visibleBoards?.find((item) => item.id === defaultSelectedBoardId) ??
    visibleBoards?.find((item) => item.type === defaultSelectedBoardType) ??
    null;
  const routedPostBoard = routedBoardId
    ? visibleBoards?.find((item) => item.id === routedBoardId)
    : undefined;
  const hasActivePostView = !!selectedPost || !!(routedBoardId && routedPostId);

  useEffect(() => {
    if (selectedBoard || !defaultSelectedBoard) {
      return;
    }

    setSelectedBoard(defaultSelectedBoard);
    if (defaultSelectedPostId) {
      setSelectedPost(defaultSelectedPostId);
    }
  }, [defaultSelectedBoard, defaultSelectedPostId, selectedBoard]);

  const canWriteComposer = useCallback(
    (board: Board, surface: "board" | "feed") => {
      if (surface === "feed") {
        return isMember || isAdmin;
      }

      return board.writePermission === "ALL_MEMBERS" ? isMember : isAdmin;
    },
    [isAdmin, isMember],
  );

  useEffect(() => {
    if (!isActive || hasActivePostView) {
      setShowComposerForm(false);
      return;
    }

    if (!composerNonce || handledComposerNonceRef.current === composerNonce) {
      return;
    }

    const targetBoard = selectedBoard ?? defaultSelectedBoard ?? defaultComposerBoard;
    if (!targetBoard) {
      return;
    }

    const targetSurface = selectedBoard || defaultSelectedBoard ? "board" : "feed";
    if (!canWriteComposer(targetBoard, targetSurface)) {
      return;
    }

    handledComposerNonceRef.current = composerNonce;

    if (!selectedBoard && defaultSelectedBoard) {
      setSelectedBoard(defaultSelectedBoard);
      if (defaultSelectedPostId) {
        setSelectedPost(defaultSelectedPostId);
      }
    }

    setShowComposerForm(true);
    onComposerHandled?.();
  }, [
    canWriteComposer,
    composerNonce,
    defaultComposerBoard,
    defaultSelectedBoard,
    defaultSelectedPostId,
    hasActivePostView,
    isActive,
    onComposerHandled,
    selectedBoard,
  ]);

  const closeCreateForm = useCallback(() => {
    setShowComposerForm(false);
  }, []);

  const toggleCreateForm = useCallback(() => {
    setShowComposerForm((current) => !current);
  }, []);

  const closeRoutedPost = useCallback(() => {
    setShowComposerForm(false);

    if (onCloseRoutedPost) {
      onCloseRoutedPost();
      return;
    }

    setSelectedPost(null);
    setSelectedBoard(null);
  }, [onCloseRoutedPost]);

  const closeSelectedBoard = useCallback(() => {
    setShowComposerForm(false);
    setSelectedBoard(null);
  }, []);

  const closeSelectedPost = useCallback(() => {
    setShowComposerForm(false);
    setSelectedPost(null);
  }, []);

  const selectBoard = useCallback((board: Board) => {
    setShowComposerForm(false);
    setSelectedBoard(board);
  }, []);

  const openPost = useCallback(
    (board: Board, postId: string) => {
      setShowComposerForm(false);

      if (onSelectRoutedPost) {
        onSelectRoutedPost(board, postId);
        return;
      }

      setSelectedBoard(board);
      setSelectedPost(postId);
    },
    [onSelectRoutedPost],
  );

  return {
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
    composer: {
      showForm: showComposerForm,
      closeCreateForm,
      toggleCreateForm,
    },
  };
}
