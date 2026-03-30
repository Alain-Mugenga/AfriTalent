import 'dotenv/config';
import express from "express";
import cookieParser from "cookie-parser";
import pg from "pg";
import crypto from "crypto";
import { fileURLToPath } from "url";
import path from "path";
import { readFileSync } from "fs";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Database ──────────────────────────────────────────────────────────────────
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ── App ───────────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ── Helpers ───────────────────────────────────────────────────────────────────
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function requireAuth(req, res, next) {
  if (!req.cookies?.user_id) return res.status(401).json({ error: "Not authenticated" });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.cookies?.user_id) return res.status(401).json({ error: "Not authenticated" });
  if (req.cookies?.user_role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
}

// ── Auth routes ───────────────────────────────────────────────────────────────
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Name, email, and password are required" });
  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0)
      return res.status(409).json({ error: "Email already registered" });
    const hash = hashPassword(password);
    const userRole = role === "admin" ? "athlete" : (role || "athlete");
    const result = await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at",
      [name, email, hash, userRole]
    );
    const user = result.rows[0];
    res.cookie("user_id", user.id, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie("user_role", user.role, { httpOnly: false, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ user });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid email or password" });
    const user = result.rows[0];
    if (hashPassword(password) !== user.password_hash)
      return res.status(401).json({ error: "Invalid email or password" });
    res.cookie("user_id", user.id, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie("user_role", user.role, { httpOnly: false, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie("user_id");
  res.clearCookie("user_role");
  res.json({ message: "Logged out" });
});

app.get("/api/auth/me", async (req, res) => {
  const userId = req.cookies?.user_id;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1", [userId]
    );
    if (result.rows.length === 0) return res.status(401).json({ error: "Not authenticated" });
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ error: "Failed to get user info" });
  }
});

// ── Athlete routes ────────────────────────────────────────────────────────────
app.get("/api/athletes", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM athletes WHERE status = $1 ORDER BY is_featured DESC, created_at DESC",
      ["approved"]
    );
    res.json({ athletes: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch athletes" });
  }
});

app.get("/api/athletes/featured", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM athletes WHERE is_featured = true AND status = $1 ORDER BY name",
      ["approved"]
    );
    res.json({ athletes: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch featured athletes" });
  }
});

app.get("/api/athletes/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM athletes WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Athlete not found" });
    res.json({ athlete: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch athlete" });
  }
});

app.post("/api/athletes", requireAuth, async (req, res) => {
  const { name, country, sport, age, bio, achievements, photo_url, highlight_video_url, stats } = req.body;
  if (!name || !country || !sport)
    return res.status(400).json({ error: "Name, country, and sport are required" });
  try {
    const result = await pool.query(
      `INSERT INTO athletes (name, country, sport, age, bio, achievements, photo_url, highlight_video_url, stats, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending') RETURNING *`,
      [name, country, sport, age || null, bio || null, achievements || null,
       photo_url || null, highlight_video_url || null, JSON.stringify(stats || {})]
    );
    res.status(201).json({ athlete: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create athlete" });
  }
});

// ── Admin routes ──────────────────────────────────────────────────────────────
app.get("/api/admin/athletes", requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM athletes ORDER BY created_at DESC");
    res.json({ athletes: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch athletes" });
  }
});

app.get("/api/admin/athletes/pending", requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM athletes WHERE status = 'pending' ORDER BY created_at DESC"
    );
    res.json({ athletes: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pending athletes" });
  }
});

app.patch("/api/admin/athletes/:id/approve", requireAdmin, async (req, res) => {
  try {
    await pool.query("UPDATE athletes SET status = 'approved' WHERE id = $1", [req.params.id]);
    res.json({ message: "Athlete approved" });
  } catch (err) {
    res.status(500).json({ error: "Failed to approve athlete" });
  }
});

app.patch("/api/admin/athletes/:id/reject", requireAdmin, async (req, res) => {
  try {
    await pool.query("UPDATE athletes SET status = 'rejected' WHERE id = $1", [req.params.id]);
    res.json({ message: "Athlete rejected" });
  } catch (err) {
    res.status(500).json({ error: "Failed to reject athlete" });
  }
});

app.patch("/api/admin/athletes/:id/feature", requireAdmin, async (req, res) => {
  const { featured } = req.body;
  try {
    await pool.query("UPDATE athletes SET is_featured = $1 WHERE id = $2", [featured, req.params.id]);
    res.json({ message: "Athlete updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update athlete" });
  }
});

app.get("/api/admin/users", requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ── Catch-all: serve index.html for any unknown route ─────────────────────────
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ AfriTalent running at http://localhost:${PORT}`);
  console.log(`   Admin login: admin@afritalent.com / admin123\n`);
});