"use client";

import { useEffect, useState } from "react";

export default function AdminNewsletterManager() {
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [subscribers, setSubscribers] = useState(0);
  const [configured, setConfigured] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/newsletter").then(async (response) => {
      const data = await response.json();
      if (response.ok) { setSubscribers(data.subscribers); setConfigured(data.configured); }
    }).catch(() => setMessage("Unable to load newsletter status."));
  }, []);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!window.confirm(`Send this newsletter to ${subscribers} confirmed subscribers?`)) return;
    setSending(true); setMessage("");
    try {
      const response = await fetch("/api/admin/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, text }) });
      const data = await response.json();
      if (!response.ok) { setMessage(data.delivered ? `${data.error} ${data.delivered} messages were accepted before the error.` : data.error || "Unable to send newsletter."); return; }
      setMessage(`Newsletter accepted for ${data.delivered} subscribers.`);
      setSubject(""); setText("");
    } catch {
      setMessage("Unable to reach the newsletter service.");
    } finally {
      setSending(false);
    }
  }

  return <div className="admin-page max-w-3xl space-y-7 py-8">
    <section>
      <p className="section-kicker mb-2">Audience</p>
      <h1 className="font-serif text-3xl">Newsletter</h1>
      <p className="mt-2 text-sm text-ink/65">{subscribers} confirmed subscribers</p>
      {!configured && <p className="mt-3 border-l-2 border-gold pl-3 text-sm">Email sending is not configured. Set the Resend API key and verified sender address in the deployment environment.</p>}
    </section>
    <form onSubmit={send} className="space-y-4 border-t border-line pt-6">
      <label className="block text-sm">Subject<input required maxLength={180} value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-1 w-full border border-line bg-surface px-3 py-2.5" /></label>
      <label className="block text-sm">Message<textarea required maxLength={30000} rows={14} value={text} onChange={(event) => setText(event.target.value)} placeholder="Write the newsletter message. Blank lines separate paragraphs." className="mt-1 w-full border border-line bg-surface px-3 py-3" /></label>
      <button type="submit" disabled={sending || !configured || subscribers === 0} className="button-primary disabled:cursor-not-allowed disabled:opacity-50">{sending ? "Sending..." : "Send newsletter"}</button>
    </form>
    {message && <p role="status" className="text-sm text-press">{message}</p>}
  </div>;
}