import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // YE LINE ADD KAREIN

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Backend URL check karlein (5000 ya jo bhi aapka port hai)
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
      });

      alert("Registration Successful!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.msg || "Signup Failed");
    }
  };


  return (
    <div style={styles.pageBackground}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>
          SmartShop join karne ke liye details bharein
        </p>

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              placeholder="Your Name"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="user@example.com"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" style={styles.button}>
            Sign Up
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Pehle se account hai?{" "}
            <Link to="/login" style={styles.loginLink}>
              Login karein
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Styles (Matching Login Design) ---
const styles = {
  pageBackground: {
    minHeight: "85vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f6f8",
    padding: "20px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#111",
    marginBottom: "8px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "15px",
    color: "#666",
    marginBottom: "30px",
    textAlign: "center",
  },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "14px", fontWeight: "600", color: "#333" },
  input: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "15px",
    outline: "none",
  },
  button: {
    backgroundColor: "#111",
    color: "#fff",
    padding: "14px",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
    marginTop: "10px",
  },
  footer: {
    marginTop: "25px",
    textAlign: "center",
    borderTop: "1px solid #eee",
    paddingTop: "20px",
  },
  footerText: { fontSize: "14px", color: "#555", margin: 0 },
  loginLink: { color: "#10b981", fontWeight: "bold", textDecoration: "none" },
};

export default Register;
