import { useEffect, useState } from "react";
import type { UserProfile } from "../hooks/useUserProfile";

const inputClass =
  "w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-gray-500 focus:border-[#0099BB] focus:outline-none";
const labelClass = "mb-1 block text-sm text-gray-300";

interface Props {
  profile: UserProfile | null;
  onSubmit: (fname: string, lname: string) => Promise<void>;
}

const CompleteProfileModal = ({ profile, onSubmit }: Props) => {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFname(profile.fname ?? "");
      setLname(profile.lname ?? "");
    }
  }, [profile]);

  // Lock body scroll while the modal is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fname.trim() || !lname.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(fname.trim(), lname.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="complete-profile-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-gradient-to-br from-[#0F1F3C] to-[#101c3b] p-8 text-white shadow-2xl">
        <h1 id="complete-profile-title" className="mb-2 font-bayon text-3xl">
          Complete Your Profile
        </h1>
        <p className="mb-6 text-sm text-gray-400">
          Please tell us your name to finish setting up your account.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="fname">
                First Name *
              </label>
              <input
                id="fname"
                name="fname"
                type="text"
                required
                autoFocus
                value={fname}
                onChange={(e) => setFname(e.target.value)}
                className={inputClass}
                placeholder="John"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="lname">
                Last Name *
              </label>
              <input
                id="lname"
                name="lname"
                type="text"
                required
                value={lname}
                onChange={(e) => setLname(e.target.value)}
                className={inputClass}
                placeholder="Doe"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !fname.trim() || !lname.trim()}
            className="w-full rounded bg-gradient-to-r from-[#004466] to-[#0099BB] py-3 font-bayon text-lg text-white hover:shadow-lg hover:shadow-[#0099BB]/50 disabled:opacity-50"
          >
            {submitting ? "SAVING..." : "SAVE & CONTINUE"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfileModal;
