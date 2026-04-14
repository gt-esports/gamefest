import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { SignInButton, useUser } from "../hooks/useAuth";
import { useRegistration } from "../hooks/useRegistration";
import type { AdmissionType, CreateRegistrationInput } from "../schemas/RegistrationSchema";

const inputClass =
  "w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-gray-500 focus:border-[#0099BB] focus:outline-none";

const labelClass = "mb-1 block text-sm text-gray-300";

const RegistrationPage = () => {
  const { isLoaded, user } = useUser();
  const { registration, loading, register } = useRegistration(user?.id ?? null);
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateRegistrationInput>({
    first_name: "",
    last_name: "",
    email: "",
    admission_type: "GA",
    school: "",
    heard_from: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAdmissionType = (type: AdmissionType) => {
    setForm((prev) => ({ ...prev, admission_type: type }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      await register(form);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-col bg-streak bg-cover">
      <div className="mt-40 flex justify-center px-4 pb-20 tracking-wider">
        <div className="w-full max-w-2xl">
          {!isLoaded || loading ? (
            <p className="text-white">Loading...</p>
          ) : !user ? (
            <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-[#0F1F3C]/90 to-[#101c3b]/90 p-8 text-white shadow-xl">
              <h1 className="mb-4 font-bayon text-3xl">Register for GameFest</h1>
              <p className="mb-6 text-gray-300">You must be signed in with Discord to register.</p>
              <SignInButton>
                <span className="rounded bg-gradient-to-r from-[#004466] to-[#0099BB] px-6 py-2 font-bayon text-white hover:shadow-lg hover:shadow-[#0099BB]/50">
                  LOGIN WITH DISCORD
                </span>
              </SignInButton>
            </div>
          ) : registration ? (
            <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-[#0F1F3C]/90 to-[#101c3b]/90 p-8 text-white shadow-xl">
              <h1 className="mb-2 font-bayon text-3xl text-[#0099BB]">You're Registered!</h1>
              <p className="mb-6 text-gray-300">
                Your registration for GameFest has been received.
              </p>
              <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-6">
                <Row label="Name" value={`${registration.first_name} ${registration.last_name}`} />
                <Row label="Email" value={registration.email} />
                <Row
                  label="Admission Type"
                  value={registration.admission_type === "BYOC" ? "BYOC (Bring Your Own Computer)" : "General Admission"}
                />
                {registration.school && <Row label="School" value={registration.school} />}
                {registration.heard_from && <Row label="Heard From" value={registration.heard_from} />}
              </div>
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="mt-6 rounded bg-gradient-to-r from-[#004466] to-[#0099BB] px-6 py-2 font-bayon text-white hover:shadow-lg hover:shadow-[#0099BB]/50"
              >
                VIEW PROFILE
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-[#0F1F3C]/90 to-[#101c3b]/90 p-8 text-white shadow-xl">
              <h1 className="mb-2 font-bayon text-3xl">Register for GameFest</h1>
              <div className="mb-6 rounded-lg border border-[#0099BB]/40 bg-[#0099BB]/10 px-4 py-3 text-sm text-[#7dd3f0]">
                <span className="font-semibold text-white">Heads up:</span> This form registers you for the event itself. You also need to sign up for individual tournaments on our{" "}
                <a
                  href="https://www.start.gg/tournament/gamefest-2026/details"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white"
                >
                  start.gg page
                </a>
                .
              </div>
              <p className="mb-8 text-gray-400">Fields marked with * are required.</p>

              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="first_name">
                      First Name *
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      required
                      value={form.first_name}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="last_name">
                      Last Name *
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      required
                      value={form.last_name}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass} htmlFor="email">
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <p className={labelClass}>Admission Type *</p>
                  <div className="mt-1 flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleAdmissionType("GA")}
                      className={`flex-1 rounded-lg border px-4 py-3 text-left transition-colors ${
                        form.admission_type === "GA"
                          ? "border-[#0099BB] bg-[#0099BB]/20 text-white"
                          : "border-white/20 bg-white/5 text-gray-300 hover:border-white/40"
                      }`}
                    >
                      <span className="block font-bayon text-lg">GA</span>
                      <span className="block text-xs text-gray-400">General Admission</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdmissionType("BYOC")}
                      className={`flex-1 rounded-lg border px-4 py-3 text-left transition-colors ${
                        form.admission_type === "BYOC"
                          ? "border-[#0099BB] bg-[#0099BB]/20 text-white"
                          : "border-white/20 bg-white/5 text-gray-300 hover:border-white/40"
                      }`}
                    >
                      <span className="block font-bayon text-lg">BYOC+GA</span>
                      <span className="block text-xs text-gray-400">(You're bringing your own setup)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass} htmlFor="school">
                    School <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    id="school"
                    name="school"
                    type="text"
                    value={form.school ?? ""}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Georgia Tech"
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="heard_from">
                    How did you hear about us? <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    id="heard_from"
                    name="heard_from"
                    type="text"
                    value={form.heard_from ?? ""}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Instagram, friend, Discord, etc."
                  />
                </div>

                {submitError && (
                  <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded bg-gradient-to-r from-[#004466] to-[#0099BB] py-3 font-bayon text-lg text-white hover:shadow-lg hover:shadow-[#0099BB]/50 disabled:opacity-50"
                >
                  {submitting ? "REGISTERING..." : "REGISTER"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-4 text-sm">
    <span className="text-gray-400">{label}</span>
    <span className="text-right text-white">{value}</span>
  </div>
);

export default RegistrationPage;
