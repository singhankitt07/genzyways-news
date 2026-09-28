"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  title: string;
  category: string;
  published: boolean;
  breaking: boolean;
  createdAt: string;
};

export default function ArticleRow(props: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function togglePublished() {
    setBusy(true);
    await fetch(`/api/articles/${props.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...props, published: !props.published })
    });
    setBusy(false);
    setMessage(props.published ? "Moved to drafts" : "Published");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${props.title}"? This cannot be undone.`)) return;
    setBusy(true);
    await fetch(`/api/articles/${props.id}`, { method: "DELETE" });
    router.refresh();
    setMessage("Deleted");
  }

  return (
    <tr className="border-b border-line">
      <td className="py-3 pr-4">
        <Link href={`/admin/articles/${props.id}`} className="hover:underline font-medium">
          {props.title}
        </Link>
        {props.breaking && <span className="ml-2 text-xs text-press font-semibold">BREAKING</span>}
      </td>
      <td className="py-3 pr-4 text-sm text-ink/60">{props.category}</td>
      <td className="py-3 pr-4 text-sm">
        <button
          onClick={togglePublished}
          disabled={busy}
          className={props.published ? "text-green-700" : "text-ink/50"}
        >
          {props.published ? "Published" : "Draft"}
        </button>
      </td>
      <td className="py-3 text-right text-sm">
        <Link href={`/admin/articles/${props.id}`} className="text-ink/60 hover:text-ink mr-4">
          Edit
        </Link>
        <button onClick={handleDelete} disabled={busy} className="text-press hover:underline">
          Delete
        </button>
        {message && <span role="status" className="ml-3 text-xs text-green-700">{message}</span>}
      </td>
    </tr>
  );
}
