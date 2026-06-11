import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "reviewer",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register(form);
      navigate("/admin");
    } catch (err) {
      console.error("Registration failed:", err);

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <form onSubmit={submit} className="card">
        <h2>Register</h2>

        {error && <div className="error">{error}</div>}

        <div className="form-group">
          <label>Name</label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={update}
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={update}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={update}
            placeholder="Enter your password"
            required
            minLength={6}
          />
        </div>

        <div className="form-group">
          <label>Role</label>
          <select name="role" value={form.role} onChange={update}>
            <option value="reviewer">Content Reviewer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>

        <p style={{ marginTop: "15px" }}>
          Already have an account? <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}