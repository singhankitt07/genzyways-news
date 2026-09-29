"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

type Profile = { name: string; email: string; age: number | null; dateOfBirth: string; country: string; state: string; city: string; address: string; pinCode: string; preferences: string; image: string; bio: string; preferredLanguage: string; theme: string; readingFontSize: number; emailAlerts: boolean; pushAlerts: boolean };
const blank: Profile = { name: "", email: "", age: null, dateOfBirth: "", country: "", state: "", city: "", address: "", pinCode: "", preferences: "", image: "", bio: "", preferredLanguage: "en", theme: "auto", readingFontSize: 18, emailAlerts: true, pushAlerts: true };

export default function ProfileForm() {
  const [profile, setProfile] = useState(blank);
  const [message, setMessage] = useState("");
  const { setTheme, setFontSize } = useTheme();
  useEffect(() => { fetch("/api/account/profile").then((response) => response.json()).then(setProfile); }, []);
  function update(field: keyof Profile, value: string) { setProfile((current) => ({ ...current, [field]: value })); }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/account/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
    if (!response.ok) {
      setMessage((await response.json()).error || "Unable to save profile.");
      return;
    }
    setTheme(profile.theme === "default" ? "auto" : profile.theme as "light" | "sepia" | "dark" | "auto");
    setFontSize(profile.readingFontSize);
    setMessage("Profile saved.");
  }
  return (
    <form onSubmit={save} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="text-sm">Name<input value={profile.name} onChange={(e) => update("name", e.target.value)} className="mt-1 w-full border border-line bg-surface px-3 py-2" required /></label>
        <label className="text-sm">Email<input value={profile.email} className="mt-1 w-full border border-line px-3 py-2 bg-paper text-ink/50" readOnly /></label>
        <label className="text-sm">Age<input type="number" min="13" max="120" value={profile.age ?? ""} onChange={(e) => update("age", e.target.value)} className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label>
        <label className="text-sm">Date of birth<input type="date" value={profile.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label>
        <label className="text-sm">Country<input value={profile.country} onChange={(e) => update("country", e.target.value)} placeholder="India or USA" className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label>
        <label className="text-sm">State / province<input value={profile.state} onChange={(e) => update("state", e.target.value)} className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label>
        <label className="text-sm">City<input value={profile.city} onChange={(e) => update("city", e.target.value)} className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label>
        <label className="text-sm">PIN / ZIP code<input value={profile.pinCode} onChange={(e) => update("pinCode", e.target.value)} className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label>
      </div>
      <label className="block text-sm">Address<textarea value={profile.address} onChange={(e) => update("address", e.target.value)} rows={3} className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label>
      <label className="block text-sm">News preferences <span className="text-ink/50">(for example: AI World, Business)</span><textarea value={profile.preferences} onChange={(e) => update("preferences", e.target.value)} rows={3} className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label>
      <label className="block text-sm">Profile photo URL<input value={profile.image} onChange={(e) => update("image", e.target.value)} className="mt-1 w-full border border-line bg-surface px-3 py-2" placeholder="https://..." /></label>
      <label className="block text-sm">Bio<textarea value={profile.bio} onChange={(e) => update("bio", e.target.value)} rows={3} className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm">Preferred language<select value={profile.preferredLanguage} onChange={(e) => update("preferredLanguage", e.target.value)} className="mt-1 w-full border border-line bg-surface px-3 py-2"><option value="en">English</option><option value="hi">हिंदी</option><option value="hinglish">Hinglish</option></select></label><label className="text-sm">Reading theme<select value={profile.theme === "default" ? "auto" : profile.theme} onChange={(e) => update("theme", e.target.value)} className="mt-1 w-full border border-line bg-surface px-3 py-2"><option value="light">Light</option><option value="sepia">Sepia</option><option value="dark">Dark</option><option value="auto">Auto</option></select></label><label className="text-sm">Article text size<select value={profile.readingFontSize} onChange={(e) => setProfile((current) => ({ ...current, readingFontSize: Number(e.target.value) }))} className="mt-1 w-full border border-line bg-surface px-3 py-2">{[16, 17, 18, 19, 20, 21, 22, 23, 24].map((size) => <option key={size} value={size}>{size}px</option>)}</select></label></div>
      <div className="flex flex-wrap gap-5 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={profile.emailAlerts} onChange={(e) => setProfile({ ...profile, emailAlerts: e.target.checked })} />Email alerts</label><label className="flex items-center gap-2"><input type="checkbox" checked={profile.pushAlerts} onChange={(e) => setProfile({ ...profile, pushAlerts: e.target.checked })} />News alerts</label></div>
      <button className="button-primary text-sm" type="submit">Save profile</button>
      {message && <p className="text-sm text-ink/70">{message}</p>}
    </form>
  );
}
