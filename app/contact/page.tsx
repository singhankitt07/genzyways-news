"use client";
import { useState } from "react";

const CONTACT_EMAIL = "hello.genzywaysnews@gmail.com";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Message from ${name || "website visitor"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <div className="py-12 max-w-lg mx-auto">
      <h1 className="font-serif text-4xl mb-3">Contact Us</h1>
      <p className="text-ink/70 mb-8">
        Tips, corrections, feedback, or partnership queries — send us a note and we'll get
        back to you. You can also write directly to{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-press">{CONTACT_EMAIL}</a>.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-line bg-surface px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-line bg-surface px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Message</label>
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border border-line bg-surface px-3 py-2"
          />
        </div>
        <button type="submit" className="button-primary">
          Send Message
        </button>
      </form>
    </div>
  );
}
