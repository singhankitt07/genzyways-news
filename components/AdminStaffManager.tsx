"use client";

import { useEffect, useState } from "react";

type StaffMember = { id: string; email: string; name: string; role: "ADMIN" | "EDITOR" | "MODERATOR" };
const roleNames = { ADMIN: "Administrator", EDITOR: "Editor", MODERATOR: "Moderator" };

export default function AdminStaffManager() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffMember["role"]>("EDITOR");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const response = await fetch("/api/admin/staff");
    const data = await response.json();
    if (response.ok) setStaff(data.staff);
    else setMessage(data.error || "Unable to load staff accounts.");
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createStaff(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/admin/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password, role }) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error || "Unable to create account."); return; }
    setStaff((current) => [...current, data.user]);
    setName(""); setEmail(""); setPassword(""); setRole("EDITOR");
    setMessage(data.promoted ? "Reader account promoted to staff." : "Staff account created.");
  }

  async function updateStaff(member: StaffMember) {
    const response = await fetch("/api/admin/staff", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(member) });
    const data = await response.json();
    setMessage(response.ok ? "Staff account updated." : data.error || "Unable to update account.");
    if (response.ok) setStaff((current) => current.map((item) => item.id === member.id ? data.user : item));
  }

  async function removeStaff(member: StaffMember) {
    if (!window.confirm(`Remove ${member.name}'s staff access? Their reader account and content will remain.`)) return;
    const response = await fetch("/api/admin/staff", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: member.id }) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error || "Unable to remove account."); return; }
    setStaff((current) => current.filter((item) => item.id !== member.id));
    setMessage("Staff account removed.");
  }

  return <div className="admin-page space-y-8 py-8">
    <section>
      <p className="section-kicker mb-2">Access control</p>
      <h1 className="font-serif text-3xl">Staff & roles</h1>
      <p className="mt-2 text-sm text-ink/65">Administrators manage all areas and staff. Editors manage articles. Moderators review comment reports.</p>
    </section>
    <section className="border-t border-line pt-6">
      <h2 className="font-serif text-xl">Staff accounts</h2>
      {loading ? <p className="py-6 text-sm text-ink/60">Loading accounts...</p> : <div className="mt-3 overflow-x-auto border-y border-line"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b border-line text-ink/60"><th className="py-3 pr-4 font-medium">Name</th><th className="py-3 pr-4 font-medium">Email</th><th className="py-3 pr-4 font-medium">Role</th><th className="py-3 font-medium">Actions</th></tr></thead><tbody>{staff.map((member) => <tr key={member.id} className="border-b border-line last:border-0"><td className="py-3 pr-4"><input aria-label={`${member.email} name`} value={member.name} onChange={(event) => setStaff((current) => current.map((item) => item.id === member.id ? { ...item, name: event.target.value } : item))} className="w-full border border-line bg-surface px-2 py-1.5" /></td><td className="py-3 pr-4">{member.email}</td><td className="py-3 pr-4"><select aria-label={`${member.email} role`} value={member.role} onChange={(event) => setStaff((current) => current.map((item) => item.id === member.id ? { ...item, role: event.target.value as StaffMember["role"] } : item))} className="border border-line bg-surface px-2 py-1.5">{Object.entries(roleNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td><td className="py-3"><div className="flex gap-3"><button type="button" onClick={() => updateStaff(member)} className="text-press underline">Save</button><button type="button" onClick={() => removeStaff(member)} className="text-ink/60 underline">Remove</button></div></td></tr>)}</tbody></table></div>}
    </section>
    <section className="max-w-2xl border-t border-line pt-6">
      <h2 className="font-serif text-xl">Add staff member</h2>
      <p className="mt-1 text-sm text-ink/60">An existing reader account can be promoted by email. Set a temporary password only for a new account.</p>
      <form onSubmit={createStaff} className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">Full name<input required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label>
        <label className="text-sm">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label>
        <label className="text-sm">Temporary password<input type="password" minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full border border-line bg-surface px-3 py-2" /></label>
        <label className="text-sm">Role<select value={role} onChange={(event) => setRole(event.target.value as StaffMember["role"])} className="mt-1 w-full border border-line bg-surface px-3 py-2">{Object.entries(roleNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <button type="submit" className="button-primary justify-self-start">Create account</button>
      </form>
    </section>
    {message && <p role="status" className="text-sm text-press">{message}</p>}
  </div>;
}