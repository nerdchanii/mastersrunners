import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useChatBackToMessages() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const currentState = window.history.state ?? {};
    const userState = currentState.usr ?? {};
    if (userState.chatMessagesBackstop === true) {
      return;
    }

    const detailUrl = `${location.pathname}${location.search}${location.hash}`;

    window.history.replaceState(
      {
        ...currentState,
        usr: {
          ...userState,
          chatMessagesBase: true,
        },
      },
      "",
      "/messages",
    );

    window.history.pushState(
      {
        ...currentState,
        usr: {
          ...userState,
          chatMessagesBackstop: true,
        },
      },
      "",
      detailUrl,
    );
  }, [location.hash, location.pathname, location.search]);

  return () => navigate("/messages");
}
