import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface MentionLinkProps {
  children: string;
}

/** Parses text and renders @username as clickable profile links */
export function MentionLink({ children }: MentionLinkProps) {
  const parts = children.split(/(@\S+)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("@")) {
          const username = part.slice(1);
          return (
            <Link
              key={i}
              to={`/profile/${username}`}
              className="font-semibold text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/** Renders text content with @mentions parsed as links */
export function CommentContent({ content }: { content: string }) {
  const hasMention = content.includes("@");

  if (!hasMention) {
    return <span>{content}</span>;
  }

  return <MentionLink>{content}</MentionLink>;
}
