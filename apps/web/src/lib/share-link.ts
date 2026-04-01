export type ShareLinkResult = "shared" | "copied" | "dismissed";

interface ShareLinkOptions {
  title?: string;
  text?: string;
  url: string;
}

export async function shareLink({ title, text, url }: ShareLinkOptions): Promise<ShareLinkResult> {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text, url });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "dismissed";
      }
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return "copied";
  }

  throw new Error("공유를 지원하지 않는 환경입니다.");
}
