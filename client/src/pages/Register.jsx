import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Employee",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user && user.role === "Administrator";

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAdmin) {
      const msg = "Access Denied: Only logged-in Administrators can register new users.";
      setError(msg);
      showToast(msg, "error");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      // Make the call using our api instance (which automatically includes token in headers)
      await api.post("/auth/register", formData);
      showToast("User registered successfully", "success");
      navigate("/login");
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed. (Only Administrators can register new users)";
      setError(message);
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box" style={{ width: "420px" }}>
        <h2>Register User</h2>
        <p className="login-subtitle">Create a new user account (Admin access required)</p>
        
        {!isAdmin && (
          <div style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #feebc8",
            borderRadius: "6px",
            padding: "12px",
            marginBottom: "16px",
            fontSize: "13px",
            color: "#c05621",
            lineHeight: "1.4"
          }}>
            <strong>Security Notice:</strong> The backend API restricts user registration to logged-in Administrators. 
            <br />
            Please log in with the test Admin account first:
            <div style={{ marginTop: "6px", fontWeight: "bold" }}>
              Email: <code style={{ color: "#2d3748" }}>admin@vpm.com</code>
              <br />
              Password: <code style={{ color: "#2d3748" }}>admin123</code>
            </div>
          </div>
        )}

        {error && <p className="error-msg">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={!isAdmin}
          />

          <label className="sr-only" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={!isAdmin}
          />

          <label className="sr-only" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={!isAdmin}
          />

          <label htmlFor="role" className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#6b7280' }}>
            Assign Role:
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={!isAdmin}
            style={{
              width: "100%",
              padding: "10px 12px",
              marginBottom: "14px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              backgroundColor: "#fff"
            }}
          >
            <option value="Employee">Employee</option>
            <option value="Receptionist">Receptionist</option>
            <option value="Administrator">Administrator</option>
          </select>

          <button type="submit" disabled={submitting || !isAdmin}>
            {submitting ? "Registering..." : "Register"}
          </button>

          <p style={{ marginTop: "16px", textAlign: "center", fontSize: "14px" }}>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;