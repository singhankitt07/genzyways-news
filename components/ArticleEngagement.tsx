"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CommentItem = { id: string; body: string; editedAt?: string | null; createdAt: string; parentId?: string | null; user: { id: string; name: string; image?: string | null }; votes: number; voted: boolean; own: boolean; removed: boolean };
type Props = { articleId: string };
const reactionLabels = [{ type: "LIKE", label: "Like" }, { type: "INSIGHTFUL", label: "Insightful" }, { type: "SAD", label: "Sad" }, { type: "ANGRY", label: "Angry" }];

export default function ArticleEngagement({ articleId }: Props) {
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [activeReactions, setActiveReactions] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    const [articleResponse, commentResponse] = await Promise.all([fetch(`/api/engagement/article?articleId=${articleId}`), fetch(`/api/engagement/comments?articleId=${articleId}`)]);
    if (articleResponse.ok) { const data = await articleResponse.json(); setReactions(data.reactions || {}); setSaved(data.saved); }
    if (commentResponse.ok) setComments((await commentResponse.json()).comments || []);
  }
  useEffect(() => { load(); fetch("/api/engagement/article", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ articleId, action: "history", progress: 100 }) }); }, [articleId]);

  async function action(payload: Record<string, unknown>) {
    const response = await fetch("/api/engagement/article", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ articleId, ...payload }) });
    if (response.status === 401) { setMessage("Sign in to save, react, or track reading history."); return; }
    if (!response.ok) { setMessage((await response.json()).error || "Unable to update this article."); return; }
    const data = await response.json();
    if (payload.action === "bookmark") setSaved(data.saved);
    if (typeof payload.action === "string" && reactionLabels.some((item) => item.type === payload.action)) setActiveReactions((items) => data.active ? [...new Set([...items, payload.action as string])] : items.filter((item) => item !== payload.action));
    await load();
  }

  async function submitComment(event: React.FormEvent) {
    event.preventDefault();
    const endpoint = editing ? "/api/engagement/comments" : "/api/engagement/comments";
    const response = await fetch(endpoint, { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing ? { id: editing, body } : { articleId, body, parentId: replyTo }) });
    const data = await response.json();
    if (response.status === 401) setMessage("Sign in to join the conversation.");
    else if (!response.ok) setMessage(data.error || "Unable to save comment.");
    else { setBody(""); setReplyTo(null); setEditing(null); setMessage(""); await load(); }
  }

  async function deleteComment(id: string) { const response = await fetch(`/api/engagement/comments?id=${id}`, { method: "DELETE" }); if (response.ok) load(); else setMessage((await response.json()).error || "Unable to delete comment."); }
  async function vote(commentId: string) { const response = await fetch("/api/engagement/comments/vote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ commentId }) }); if (response.status === 401) setMessage("Sign in to upvote comments."); else load(); }
  async function report(commentId: string) { const response = await fetch("/api/engagement/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ commentId }) }); setMessage(response.ok ? "Thanks. The comment has been reported for review." : (await response.json()).error || "Unable to report comment."); }

  const topLevel = comments.filter((comment) => !comment.parentId);
  function renderComment(comment: CommentItem, depth = 0) {
    return <div key={comment.id} className={`border-t border-line py-4 ${depth ? "ml-5 border-l pl-4" : ""}`}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">{comment.user.name}</p><p className="text-xs text-ink/50">{new Date(comment.createdAt).toLocaleDateString()}</p></div><button type="button" onClick={() => report(comment.id)} className="text-xs text-ink/50 underline hover:text-press">Report</button></div><p className={`mt-2 text-sm leading-relaxed ${comment.removed ? "italic text-ink/50" : ""}`}>{comment.body}{comment.editedAt && !comment.removed ? " (edited)" : ""}</p>{!comment.removed && <div className="mt-3 flex flex-wrap gap-3 text-xs"><button type="button" onClick={() => vote(comment.id)} className={comment.voted ? "font-bold text-press" : "text-ink/60 hover:text-press"}>Upvote ({comment.votes})</button><button type="button" onClick={() => { setReplyTo(comment.id); setEditing(null); }} className="text-ink/60 hover:text-press">Reply</button>{comment.own && <><button type="button" onClick={() => { setEditing(comment.id); setReplyTo(null); setBody(comment.body); }} className="text-ink/60 hover:text-press">Edit</button><button type="button" onClick={() => deleteComment(comment.id)} className="text-ink/60 hover:text-press">Delete</button></>}</div>}{comments.filter((reply) => reply.parentId === comment.id).map((reply) => renderComment(reply, depth + 1))}</div>;
  }

  return <section className="article-engagement mt-12 border-t-2 border-press pt-6" aria-labelledby="engagement-heading"><div className="flex flex-wrap items-center justify-between gap-4"><h2 id="engagement-heading" className="font-serif text-2xl">Join the conversation</h2><button type="button" onClick={() => action({ action: "bookmark" })} className="button-secondary text-sm">{saved ? "Saved" : "Save for later"}</button></div><div className="mt-5 flex flex-wrap gap-2">{reactionLabels.map((reaction) => <button key={reaction.type} type="button" onClick={() => action({ action: reaction.type })} className={`rounded-full border border-line px-3 py-2 text-xs ${activeReactions.includes(reaction.type) ? "border-press text-press" : "hover:border-press"}`}>{reaction.label} {reactions[reaction.type] || 0}</button>)}</div><form onSubmit={submitComment} className="mt-8 space-y-3"><label htmlFor="comment-body" className="block text-sm font-semibold">{editing ? "Edit your comment" : replyTo ? "Write a reply" : "Share your thoughts"}</label><textarea id="comment-body" required rows={4} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Keep the conversation thoughtful and useful." className="w-full border border-line bg-surface px-3 py-2" /><div className="flex flex-wrap gap-3"><button type="submit" className="button-primary text-sm">{editing ? "Save edit" : replyTo ? "Post reply" : "Post comment"}</button>{(editing || replyTo) && <button type="button" onClick={() => { setEditing(null); setReplyTo(null); setBody(""); }} className="button-secondary text-sm">Cancel</button>}</div></form>{message && <p className="mt-3 text-sm text-press">{message} {message.startsWith("Sign in") && <Link href="/account/login" className="underline">Sign in</Link>}</p>}<div className="mt-8"><h3 className="font-serif text-xl">Comments ({comments.length})</h3><div className="mt-2">{topLevel.length ? topLevel.map((comment) => renderComment(comment)) : <p className="py-5 text-sm text-ink/60">No comments yet. Start the conversation.</p>}</div></div></section>;
}
