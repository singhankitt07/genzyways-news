"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ShareButtons from "./ShareButtons";

type Props = { articleId: string; title: string; path: string };

function BookmarkIcon({ saved }: { saved: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-4-6 4V4.75Z" /></svg>;
}

function ShareIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.7 10.7 6.6-4.4m-6.6 7 6.6 4.4" /></svg>;
}

export default function ArticleReadingTools({ articleId, title, path }: Props) {
  const [saved, setSaved] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/engagement/article?articleId=${encodeURIComponent(articleId)}`)
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (active && data) setSaved(Boolean(data.saved)); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [articleId]);

  useEffect(() => {
    if (!shareOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShareOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shareOpen]);

  async function toggleBookmark() {
    setFeedback("");
    const response = await fetch("/api/engagement/article", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, action: "bookmark" })
    });
    if (response.status === 401) {
      setFeedback("Sign in to save this story.");
      return;
    }
    if (!response.ok) {
      setFeedback("Could not update the saved story.");
      return;
    }
    setSaved(Boolean((await response.json()).saved));
    setFeedback("");
  }

  return (
    <div className="article-reading-tools" aria-label="Article actions">
      <button type="button" className="reading-tool-button" onClick={toggleBookmark} aria-label={saved ? "Remove bookmark" : "Bookmark article"} aria-pressed={saved} title={saved ? "Remove bookmark" : "Bookmark article"}>
        <BookmarkIcon saved={saved} /><span className="reading-tool-label">{saved ? "Saved" : "Save"}</span>
      </button>
      <button type="button" className="reading-tool-button" onClick={() => setShareOpen((open) => !open)} aria-label="Share article" aria-expanded={shareOpen} aria-controls="article-share-options" title="Share article">
        <ShareIcon /><span className="reading-tool-label">Share</span>
      </button>
      <div id="article-share-options" className={`reading-share-menu ${shareOpen ? "is-open" : ""}`} hidden={!shareOpen} aria-label="Share this story">
        <ShareButtons title={title} path={path} />
      </div>
      {feedback && <p className="reading-tool-feedback" role="status">{feedback}{feedback.startsWith("Sign in") && <> <Link href="/account/login" className="underline">Sign in</Link></>}</p>}
    </div>
  );
}