import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useToast } from "../context/ToastContext";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../services/api";

const ROLES = ["Administrator", "Receptionist", "Employee"];

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "Employee",
};

const Users = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = roleFilter ? { role: roleFilter } : {};
      const { data } = await getUsers(params);
      setUsers(data);
    } catch (err) {
      showToast(err.response?.data?.message || "Could not load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (user) => {
    setEditingId(user._id);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const payload = { name: form.name, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        await updateUser(editingId, payload);
        showToast("User updated", "success");
      } else {
        await createUser(form);
        showToast("User created", "success");
      }
      setShowForm(false);
      loadUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      showToast("User deleted", "success");
      loadUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Manage Users</h1>
        <button type="button" className="btn btn-navy" onClick={openCreate}>
          Add User
        </button>
      </div>

      <div className="filters card">
        <label htmlFor="roleFilter">Filter by role:</label>
        <select
          id="roleFilter"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="card">
          <h3>{editingId ? "Edit User" : "Create User"}</h3>
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">
                  Password {editingId && "(leave blank to keep current)"}
                </label>
                <input
                  id="password"
                  type="password"
                  required={!editingId}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button type="submit" className="btn btn-navy">
                {editingId ? "Update" : "Create"}
              </button>
              <button
                type="button"
                className="btn btn-gray"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card table-card">
        {loading ? (
          <p className="muted">Loading users...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-cell">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td className="actions-cell">
                      <button
                        type="button"
                        className="btn btn-blue"
                        onClick={() => openEdit(u)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-red"
                        onClick={() => handleDelete(u._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default Users;
