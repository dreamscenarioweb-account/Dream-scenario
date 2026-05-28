import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Camera } from "lucide-react";

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)] flex items-center justify-center p-4 font-body">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold tracking-tight text-black mb-2">captured</h1>
          <span className="inline-block px-2 py-1 bg-white border border-[hsl(215,20%,90%)] rounded text-[10px] font-bold tracking-widest uppercase text-[hsl(215,15%,50%)]">
            Admin Panel
          </span>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[hsl(215,20%,90%)] p-8 space-y-6">
          <div className="text-center pb-2">
            <h2 className="font-display text-2xl font-bold text-black mb-1">Welcome Back</h2>
            <p className="font-body text-[13px] text-[hsl(215,15%,50%)]">Sign in to your admin account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg px-4 py-3 font-body text-xs text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="font-body text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)] mb-2 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-[hsl(215,20%,90%)] bg-[hsl(0,0%,100%)] font-body text-sm text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors shadow-sm"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="font-body text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)] mb-2 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-[hsl(215,20%,90%)] bg-[hsl(0,0%,100%)] font-body text-sm text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors shadow-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-black hover:bg-gray-900 text-white font-body text-sm font-medium tracking-wide rounded-lg transition-colors disabled:opacity-50 mt-4 shadow-md"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
