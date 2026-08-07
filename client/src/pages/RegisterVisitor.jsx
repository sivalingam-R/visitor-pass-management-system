import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useToast } from "../context/ToastContext";
import { createVisitor, getEmployees } from "../services/api";

const emptyForm = {
  visitorName: "",
  phoneNumber: "",
  address: "",
  purpose: "",
  employeeId: "",
  visitDate: "",
  expectedArrivalTime: "",
};

const RegisterVisitor = () => {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getEmployees()
      .then(({ data }) => setEmployees(data))
      .catch((err) =>
        showToast(err.response?.data?.message || "Could not load employees")
      );
  }, [showToast]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await createVisitor(form);
      showToast("Visitor registered successfully", "success");
      setForm(emptyForm);
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      setError(message);
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <h1 className="page-title">Register Visitor</h1>
      <div className="card">
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="visitorName">Visitor Name *</label>
              <input
                id="visitorName"
                name="visitorName"
                required
                value={form.visitorName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                required
                value={form.phoneNumber}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="purpose">Purpose of Visit *</label>
              <input
                id="purpose"
                name="purpose"
                required
                value={form.purpose}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="employeeId">Employee to Visit *</label>
              <select
                id="employeeId"
                name="employeeId"
                required
                value={form.employeeId}
                onChange={handleChange}
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="visitDate">Visit Date *</label>
              <input
                id="visitDate"
                name="visitDate"
                type="date"
                required
                value={form.visitDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="expectedArrivalTime">Expected Arrival Time</label>
              <input
                id="expectedArrivalTime"
                name="expectedArrivalTime"
                type="time"
                value={form.expectedArrivalTime}
                onChange={handleChange}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-navy" disabled={submitting}>
            {submitting ? "Registering..." : "Register Visitor"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default RegisterVisitor;
