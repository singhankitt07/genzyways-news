"use client";

import { useEffect, useState } from "react";

type Profile = { name: string; email: string; age: number | null; dateOfBirth: string; country: string; state: string; city: string; address: string; pinCode: string; preferences: string };
const blank: Profile = { name: "", email: "", age: null, dateOfBirth: "", country: "", state: "", city: "", address: "", pinCode: "", preferences: "" };

export default function ProfileForm() {
  const [profile, setProfile] = useState(blank);
  const [message, setMessage] = useState("");
  useEffect(() => { fetch("/api/account/profile").then((response) => response.json()).then(setProfile); }, []);
  function update(field: keyof Profile, value: string) { setProfile((current) => ({ ...current, [field]: value })); }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/account/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
    setMessage(response.ok ? "Profile saved." : (await response.json()).error || "Unable to save profile.");
  }
  return (
    <form onSubmit={save} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="text-sm">Name<input value={profile.name} onChange={(e) => update("name", e.target.value)} className="mt-1 w-full border border-line px-3 py-2 bg-white" required /></label>
        <label className="text-sm">Email<input value={profile.email} className="mt-1 w-full border border-line px-3 py-2 bg-paper text-ink/50" readOnly /></label>
        <label className="text-sm">Age<input type="number" min="13" max="120" value={profile.age ?? ""} onChange={(e) => update("age", e.target.value)} className="mt-1 w-full border border-line px-3 py-2 bg-white" /></label>
        <label className="text-sm">Date of birth<input type="date" value={profile.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} className="mt-1 w-full border border-line px-3 py-2 bg-white" /></label>
        <label className="text-sm">Country<input value={profile.country} onChange={(e) => update("country", e.target.value)} placeholder="India or USA" className="mt-1 w-full border border-line px-3 py-2 bg-white" /></label>
        <label className="text-sm">State / province<input value={profile.state} onChange={(e) => update("state", e.target.value)} className="mt-1 w-full border border-line px-3 py-2 bg-white" /></label>
        <label className="text-sm">City<input value={profile.city} onChange={(e) => update("city", e.target.value)} className="mt-1 w-full border border-line px-3 py-2 bg-white" /></label>
        <label className="text-sm">PIN / ZIP code<input value={profile.pinCode} onChange={(e) => update("pinCode", e.target.value)} className="mt-1 w-full border border-line px-3 py-2 bg-white" /></label>
      </div>
      <label className="block text-sm">Address<textarea value={profile.address} onChange={(e) => update("address", e.target.value)} rows={3} className="mt-1 w-full border border-line px-3 py-2 bg-white" /></label>
      <label className="block text-sm">News preferences <span className="text-ink/50">(for example: AI World, Business)</span><textarea value={profile.preferences} onChange={(e) => update("preferences", e.target.value)} rows={3} className="mt-1 w-full border border-line px-3 py-2 bg-white" /></label>
      <button className="bg-ink px-5 py-2.5 text-sm text-white" type="submit">Save profile</button>
      {message && <p className="text-sm text-ink/70">{message}</p>}
    </form>
  );
}
