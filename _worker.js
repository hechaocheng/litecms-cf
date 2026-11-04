var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// functions/schema-inline.js
var schema_inline_exports = {};
__export(schema_inline_exports, {
  SCHEMA: () => SCHEMA
});
var SCHEMA;
var init_schema_inline = __esm({
  "functions/schema-inline.js"() {
    SCHEMA = "-- LiteCMS CF \u7248 D1 \u521D\u59CB\u5316\u811A\u672C\n-- \u6267\u884C\uFF1Anpx wrangler d1 execute litecms --remote --file=./schema.sql\n-- \uFF08\u672C\u5730\u5F00\u53D1\u7528 --local\uFF09\n\nCREATE TABLE IF NOT EXISTS users (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    username TEXT NOT NULL UNIQUE,\n    password TEXT NOT NULL,\n    nickname TEXT NOT NULL DEFAULT '',\n    role TEXT NOT NULL DEFAULT 'editor',\n    created_at TEXT NOT NULL DEFAULT ''\n);\n\nCREATE TABLE IF NOT EXISTS categories (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    name TEXT NOT NULL,\n    slug TEXT NOT NULL UNIQUE,\n    description TEXT NOT NULL DEFAULT '',\n    sort_order INTEGER NOT NULL DEFAULT 0,\n    created_at TEXT NOT NULL DEFAULT ''\n);\n\nCREATE TABLE IF NOT EXISTS tags (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    name TEXT NOT NULL UNIQUE,\n    slug TEXT NOT NULL UNIQUE,\n    created_at TEXT NOT NULL DEFAULT ''\n);\n\nCREATE TABLE IF NOT EXISTS articles (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    title TEXT NOT NULL,\n    slug TEXT NOT NULL UNIQUE,\n    summary TEXT NOT NULL DEFAULT '',\n    content TEXT NOT NULL DEFAULT '',\n    category_id INTEGER NOT NULL DEFAULT 0,\n    author_id INTEGER NOT NULL DEFAULT 0,\n    status TEXT NOT NULL DEFAULT 'draft',\n    is_featured INTEGER NOT NULL DEFAULT 0,\n    views INTEGER NOT NULL DEFAULT 0,\n    published_at TEXT DEFAULT NULL,\n    created_at TEXT NOT NULL DEFAULT '',\n    updated_at TEXT NOT NULL DEFAULT '',\n    deleted_at TEXT DEFAULT NULL\n);\n\nCREATE TABLE IF NOT EXISTS article_tags (\n    article_id INTEGER NOT NULL,\n    tag_id INTEGER NOT NULL,\n    PRIMARY KEY (article_id, tag_id)\n);\n\nCREATE TABLE IF NOT EXISTS settings (\n    skey TEXT PRIMARY KEY,\n    svalue TEXT NOT NULL DEFAULT ''\n);\n\n\nCREATE TABLE IF NOT EXISTS comments (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    article_id INTEGER NOT NULL,\n    parent_id INTEGER NOT NULL DEFAULT 0,\n    author TEXT NOT NULL,\n    email TEXT NOT NULL DEFAULT '',\n    website TEXT NOT NULL DEFAULT '',\n    content TEXT NOT NULL,\n    status TEXT NOT NULL DEFAULT 'pending',\n    ip TEXT NOT NULL DEFAULT '',\n    user_agent TEXT NOT NULL DEFAULT '',\n    created_at TEXT NOT NULL DEFAULT '',\n    updated_at TEXT NOT NULL DEFAULT ''\n);\n\nCREATE INDEX IF NOT EXISTS idx_comments_article ON comments (article_id);\nCREATE INDEX IF NOT EXISTS idx_comments_status ON comments (status);\n\n-- \u8BC4\u8BBA\u9891\u7387\u8FFD\u8E2A\uFF1A\u6309 IP \u8BB0\u5F55\u6700\u8FD1\u4E00\u6B21\u63D0\u4EA4\u4E0E\u5F53\u65E5\u8BA1\u6570\uFF08\u9632\u704C\u6C34\uFF09\nCREATE TABLE IF NOT EXISTS comment_rate (\n    ip TEXT PRIMARY KEY,\n    last_at INTEGER NOT NULL DEFAULT 0,\n    day TEXT NOT NULL DEFAULT '',\n    day_count INTEGER NOT NULL DEFAULT 0\n);\n\n-- \u8BC4\u8BBA\u552F\u4E00\u6307\u7EB9\uFF1A\u76F8\u540C IP + \u76F8\u540C\u5185\u5BB9\u77ED\u65F6\u95F4\u5185\u91CD\u590D\u89C6\u4E3A\u704C\u6C34\nCREATE INDEX IF NOT EXISTS idx_comments_ip_time ON comments (ip, created_at);\nCREATE INDEX IF NOT EXISTS idx_comments_parent ON comments (parent_id);\nCREATE INDEX IF NOT EXISTS idx_comments_ip ON comments (ip, created_at);\nCREATE INDEX IF NOT EXISTS idx_articles_status ON articles (status);\nCREATE INDEX IF NOT EXISTS idx_articles_category ON articles (category_id);\nCREATE INDEX IF NOT EXISTS idx_articles_deleted ON articles (deleted_at);\nCREATE INDEX IF NOT EXISTS idx_articles_published ON articles (published_at DESC);\n\n-- \u72EC\u7ACB\u9875\u9762\uFF08\u5982\u300C\u5173\u4E8E\u300D\uFF09\uFF1A\u53EF\u6302\u8F7D\u5230\u524D\u53F0\u5BFC\u822A\u680F\nCREATE TABLE IF NOT EXISTS pages (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    title TEXT NOT NULL,\n    slug TEXT NOT NULL UNIQUE,\n    content TEXT NOT NULL DEFAULT '',\n    show_in_nav INTEGER NOT NULL DEFAULT 1,\n    sort_order INTEGER NOT NULL DEFAULT 0,\n    status TEXT NOT NULL DEFAULT 'published',\n    created_at TEXT NOT NULL DEFAULT '',\n    updated_at TEXT NOT NULL DEFAULT ''\n);\n\nCREATE INDEX IF NOT EXISTS idx_pages_status ON pages (status);\n";
  }
});

// functions/lib/core.js
var VERSION = "1.0.34-cf";
// 保留路径：页面 slug 不能占用这些
var RESERVED_SLUGS = ["", "about", "search", "archive", "article", "category", "tag", "page", "wp-admin", "install", "media", "assets", "wp-uploads", "api"];
var H_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
function h(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => H_MAP[c]);
}
function nowStr() {
  return new Date(Date.now() + 8 * 3600 * 1e3).toISOString().slice(0, 19).replace("T", " ");
}
function fmtDate(dt, withTime = false) {
  if (!dt) return "\u2014";
  return withTime ? String(dt).slice(0, 16) : String(dt).slice(0, 10);
}
function excerpt(html2, length = 110) {
  const text = String(html2 || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  return text.length <= length ? text : text.slice(0, length) + "\u2026";
}
function paginate(total, perPage, page) {
  total = Math.max(0, total);
  perPage = Math.max(1, perPage);
  let pages = Math.max(1, Math.ceil(total / perPage));
  page = Math.min(Math.max(1, page), pages);
  return { total, pages, page, offset: (page - 1) * perPage, limit: perPage };
}
function slugify(text) {
  const s = String(text || "").toLowerCase().trim().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-").replace(/^-+|-+$/g, "");
  return s || "item-" + Date.now().toString(36);
}
function strToArr(s) {
  return String(s || "").split(/[,，\s]+/).map((x) => x.trim()).filter(Boolean);
}
function randomId(n = 16) {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}
function sessionSecret(env) {
  const s = env && env.SESSION_SECRET ? String(env.SESSION_SECRET) : "";
  if (s && s.length >= 16 && s !== "please-change-me-to-a-long-random-string") {
    return s;
  }
  return "litecms-fallback-secret-" + (env && env.CF_PAGES_BRANCH ? env.CF_PAGES_BRANCH : "default") + "-v1";
}
async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}
async function sign(secret, payload) {
  return payload + "." + await hmac(secret, payload);
}
async function verify(secret, token) {
  const i = String(token || "").lastIndexOf(".");
  if (i <= 0) return null;
  const payload = token.slice(0, i);
  const expect = await hmac(secret, payload);
  if (token.slice(i + 1) !== expect) return null;
  return payload;
}
function b64json(obj) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function unb64(s) {
  try {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    return JSON.parse(decodeURIComponent(escape(atob(s))));
  } catch (e) {
    return null;
  }
}
function parseCookies(request) {
  const out = {};
  const raw = request.headers.get("Cookie") || "";
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
function cookieHeader(name, value, opts = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, "Path=" + (opts.path || "/")];
  if (opts.maxAge != null) parts.push("Max-Age=" + opts.maxAge);
  if (opts.httpOnly !== false) parts.push("HttpOnly");
  if (opts.sameSite !== false) parts.push("SameSite=Lax");
  return parts.join("; ");
}
async function getSession(env, request) {
  const cookies = parseCookies(request);
  const payload = await verify(sessionSecret(env), cookies.l_sess || "");
  if (!payload) return null;
  const data = unb64(payload);
  if (!data || !data.uid || data.exp && data.exp < Date.now()) return null;
  return data;
}
async function setSession(env, user, headers) {
  const payload = b64json({ uid: user.id, uname: user.username, nickname: user.nickname, exp: Date.now() + 7 * 86400 * 1e3 });
  headers.append("Set-Cookie", cookieHeader("l_sess", await sign(sessionSecret(env), payload), { maxAge: 7 * 86400 }));
}
async function clearSession(headers) {
  headers.append("Set-Cookie", cookieHeader("l_sess", "", { maxAge: 0 }));
}
async function setFlash(env, headers, type, message) {
  const payload = b64json({ t: type, m: message, e: Date.now() + 60 * 1e3 });
  headers.append("Set-Cookie", cookieHeader("l_flash", await sign(sessionSecret(env), payload), { maxAge: 60 }));
}
async function takeFlash(env, request, headers) {
  const cookies = parseCookies(request);
  const payload = await verify(sessionSecret(env), cookies.l_flash || "");
  if (!payload) return null;
  const data = unb64(payload);
  headers.append("Set-Cookie", cookieHeader("l_flash", "", { maxAge: 0 }));
  return data && data.e > Date.now() ? { type: data.t, message: data.m } : null;
}
async function ensureCsrf(env, request, headers) {
  const cookies = parseCookies(request);
  if (cookies.l_csrf) return cookies.l_csrf;
  const token = randomId(16);
  headers.append("Set-Cookie", cookieHeader("l_csrf", token, { maxAge: 86400 * 7, httpOnly: true }));
  return token;
}
function csrfField(token) {
  return `<input type="hidden" name="_token" value="${h(token)}">`;
}
function csrfOk(request, form) {
  const cookies = parseCookies(request);
  return Boolean(cookies.l_csrf) && form.get("_token") === cookies.l_csrf;
}
function csrfOkHeader(request, form) {
  if (csrfOk(request, form)) return true;
  const cookies = parseCookies(request);
  const token = request.headers.get("X-CSRF-Token") || "";
  return Boolean(cookies.l_csrf) && token !== "" && token === cookies.l_csrf;
}
function json(data, status = 200, headers = null) {
  const hh = headers || new Headers();
  hh.set("Content-Type", "application/json; charset=utf-8");
  hh.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(data), { status, headers: hh });
}
async function visitorPow(dateKey, seed) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(dateKey + "|" + seed + "|litecms"));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
async function hashPassword(password) {
  const salt = randomId(16);
  const iter = 1e5;
  const bits = await pbkdf2(password, salt, iter);
  return `pbkdf2$${iter}$${salt}$${bits}`;
}
async function pbkdf2(password, salt, iter) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: iter },
    key,
    256
  );
  return Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, "0")).join("");
}
async function verifyPassword(password, stored) {
  const m = /^pbkdf2\$(\d+)\$([^$]+)\$([0-9a-f]+)$/.exec(String(stored || ""));
  if (!m) return false;
  return await pbkdf2(password, m[2], +m[1]) === m[3];
}

// functions/lib/db.js
var Db = class {
  constructor(env) {
    this.env = env;
  }
  get db() {
    return this.env.DB;
  }
  async one(sql, ...params) {
    const r = await this.db.prepare(sql).bind(...params).first();
    return r === null ? null : r;
  }
  async all(sql, ...params) {
    const r = await this.db.prepare(sql).bind(...params).all();
    return r.results || [];
  }
  async run(sql, ...params) {
    return this.db.prepare(sql).bind(...params).run();
  }
  async intval(sql, ...params) {
    const r = await this.db.prepare(sql).bind(...params).first();
    if (!r) return 0;
    const v = Object.values(r)[0];
    return Number(v) || 0;
  }
  async batch(stmts) {
    return this.db.batch(stmts);
  }
  stmt(sql, ...params) {
    return this.db.prepare(sql).bind(...params);
  }
  async isInstalled() {
    try {
      return await this.intval(
        "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='articles'"
      ) > 0;
    } catch (e) {
      return false;
    }
  }
};
var Settings = class {
  constructor(db) {
    this.db = db;
    this.cache = null;
  }
  async load() {
    if (this.cache === null) {
      this.cache = {};
      const rows = await this.db.all("SELECT skey, svalue FROM settings");
      for (const r of rows) this.cache[r.skey] = r.svalue;
    }
    return this.cache;
  }
  async get(key, dflt = "") {
    const m = await this.load();
    return m[key] !== void 0 && m[key] !== "" ? m[key] : String(dflt);
  }
  async set(key, value) {
    await this.db.run(
      "INSERT INTO settings (skey, svalue) VALUES (?, ?) ON CONFLICT(skey) DO UPDATE SET svalue = excluded.svalue",
      key,
      String(value)
    );
    if (this.cache) this.cache[key] = String(value);
  }
};
function defaultSettings() {
  return {
    site_name: "LiteCMS \u5185\u5BB9\u7BA1\u7406\u7CFB\u7EDF",
    site_subtitle: "Cloudflare Pages + D1 + R2 \u6253\u9020\u7684\u8F7B\u91CF\u7EA7 CMS",
    site_stats: "",
    per_page: "6",
    admin_per_page: "10",
    comments_enabled: "1",
    comments_moderation: "1",
    comments_per_page: "20",
    comments_interval: "30",
    comments_max_links: "3",
    comments_max_length: "1000",
    comments_notice: "\u8BC4\u8BBA\u5C06\u5728\u7AD9\u957F\u5BA1\u6838\u901A\u8FC7\u540E\u663E\u793A\uFF0C\u8BF7\u6587\u660E\u53D1\u8A00\u3002",
    // 防灌水：同一 IP 每天最多通过审核的评论数，超过自动进待审
    comments_ip_daily: "15",
    // 前台主题（blue = 蓝调版式）
    front_tips: "1",
    front_tips_text: "\u672C\u7AD9\u57FA\u4E8E LiteCMS \u6784\u5EFA\uFF0C\u8BC4\u8BBA\u91C7\u7528\u5373\u65F6\u63D0\u4EA4\uFF0C\u8BF7\u6587\u660E\u53D1\u8A00\u3002",
    front_tips_type: "info",
    banner_image: "",
    qrcode_image: "",
    qrcode_tip: "\u5173\u6CE8\u516C\u4F17\u53F7",
    friend_links: "",
    icp_no: "",
    beian_no: ""
  };
}

// functions/lib/models.js
var PUB_WHERE = "a.deleted_at IS NULL AND a.status = 'published'";
var PUB_SELECT = `
  SELECT a.*, c.name AS category_name, c.slug AS category_slug,
    u.nickname AS author_name,
    (SELECT GROUP_CONCAT(t.name || '|' || t.slug, ',') FROM article_tags at2
       JOIN tags t ON t.id = at2.tag_id WHERE at2.article_id = a.id) AS tag_csv,
    (SELECT COUNT(*) FROM comments cm
       WHERE cm.article_id = a.id AND cm.status = 'approved') AS comment_count
  FROM articles a
  LEFT JOIN categories c ON c.id = a.category_id
  LEFT JOIN users u ON u.id = a.author_id`;
function decorateArticle(row) {
  if (!row) return row;
  row.tags = [];
  if (row.tag_csv) {
    for (const pair of row.tag_csv.split(",")) {
      const [name, slug] = pair.split("|");
      if (name) row.tags.push({ name, slug });
    }
  }
  row.is_featured = Number(row.is_featured);
  row.views = Number(row.views);
  row.comment_count = Number(row.comment_count) || 0;
  return row;
}
var ArticleModel = {
  async published(db, opts = {}) {
    const where = [PUB_WHERE];
    const params = [];
    if (opts.category_id) {
      where.push("a.category_id = ?");
      params.push(opts.category_id);
    }
    if (opts.tag_id) {
      where.push("a.id IN (SELECT article_id FROM article_tags WHERE tag_id = ?)");
      params.push(opts.tag_id);
    }
    if (opts.keyword) {
      where.push("(a.title LIKE ? OR a.summary LIKE ? OR a.content LIKE ?)");
      const like = "%" + opts.keyword + "%";
      params.push(like, like, like);
    }
    if (opts.month && /^\d{4}-\d{2}$/.test(opts.month)) {
      where.push("a.published_at LIKE ?");
      params.push(opts.month + "%");
    }
    if (opts.exclude_id) {
      where.push("a.id != ?");
      params.push(opts.exclude_id);
    }
    if (opts.featured_only) {
      where.push("a.is_featured = 1");
    }
    if (opts.exclude_featured) {
      where.push("a.is_featured = 0");
    }
    params.push(opts.limit || 10, opts.offset || 0);
    const rows = await db.all(
      `${PUB_SELECT} WHERE ${where.join(" AND ")}
       ORDER BY a.published_at DESC, a.id DESC LIMIT ? OFFSET ?`,
      ...params
    );
    return rows.map(decorateArticle);
  },
  async countPublished(db, opts = {}) {
    const where = [PUB_WHERE];
    const params = [];
    if (opts.exclude_featured) {
      where.push("a.is_featured = 0");
    }
    if (opts.category_id) {
      where.push("a.category_id = ?");
      params.push(opts.category_id);
    }
    if (opts.tag_id) {
      where.push("a.id IN (SELECT article_id FROM article_tags WHERE tag_id = ?)");
      params.push(opts.tag_id);
    }
    if (opts.keyword) {
      where.push("(a.title LIKE ? OR a.summary LIKE ? OR a.content LIKE ?)");
      const like = "%" + opts.keyword + "%";
      params.push(like, like, like);
    }
    if (opts.month && /^\d{4}-\d{2}$/.test(opts.month)) {
      where.push("a.published_at LIKE ?");
      params.push(opts.month + "%");
    }
    return db.intval(`SELECT COUNT(*) FROM articles a WHERE ${where.join(" AND ")}`, ...params);
  },
  async findBySlug(db, slug) {
    const r = await db.one(`${PUB_SELECT} WHERE ${PUB_WHERE} AND a.slug = ? LIMIT 1`, slug);
    return decorateArticle(r);
  },
  async find(db, id) {
    const r = await db.one(
      "SELECT a.* FROM articles a WHERE a.id = ? AND a.deleted_at IS NULL LIMIT 1",
      id
    );
    return r ? decorateArticle(r) : null;
  },
  async neighbors(db, article) {
    const at = article.published_at || "";
    const useTime = at !== "";
    const orderCol = useTime ? "a.published_at" : "a.id";
    const cmpCol = useTime ? "a.published_at" : "a.id";
    const cmpVal = useTime ? at : Number(article.id) || 0;
    const prev = await db.one(
      `${PUB_SELECT} WHERE ${PUB_WHERE} AND a.id != ? AND ${cmpCol} < ?
       ORDER BY ${orderCol} DESC LIMIT 1`,
      article.id,
      cmpVal
    );
    const next = await db.one(
      `${PUB_SELECT} WHERE ${PUB_WHERE} AND a.id != ? AND ${cmpCol} > ?
       ORDER BY ${orderCol} ASC LIMIT 1`,
      article.id,
      cmpVal
    );
    return { prev: decorateArticle(prev), next: decorateArticle(next) };
  },
  async addView(db, id) {
    await db.run("UPDATE articles SET views = views + 1 WHERE id = ?", id);
  },
  async adminList(db, opts = {}) {
    const where = [opts.status === "trash" ? "a.deleted_at IS NOT NULL" : "a.deleted_at IS NULL"];
    const params = [];
    if (opts.status && opts.status !== "all" && opts.status !== "trash") {
      where.push("a.status = ?");
      params.push(opts.status);
    }
    if (opts.keyword) {
      where.push("a.title LIKE ?");
      params.push("%" + opts.keyword + "%");
    }
    if (opts.category_id) {
      where.push("a.category_id = ?");
      params.push(opts.category_id);
    }
    params.push(opts.limit || 10, opts.offset || 0);
    const rows = await db.all(
      `${PUB_SELECT} WHERE ${where.join(" AND ")}
       ORDER BY a.updated_at DESC, a.id DESC LIMIT ? OFFSET ?`,
      ...params
    );
    return rows.map(decorateArticle);
  },
  async adminCount(db, opts = {}) {
    const where = [opts.status === "trash" ? "a.deleted_at IS NOT NULL" : "a.deleted_at IS NULL"];
    const params = [];
    if (opts.status && opts.status !== "all" && opts.status !== "trash") {
      where.push("a.status = ?");
      params.push(opts.status);
    }
    if (opts.keyword) {
      where.push("a.title LIKE ?");
      params.push("%" + opts.keyword + "%");
    }
    if (opts.category_id) {
      where.push("a.category_id = ?");
      params.push(opts.category_id);
    }
    return db.intval(`SELECT COUNT(*) FROM articles a WHERE ${where.join(" AND ")}`, ...params);
  },
  async stats(db) {
    return {
      published: await db.intval("SELECT COUNT(*) FROM articles WHERE deleted_at IS NULL AND status='published'"),
      draft: await db.intval("SELECT COUNT(*) FROM articles WHERE deleted_at IS NULL AND status='draft'"),
      trashed: await db.intval("SELECT COUNT(*) FROM articles WHERE deleted_at IS NOT NULL"),
      views: await db.intval("SELECT COALESCE(SUM(views), 0) FROM articles WHERE deleted_at IS NULL")
    };
  },
  async save(db, id, data, tagNames) {
    const now = nowStr();
    let articleId = id;
    if (id > 0) {
      await db.run(
        `UPDATE articles SET title=?, slug=?, summary=?, content=?, category_id=?,
         status=?, is_featured=?, published_at=?, updated_at=? WHERE id=?`,
        data.title,
        data.slug,
        data.summary,
        data.content,
        data.category_id,
        data.status,
        data.is_featured,
        data.published_at,
        now,
        id
      );
    } else {
      const r = await db.run(
        `INSERT INTO articles (title, slug, summary, content, category_id, author_id,
           status, is_featured, published_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        data.title,
        data.slug,
        data.summary,
        data.content,
        data.category_id,
        data.author_id,
        data.status,
        data.is_featured,
        data.published_at,
        now,
        now
      );
      articleId = r.meta.last_row_id;
    }
    await syncTags(db, articleId, tagNames);
    return articleId;
  },
  async setDeletedAt(db, id, value) {
    if (value === null || value === void 0) {
      await db.run("UPDATE articles SET deleted_at = NULL, updated_at = ? WHERE id = ?", nowStr(), id);
      return;
    }
    await db.run("UPDATE articles SET deleted_at = ?, updated_at = ? WHERE id = ?", value, nowStr(), id);
  },
  async setStatus(db, ids, status) {
    for (const id of ids) {
      await db.run("UPDATE articles SET status = ?, updated_at = ? WHERE id = ?", status, nowStr(), id);
    }
  },
  async feature(db, ids) {
    for (const id of ids) {
      await db.run("UPDATE articles SET is_featured = 1 - is_featured, updated_at = ? WHERE id = ?", nowStr(), id);
    }
  },
  async destroy(db, id) {
    await db.batch([
      db.stmt("DELETE FROM article_tags WHERE article_id = ?", id),
      db.stmt("DELETE FROM comments WHERE article_id = ?", id),
      db.stmt("DELETE FROM articles WHERE id = ?", id)
    ]);
  }
};
async function syncTags(db, articleId, tagNames) {
  await db.run("DELETE FROM article_tags WHERE article_id = ?", articleId);
  for (const name of tagNames.slice(0, 10)) {
    const slug = slugify(name);
    let tag = await db.one("SELECT id FROM tags WHERE slug = ? OR name = ?", slug, name);
    let tagId;
    if (tag) {
      tagId = tag.id;
    } else {
      const r = await db.run("INSERT INTO tags (name, slug, created_at) VALUES (?, ?, ?)", name, slug, nowStr());
      tagId = r.meta.last_row_id;
    }
    await db.run("INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)", articleId, tagId);
  }
}
var CategoryModel = {
  async all(db, withCount) {
    if (withCount) {
      return db.all(`
        SELECT c.*, (SELECT COUNT(*) FROM articles a
          WHERE a.category_id = c.id AND a.deleted_at IS NULL AND a.status='published') AS article_count
        FROM categories c ORDER BY c.sort_order ASC, c.id ASC`);
    }
    return db.all("SELECT * FROM categories ORDER BY sort_order ASC, id ASC");
  },
  async find(db, id) {
    return db.one("SELECT * FROM categories WHERE id = ?", id);
  },
  async findBySlug(db, slug) {
    return db.one("SELECT * FROM categories WHERE slug = ?", slug);
  },
  async save(db, id, data) {
    if (id > 0) {
      await db.run(
        "UPDATE categories SET name=?, slug=?, description=?, sort_order=? WHERE id=?",
        data.name,
        data.slug,
        data.description,
        data.sort_order,
        id
      );
      return id;
    }
    const r = await db.run(
      "INSERT INTO categories (name, slug, description, sort_order, created_at) VALUES (?, ?, ?, ?, ?)",
      data.name,
      data.slug,
      data.description,
      data.sort_order,
      nowStr()
    );
    return r.meta.last_row_id;
  },
  async destroy(db, id) {
    await db.batch([
      db.stmt("UPDATE articles SET category_id = 0 WHERE category_id = ?", id),
      db.stmt("DELETE FROM categories WHERE id = ?", id)
    ]);
  }
};
/** 独立页面（如「关于我们」）：可挂载到前台导航栏 */
var PageModel = {
  async all(db) {
    return db.all("SELECT * FROM pages ORDER BY sort_order ASC, id ASC").catch(() => []);
  },
  async published(db) {
    return db.all("SELECT * FROM pages WHERE status = 'published' ORDER BY sort_order ASC, id ASC").catch(() => []);
  },
  async nav(db) {
    return db.all("SELECT * FROM pages WHERE status = 'published' AND show_in_nav = 1 ORDER BY sort_order ASC, id ASC").catch(() => []);
  },
  async find(db, id) {
    return db.one("SELECT * FROM pages WHERE id = ?", id);
  },
  async findBySlug(db, slug) {
    return db.one("SELECT * FROM pages WHERE slug = ? AND status = 'published'", slug);
  },
  async save(db, id, data) {
    if (id > 0) {
      await db.run(
        "UPDATE pages SET title=?, slug=?, content=?, show_in_nav=?, sort_order=?, status=?, updated_at=? WHERE id=?",
        data.title, data.slug, data.content, data.show_in_nav, data.sort_order, data.status, nowStr(), id
      );
      return id;
    }
    const r = await db.run(
      "INSERT INTO pages (title, slug, content, show_in_nav, sort_order, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      data.title, data.slug, data.content, data.show_in_nav, data.sort_order, data.status, nowStr(), nowStr()
    );
    return r.meta.last_row_id;
  },
  async destroy(db, id) {
    await db.run("DELETE FROM pages WHERE id = ?", id);
  }
};
var TagModel = {
  async all(db, withCount) {
    if (withCount) {
      return db.all(`
        SELECT t.*, (SELECT COUNT(*) FROM article_tags at2
          JOIN articles a ON a.id = at2.article_id
          WHERE at2.tag_id = t.id AND a.deleted_at IS NULL AND a.status='published') AS article_count
        FROM tags t ORDER BY article_count DESC, t.id DESC`);
    }
    return db.all("SELECT * FROM tags ORDER BY id DESC");
  },
  async findBySlug(db, slug) {
    return db.one("SELECT * FROM tags WHERE slug = ?", slug);
  },
  async save(db, id, data) {
    if (id > 0) {
      await db.run("UPDATE tags SET name=?, slug=? WHERE id=?", data.name, data.slug, id);
      return id;
    }
    const r = await db.run("INSERT INTO tags (name, slug, created_at) VALUES (?, ?, ?)", data.name, data.slug, nowStr());
    return r.meta.last_row_id;
  },
  async destroy(db, id) {
    await db.batch([
      db.stmt("DELETE FROM article_tags WHERE tag_id = ?", id),
      db.stmt("DELETE FROM tags WHERE id = ?", id)
    ]);
  }
};
function looksLikeSpam(text) {
  const t = String(text || "");
  if (!t) return false;
  const chars = Array.from(t.replace(/\s/g, ""));
  if (chars.length >= 12) {
    const freq = {};
    let max = 0;
    for (const c of chars) {
      freq[c] = (freq[c] || 0) + 1;
      if (freq[c] > max) max = freq[c];
    }
    if (max / chars.length > 0.7) return true;
  }
  for (let len = 2; len <= 6; len++) {
    const re = new RegExp(`(.{${len}})\\1{3,}`, "u");
    if (re.test(t)) return true;
  }
  if (stripLinksCount(t) > 0 && /(代开|发票|办证|私彩|博彩|彩票|加微信|加QQ|包过|刷单|返利)/i.test(t)) return true;
  return false;
}
function stripLinksCount(content) {
  const m = String(content).match(/https?:\/\/|www\./gi);
  return m ? m.length : 0;
}
var CommentModel = {
  /**
   * 创建评论（含多层防灌水）
   * data: { article_id, parent_id, author, email, website, content, ip, user_agent, token, elapsed }
   * 返回 { ok, errors, id, status, spamBy }
   */
  async create(db, settings, data) {
    const errors = {};
    const author = String(data.author || "").trim();
    const email = String(data.email || "").trim();
    let website = String(data.website || "").trim();
    const content = String(data.content || "").trim();
    const articleId = Number(data.article_id) || 0;
    let parentId = Number(data.parent_id) || 0;
    const ip = String(data.ip || "").trim();
    const ua = String(data.user_agent || "");
    const token = String(data.token || "");
    const elapsed = Number(data.elapsed) || 0;
    let forcedPending = false;
    const article = await db.one(
      "SELECT id FROM articles WHERE id = ? AND status = 'published' AND deleted_at IS NULL",
      articleId
    );
    if (!article) errors.article = "\u6587\u7AE0\u4E0D\u5B58\u5728\u6216\u672A\u53D1\u5E03\uFF0C\u65E0\u6CD5\u8BC4\u8BBA\u3002";
    if (!author) errors.author = "\u8BF7\u586B\u5199\u6635\u79F0\u3002";
    else if (author.length > 30) errors.author = "\u6635\u79F0\u4E0D\u80FD\u8D85\u8FC7 30 \u4E2A\u5B57\u7B26\u3002";
    if (!email) errors.email = "\u8BF7\u586B\u5199\u90AE\u7BB1\u3002";
    else if (email.length > 120) errors.email = "\u90AE\u7BB1\u5730\u5740\u8FC7\u957F\u3002";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "\u90AE\u7BB1\u683C\u5F0F\u4E0D\u6B63\u786E\u3002";
    if (website) {
      if (!/^https?:\/\//i.test(website)) website = "http://" + website;
      if (website.length > 200 || !/^https?:\/\/[a-z0-9.-]+(\.[a-z]{2,})(:\d+)?([\/?#]\S*)?$/i.test(website)) {
        errors.website = "\u7F51\u7AD9\u5730\u5740\u683C\u5F0F\u4E0D\u6B63\u786E\u3002";
      }
    }
    const maxLen = parseInt(await settings.get("comments_max_length", "1000"), 10) || 1e3;
    if (content.length < 2) errors.content = "\u8BC4\u8BBA\u5185\u5BB9\u592A\u77ED\u4E86\uFF0C\u81F3\u5C11 2 \u4E2A\u5B57\u3002";
    else if (content.length > maxLen) errors.content = `\u8BC4\u8BBA\u5185\u5BB9\u4E0D\u80FD\u8D85\u8FC7 ${maxLen} \u4E2A\u5B57\u7B26\u3002`;
    const maxLinks = parseInt(await settings.get("comments_max_links", "3"), 10) || 3;
    if (stripLinksCount(content) > maxLinks) errors.content = `\u8BC4\u8BBA\u4E2D\u7684\u94FE\u63A5\u6570\u91CF\u8FC7\u591A\uFF08\u6700\u591A ${maxLinks} \u4E2A\uFF09\u3002`;
    let spamBy = "";
    if (!token) {
      if (data.is_ajax) spamBy = "no-token";
      else forcedPending = true;
    } else if (!/^[a-f0-9]{64}$/.test(token)) spamBy = "bad-token";
    if (!spamBy && looksLikeSpam(content)) spamBy = "content";
    if (!spamBy && author && /https?:\/\/|www\./i.test(author)) spamBy = "author-url";
    if (parentId > 0) {
      const parent = await db.one("SELECT id, article_id, parent_id, status FROM comments WHERE id = ?", parentId);
      if (!parent || Number(parent.article_id) !== articleId) {
        errors.parent_id = "\u8981\u56DE\u590D\u7684\u8BC4\u8BBA\u4E0D\u5B58\u5728\u3002";
        parentId = 0;
      } else if (parent.status !== "approved") {
        errors.parent_id = "\u8BE5\u8BC4\u8BBA\u5C1A\u5728\u5BA1\u6838\u4E2D\uFF0C\u6682\u4E0D\u80FD\u56DE\u590D\u3002";
        parentId = 0;
      } else if (Number(parent.parent_id) !== 0) {
        parentId = Number(parent.parent_id);
      }
    }
    const interval = parseInt(await settings.get("comments_interval", "30"), 10) || 0;
    if (interval > 0 && ip) {
      const row = await db.one("SELECT last_at FROM comment_rate WHERE ip = ?", ip).catch(() => null);
      if (row && Number(row.last_at) > 0) {
        const wait = interval - Math.floor((Date.now() - Number(row.last_at)) / 1e3);
        if (wait > 0) errors.rate = `\u53D1\u8A00\u592A\u9891\u7E41\u4E86\uFF0C\u8BF7 ${wait} \u79D2\u540E\u518D\u8BD5\u3002`;
      }
    }
    const daily = parseInt(await settings.get("comments_ip_daily", "15"), 10) || 0;
    const today = nowStr().slice(0, 10);
    let dayCount = 0;
    if (ip) {
      try {
        const row = await db.one("SELECT day, day_count FROM comment_rate WHERE ip = ?", ip);
        if (row && row.day === today) dayCount = Number(row.day_count) || 0;
      } catch (e) {
        dayCount = 0;
      }
    }
    const overQuota = daily > 0 && dayCount >= daily;
    if (!spamBy && ip && content.length >= 4) {
      const dup = await db.one(
        "SELECT id FROM comments WHERE ip = ? AND content = ? AND created_at >= ? LIMIT 1",
        ip,
        content,
        new Date(Date.now() + 8 * 36e5 - 10 * 6e4).toISOString().slice(0, 19).replace("T", " ")
      );
      if (dup) errors.content = "\u4F60\u521A\u521A\u5DF2\u7ECF\u63D0\u4EA4\u8FC7\u540C\u6837\u7684\u5185\u5BB9\u4E86\uFF0C\u8BF7\u52FF\u91CD\u590D\u63D0\u4EA4\u3002";
    }
    if (Object.keys(errors).length > 0) {
      return { ok: false, errors, id: 0, status: "", spamBy: "" };
    }
    const moderation = await settings.get("comments_moderation", "1") === "1";
    const now = nowStr();
    const status = spamBy ? "spam" : moderation || overQuota || forcedPending ? "pending" : "approved";
    const r = await db.run(
      `INSERT INTO comments (article_id, parent_id, author, email, website, content,
         status, ip, user_agent, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      articleId,
      parentId,
      author,
      email,
      website,
      content,
      status,
      ip,
      ua,
      now,
      now
    );
    if (ip) {
      const nextCount = (dayCount || 0) + 1;
      try {
        await db.run(
          `INSERT INTO comment_rate (ip, last_at, day, day_count) VALUES (?, ?, ?, ?)
           ON CONFLICT(ip) DO UPDATE SET last_at = excluded.last_at, day = excluded.day, day_count = excluded.day_count`,
          ip,
          Date.now(),
          today,
          nextCount
        );
      } catch (e) {
      }
    }
    return {
      ok: true,
      errors: {},
      id: r.meta.last_row_id,
      status,
      spamBy,
      overQuota
    };
  },
  /** 取某篇文章最新的已通过评论（AJAX 提交后用于就地插入） */
  async findApproved(db, id) {
    return db.one("SELECT * FROM comments WHERE id = ? AND status = 'approved'", id);
  },
  async replyCount(db, parentId) {
    return db.intval("SELECT COUNT(*) FROM comments WHERE parent_id = ? AND status = 'approved'", parentId);
  },
  async treeForArticle(db, articleId) {
    const rows = await db.all(
      "SELECT * FROM comments WHERE article_id = ? AND status = 'approved' ORDER BY id ASC",
      articleId
    );
    const tops = [];
    const map = {};
    for (const r of rows) {
      r.children = [];
      map[r.id] = r;
    }
    for (const r of rows) {
      if (r.parent_id && map[r.parent_id]) map[r.parent_id].children.push(r);
      else tops.push(r);
    }
    return tops;
  },
  async countApproved(db, articleId) {
    return db.intval("SELECT COUNT(*) FROM comments WHERE article_id = ? AND status='approved'", articleId);
  },
  async adminList(db, opts = {}) {
    const where = ["1=1"];
    const params = [];
    if (opts.status && opts.status !== "all") {
      where.push("c.status = ?");
      params.push(opts.status);
    }
    params.push(opts.limit || 20, opts.offset || 0);
    return db.all(`
      SELECT c.*, a.title AS article_title, a.slug AS article_slug
      FROM comments c LEFT JOIN articles a ON a.id = c.article_id
      WHERE ${where.join(" AND ")}
      ORDER BY c.id DESC LIMIT ? OFFSET ?`, ...params);
  },
  async adminCount(db, opts = {}) {
    if (opts.status && opts.status !== "all") {
      return db.intval("SELECT COUNT(*) FROM comments WHERE status = ?", opts.status);
    }
    return db.intval("SELECT COUNT(*) FROM comments");
  },
  async stats(db) {
    return {
      pending: await db.intval("SELECT COUNT(*) FROM comments WHERE status='pending'"),
      approved: await db.intval("SELECT COUNT(*) FROM comments WHERE status='approved'"),
      spam: await db.intval("SELECT COUNT(*) FROM comments WHERE status='spam'")
    };
  }
};

// functions/lib/views-front.js
function pagerHtml(pager, base, params = {}) {
  if (!pager || pager.pages <= 1) {
    return pager && pager.total > 0 ? `<div class="pager"><span class="total">\u5171 ${pager.total} \u6761</span></div>` : "";
  }
  const make = (p) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== "" && v !== null && v !== void 0) u.set(k, v);
    }
    u.set("page", p);
    return `${base}?${u.toString()}`;
  };
  const { page, pages } = pager;
  let start = Math.max(1, page - 2);
  const end = Math.min(pages, start + 4);
  start = Math.max(1, end - 4);
  let out = '<div class="pager">';
  out += page > 1 ? `<a href="${h(make(page - 1))}">\u4E0A\u4E00\u9875</a>` : '<span class="disabled">\u4E0A\u4E00\u9875</span>';
  for (let i = start; i <= end; i++) {
    out += i === page ? `<span class="current">${i}</span>` : `<a href="${h(make(i))}">${i}</a>`;
  }
  out += page < pages ? `<a href="${h(make(page + 1))}">\u4E0B\u4E00\u9875</a>` : '<span class="disabled">\u4E0B\u4E00\u9875</span>';
  out += `<span class="total">\u5171 ${pager.total} \u6761 / ${pages} \u9875</span>`;
  return out + "</div>";
}
function card(a, featured = false) {
  const tags = (a.tags || []).map((t) => `<a href="/tag/${h(t.slug)}">#${h(t.name)}</a>`).join("");
  return `
<article class="card${featured ? " card-featured" : ""}">
  ${featured ? '<span class="badge-featured">\u7CBE\u9009</span>' : ""}
  <div class="card-body">
    <div class="card-meta">
      ${a.category_name ? `<a class="cat" href="/category/${h(a.category_slug)}">${h(a.category_name)}</a>` : '<span class="cat muted">\u672A\u5206\u7C7B</span>'}
      <span class="dot">\xB7</span><time>${h(fmtDate(a.published_at))}</time>
      <span class="dot">\xB7</span><span>${Number(a.views) || 0} \u6B21\u9605\u8BFB</span>
      ${Number(a.comment_count) > 0 ? `<span class="dot">\xB7</span><span>${Number(a.comment_count)} \u6761\u8BC4\u8BBA</span>` : ""}
    </div>
    <h2 class="card-title"><a href="/article/${h(a.slug)}">${h(a.title)}</a></h2>
    <p class="card-excerpt">${h(excerpt(a.summary || a.content, 110))}</p>
    <div class="card-foot">
      <div class="tags">${tags}</div>
      <a class="read-more" href="/article/${h(a.slug)}">\u9605\u8BFB\u5168\u6587 \u2192</a>
    </div>
  </div>
</article>`;
}
/** 提取客户端真实 IP：优先 Cloudflare 头，其次 XFF 链的第一跳 */
function clientIp(request) {
  const cf = (request.headers.get("CF-Connecting-IP") || "").trim();
  if (cf) return cf;
  const xff = (request.headers.get("X-Forwarded-For") || "").trim();
  if (xff) return xff.split(",")[0].trim();
  return (request.headers.get("X-Real-IP") || "").trim();
}
/** 解析友情链接配置：一行一个，支持「名称 | 地址」或纯地址；返回 [{ name, href, auto }] */
function parseFriendLinks(raw) {
  const out = [];
  for (const line of String(raw || "").split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    let [name, href] = t.split("|").map((x) => (x || "").trim());
    let auto = false;
    if (!href || href === "") {
      href = name;
      name = href.replace(/^(https?:)?\/\//i, "").replace(/\/$/, "");
      auto = true;
    }
    if (!href) continue;
    if (!/^(https?:)?\/\//i.test(href)) href = "//" + href;
    out.push({ name, href, auto });
  }
  return out;
}
/** 把 [{name,href}] 序列化回配置文本（去掉自动补全的 // 前缀，保持可读） */
function serializeFriendLinks(items) {
  return items.map((l) => {
    const href = String(l.href || "").replace(/^\/\//, "");
    return l.name && l.name !== href ? l.name + " | " + href : href;
  }).join("\n");
}
/** 规范化用户输入的地址：补全协议、拒绝危险协议 */
function normalizeHref(input) {
  let href = String(input || "").trim();
  if (!href) return "";
  if (/^(javascript|data|vbscript):/i.test(href)) return "";
  if (!/^(https?:)?\/\//i.test(href)) href = "//" + href.replace(/^\/+/, "");
  return href;
}
/** 前台页脚「友情链接」模块 */
function renderFriendLinksSide(raw) {
  const items = parseFriendLinks(raw);
  if (!items.length) return "";
  return `<div class="friendlinks">${items.map((l) => `<a target="_blank" rel="noopener nofollow" href="${h(l.href)}">${h(l.name)}</a>`).join("")}</div>`;
}
async function sideArchives(ctx) {
  try {
    const rows = await ctx.db.all(
      "SELECT substr(published_at, 1, 7) AS ym, COUNT(*) AS cnt FROM articles WHERE status='published' AND deleted_at IS NULL AND published_at IS NOT NULL GROUP BY ym ORDER BY ym DESC LIMIT 6"
    );
    return (rows || []).map((r) => ({ month: r.ym, total: Number(r.cnt) || 0 }));
  } catch (e) {
    return [];
  }
}
async function sideLatestComments(ctx, limit = 6) {
  try {
    const rows = await ctx.db.all(
      `SELECT cm.id, cm.author, cm.content, cm.created_at, cm.article_id,
         a.title AS article_title, a.slug AS article_slug
       FROM comments cm
       JOIN articles a ON a.id = cm.article_id
       WHERE cm.status = 'approved' AND a.deleted_at IS NULL AND a.status = 'published'
       ORDER BY cm.created_at DESC, cm.id DESC LIMIT ?`,
      limit
    );
    return rows || [];
  } catch (e) {
    return [];
  }
}
async function sideHotArticles(ctx, limit = 6) {
  try {
    const rows = await ctx.db.all(
      `SELECT a.id, a.title, a.slug, COUNT(cm.id) AS cnt
       FROM articles a
       JOIN comments cm ON cm.article_id = a.id AND cm.status = 'approved'
       WHERE a.deleted_at IS NULL AND a.status = 'published'
       GROUP BY a.id
       ORDER BY cnt DESC, a.published_at DESC
       LIMIT ?`,
      limit
    );
    return (rows || []).map((r) => ({ ...r, cnt: Number(r.cnt) || 0 }));
  } catch (e) {
    return [];
  }
}
/**
 * 侧边栏 HTML：Ta们说（最新评论）+ 热点（最多评论文章）
 * 无数据时整块不渲染，避免出现空的卡片标题。
 */
function sidebarExtra(latestComments, hotArticles) {
  // Ta们说：单行「评论者：评论内容」，与「文章分类」保持同一套 .classify 样式
  const cmHtml = latestComments.length
    ? `<div class="classify side-comments">
      <h3>Ta们说</h3>
      ${latestComments.map((cm) => `<a href="/article/${h(cm.article_slug)}#comment-${Number(cm.id)}" title="${h(cm.author)}\uFF1A${h(excerpt(cm.content, 120))}"><b class="cm-author">${h(cm.author)}\uFF1A</b>${h(excerpt(cm.content, 28))}</a>`).join("")}
    </div>`
    : "";
  // 热点：与「文章分类」同一套 .classify 样式（标题 + 右侧评论数）
  const hotHtml = hotArticles.length
    ? `<div class="classify side-hot">
      <h3>\u70ED\u70B9</h3>
      ${hotArticles.map((a) => `<a href="/article/${h(a.slug)}" title="${h(a.title)}\uFF08${a.cnt} \u6761\u8BC4\u8BBA\uFF09">${h(a.title)}<span>${a.cnt}</span></a>`).join("")}
    </div>`
    : "";
  return cmHtml + hotHtml;
}
/**
 * 文章正文渲染：
 * - 从其它编辑器粘贴的纯文本换行（\n）默认会被 HTML 折叠，
 *   配合 .article-content 的 white-space:pre-line 让换行生效；
 * - 先压缩「标签之间」的换行（>\n<），避免媒体插入的 HTML 块产生多余空行。
 */
function renderArticleContent(raw) {
  return String(raw || "").replace(/>\s*\n\s*</g, "><").replace(/\n{3,}/g, "\n\n");
}
/**
 * 公网安备：输入「粤公网安备44098102441016」这类文案，
 * 自动提取其中的号码拼成备案查询链接；留空使用默认值。
 */
var BEIAN_DEFAULT = "\u7CA4\u516C\u7F51\u5B89\u590744098102441016";
function renderBeian(raw) {
  const text = String(raw || "").trim() || BEIAN_DEFAULT;
  const digits = (text.match(/(\d{6,})/) || [])[1] || "";
  const href = digits
    ? "https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=" + digits
    : "https://www.beian.gov.cn/portal/registerSystemInfo";
  return `<a target="_blank" rel="noopener" href="${h(href)}">${h(text)}</a>`;
}
async function frontLayout(ctx, title, active, content) {
  const s = ctx.s || {};
  const siteName = s.site_name || "LiteCMS";
  const cats = ctx.cats || [];
  const navTags = (ctx.navTags || []).slice(0, 16);
  const sideCats = cats.slice(0, 12);
  const archives = await sideArchives(ctx);
  const latestComments = await sideLatestComments(ctx, 6);
  const hotArticles = await sideHotArticles(ctx, 6);
  const qrcode = s.qrcode_image || "";
  const qrcodeTip = s.qrcode_tip || "\u5173\u6CE8\u516C\u4F17\u53F7";
  const showTips = s.front_tips !== "0";
  const bannerImage = (s.banner_image || "").trim() || "//hechaocheng.cn/HccTools/img/header.genzi.win.png";
  const tipsType = ["info", "warning", "danger"].includes(s.front_tips_type) ? s.front_tips_type : "info";
  const tipsText = (s.front_tips_text || "").trim() !== "" ? s.front_tips_text : "\u672C\u7AD9\u57FA\u4E8E LiteCMS \u6784\u5EFA\uFF0C\u8BC4\u8BBA\u91C7\u7528\u5373\u65F6\u63D0\u4EA4\uFF0C\u8BF7\u6587\u660E\u53D1\u8A00\u3002";
  const now = new Date(Date.now() + 8 * 3600 * 1e3);
  const pad = (n) => n < 10 ? "0" + n : "" + n;
  const dateStr = pad(now.getUTCMonth() + 1) + "\u6708" + pad(now.getUTCDate()) + "\u65E5";
  const weekStr = "\u661F\u671F" + "\u65E5\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D"[now.getUTCDay()];
  const timeStr = pad(now.getUTCHours()) + ":" + pad(now.getUTCMinutes()) + ":" + pad(now.getUTCSeconds());
  const friendLinksHtml = renderFriendLinksSide(s.friend_links);
  const beianHtml = renderBeian(s.beian_no);
  return `<!DOCTYPE html>
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#5682a3">
<title>${title ? h(title) + " - " + h(siteName) : h(siteName)}</title>
<meta name="description" content="${h(s.site_subtitle || "")}">
<meta name="generator" content="LiteCMS CF">
<link rel="stylesheet" href="/assets/css/theme-blue.css?v=${encodeURIComponent(VERSION)}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>\u{1F4DD}</text></svg>">
</head>
<body class="theme-blue">

<a rel="bookmark" href="/" class="site-logo" aria-label="${h(siteName)}">
  <div class="logo has-banner" style="background-image:url(${h(bannerImage)})">
    <div class="logo-inner">
      <span class="logo-mark">L</span>
      <span class="logo-text">
        <strong>${h(siteName)}</strong>
        <small>${h(s.site_subtitle || "")}</small>
      </span>
    </div>
  </div>
</a>

<div class="navmain">
  <div class="nav">
    <span class="navmenu" id="navToggle">\u5BFC\u822A\u83DC\u5355</span>
    <ul id="navList">
      <li class="${active === "home" ? "active" : ""}"><a href="/" rel="home">\u7F51\u7AD9\u9996\u9875</a></li>
      ${(ctx.navPages || []).map((pg) => `<li class="${active === "page-" + pg.id ? "active" : ""}"><a href="/${h(pg.slug)}" title="${h(pg.title)}">${h(pg.title)}</a></li>`).join("")}
      <li class="${active === "about" ? "active" : ""}"><a href="/about">\u5173\u4E8E</a></li>
    </ul>
    <a class="qun" href="${ctx.user ? "/wp-admin" : "/wp-admin/login"}">\u7BA1\u7406\u540E\u53F0</a>
    <div class="clear"></div>
  </div>
</div>

<div class="notice">
  <noscript><div class="error">\u8BF7\u786E\u4FDD\u60A8\u7684\u6D4F\u89C8\u5668\u5DF2\u542F\u7528\u5E76\u652F\u6301 JavaScript \u811A\u672C\uFF0C\u5426\u5219\u90E8\u5206\u529F\u80FD\uFF08\u5982\u8BC4\u8BBA\uFF09\u53EF\u80FD\u65E0\u6CD5\u6B63\u5E38\u4F7F\u7528\u3002</div></noscript>
  ${showTips ? `<div class="${tipsType}">${h(tipsText)}</div>` : ""}
</div>

<div class="main">
  <div class="content-area">
${content}
  </div>

  <div class="sidebar" id="sidebar">
    <div class="widget clock" id="widgetClock" title="\u70B9\u51FB\u628A\u5F53\u524D\u65E5\u671F\u586B\u8FDB\u641C\u7D22\u6846">
      <div class="clock-date"><span id="dynDate">${h(dateStr)}</span><span id="dynWeek">${h(weekStr)}</span></div>
      <div class="clock-time" id="dynTime">${h(timeStr)}</div>
      <div class="clear"></div>
    </div>

    <div class="widget">
      <form action="/search" method="get" role="search">
        <div class="search-area">
          <div><div class="input-area"><div>
            <input type="text" name="q" id="q" maxlength="36" class="search" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false" value="${active === "search" ? h(ctx.q || "") : ""}" placeholder="\u641C\u7D22\u6587\u7AE0\u2026">
          </div></div></div>
          <button type="submit" class="submit" aria-label="\u641C\u7D22"><svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M952.7 906.3 711.5 645a361.1 361.1 0 1 0-51.2 55.5l237.7 257.5a32 32 0 0 0 45.5 1.8 32 32 0 0 0 9.2-23.7 32 32 0 0 0-10-29.8zM425.1 720.7a295.5 295.5 0 1 1 0-591 295.5 295.5 0 0 1 0 591z" fill="#ffffff"></path></svg></button>
        </div>
      </form>
    </div>

    ${sideCats.length ? `<div class="classify"><h3>\u6587\u7AE0\u5206\u7C7B</h3>${sideCats.map((c) => `<a href="/category/${h(c.slug)}" title="${h(c.name)}">${h(c.name)}<span>${Number(c.article_count) || 0}</span></a>`).join("")}</div>` : ""}

    ${navTags.length ? `<div class="classify"><h3>Tags</h3>${navTags.map((t) => `<a href="/tag/${h(t.slug)}" title="${h(t.name)}">#${h(t.name)}<span>${Number(t.article_count) || 0}</span></a>`).join("")}</div>` : ""}

    ${archives.length ? `<div class="classify"><h3>\u6587\u7AE0\u5F52\u6863</h3>${archives.map((ar) => `<a href="/archive?month=${h(ar.month)}">${h(ar.month)}<span>${ar.total}</span></a>`).join("")}</div>` : ""}

    ${sidebarExtra(latestComments, hotArticles)}

    ${qrcode ? `<div class="images"><h3>${h(qrcodeTip)}</h3><img src="${h(qrcode)}" alt="${h(qrcodeTip)}" loading="lazy"></div>` : ""}

    <div class="clear"></div>
  </div>
  <div class="clear"></div>
</div>

<div class="footer">
  ${friendLinksHtml}
  <div class="footer-meta">
    
	
	<div>Copyright &copy; ${now.getUTCFullYear()} <a href="/">${h(siteName)}</a> All Rights Reserved.</div>
	<div><a target="_blank" href="https://www.miibeian.gov.cn/">${s.icp_no ? h(s.icp_no) : "粤ICP备09058819号"}</a>&nbsp;\xB7&nbsp;&#x6280;&#x672F;&#x652F;&#x6301;:<a target="_blank" href="//hechaocheng.cn/" title="程序仅供技术测试交流使用,违反后果自负"><!--[保留作者]-->&#x4F55;<!--(链接是)-->&#x671D;<!--{最基本的}-->&#x57CE;<!--#尊重#--></a></div>
	<div>${beianHtml}</div>
	</div>
  </div>
</div>

<div id="HccTop" title="\u56DE\u5230\u9876\u90E8">\u2191</div>

<script src="/assets/js/front.js?v=${encodeURIComponent(VERSION)}"></script>
<script src="/assets/js/theme-blue.js?v=${encodeURIComponent(VERSION)}"></script>
${s.site_stats ? "\n" + s.site_stats + "\n" : ""}</body>
</html>`;
}
async function pageHome(ctx, data) {
  const { articles, featured, pager } = data;
  let out = "";
  if (featured && featured.length) {
    out += `<section class="featured-zone">
  <div class="section-head"><h2>\u7CBE\u9009\u63A8\u8350</h2><span class="muted">\u7F16\u8F91\u624B\u5DE5\u6311\u9009\u7684\u4F18\u8D28\u5185\u5BB9</span></div>
  <div class="featured-grid">${featured.map((fa) => `
    <a class="feature-item" href="/article/${h(fa.slug)}">
      <span class="feature-cat">${h(fa.category_name || "\u672A\u5206\u7C7B")}</span>
      <strong>${h(fa.title)}</strong>
      <span class="feature-meta">${h(fmtDate(fa.published_at))} \xB7 ${Number(fa.views) || 0} \u9605\u8BFB</span>
    </a>`).join("")}</div>
</section>`;
  }
  out += `<div class="section-head"><h2>\u6700\u65B0\u6587\u7AE0</h2><span class="muted">\u5171 ${pager.total} \u7BC7</span></div>
<div class="card-list">`;
  out += articles.length ? articles.map((a) => card(a)).join("") : `<div class="empty"><p>\u8FD8\u6CA1\u6709\u53D1\u5E03\u4EFB\u4F55\u6587\u7AE0\u3002</p><a class="btn btn-primary" href="/wp-admin">\u53BB\u540E\u53F0\u5199\u7B2C\u4E00\u7BC7</a></div>`;
  out += "</div>" + pagerHtml(pager, "/");
  return await frontLayout(ctx, "", "home", out);
}
async function pageList(ctx, data) {
  const { heading, subheading, articles, pager, active, base, params, emptyText } = data;
  let out = `<div class="page-head"><h1>${h(heading)}</h1>${subheading ? `<p class="muted">${h(subheading)}</p>` : ""}</div>
<div class="card-list">`;
  out += articles.length ? articles.map((a) => card(a)).join("") : `<div class="empty"><p>${h(emptyText || "\u8BE5\u680F\u76EE\u4E0B\u6682\u65F6\u6CA1\u6709\u6587\u7AE0\u3002")}</p><a class="btn" href="/">\u8FD4\u56DE\u9996\u9875</a></div>`;
  out += "</div>" + pagerHtml(pager, base, params);
  return await frontLayout(ctx, heading, active, out);
}
var AVATAR_COLORS = ["#2f5bea", "#0f9d58", "#d93025", "#f59e0b", "#8b5cf6", "#0891b2", "#db2777", "#65a30d"];
function avatarColor(email) {
  let hash = 0;
  for (const ch of String(email || "").toLowerCase().trim()) {
    hash = hash * 31 + ch.codePointAt(0) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
var initial = (name) => h(Array.from(String(name || "?").trim())[0] || "?");
function renderComment(ctx, c, opts = {}) {
  const canReply = opts.canReply !== false;
  const children = c.children || [];
  const replies = children.length ? `
    <ul class="comment-replies">${children.map((rp) => `
      <li id="comment-${rp.id}">
        <div class="cm-avatar small" style="background:${avatarColor(rp.email)}">${initial(rp.author)}</div>
        <div class="cm-main">
          <div class="cm-head">
            ${rp.website ? `<a class="cm-author" href="${h(rp.website)}" target="_blank" rel="nofollow noopener noreferrer">${h(rp.author)}</a>` : `<span class="cm-author">${h(rp.author)}</span>`}
            <span class="cm-to">\u56DE\u590D @${h(c.author)}</span>
            <span class="cm-time">${h(fmtDate(rp.created_at, true))}</span>
          </div>
          <div class="cm-body">${commentBody(rp.content)}</div>
        </div>
      </li>`).join("")}</ul>` : "";
  return `
    <li class="comment" id="comment-${c.id}">
      <div class="cm-avatar" style="background:${avatarColor(c.email)}">${initial(c.author)}</div>
      <div class="cm-main">
        <div class="cm-head">
          ${c.website ? `<a class="cm-author" href="${h(c.website)}" target="_blank" rel="nofollow noopener noreferrer">${h(c.author)}</a>` : `<span class="cm-author">${h(c.author)}</span>`}
          <span class="cm-time">${h(fmtDate(c.created_at, true))}</span>
        </div>
        <div class="cm-body">${commentBody(c.content)}</div>
        ${canReply ? `<div class="cm-actions">
          <button type="button" class="reply-btn" data-reply="${c.id}" data-author="${h(c.author)}">\u56DE\u590D${children.length ? `\uFF08${children.length}\uFF09` : ""}</button>
        </div>` : ""}
        ${replies}
      </div>
    </li>`;
}
function commentBody(text) {
  return h(text).replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="nofollow noopener noreferrer">$1</a>'
  );
}
async function pageArticle(ctx, data) {
  const {
    article: a,
    neighbors = { prev: null, next: null },
    related = [],
    comments = [],
    commentCount = 0,
    commentsEnabled,
    commentForm,
    flash
  } = data;
  const cf = commentForm || { author: "", email: "", website: "", content: "", parent_id: 0, errors: {} };
  const errs = Object.values(cf.errors || {}).filter(Boolean);
  const maxLen = parseInt(ctx.s.comments_max_length || "1000", 10) || 1e3;
  const interval = parseInt(ctx.s.comments_interval || "30", 10) || 0;
  const moderation = ctx.s.comments_moderation === "1";
  const tags = (a.tags || []).map((t) => `<a href="/tag/${h(t.slug)}">#${h(t.name)}</a>`).join("");
  const content = `
${flash ? `<div class="alert alert-${flash.type === "success" ? "success" : "error"}"><span>${h(flash.message)}</span></div>` : ""}
<article class="article-single">
  <header class="article-head">
    <!--div class="breadcrumb"><a href="/">\u9996\u9875</a>${a.category_name ? `<span>/</span><a href="/category/${h(a.category_slug)}">${h(a.category_name)}</a>` : ""}</div-->
    <h1>${h(a.title)}</h1>
    <div class="article-meta">
      <span>\u4F5C\u8005\uFF1A${h(a.author_name || "\u7BA1\u7406\u5458")}</span>
      <span>\u53D1\u5E03\u4E8E ${h(fmtDate(a.published_at, true))}</span>
      <span>${Number(a.views) || 0} \u6B21\u9605\u8BFB</span>
      <a class="to-comments" href="#comments">${commentCount} \u6761\u8BC4\u8BBA</a>
      ${a.updated_at && a.created_at && a.updated_at !== a.created_at ? `<span class="muted">\u66F4\u65B0\u4E8E ${h(fmtDate(a.updated_at, true))}</span>` : ""}
    </div>
  </header>
  ${a.summary ? `<div class="article-summary">${h(a.summary)}</div>` : ""}
  <div class="article-content">${renderArticleContent(a.content)}</div>
  ${tags ? `<div class="article-tags">${tags}</div>` : ""}
  <nav class="neighbors">
    ${neighbors.prev ? `<a class="prev" href="/article/${h(neighbors.prev.slug)}"><small>\u4E0A\u4E00\u7BC7</small><strong>${h(neighbors.prev.title)}</strong></a>` : '<span class="prev disabled" aria-disabled="true"><small>\u4E0A\u4E00\u7BC7</small><strong>\u5DF2\u7ECF\u662F\u7B2C\u4E00\u7BC7\u4E86</strong></span>'}
    ${neighbors.next ? `<a class="next" href="/article/${h(neighbors.next.slug)}"><small>\u4E0B\u4E00\u7BC7</small><strong>${h(neighbors.next.title)}</strong></a>` : '<span class="next disabled" aria-disabled="true"><small>\u4E0B\u4E00\u7BC7</small><strong>\u5DF2\u7ECF\u662F\u6700\u540E\u4E00\u7BC7\u4E86</strong></span>'}
  </nav>
</article>

<section class="comments" id="comments">
  <div class="comments-head">
    <h2>\u8BC4\u8BBA<span class="count">${commentCount}</span></h2>
    ${moderation ? `<p class="notice">${h(ctx.s.comments_notice || "\u8BC4\u8BBA\u5C06\u5728\u7AD9\u957F\u5BA1\u6838\u901A\u8FC7\u540E\u663E\u793A\u3002")}</p>` : ""}
  </div>
  ${comments.length ? `<ol class="comment-list">${comments.map((c) => renderComment(ctx, c, { canReply: commentsEnabled })).join("")}</ol>` : commentsEnabled ? '<div class="comments-empty">\u8FD8\u6CA1\u6709\u8BC4\u8BBA\uFF0C\u6765\u8BF4\u4E24\u53E5\u5427\u3002</div>' : '<div class="comments-empty">\u8FD8\u6CA1\u6709\u8BC4\u8BBA\u3002</div>'}
  ${commentsEnabled ? `
      <div class="comment-form-wrap" id="comment-form">
        <h3 class="form-title" id="formTitle">\u53D1\u8868\u8BC4\u8BBA</h3>
        <div class="cm-status" id="cmStatus" role="status" aria-live="polite" hidden></div>
        ${errs.length ? `<div class="alert alert-error">${errs.map((e) => `<div>${h(e)}</div>`).join("")}</div>` : ""}
        <form method="post" action="/comment" class="comment-form" id="cForm"
              data-interval="${interval}" data-moderation="${moderation ? "1" : "0"}">
          ${csrfField(ctx.csrf)}
          <input type="hidden" name="article_id" value="${a.id}">
          <input type="hidden" name="slug" value="${h(a.slug)}">
          <input type="hidden" name="parent_id" id="parentId" value="${Number(cf.parent_id) || 0}">
          <input type="hidden" name="elapsed" id="cmElapsed" value="0">
          <input type="hidden" name="token" id="cmToken" value="">
          <div class="hp-field"><label>\u8BF7\u52FF\u586B\u5199<input type="text" name="homepage" value="" tabindex="-1" autocomplete="off"></label></div>
          <div class="reply-hint" id="replyHint" style="display:none">
            \u6B63\u5728\u56DE\u590D <strong id="replyTarget"></strong>
            <button type="button" id="cancelReply">\u53D6\u6D88</button>
          </div>
          <div class="form-row">
            <label class="field"><span class="label">\u6635\u79F0 <em class="req">*</em></span>
              <input type="text" name="author" id="cmAuthor" value="${h(cf.author || "")}" maxlength="30" required placeholder="\u600E\u4E48\u79F0\u547C\u4F60\uFF1F" autocomplete="nickname"></label>
            <label class="field"><span class="label">\u90AE\u7BB1 <em class="req">*</em><small class="hint">\u4E0D\u4F1A\u516C\u5F00</small></span>
              <input type="email" name="email" id="cmEmail" value="${h(cf.email || "")}" maxlength="120" required placeholder="you@example.com" autocomplete="email"></label>
            <label class="field"><span class="label">\u7F51\u7AD9 <small class="hint">\u9009\u586B</small></span>
              <input type="text" name="website" id="cmWebsite" value="${h(cf.website || "")}" maxlength="200" placeholder="https://" autocomplete="url"></label>
          </div>
          <label class="field"><span class="label">\u8BC4\u8BBA\u5185\u5BB9 <em class="req">*</em></span>
            <textarea name="content" id="cContent" rows="5" maxlength="${maxLen}" required placeholder="\u53CB\u5584\u53D1\u8A00\uFF0C\u7406\u6027\u8BA8\u8BBA\u2026">${h(cf.content || "")}</textarea>
            <span class="counter"><span id="cCount">0</span> / ${maxLen}</span></label>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" id="cmSubmit">\u63D0\u4EA4\u8BC4\u8BBA</button>
            <span class="muted small">\u652F\u6301\u7EAF\u6587\u672C\uFF0C\u7F51\u5740\u4F1A\u81EA\u52A8\u8F6C\u6210\u94FE\u63A5</span>
            <label class="check-line cm-remember"><input type="checkbox" id="cmRemember" checked> \u8BB0\u4F4F\u6211\u7684\u4FE1\u606F</label>
          </div>
        </form>
      </div>` : `
      <div class="comment-form-wrap comment-closed" id="comment-form">
        <h3 class="form-title">\u53D1\u8868\u8BC4\u8BBA</h3>
        <div class="comments-off">
          <strong>\u8BC4\u8BBA\u529F\u80FD\u5DF2\u5173\u95ED</strong>
          <p>\u672C\u7AD9\u5DF2\u6682\u505C\u63A5\u6536\u65B0\u8BC4\u8BBA\uFF0C\u6B64\u524D\u7684\u8BC4\u8BBA\u4ECD\u4F1A\u6B63\u5E38\u5C55\u793A\u3002</p>
        </div>
      </div>`}
</section>

${related.length ? `<section class="related">
  <div class="section-head"><h2>\u76F8\u5173\u6587\u7AE0</h2></div>
  <div class="card-list">${related.map((r) => card(r)).join("")}</div>
</section>` : ""}`;
  return await frontLayout(ctx, a.title, "home", content);
}
async function page404(ctx, message) {
  return await frontLayout(ctx, "\u9875\u9762\u4E0D\u5B58\u5728", "", `
<div class="notfound">
  <div class="code">404</div>
  <h1>\u9875\u9762\u4E0D\u5B58\u5728</h1>
  <p class="muted">${h(message || "\u4F60\u8BBF\u95EE\u7684\u9875\u9762\u53EF\u80FD\u5DF2\u88AB\u5220\u9664\u3001\u6539\u540D\uFF0C\u6216\u8005\u4ECE\u672A\u5B58\u5728\u8FC7\u3002")}</p>
  <div class="actions">
    <a class="btn btn-primary" href="/">\u56DE\u5230\u9996\u9875</a>
    <a class="btn" href="/search?q=">\u641C\u7D22\u5185\u5BB9</a>
  </div>
</div>`);
}
/** 前台独立页面（后台「页面」创建，slug 直达） */
async function pageCustom(ctx, pg) {
  return await frontLayout(ctx, pg.title, "page-" + pg.id, `
<div class="page-head">
  <h1>${h(pg.title)}</h1>
</div>
<div class="prose article-content">${renderArticleContent(pg.content)}</div>`);
}
async function pageAbout(ctx) {
  const s = ctx.s || {};
  return await frontLayout(ctx, "\u5173\u4E8E\u672C\u7AD9", "about", `
<div class="page-head">
  <h1>\u5173\u4E8E\u672C\u7AD9</h1>
  <p class="muted">${h(s.site_subtitle || "")}</p>
</div>
<div class="prose">
  <p>\u672C\u7AD9\u662F\u8F7B\u91CF\u7EA7\u5185\u5BB9\u7BA1\u7406\u7CFB\u7EDF <strong>LiteCMS</strong> \u7684 Cloudflare \u7248\u672C\uFF0C\u5168\u90E8\u8FD0\u884C\u5728\u8FB9\u7F18\u7F51\u7EDC\u4E0A\uFF1A<strong>Pages</strong> \u63D0\u4F9B\u8BBF\u95EE\u4E0E\u51FD\u6570\u8BA1\u7B97\uFF0C<strong>D1</strong> \u5B58\u50A8\u6570\u636E\uFF0C<strong>R2</strong> \u5B58\u653E\u5A92\u4F53\u6587\u4EF6\u3002\u6CA1\u6709\u4F7F\u7528\u4EFB\u4F55\u524D\u7AEF\u6846\u67B6\uFF0C\u754C\u9762\u5168\u90E8\u662F\u670D\u52A1\u7AEF\u6E32\u67D3\u7684\u539F\u751F HTML + CSS\u3002</p>

  <h2>\u529F\u80FD\u4E00\u89C8</h2>
  <ul>
    <li>\u6587\u7AE0\uFF1A\u65B0\u589E\u3001\u7F16\u8F91\u3001\u8F6F\u5220\u9664\u8FDB\u56DE\u6536\u7AD9\u3001\u6062\u590D\u3001\u5F7B\u5E95\u5220\u9664\u3001\u6279\u91CF\u64CD\u4F5C</li>
    <li>\u5206\u7C7B\uFF1A\u589E\u5220\u6539\u67E5\uFF0C\u5220\u9664\u5206\u7C7B\u65F6\u6587\u7AE0\u81EA\u52A8\u79FB\u5165\u300C\u672A\u5206\u7C7B\u300D</li>
    <li>\u6807\u7B7E\uFF1A\u4FDD\u5B58\u6587\u7AE0\u65F6\u81EA\u52A8\u521B\u5EFA\u5E76\u5EFA\u7ACB\u591A\u5BF9\u591A\u5173\u8054</li>
    <li>\u524D\u53F0\uFF1A\u9996\u9875\u3001\u5206\u7C7B\u9875\u3001\u6807\u7B7E\u9875\u3001\u5F52\u6863\u3001\u641C\u7D22\u3001\u6587\u7AE0\u8BE6\u60C5\u3001\u4E0A\u4E0B\u7BC7\u5BFC\u822A</li>
    <li>\u540E\u53F0\uFF1A\u4EEA\u8868\u76D8\u7EDF\u8BA1\u3001\u6587\u7AE0\u7B5B\u9009\u5206\u9875\u3001\u8BC4\u8BBA\u5BA1\u6838\u3001\u5A92\u4F53\u5E93\u3001\u7AD9\u70B9\u8BBE\u7F6E\u3001\u4FEE\u6539\u5BC6\u7801</li>
    <li>\u5B89\u5168\uFF1AD1 \u53C2\u6570\u7ED1\u5B9A\u9632\u6CE8\u5165\u3001CSRF \u53CC\u63D0\u4EA4\u6821\u9A8C\u3001\u8F93\u51FA\u8F6C\u4E49\u3001PBKDF2 \u52A0\u76D0\u54C8\u5E0C\u3001\u8BF7\u6C42\u7B7E\u540D Cookie</li>
  </ul>

  <h2>\u6280\u672F\u6808</h2>
  <table>
    <tr><th>\u5C42\u6B21</th><th>\u5B9E\u73B0</th></tr>
    <tr><td>\u8FD0\u884C\u73AF\u5883</td><td>Cloudflare Pages Functions\uFF08Workers Runtime\uFF09</td></tr>
    <tr><td>\u6570\u636E\u5B58\u50A8</td><td>Cloudflare D1\uFF08SQLite \u8BED\u4E49\uFF09</td></tr>
    <tr><td>\u5A92\u4F53\u5B58\u50A8</td><td>Cloudflare R2 \u5BF9\u8C61\u5B58\u50A8</td></tr>
    <tr><td>\u4F1A\u8BDD</td><td>\u65E0\u72B6\u6001 HMAC-SHA256 \u7B7E\u540D Cookie</td></tr>
    <tr><td>\u524D\u7AEF</td><td>\u539F\u751F HTML / CSS / \u5C11\u91CF vanilla JS</td></tr>
  </table>

  <h2>\u5173\u4E8E\u8FD9\u5957\u7CFB\u7EDF</h2>
  <p>\u5B83\u6700\u521D\u662F\u4E00\u4E2A\u8DD1\u5728 PHP + SQLite \u4E0A\u7684\u5355\u6587\u4EF6\u5F0F CMS\uFF0C\u4E3A\u4E86\u5728\u6CA1\u6709\u670D\u52A1\u5668\u7684\u524D\u63D0\u4E0B\u957F\u671F\u8FD0\u884C\uFF0C\u88AB\u5B8C\u6574\u79FB\u690D\u5230\u4E86 Cloudflare \u7684\u514D\u8D39\u989D\u5EA6\u4E4B\u5185\u3002</p>
</div>`);
}
function pageLogin(ctx, error, info, username, next) {
  const siteName = ctx.s.site_name || "LiteCMS";
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>\u767B\u5F55 - ${h(siteName)}</title>
<link rel="stylesheet" href="/assets/css/admin.css?v=${encodeURIComponent(VERSION)}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>\u2699\uFE0F</text></svg>">
</head>
<body class="auth-body">
  <div class="auth-bg"></div>
  <div class="auth-wrap">
    <div class="login-card">
      <div class="login-head">
        <span class="brand-mark big">L</span>
        <h1>\u767B\u5F55\u7BA1\u7406\u540E\u53F0</h1>
        <p class="muted">${h(siteName)}</p>
      </div>
      ${error ? `<div class="alert alert-error"><span>${h(error)}</span></div>` : ""}
      ${info ? `<div class="alert alert-info" style="background:#eef2ff;border-color:#c7d2fe;color:#23398f"><span>${h(info)}</span></div>` : ""}
      <form method="post" action="/wp-admin/login" class="login-form" autocomplete="off">
        ${csrfField(ctx.csrf)}
        <input type="hidden" name="next" value="${h(next || "")}">
        <label class="field"><span class="label">\u7528\u6237\u540D</span>
          <input type="text" name="username" value="${h(username || "")}" placeholder="\u8BF7\u8F93\u5165\u7528\u6237\u540D" required autofocus></label>
        <label class="field"><span class="label">\u5BC6\u7801</span>
          <input type="password" name="password" placeholder="\u8BF7\u8F93\u5165\u5BC6\u7801" required></label>
        <button type="submit" class="btn btn-primary btn-block">\u767B \u5F55</button>
      </form>
      <p class="login-tip muted">\u8D26\u53F7\u5728\u9996\u6B21\u8BBF\u95EE <code>/install</code> \u65F6\u521B\u5EFA\u3002</p>
    </div>
    <p class="auth-foot muted">LiteCMS \xB7 Cloudflare Pages + D1 + R2</p>
  </div>
</body></html>`;
}

// functions/lib/views-admin.js
var MENU = [
  ["dashboard", "\u4EEA\u8868\u76D8", "dashboard"],
  ["articles", "\u6587\u7AE0", "articles"],
  ["comments", "\u8BC4\u8BBA", "comments"],
  ["categories", "\u5206\u7C7B", "categories"],
  ["tags", "\u6807\u7B7E", "tags"],
  ["pages", "\u9875\u9762", "pages"],
  ["friendlinks", "\u94FE\u63A5", "friendlinks"],
  ["media", "\u5A92\u4F53\u5E93", "media"],
  ["password", "\u4FEE\u6539\u5BC6\u7801", "password"],
  ["settings", "\u8BBE\u7F6E", "settings"]
];
function adminLayout(ctx, title, nav, content, pendingComments = 0) {
  const u = ctx.user || {};
  const nick = u.nickname || u.username || "U";
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${h(title)} - ${h(ctx.s.site_name)} \u7BA1\u7406\u540E\u53F0</title>
<link rel="stylesheet" href="/assets/css/admin.css?v=${encodeURIComponent(VERSION)}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>\u2699\uFE0F</text></svg>">
</head>
<body class="admin-body">
<aside class="sidebar">
  <a class="side-brand" href="/wp-admin">
    <span class="brand-mark">L</span>
    <span><strong>LiteCMS</strong><small>\u7BA1\u7406\u540E\u53F0 v${h(VERSION)}</small></span>
  </a>
  <nav class="side-nav">
    ${MENU.map(([key, label, navKey]) => `
      <a href="/wp-admin/${key}" class="${nav === navKey ? "on" : ""}"><span>${label}</span>${navKey === "comments" && pendingComments > 0 ? `<em class="nav-badge">${pendingComments}</em>` : ""}</a>`).join("")}
  </nav>
  <div class="side-foot">
    <a href="/" target="_blank" rel="noopener">\u67E5\u770B\u524D\u53F0 \u2197</a>
    <a href="/wp-admin/logout" class="danger">\u9000\u51FA\u767B\u5F55</a>
  </div>
</aside>
<div class="main">
  <header class="topbar">
    <div class="topbar-left"><h1>${h(title)}</h1></div>
    <div class="topbar-right">
      <span class="user-chip"><span class="avatar">${h(Array.from(nick)[0] || "U")}</span>${h(nick)}<em>${h(u.role || "admin")}</em></span>
      <a class="btn btn-primary btn-sm" href="/wp-admin/articles/new">\uFF0B \u65B0\u5EFA\u6587\u7AE0</a>
    </div>
  </header>
  <div class="content">
    ${ctx.flash ? `<div class="alert alert-${h(ctx.flash.type === "success" ? "success" : "error")}"><span>${h(ctx.flash.message)}</span><button type="button" class="alert-close" onclick="this.parentNode.style.display='none'">\xD7</button></div>` : ""}
    ${content}
  </div>
</div>
<script src="/assets/js/admin.js?v=${encodeURIComponent(VERSION)}"></script>
</body></html>`;
}
function pagerHtml2(pager, base, params = {}) {
  if (!pager || pager.pages <= 1) {
    return pager && pager.total > 0 ? `<div class="pager"><span class="total">\u5171 ${pager.total} \u6761</span></div>` : "";
  }
  const make = (p) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== "" && v !== null && v !== void 0 && v !== 0 && v !== "0") u.set(k, v);
    }
    u.set("page", p);
    return `${base}?${u.toString()}`;
  };
  const { page, pages } = pager;
  let start = Math.max(1, page - 2);
  let end = Math.min(pages, start + 4);
  start = Math.max(1, end - 4);
  let out = '<div class="pager">';
  out += page > 1 ? `<a href="${h(make(page - 1))}">\u4E0A\u4E00\u9875</a>` : '<span class="disabled">\u4E0A\u4E00\u9875</span>';
  for (let i = start; i <= end; i++) {
    out += i === page ? `<span class="current">${i}</span>` : `<a href="${h(make(i))}">${i}</a>`;
  }
  out += page < pages ? `<a href="${h(make(page + 1))}">\u4E0B\u4E00\u9875</a>` : '<span class="disabled">\u4E0B\u4E00\u9875</span>';
  out += `<span class="total">\u5171 ${pager.total} \u6761 / ${pages} \u9875</span>`;
  return out + "</div>";
}
var pill = (text, kind) => `<span class="pill pill-${kind}">${h(text)}</span>`;
function pageDashboard(ctx, data) {
  const { stats, recent, topViewed, cats, pending } = data;
  const total = stats.published + stats.draft;
  const maxCount = Math.max(1, ...(cats || []).map((c) => Number(c.article_count) || 0));
  const content = `
<div class="stat-grid">
  <div class="stat"><span class="stat-label">\u5168\u90E8\u6587\u7AE0</span><strong>${total}</strong>
    <span class="stat-sub">\u542B\u8349\u7A3F ${stats.draft} \u7BC7</span></div>
  <div class="stat"><span class="stat-label">\u5DF2\u53D1\u5E03</span><strong>${stats.published}</strong>
    <span class="stat-sub">\u5BF9\u5916\u53EF\u89C1</span></div>
  <div class="stat"><span class="stat-label">\u7D2F\u8BA1\u9605\u8BFB</span><strong>${stats.views}</strong>
    <span class="stat-sub">\u5168\u90E8\u6587\u7AE0\u5408\u8BA1</span></div>
  <div class="stat"><span class="stat-label">\u56DE\u6536\u7AD9</span><strong>${stats.trashed}</strong>
    <span class="stat-sub"><a href="/wp-admin/recycle">\u67E5\u770B \u2192</a></span></div>
  <div class="stat"><span class="stat-label">\u5F85\u5BA1\u8BC4\u8BBA</span><strong>${pending}</strong>
    <span class="stat-sub">${pending > 0 ? `<a href="/wp-admin/comments?status=pending" style="color:#b26a00">\u53BB\u5BA1\u6838 \u2192</a>` : "\u5168\u90E8\u5DF2\u5904\u7406"}</span></div>
</div>

<div class="grid-2">
  <section class="panel">
    <header class="panel-head"><h3>\u6700\u8FD1\u7F16\u8F91</h3>
      <a class="btn btn-sm" href="/wp-admin/articles">\u5168\u90E8\u6587\u7AE0</a></header>
    ${recent && recent.length ? `<ul class="simple-list">${recent.map((a) => `
      <li>
        <div class="sl-main">
          <a href="/wp-admin/articles/${a.id}/edit">${h(a.title)}</a>
          <div class="sl-meta">
            ${pill(a.status === "published" ? "\u5DF2\u53D1\u5E03" : "\u8349\u7A3F", a.status === "published" ? "ok" : "draft")}
            ${Number(a.is_featured) ? pill("\u7CBE\u9009", "star") : ""}
            <span class="muted">${h(a.category_name || "\u672A\u5206\u7C7B")}</span>
            <span class="muted">\xB7 \u66F4\u65B0\u4E8E ${h(fmtDate(a.updated_at, true))}</span>
          </div>
        </div>
        <a class="link-edit" href="/wp-admin/articles/${a.id}/edit">\u7F16\u8F91</a>
      </li>`).join("")}</ul>` : '<div class="panel-empty">\u8FD8\u6CA1\u6709\u6587\u7AE0\uFF0C<a href="/wp-admin/articles/new">\u53BB\u5199\u7B2C\u4E00\u7BC7</a>\u3002</div>'}
  </section>

  <section class="panel">
    <header class="panel-head"><h3>\u70ED\u95E8\u6587\u7AE0</h3><span class="muted small">\u6309\u9605\u8BFB\u91CF</span></header>
    ${topViewed && topViewed.length ? `<ol class="rank-list">${topViewed.map((a, i) => `
      <li>
        <span class="rank-no${i < 3 ? " hot" : ""}">${i + 1}</span>
        <span class="rank-title"><a href="/article/${h(a.slug)}" target="_blank" rel="noopener">${h(a.title)}</a></span>
        <span class="rank-val">${Number(a.views)}</span>
      </li>`).join("")}</ol>` : '<div class="panel-empty">\u6682\u65E0\u6570\u636E\u3002</div>'}

    <header class="panel-head" style="margin-top:24px"><h3>\u5206\u7C7B\u5206\u5E03</h3>
      <a class="btn btn-sm" href="/wp-admin/categories">\u7BA1\u7406</a></header>
    ${cats && cats.length ? `<ul class="bar-list">${cats.map((c) => `
      <li>
        <span class="bar-label">${h(c.name)}</span>
        <span class="bar-track"><span class="bar-fill" style="width:${Math.round((Number(c.article_count) || 0) / maxCount * 100)}%"></span></span>
        <span class="bar-val">${Number(c.article_count) || 0}</span>
      </li>`).join("")}</ul>` : '<div class="panel-empty">\u8FD8\u6CA1\u6709\u5206\u7C7B\u3002</div>'}
  </section>
</div>

<section class="panel">
  <header class="panel-head"><h3>\u7CFB\u7EDF\u4FE1\u606F</h3></header>
  <table class="table-plain">
    <tr><th>\u7A0B\u5E8F\u7248\u672C</th><td>LiteCMS ${h(VERSION)}</td></tr>
    <tr><th>\u8FD0\u884C\u73AF\u5883</th><td>Cloudflare Pages Functions\uFF08Workers Runtime\uFF09</td></tr>
    <tr><th>\u6570\u636E\u5E93</th><td>Cloudflare D1\uFF08SQLite\uFF09</td></tr>
    <tr><th>\u5BF9\u8C61\u5B58\u50A8</th><td>Cloudflare R2 <code>MEDIA</code></td></tr>
    <tr><th>\u767B\u5F55\u65B9\u5F0F</th><td>\u65E0\u72B6\u6001\u7B7E\u540D Cookie\uFF08HMAC-SHA256\uFF09</td></tr>
    <tr><th>\u5F53\u524D\u8D26\u53F7</th><td><code>${h(ctx.user && (ctx.user.username || ctx.user.nickname) || "\u2014")}</code></td></tr>
  </table>
</section>`;
  return adminLayout(ctx, "\u4EEA\u8868\u76D8", "dashboard", content, pending);
}
function pageArticles(ctx, data) {
  const { articles, pager, status, keyword, catId, cats, stats } = data;
  const tabs = [
    ["all", "\u5168\u90E8", stats.published + stats.draft],
    ["published", "\u5DF2\u53D1\u5E03", stats.published],
    ["draft", "\u8349\u7A3F", stats.draft],
    ["trash", "\u56DE\u6536\u7AD9", stats.trashed]
  ];
  const tabHref = (k) => {
    const u = new URLSearchParams();
    if (k !== "all") u.set("status", k);
    if (keyword) u.set("keyword", keyword);
    if (catId) u.set("category_id", catId);
    const s = u.toString();
    return "/wp-admin/articles" + (s ? "?" + s : "");
  };
  const back = "/wp-admin/articles?" + new URLSearchParams({ status, keyword: keyword || "", category_id: catId || 0, page: pager.page }).toString();
  const content = `
<div class="toolbar">
  <div class="tabs">${tabs.map(([k, label, n]) => `
    <a href="${h(tabHref(k))}" class="tab ${status === k || k === "all" && (status === "all" || !status) ? "on" : ""}">${label}<em>${n}</em></a>`).join("")}</div>
  <form class="filter-form" method="get" action="/wp-admin/articles">
    ${status !== "all" ? `<input type="hidden" name="status" value="${h(status)}">` : ""}
    <select name="category_id" onchange="this.form.submit()">
      <option value="0">\u5168\u90E8\u5206\u7C7B</option>
      ${cats.map((c) => `<option value="${c.id}" ${Number(catId) === Number(c.id) ? "selected" : ""}>${h(c.name)}</option>`).join("")}
    </select>
    <input type="text" name="keyword" value="${h(keyword || "")}" placeholder="\u641C\u7D22\u6807\u9898 / \u6458\u8981">
    <button type="submit" class="btn btn-sm">\u7B5B\u9009</button>
    ${keyword || catId ? `<a class="btn btn-sm" href="/wp-admin/articles${status !== "all" ? "?status=" + h(status) : ""}">\u91CD\u7F6E</a>` : ""}
  </form>
</div>

<form method="post" action="/wp-admin/articles/batch" id="batchForm">
  ${csrfField(ctx.csrf)}
  <input type="hidden" name="back" value="${h(back)}">
  <div class="bulk-bar">
    <label class="check-all"><input type="checkbox" id="checkAll"> \u5168\u9009</label>
    <select name="bulk_action">
      ${status === "trash" ? '<option value="restore">\u6062\u590D\u9009\u4E2D</option><option value="destroy">\u5F7B\u5E95\u5220\u9664</option>' : '<option value="publish">\u6279\u91CF\u53D1\u5E03</option><option value="draft">\u8F6C\u4E3A\u8349\u7A3F</option><option value="feature">\u8BBE\u4E3A\u7CBE\u9009</option><option value="trash">\u79FB\u5165\u56DE\u6536\u7AD9</option>'}
    </select>
    <button type="submit" class="btn btn-sm" onclick="return confirmBulk();">\u6267\u884C</button>
    <span class="muted small" id="selCount">\u5DF2\u9009 0 \u9879</span>
  </div>

  <div class="table-wrap">
    <table class="data-table">
      <thead><tr>
        <th class="col-check"></th><th>\u6807\u9898</th><th class="col-cat">\u5206\u7C7B</th><th class="col-tags">\u6807\u7B7E</th>
        <th class="col-status">\u72B6\u6001</th><th class="col-num">\u9605\u8BFB</th><th class="col-time">\u66F4\u65B0\u65F6\u95F4</th><th class="col-act">\u64CD\u4F5C</th>
      </tr></thead>
      <tbody>
      ${articles.length === 0 ? `<tr><td colspan="8" class="table-empty">\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u6587\u7AE0\u3002<a href="/wp-admin/articles/new">\u65B0\u5EFA\u4E00\u7BC7</a></td></tr>` : ""}
      ${articles.map((a) => {
    const tags = a.tags || [];
    return `
        <tr>
          <td class="col-check"><input type="checkbox" class="row-check" name="ids" value="${a.id}"></td>
          <td>
            <div class="title-cell"><a href="/wp-admin/articles/${a.id}/edit">${h(a.title)}</a>
              ${Number(a.is_featured) ? pill("\u7CBE\u9009", "star") : ""}</div>
            <div class="sub-cell muted">${h(a.slug)}</div>
          </td>
          <td class="col-cat">${h(a.category_name || "\u672A\u5206\u7C7B")}</td>
          <td class="col-tags">${tags.length ? tags.slice(0, 3).map((t) => `<span class="tag-mini">${h(t.name)}</span>`).join("") + (tags.length > 3 ? `<span class="muted">+${tags.length - 3}</span>` : "") : '<span class="muted">\u2014</span>'}</td>
          <td class="col-status">${a.deleted_at ? pill("\u56DE\u6536\u7AD9", "danger") : a.status === "published" ? pill("\u5DF2\u53D1\u5E03", "ok") : pill("\u8349\u7A3F", "draft")}</td>
          <td class="col-num">${Number(a.views) || 0}</td>
          <td class="col-time muted">${h(fmtDate(a.updated_at, true))}</td>
          <td class="col-act"><div class="act-group">
            <a class="link" href="/article/${h(a.slug)}" target="_blank" rel="noopener">\u9884\u89C8</a>
            <a class="link" href="/wp-admin/articles/${a.id}/edit">\u7F16\u8F91</a>
            <button type="submit" formaction="/wp-admin/articles/${a.id}/trash" class="link danger" onclick="return confirm('\u5C06\u300A${h(a.title).replace(/'/g, "&#39;")}\u300B\u79FB\u5165\u56DE\u6536\u7AD9\uFF1F');">\u5220\u9664</button>
          </div></td>
        </tr>`;
  }).join("")}
      </tbody>
    </table>
  </div>
</form>
${pagerHtml2(pager, "/wp-admin/articles", { status: status === "all" ? "" : status, keyword, category_id: catId })}`;
  return adminLayout(ctx, "\u6587\u7AE0\u7BA1\u7406", "articles", content);
}
function pageRecycle(ctx, data) {
  const { articles = [], total = articles.length } = data;
  const content = `
<div class="toolbar">
  <div class="tabs"><a href="/wp-admin/articles" class="tab">\u5168\u90E8\u6587\u7AE0</a><a href="/wp-admin/articles?status=trash" class="tab on">\u56DE\u6536\u7AD9<em>${total}</em></a></div>
  <span class="muted small" style="margin-left:auto">\u8F6F\u5220\u9664\u7684\u6587\u7AE0\u4FDD\u7559\u5728\u6B64\uFF0C\u53EF\u6062\u590D\u6216\u5F7B\u5E95\u5220\u9664</span>
</div>
<form method="post" action="/wp-admin/articles/batch" id="batchForm">
  ${csrfField(ctx.csrf)}
  <input type="hidden" name="back" value="/wp-admin/recycle">
  <div class="bulk-bar">
    <label class="check-all"><input type="checkbox" id="checkAll"> \u5168\u9009</label>
    <select name="bulk_action">
      <option value="restore">\u6062\u590D\u9009\u4E2D</option><option value="destroy">\u5F7B\u5E95\u5220\u9664</option>
    </select>
    <button type="submit" class="btn btn-sm" onclick="return confirmBulk();">\u6267\u884C</button>
    <span class="muted small" id="selCount">\u5DF2\u9009 0 \u9879</span>
    <a class="btn btn-sm" href="/wp-admin/articles" style="margin-left:auto">\u8FD4\u56DE\u6587\u7AE0\u5217\u8868</a>
  </div>
  <div class="table-wrap">
    <table class="data-table">
      <thead><tr><th class="col-check"></th><th>\u6807\u9898</th><th class="col-time">\u5220\u9664\u65F6\u95F4</th><th class="col-act">\u64CD\u4F5C</th></tr></thead>
      <tbody>
      ${articles.length === 0 ? '<tr><td colspan="4" class="table-empty">\u56DE\u6536\u7AD9\u662F\u7A7A\u7684\uFF0C\u88AB\u5220\u9664\u7684\u6587\u7AE0\u4F1A\u5148\u653E\u5230\u8FD9\u91CC\u3002</td></tr>' : ""}
      ${articles.map((a) => `
        <tr>
          <td class="col-check"><input type="checkbox" class="row-check" name="ids" value="${a.id}"></td>
          <td><div class="title-cell">${h(a.title)}</div><div class="sub-cell muted">${h(a.slug)}</div></td>
          <td class="col-time muted">${h(fmtDate(a.deleted_at, true))}</td>
          <td class="col-act"><div class="act-group">
            <button type="submit" formaction="/wp-admin/articles/${a.id}/restore" class="link">\u6062\u590D</button>
            <button type="submit" formaction="/wp-admin/articles/${a.id}/destroy" class="link danger" onclick="return confirm('\u5F7B\u5E95\u5220\u9664\u540E\u65E0\u6CD5\u6062\u590D\uFF0C\u786E\u5B9A\u7EE7\u7EED\uFF1F');">\u5F7B\u5E95\u5220\u9664</button>
          </div></td>
        </tr>`).join("")}
      </tbody>
    </table>
  </div>
</form>`;
  return adminLayout(ctx, "\u56DE\u6536\u7AD9", "articles", content);
}
function pageArticleForm(ctx, data) {
  const { article: a, errors = {}, cats, allTags, articleId } = data;
  const isEdit = articleId > 0;
  const v = {
    title: a.title || "",
    slug: a.slug || "",
    summary: a.summary || "",
    content: a.content || "",
    category_id: Number(a.category_id) || 0,
    status: a.status || "published",
    is_featured: Number(a.is_featured) || 0,
    published_at: a.published_at || "",
    tagNames: a.tagNames || (a.tags || []).map((t) => t.name)
  };
  const publishedLocal = v.published_at ? String(v.published_at).slice(0, 16).replace(" ", "T") : "";
  const errList = Object.values(errors).filter(Boolean);
  const hasErr = (k) => errors[k] ? " has-error" : "";
  const errMsg = (k) => errors[k] ? `<em class="err-msg">${h(errors[k])}</em>` : "";
  const content = `
${errList.length ? `<div class="alert alert-error"><span>\u8BF7\u4FEE\u6B63\u4EE5\u4E0B\u95EE\u9898\uFF1A${h(errList.join(" "))}</span></div>` : ""}
<form method="post" action="/wp-admin/articles/save" class="editor-form" id="editorForm">
  ${csrfField(ctx.csrf)}
  <input type="hidden" name="id" value="${articleId}">
  <div class="editor-grid">
    <div class="editor-main">
      <div class="card-block">
        <label class="field">
          <span class="label">\u6807\u9898 <em class="req">*</em></span>
          <input type="text" name="title" id="titleInput" class="${h(hasErr("title").trim())}" value="${h(v.title)}" placeholder="\u8BF7\u8F93\u5165\u6587\u7AE0\u6807\u9898" maxlength="120" required>
          ${errMsg("title")}
        </label>
        <label class="field">
          <span class="label">\u522B\u540D\uFF08URL Slug\uFF09 <small class="hint">\u7559\u7A7A\u5219\u6839\u636E\u6807\u9898\u81EA\u52A8\u751F\u6210</small></span>
          <input type="text" name="slug" value="${h(v.slug)}" placeholder="\u4F8B\u5982\uFF1Ahello-world">
        </label>
        <label class="field">
          <span class="label">\u6458\u8981 <small class="hint">\u7559\u7A7A\u5219\u81EA\u52A8\u622A\u53D6\u6B63\u6587\u524D 110 \u5B57\uFF0C\u6700\u591A 300 \u5B57</small></span>
          <textarea name="summary" rows="3" maxlength="300" placeholder="\u4E00\u53E5\u8BDD\u4ECB\u7ECD\u8FD9\u7BC7\u6587\u7AE0">${h(v.summary)}</textarea>
          ${errMsg("summary")}
        </label>
        <div class="field">
          <span class="label">\u6B63\u6587 <small class="hint">\u652F\u6301 HTML \u6807\u7B7E</small></span>
          <div class="toolbar-editor">
            <button type="button" class="tb" data-wrap="h2" title="\u4E8C\u7EA7\u6807\u9898">H2</button>
            <button type="button" class="tb" data-wrap="h3" title="\u4E09\u7EA7\u6807\u9898">H3</button>
            <button type="button" class="tb" data-wrap="strong" title="\u52A0\u7C97">B</button>
            <button type="button" class="tb" data-wrap="em" title="\u659C\u4F53">I</button>
            <button type="button" class="tb" data-wrap="code" title="\u884C\u5185\u4EE3\u7801">&lt;/&gt;</button>
            <button type="button" class="tb" data-wrap="p" title="\u6BB5\u843D">P</button>
            <button type="button" class="tb" data-list="ul" title="\u65E0\u5E8F\u5217\u8868">\u2022 \u5217\u8868</button>
            <button type="button" class="tb" data-list="ol" title="\u6709\u5E8F\u5217\u8868">1. \u5217\u8868</button>
            <button type="button" class="tb" data-insert="link" title="\u94FE\u63A5">\u94FE\u63A5</button>
            <button type="button" class="tb" data-insert="quote" title="\u5F15\u7528">\u5F15\u7528</button>
            <button type="button" class="tb" data-insert="table" title="\u8868\u683C">\u8868\u683C</button>
            <button type="button" class="tb tb-media" id="tbMedia" title="\u4ECE\u5A92\u4F53\u5E93\u9009\u62E9\u6216\u4E0A\u4F20\u56FE\u7247/\u6587\u4EF6">\u{1F5BC} \u5A92\u4F53</button>
            <span class="tb-info muted" id="editorInfo">\u2014</span>
          </div>
          <textarea name="content" id="contentInput" class="content-input" rows="18" placeholder="\u5728\u8FD9\u91CC\u7F16\u5199\u6B63\u6587\u2026">${h(v.content)}</textarea>
        </div>
      </div>
    </div>

    <aside class="editor-side">
      <div class="card-block">
        <div class="side-title">\u53D1\u5E03</div>
        <div class="field">
          <span class="label">\u72B6\u6001</span>
          <div class="radio-row">
            <label><input type="radio" name="status" value="published" ${v.status === "published" ? "checked" : ""}> \u53D1\u5E03</label>
            <label><input type="radio" name="status" value="draft" ${v.status !== "published" ? "checked" : ""}> \u8349\u7A3F</label>
          </div>
        </div>
        <label class="field">
          <span class="label">\u53D1\u5E03\u65F6\u95F4 <small class="hint">\u7559\u7A7A\u5219\u4F7F\u7528\u5F53\u524D\u65F6\u95F4</small></span>
          <input type="datetime-local" name="published_at" value="${h(publishedLocal)}">
        </label>
        <label class="check-line">
          <input type="checkbox" name="is_featured" value="1" ${v.is_featured ? "checked" : ""}>
          <span>\u8BBE\u4E3A\u7CBE\u9009\uFF08\u9996\u9875\u63A8\u8350\u4F4D\uFF09</span>
        </label>
        <div class="side-actions">
          <button type="submit" class="btn btn-primary btn-block">${isEdit ? "\u4FDD\u5B58\u4FEE\u6539" : "\u521B\u5EFA\u6587\u7AE0"}</button>
          <a class="btn btn-block" href="/wp-admin/articles">\u8FD4\u56DE\u5217\u8868</a>
        </div>
        ${isEdit ? `<div class="side-meta muted">
          <div>ID\uFF1A${articleId}</div>
          <div>\u9605\u8BFB\uFF1A${Number(a.views) || 0}</div>
          ${a.created_at ? `<div>\u521B\u5EFA\uFF1A${h(fmtDate(a.created_at, true))}</div>` : ""}
        </div>` : ""}
      </div>

      <div class="card-block">
        <div class="side-title">\u5206\u7C7B</div>
        <label class="field">
          <select name="category_id">
            <option value="0">\u672A\u5206\u7C7B</option>
            ${cats.map((c) => `<option value="${c.id}" ${v.category_id === Number(c.id) ? "selected" : ""}>${h(c.name)}</option>`).join("")}
          </select>
        </label>
      </div>

      <div class="card-block">
        <div class="side-title">\u6807\u7B7E</div>
        <label class="field">
          <input type="text" name="tags" value="${h(v.tagNames.join(", "))}" placeholder="\u7528\u9017\u53F7\u5206\u9694\uFF0C\u5982\uFF1A\u6280\u672F, \u6559\u7A0B">
        </label>
        ${allTags.length ? `<div class="tag-picker">${allTags.map((t) => `
          <button type="button" class="tag-pick${v.tagNames.includes(t.name) ? " on" : ""}" data-tag="${h(t.name)}">${h(t.name)}</button>`).join("")}</div>` : ""}
      </div>
    </aside>
  </div>
</form>

<div class="media-modal" id="mediaModal" hidden>
  <div class="media-mask" data-media-close></div>
  <div class="media-dialog" role="dialog" aria-modal="true" aria-label="\u5A92\u4F53\u5E93">
    <header class="media-head">
      <h3>\u5A92\u4F53\u5E93</h3>
      <button type="button" class="media-x" data-media-close aria-label="\u5173\u95ED">\xD7</button>
    </header>
    <div class="media-toolbar">
      <label class="media-upload">
        <input type="file" id="mediaFile" multiple>
        <span>\u4E0A\u4F20\u65B0\u6587\u4EF6</span>
      </label>
      <input type="search" id="mediaSearch" placeholder="\u641C\u7D22\u6587\u4EF6\u540D\u2026" class="media-search">
      <label class="media-opt"><input type="checkbox" id="mediaImageOnly" checked> \u4EC5\u56FE\u7247</label>
      <span class="media-status muted" id="mediaStatus"></span>
    </div>
    <div class="media-body">
      <div class="media-grid" id="mediaGrid"></div>
    </div>
    <footer class="media-foot">
      <span class="muted small">\u5355\u4E2A\u6587\u4EF6\u4E0A\u9650 10MB\uFF1B\u70B9\u51FB\u5373\u53EF\u63D2\u5165\u5230\u5149\u6807\u4F4D\u7F6E</span>
      <div class="media-insert-row" id="mediaInsertRow" hidden>
        <input type="text" id="mediaUrl" readonly>
        <button type="button" class="btn btn-sm" id="mediaCopyUrl">\u590D\u5236\u94FE\u63A5</button>
      </div>
    </footer>
  </div>
</div>`;
  return adminLayout(ctx, isEdit ? "\u7F16\u8F91\u6587\u7AE0" : "\u65B0\u5EFA\u6587\u7AE0", "articles", content);
}
/** 后台：页面管理（列表 + 新建/编辑） */
function pagePages(ctx, data) {
  const { pages = [], editPage, editId } = data;
  const isEdit = editId > 0 && !!editPage;
  const e = editPage || { id: 0, title: "", slug: "", content: "", show_in_nav: 1, sort_order: 0, status: "published" };
  const content = `
<div class="grid-2 grid-cols-7-3">
  <section class="panel">
    <header class="panel-head"><h3>\u5168\u90E8\u9875\u9762\uFF08${pages.length}\uFF09</h3>
      <span class="muted small">\u300C\u663E\u793A\u5728\u5BFC\u822A\u300D\u7684\u9875\u9762\u4F1A\u51FA\u73B0\u5728\u524D\u53F0\u5BFC\u822A\u680F</span></header>
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr>
          <th class="col-num">\u6392\u5E8F</th><th>\u6807\u9898</th><th>\u8DEF\u5F84</th><th class="col-num">\u5BFC\u822A</th><th class="col-num">\u72B6\u6001</th><th class="col-act">\u64CD\u4F5C</th>
        </tr></thead>
        <tbody>
        ${pages.length === 0 ? '<tr><td colspan="6" class="table-empty">\u8FD8\u6CA1\u6709\u9875\u9762\uFF0C\u5728\u53F3\u8FB9\u521B\u5EFA\u7B2C\u4E00\u4E2A\u5427\u3002</td></tr>' : ""}
        ${pages.map((pg) => `
          <tr${Number(pg.id) === Number(editId) ? ' class="row-active"' : ""}>
            <td class="col-num muted">${Number(pg.sort_order) || 0}</td>
            <td><strong>${h(pg.title)}</strong></td>
            <td class="muted"><a href="/${h(pg.slug)}" target="_blank" rel="noopener"><code>/${h(pg.slug)}</code></a></td>
            <td class="col-num">${Number(pg.show_in_nav) ? '\u2713' : '<span class="muted">\u2014</span>'}</td>
            <td class="col-num">${pg.status === "published" ? '<span class="badge-ok">\u5DF2\u53D1\u5E03</span>' : '<span class="badge-draft">\u8349\u7A3F</span>'}</td>
            <td class="col-act"><div class="act-group">
              <a class="link" href="/wp-admin/pages?id=${pg.id}">\u7F16\u8F91</a>
              <form method="post" action="/wp-admin/pages/delete" class="inline-form" onsubmit="return confirm('\u5220\u9664\u9875\u9762\u300C${h(pg.title).replace(/'/g, "&#39;")}\u300D\uFF1F');">
                ${csrfField(ctx.csrf)}
                <input type="hidden" name="id" value="${pg.id}">
                <button type="submit" class="link danger">\u5220\u9664</button>
              </form>
            </div></td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
  </section>

  <section class="panel">
    <header class="panel-head"><h3>${isEdit ? "\u7F16\u8F91\u9875\u9762" : "\u65B0\u5EFA\u9875\u9762"}</h3>
      ${isEdit ? '<a class="btn btn-sm" href="/wp-admin/pages">\u53D6\u6D88\u7F16\u8F91</a>' : ""}</header>
    <form method="post" action="/wp-admin/pages/save" class="pad">
      ${csrfField(ctx.csrf)}
      <input type="hidden" name="id" value="${isEdit ? e.id : 0}">
      <label class="field"><span class="label">\u9875\u9762\u6807\u9898 <em class="req">*</em></span>
        <input type="text" name="title" value="${h(e.title)}" placeholder="\u4F8B\u5982\uFF1A\u8054\u7CFB\u6211\u4EEC" maxlength="80" required></label>
      <label class="field"><span class="label">\u8DEF\u5F84\uFF08slug\uFF09 <small class="hint">\u7559\u7A7A\u81EA\u52A8\u751F\u6210</small></span>
        <input type="text" name="slug" value="${h(e.slug)}" placeholder="contact" maxlength="80"></label>
      <label class="field"><span class="label">\u6B63\u6587</span>
        <textarea name="content" rows="12" placeholder="\u652F\u6301 HTML\uFF0C\u4E5F\u53EF\u76F4\u63A5\u7C98\u8D34\u5E26\u6362\u884C\u7684\u7EAF\u6587\u672C" style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px">${h(e.content)}</textarea></label>
      <div class="grid-2">
        <label class="field"><span class="label">\u6392\u5E8F</span>
          <input type="number" name="sort_order" value="${Number(e.sort_order) || 0}" min="0"></label>
        <label class="field"><span class="label">\u72B6\u6001</span>
          <select name="status">
            <option value="published"${e.status !== "draft" ? " selected" : ""}>\u53D1\u5E03</option>
            <option value="draft"${e.status === "draft" ? " selected" : ""}>\u8349\u7A3F</option>
          </select></label>
      </div>
      <label class="field" style="display:flex;align-items:center;gap:8px">
        <input type="checkbox" name="show_in_nav" value="1"${Number(e.show_in_nav) ? " checked" : ""} style="width:auto;margin:0">
        <span style="margin:0">\u663E\u793A\u5728\u524D\u53F0\u5BFC\u822A\u680F</span></label>
      <button class="btn btn-primary btn-block">${isEdit ? "\u4FDD\u5B58\u4FEE\u6539" : "\u2795 \u521B\u5EFA\u9875\u9762"}</button>
    </form>
  </section>
</div>`;
  return adminLayout(ctx, "\u9875\u9762", "pages", content, 0);
}
async function adminPages(ctx, request, url) {
  const editId = parseInt(url.searchParams.get("id") || "0", 10) || 0;
  return html(pagePages(ctx, {
    pages: await PageModel.all(ctx.db),
    editPage: editId > 0 ? await PageModel.find(ctx.db, editId) : null,
    editId
  }), 200, ctx.headers);
}
async function adminPageSave(ctx, request) {
  const form = await request.formData();
  if (!csrfOk(request, form)) return csrfFail("/wp-admin/pages");
  const id = parseInt(form.get("id") || "0", 10) || 0;
  const title = String(form.get("title") || "").trim();
  if (!title) {
    await setFlash(ctx.env, ctx.headers, "error", "\u9875\u9762\u6807\u9898\u4E0D\u80FD\u4E3A\u7A7A\u3002");
    return redirect("/wp-admin/pages", ctx.headers);
  }
  let slug = slugify(String(form.get("slug") || "") || title);
  // slug 不能与已有系统路由冲突
  if (RESERVED_SLUGS.includes(slug)) slug = slug + "-page";
  const exist = await ctx.db.one("SELECT id FROM pages WHERE slug = ? AND id != ?", slug, id);
  if (exist) slug = slug + "-" + Date.now().toString(36);
  await PageModel.save(ctx.db, id, {
    title,
    slug,
    content: String(form.get("content") || ""),
    show_in_nav: form.get("show_in_nav") === "1" ? 1 : 0,
    sort_order: parseInt(form.get("sort_order") || "0", 10) || 0,
    status: form.get("status") === "draft" ? "draft" : "published"
  });
  await setFlash(ctx.env, ctx.headers, "success", id > 0 ? "\u9875\u9762\u5DF2\u4FDD\u5B58\u3002" : "\u9875\u9762\u5DF2\u521B\u5EFA\uFF0C\u8BBF\u95EE /" + slug + " \u67E5\u770B\u3002");
  return redirect("/wp-admin/pages", ctx.headers);
}
async function adminPageDelete(ctx, request) {
  const form = await request.formData();
  if (!csrfOk(request, form)) return csrfFail("/wp-admin/pages");
  const id = parseInt(form.get("id") || "0", 10) || 0;
  if (id > 0) {
    await PageModel.destroy(ctx.db, id);
    await setFlash(ctx.env, ctx.headers, "success", "\u9875\u9762\u5DF2\u5220\u9664\u3002");
  }
  return redirect("/wp-admin/pages", ctx.headers);
}
function pageCategories(ctx, data) {
  const { cats, editCat, editId } = data;
  const isEdit = editId > 0 && !!editCat;
  const e = editCat || { id: 0, name: "", slug: "", description: "", sort_order: 0 };
  const content = `
<div class="grid-2 grid-cols-7-3">
  <section class="panel">
    <header class="panel-head"><h3>\u5168\u90E8\u5206\u7C7B\uFF08${cats.length}\uFF09</h3></header>
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr>
          <th class="col-num">\u6392\u5E8F</th><th>\u540D\u79F0</th><th>\u522B\u540D</th><th>\u63CF\u8FF0</th><th class="col-num">\u6587\u7AE0</th><th class="col-act">\u64CD\u4F5C</th>
        </tr></thead>
        <tbody>
        ${cats.length === 0 ? '<tr><td colspan="6" class="table-empty">\u8FD8\u6CA1\u6709\u5206\u7C7B\uFF0C\u5148\u5728\u53F3\u8FB9\u521B\u5EFA\u7B2C\u4E00\u4E2A\u5427\u3002</td></tr>' : ""}
        ${cats.map((c) => `
          <tr${Number(c.id) === Number(editId) ? ' class="row-active"' : ""}>
            <td class="col-num muted">${Number(c.sort_order) || 0}</td>
            <td><strong>${h(c.name)}</strong></td>
            <td class="muted"><code>${h(c.slug)}</code></td>
            <td class="muted desc-cell">${h(c.description || "")}</td>
            <td class="col-num"><a href="/category/${h(c.slug)}" target="_blank" rel="noopener">${Number(c.article_count) || 0}</a></td>
            <td class="col-act"><div class="act-group">
              <a class="link" href="/wp-admin/categories?id=${c.id}">\u7F16\u8F91</a>
              <form method="post" action="/wp-admin/categories/delete" class="inline-form" onsubmit="return confirm('\u5220\u9664\u5206\u7C7B\u300C${h(c.name).replace(/'/g, "&#39;")}\u300D\uFF1F\u8BE5\u5206\u7C7B\u4E0B\u7684 ${Number(c.article_count) || 0} \u7BC7\u6587\u7AE0\u5C06\u88AB\u79FB\u81F3\u300C\u672A\u5206\u7C7B\u300D\u3002');">
                ${csrfField(ctx.csrf)}
                <input type="hidden" name="id" value="${c.id}">
                <button type="submit" class="link danger">\u5220\u9664</button>
              </form>
            </div></td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
  </section>

  <section class="panel">
    <header class="panel-head"><h3>${isEdit ? "\u7F16\u8F91\u5206\u7C7B" : "\u65B0\u5EFA\u5206\u7C7B"}</h3>
      ${isEdit ? '<a class="btn btn-sm" href="/wp-admin/categories">\u53D6\u6D88\u7F16\u8F91</a>' : ""}</header>
    <form method="post" action="/wp-admin/categories/save" class="pad">
      ${csrfField(ctx.csrf)}
      <input type="hidden" name="id" value="${Number(e.id) || 0}">
      <label class="field"><span class="label">\u540D\u79F0 <em class="req">*</em></span>
        <input type="text" name="name" value="${h(e.name || "")}" placeholder="\u4F8B\u5982\uFF1A\u6280\u672F\u7B14\u8BB0" required></label>
      <label class="field"><span class="label">\u522B\u540D <small class="hint">\u7559\u7A7A\u81EA\u52A8\u751F\u6210</small></span>
        <input type="text" name="slug" value="${h(e.slug || "")}" placeholder="tech"></label>
      <label class="field"><span class="label">\u63CF\u8FF0</span>
        <textarea name="description" rows="3" placeholder="\u5206\u7C7B\u7B80\u4ECB\uFF0C\u4F1A\u663E\u793A\u5728\u5206\u7C7B\u9875\u9876\u90E8">${h(e.description || "")}</textarea></label>
      <label class="field"><span class="label">\u6392\u5E8F <small class="hint">\u6570\u5B57\u8D8A\u5C0F\u8D8A\u9760\u524D</small></span>
        <input type="number" name="sort_order" value="${Number(e.sort_order) || 0}" min="0" max="9999"></label>
      <button type="submit" class="btn btn-primary btn-block">${isEdit ? "\u4FDD\u5B58\u4FEE\u6539" : "\u521B\u5EFA\u5206\u7C7B"}</button>
    </form>
  </section>
</div>`;
  return adminLayout(ctx, "\u5206\u7C7B\u7BA1\u7406", "categories", content);
}
function pageFriendLinks(ctx, data = {}) {
  const { links = [], raw = "", editIndex = -1 } = data;
  const isEdit = editIndex >= 0 && links[editIndex];
  const e = isEdit ? links[editIndex] : { name: "", href: "" };
  const content = `
<div class="grid-2 grid-cols-7-3">
  <section class="panel">
    <header class="panel-head"><h3>\u5168\u90E8\u53CB\u60C5\u94FE\u63A5\uFF08${links.length}\uFF09</h3>
      <span class="muted small">\u5C55\u793A\u4E8E\u524D\u53F0\u9875\u811A\uFF1B\u62D6\u52A8\u884C\u9996\u624B\u67C4\u53EF\u8C03\u6574\u987A\u5E8F\uFF0C\u677E\u624B\u540E\u81EA\u52A8\u4FDD\u5B58</span></header>
    <div class="table-wrap">
      <table class="data-table" id="flTable">
        <thead><tr>
          <th style="width:34px"></th><th class="col-num">\u5E8F\u53F7</th><th>\u540D\u79F0</th><th>\u5730\u5740</th><th class="col-act">\u64CD\u4F5C</th>
        </tr></thead>
        <tbody>
        ${links.length === 0 ? '<tr><td colspan="5" class="table-empty">\u8FD8\u6CA1\u6709\u53CB\u60C5\u94FE\u63A5\uFF0C\u5728\u53F3\u8FB9\u6DFB\u52A0\u7B2C\u4E00\u4E2A\u5427\u3002</td></tr>' : ""}
        ${links.map((l, i) => `
          <tr data-idx="${i}"${i === editIndex ? ' class="row-active"' : ""}>
            <td><span class="drag-handle" title="拖动调整顺序（也可用 ↑ ↓ 键）" role="button" tabindex="0" aria-label="拖动或按 ↑ ↓ 键调整顺序" draggable="false">\u2630</span></td>
            <td class="col-num muted">${i + 1}</td>
            <td><strong>${h(l.name)}</strong>${l.auto ? ' <span class="tag-mini">\u81EA\u52A8</span>' : ""}</td>
            <td class="muted desc-cell"><a href="${h(l.href)}" target="_blank" rel="noopener nofollow">${h(l.href)}</a></td>
            <td class="col-act"><div class="act-group">
              <a class="link" href="/wp-admin/friendlinks?edit=${i}">\u7F16\u8F91</a>
              <form method="post" action="/wp-admin/friendlinks/delete" class="inline-form" onsubmit="return confirm('\u5220\u9664\u53CB\u60C5\u94FE\u63A5\u300C${h(l.name).replace(/'/g, "&#39;")}\u300D\uFF1F');">
                ${csrfField(ctx.csrf)}
                <input type="hidden" name="index" value="${i}">
                <button type="submit" class="link danger">\u5220\u9664</button>
              </form>
            </div></td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
  </section>

  <section class="panel">
    <header class="panel-head"><h3>${isEdit ? "\u7F16\u8F91\u94FE\u63A5" : "\u65B0\u589E\u94FE\u63A5"}</h3>
      ${isEdit ? '<a class="btn btn-sm" href="/wp-admin/friendlinks">\u53D6\u6D88\u7F16\u8F91</a>' : ""}</header>
    <form method="post" action="/wp-admin/friendlinks/add" class="pad">
      ${csrfField(ctx.csrf)}
      <input type="hidden" name="index" value="${isEdit ? editIndex : -1}">
      <label class="field"><span class="label">\u7F51\u7AD9\u540D\u79F0 <em class="req">*</em></span>
        <input type="text" name="name" value="${h(e.name)}" placeholder="\u4F8B\u5982\uFF1A\u767E\u5EA6" maxlength="40" required></label>
      <label class="field"><span class="label">\u7F51\u7AD9\u5730\u5740 <em class="req">*</em> <small class="hint">\u53EF\u7701\u7565 https://</small></span>
        <input type="text" name="url" value="${h(String(e.href).replace(/^\/\//, ""))}" placeholder="www.baidu.com" maxlength="200" required></label>
      <button type="submit" class="btn btn-primary btn-block">${isEdit ? "\u4FDD\u5B58\u4FEE\u6539" : "\u2795 \u6DFB\u52A0\u94FE\u63A5"}</button>
    </form>

    <div class="panel-head" style="border-top:1px solid var(--line)"><h3>\u6279\u91CF\u7F16\u8F91</h3>
      <span class="muted small">\u591A\u6761\u4E00\u6B21\u5F55\u5165</span></div>
    <form method="post" action="/wp-admin/friendlinks/save" class="pad">
      ${csrfField(ctx.csrf)}
      <label class="field"><span class="label">\u94FE\u63A5\u5217\u8868 <small class="hint">\u4E00\u884C\u4E00\u4E2A\uFF0C\u683C\u5F0F\uFF1A\u540D\u79F0 | \u5730\u5740</small></span>
        <textarea name="friend_links" rows="9" placeholder="\u767E\u5EA6 | https://www.baidu.com${"\n"}\u4EC5\u586B\u5730\u5740\u4E5F\u53EF\uFF1Ahttps://example.com">${h(raw)}</textarea></label>
      <p class="muted small" style="margin:-6px 0 12px">\u4FDD\u5B58\u5C06\u6574\u4F53\u8986\u76D6\u4E0A\u65B9\u5217\u8868\uFF1B\u7A7A\u884C\u4F1A\u88AB\u5FFD\u7565\uFF0C\u672A\u5199\u534F\u8BAE\u7684\u5730\u5740\u81EA\u52A8\u8865\u5168\u4E3A //\u3002</p>
      <button type="submit" class="btn btn-block">\u4FDD\u5B58\u6574\u4F53\u5217\u8868</button>
      <div style="margin-top:12px;text-align:center"><a class="link" href="/" target="_blank" rel="noopener">\u5728\u524D\u53F0\u67E5\u770B\u6548\u679C \u2197</a></div>
    </form>
  </section>
</div>`;
  return adminLayout(ctx, "\u53CB\u60C5\u94FE\u63A5", "friendlinks", content);
}
function pageTags(ctx, data) {
  const { tags } = data;
  const content = `
<section class="panel">
  <header class="panel-head"><h3>\u5168\u90E8\u6807\u7B7E\uFF08${tags.length}\uFF09</h3>
    <span class="muted small">\u6807\u7B7E\u5728\u4FDD\u5B58\u6587\u7AE0\u65F6\u81EA\u52A8\u521B\u5EFA\uFF0C\u6B64\u5904\u53EF\u91CD\u547D\u540D\u6216\u6E05\u7406</span></header>
  ${tags.length === 0 ? '<div class="panel-empty">\u8FD8\u6CA1\u6709\u4EFB\u4F55\u6807\u7B7E\u3002\u5728\u6587\u7AE0\u7F16\u8F91\u9875\u7684\u300C\u6807\u7B7E\u300D\u6846\u91CC\u8F93\u5165\u5373\u53EF\u81EA\u52A8\u521B\u5EFA\u3002</div>' : `<div class="tag-manage">${tags.map((t) => `
      <div class="tag-card">
        <div class="tag-card-head">
          <strong>#${h(t.name)}</strong>
          ${pill(`${Number(t.article_count) || 0} \u7BC7`, Number(t.article_count) > 0 ? "ok" : "draft")}
        </div>
        <div class="tag-card-slug muted"><code>${h(t.slug)}</code></div>
        <form method="post" action="/wp-admin/tags/save" class="tag-rename">
          ${csrfField(ctx.csrf)}
          <input type="hidden" name="id" value="${t.id}">
          <input type="text" name="name" value="${h(t.name)}" placeholder="\u65B0\u540D\u79F0">
          <button type="submit" class="btn btn-sm">\u91CD\u547D\u540D</button>
        </form>
        <form method="post" action="/wp-admin/tags/delete" onsubmit="return confirm('\u5220\u9664\u6807\u7B7E\u300C${h(t.name).replace(/'/g, "&#39;")}\u300D\uFF1F\u5DF2\u5173\u8054\u6587\u7AE0\u4E0D\u4F1A\u88AB\u5220\u9664\u3002');">
          ${csrfField(ctx.csrf)}
          <input type="hidden" name="id" value="${t.id}">
          <button type="submit" class="link danger tag-del">\u5220\u9664\u6807\u7B7E</button>
        </form>
      </div>`).join("")}</div>`}
</section>`;
  return adminLayout(ctx, "\u6807\u7B7E\u7BA1\u7406", "tags", content);
}
var AVATAR_COLORS2 = ["#2f5bea", "#0f9d58", "#d93025", "#f59e0b", "#8b5cf6", "#0891b2", "#db2777", "#65a30d"];
function avatarColor2(email) {
  let hash = 0;
  for (const ch of String(email || "").toLowerCase().trim()) {
    hash = hash * 31 + ch.codePointAt(0) >>> 0;
  }
  return AVATAR_COLORS2[hash % AVATAR_COLORS2.length];
}
function pageComments(ctx, data) {
  const { comments, pager, status, stats } = data;
  const total = stats.pending + stats.approved + stats.spam;
  const tabs = [["all", "\u5168\u90E8", total], ["pending", "\u5F85\u5BA1\u6838", stats.pending], ["approved", "\u5DF2\u901A\u8FC7", stats.approved], ["spam", "\u5783\u573E", stats.spam]];
  const back = "/wp-admin/comments?" + new URLSearchParams({ status, page: pager.page }).toString();
  const content = `
<div class="toolbar">
  <div class="tabs">${tabs.map(([k, label, n]) => `
    <a href="/wp-admin/comments${k === "all" ? "" : "?status=" + k}" class="tab ${status === k || k === "all" && (status === "all" || !status) ? "on" : ""}">${label}<em>${n}</em></a>`).join("")}</div>
  <form class="filter-form" method="get" action="/wp-admin/comments">
    <span class="muted small">\u5171 ${pager.total} \u6761</span>
  </form>
</div>
${stats.pending > 0 && status !== "pending" ? `<div class="alert alert-error"><span>\u6709 <strong>${stats.pending}</strong> \u6761\u8BC4\u8BBA\u7B49\u5F85\u5BA1\u6838\uFF0C\u901A\u8FC7\u540E\u624D\u4F1A\u5728\u524D\u53F0\u663E\u793A\u3002</span><a class="btn btn-sm" href="/wp-admin/comments?status=pending">\u53BB\u5BA1\u6838 \u2192</a></div>` : ""}
<form method="post" action="/wp-admin/comments/batch" id="batchForm">
  ${csrfField(ctx.csrf)}
  <input type="hidden" name="back" value="${h(back)}">
  <div class="bulk-bar">
    <label class="check-all"><input type="checkbox" id="checkAll"> \u5168\u9009</label>
    <select name="bulk_action">
      <option value="approve">\u6279\u91CF\u901A\u8FC7</option>
      <option value="pending">\u6279\u91CF\u7F6E\u4E3A\u5F85\u5BA1\u6838</option>
      <option value="spam">\u6279\u91CF\u6807\u8BB0\u5783\u573E</option>
      <option value="delete">\u6279\u91CF\u5220\u9664</option>
    </select>
    <button type="submit" class="btn btn-sm" onclick="return confirmBulk();">\u6267\u884C</button>
    <span class="muted small" id="selCount">\u5DF2\u9009 0 \u9879</span>
  </div>

  <div class="table-wrap">
    <table class="data-table" style="min-width:900px">
      <thead><tr>
        <th class="col-check"></th><th style="width:160px">\u8BC4\u8BBA\u8005</th><th>\u5185\u5BB9</th>
        <th style="width:180px">\u6240\u5C5E\u6587\u7AE0</th><th class="col-status">\u72B6\u6001</th><th class="col-time">\u65F6\u95F4</th><th class="col-act">\u64CD\u4F5C</th>
      </tr></thead>
      <tbody>
      ${comments.length === 0 ? '<tr><td colspan="7" class="table-empty">\u6682\u65E0\u8BC4\u8BBA\u3002</td></tr>' : ""}
      ${comments.map((c) => `
        <tr>
          <td class="col-check"><input type="checkbox" class="row-check" name="ids" value="${c.id}"></td>
          <td>
            <div class="cm-user">
              <span class="cm-dot" style="background:${avatarColor2(c.email)}">${h(Array.from(String(c.author || "?").trim())[0] || "?")}</span>
              <div><strong>${h(c.author)}</strong><div class="sub-cell muted">${h(c.email || "")}</div>
                <div class="sub-cell muted cm-ipua" title="${h(c.user_agent || "")}">${h(c.ip || "IP \u672A\u77E5")}${c.user_agent ? " \xB7 " + h(excerpt(c.user_agent, 34)) : ""}</div></div>
            </div>
          </td>
          <td>${c.parent_author ? `<div class="reply-to muted">\u56DE\u590D @${h(c.parent_author)}</div>` : ""}
            <div class="cm-text">${h(excerpt(c.content, 150))}</div></td>
          <td>${c.article_title ? `<a class="small-link" href="/article/${h(c.article_slug)}#comments" target="_blank" rel="noopener">${h(excerpt(c.article_title, 22))}</a>` : '<span class="muted">\u6587\u7AE0\u5DF2\u5220\u9664</span>'}</td>
          <td class="col-status">${c.status === "approved" ? pill("\u5DF2\u901A\u8FC7", "ok") : c.status === "pending" ? pill("\u5F85\u5BA1\u6838", "warn") : pill("\u5783\u573E", "danger")}</td>
          <td class="col-time muted">${h(fmtDate(c.created_at, true))}</td>
          <td class="col-act"><div class="act-group">
            ${c.status !== "approved" ? `<button type="submit" formaction="/wp-admin/comments/${c.id}/approve" class="link">\u901A\u8FC7</button>` : `<button type="submit" formaction="/wp-admin/comments/${c.id}/pending" class="link">\u64A4\u56DE</button>`}
            ${c.status !== "spam" ? `<button type="submit" formaction="/wp-admin/comments/${c.id}/spam" class="link">\u5783\u573E</button>` : ""}
            <button type="submit" formaction="/wp-admin/comments/${c.id}/delete" class="link danger" onclick="return confirm('\u5220\u9664\u540E\u65E0\u6CD5\u6062\u590D\uFF08\u5176\u4E0B\u56DE\u590D\u4E5F\u4F1A\u4E00\u5E76\u5220\u9664\uFF09\uFF0C\u786E\u5B9A\u7EE7\u7EED\uFF1F');">\u5220\u9664</button>
          </div></td>
        </tr>`).join("")}
      </tbody>
    </table>
  </div>
</form>
${pagerHtml2(pager, "/wp-admin/comments", { status: status === "all" ? "" : status })}`;
  return adminLayout(ctx, "\u8BC4\u8BBA\u7BA1\u7406", "comments", content, stats.pending);
}
function pageSettings(ctx, data) {
  const s = data.settings || {};
  const g = (k, d = "") => s[k] === void 0 || s[k] === null ? d : s[k];
  const content = `
<form method="post" action="/wp-admin/settings/save" class="settings-wrap">
  ${csrfField(ctx.csrf)}

  <section class="panel">
    <header class="panel-head"><h3>\u57FA\u672C\u4FE1\u606F</h3></header>
    <div class="pad">
      <label class="field"><span class="label">\u7AD9\u70B9\u540D\u79F0 <em class="req">*</em></span>
        <input type="text" name="site_name" value="${h(g("site_name"))}" required></label>
      <label class="field"><span class="label">\u526F\u6807\u9898</span>
        <input type="text" name="site_subtitle" value="${h(g("site_subtitle"))}" placeholder="\u663E\u793A\u5728\u7AD9\u540D\u4E0B\u65B9\u4E0E\u9996\u9875\u6807\u9898"></label>
      <label class="field"><span class="label">\u7F51\u7AD9\u7EDF\u8BA1\u4EE3\u7801</span>
        <textarea name="site_stats" rows="6" placeholder="\u7C98\u8D34\u7B2C\u4E09\u65B9\u7EDF\u8BA1\u4EE3\u7801\uFF08\u5982\u767E\u5EA6\u7EDF\u8BA1\u3001Google Analytics\uFF09\uFF0C\u5C06\u539F\u6837\u8F93\u51FA\u5728\u9875\u9762\u5E95\u90E8" style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px">${h(g("site_stats"))}</textarea></label>
      <p class="muted small" style="margin:-6px 0 12px">\u4EE3\u7801\u4F1A\u539F\u6837\u63D2\u5165\u524D\u53F0\u6BCF\u4E2A\u9875\u9762\u7684 &lt;/body&gt; \u4E4B\u524D\uFF0C\u8BF7\u53EA\u7C98\u8D34\u4FE1\u4EFB\u7684\u7EDF\u8BA1\u4EE3\u7801\u3002</p>
    </div>
  </section>

  <section class="panel">
    <header class="panel-head"><h3>\u5217\u8868\u4E0E\u5206\u9875</h3></header>
    <div class="pad">
      <div class="grid-2">
        <label class="field"><span class="label">\u524D\u53F0\u6BCF\u9875\u6587\u7AE0\u6570</span>
          <input type="number" name="per_page" value="${h(g("per_page", 6))}" min="1" max="50"></label>
        <label class="field"><span class="label">\u540E\u53F0\u6BCF\u9875\u6761\u6570</span>
          <input type="number" name="admin_per_page" value="${h(g("admin_per_page", 10))}" min="5" max="100"></label>
      </div>
    </div>
  </section>

  <section class="panel">
    <header class="panel-head"><h3>\u8BC4\u8BBA\u8BBE\u7F6E</h3></header>
    <div class="pad">
      <label class="check-line"><input type="checkbox" name="comments_enabled" value="1" ${s.comments_enabled === "1" ? "checked" : ""}>
        <span>\u5F00\u542F\u8BC4\u8BBA\u529F\u80FD</span></label>
      <label class="check-line"><input type="checkbox" name="comments_moderation" value="1" ${s.comments_moderation === "1" ? "checked" : ""}>
        <span>\u8BC4\u8BBA\u9700\u8981\u5BA1\u6838\u540E\u624D\u80FD\u663E\u793A\uFF08\u63A8\u8350\u5F00\u542F\uFF09</span></label>
      <div class="grid-2">
        <label class="field"><span class="label">\u53D1\u8A00\u95F4\u9694\uFF08\u79D2\uFF09 <small class="hint">\u540C\u4E00 IP \u6700\u5C0F\u63D0\u4EA4\u95F4\u9694\uFF0C0 \u4E3A\u4E0D\u9650\u5236</small></span>
          <input type="number" name="comments_interval" value="${h(g("comments_interval", 30))}" min="0" max="3600"></label>
        <label class="field"><span class="label">\u5355\u6761\u8BC4\u8BBA\u6700\u5927\u94FE\u63A5\u6570 <small class="hint">\u8D85\u8FC7\u5373\u62D2\u7EDD\uFF0C\u9632\u5E7F\u544A</small></span>
          <input type="number" name="comments_max_links" value="${h(g("comments_max_links", 3))}" min="0" max="20"></label>
      </div>
      <div class="grid-2">
        <label class="field"><span class="label">\u8BC4\u8BBA\u6700\u5927\u957F\u5EA6 <small class="hint">\u5B57\u7B26\u6570</small></span>
          <input type="number" name="comments_max_length" value="${h(g("comments_max_length", 1e3))}" min="100" max="5000"></label>
        <label class="field"><span class="label">\u6BCF IP \u6BCF\u65E5\u4E0A\u9650 <small class="hint">\u8D85\u51FA\u540E\u81EA\u52A8\u8F6C\u4E3A\u5F85\u5BA1\u6838\uFF0C0 \u4E3A\u4E0D\u9650</small></span>
          <input type="number" name="comments_ip_daily" value="${h(g("comments_ip_daily", 15))}" min="0" max="500"></label>
      </div>
      <label class="field"><span class="label">\u8BC4\u8BBA\u533A\u63D0\u793A\u8BED</span>
        <input type="text" name="comments_notice" value="${h(g("comments_notice"))}" maxlength="120" placeholder="\u8BC4\u8BBA\u5C06\u5728\u7AD9\u957F\u5BA1\u6838\u901A\u8FC7\u540E\u663E\u793A"></label>
    </div>
  </section>

  <section class="panel">
    <header class="panel-head"><h3>\u524D\u53F0\u4E3B\u9898</h3></header>
    <div class="pad">
      <label class="check-line">
        <input type="checkbox" name="front_tips" value="1" ${g("front_tips", "1") === "1" ? "checked" : ""}>
        <span>\u5728\u9875\u9762\u9876\u90E8\u663E\u793A\u63D0\u793A\u6761</span>
      </label>

      <div class="grid-2">
        <label class="field"><span class="label">\u63D0\u793A\u6761\u5185\u5BB9 <small class="hint">\u7559\u7A7A\u5219\u663E\u793A\u9ED8\u8BA4\u6587\u6848</small></span>
          <input type="text" name="front_tips_text" value="${h(g("front_tips_text"))}" maxlength="200" placeholder="\u672C\u7AD9\u57FA\u4E8E LiteCMS \u6784\u5EFA\uFF0C\u8BC4\u8BBA\u91C7\u7528\u5373\u65F6\u63D0\u4EA4\uFF0C\u8BF7\u6587\u660E\u53D1\u8A00\u3002"></label>
        <label class="field"><span class="label">\u63D0\u793A\u6761\u6837\u5F0F</span>
          <select name="front_tips_type">
            <option value="info" ${g("front_tips_type", "info") === "info" ? "selected" : ""}>\u84DD\u8272 \xB7 \u6B63\u5E38\u63D0\u793A\uFF08info\uFF09</option>
            <option value="warning" ${g("front_tips_type", "info") === "warning" ? "selected" : ""}>\u9EC4\u8272 \xB7 \u8B66\u544A\uFF08warning\uFF09</option>
            <option value="danger" ${g("front_tips_type", "info") === "danger" ? "selected" : ""}>\u7EA2\u8272 \xB7 \u9519\u8BEF\uFF08danger\uFF09</option>
          </select></label>
      </div>
      <div class="tips-preview"><div class="${h(g("front_tips_type", "info"))}">${h(g("front_tips_text") || "\u672C\u7AD9\u57FA\u4E8E LiteCMS \u6784\u5EFA\uFF0C\u8BC4\u8BBA\u91C7\u7528\u5373\u65F6\u63D0\u4EA4\uFF0C\u8BF7\u6587\u660E\u53D1\u8A00\u3002")}</div></div>


      <label class="field"><span class="label">\u9876\u90E8\u6A2A\u5E45\u56FE\u7247\u5730\u5740 <small class="hint">\u7559\u7A7A\u5219\u663E\u793A\u6587\u5B57 logo\uFF1B\u5EFA\u8BAE\u5C3A\u5BF8 1024\xD7138</small></span>
        <input type="text" name="banner_image" value="${h(g("banner_image"))}" placeholder="/wp-uploads/ab/cdef\u2026 \u6216 https://\u2026"></label>

      <div class="grid-2">
        <label class="field"><span class="label">\u4FA7\u680F\u4E8C\u7EF4\u7801\u56FE\u7247\u5730\u5740 <small class="hint">\u7559\u7A7A\u5219\u4E0D\u663E\u793A</small></span>
          <input type="text" name="qrcode_image" value="${h(g("qrcode_image"))}" placeholder="//hechaocheng.cn/HccTools/img/qrcode_for_gh_8719098a500c_258.jpg \u6216 https://\u2026"></label>
        <label class="field"><span class="label">\u4E8C\u7EF4\u7801\u6807\u9898</span>
          <input type="text" name="qrcode_tip" value="${h(g("qrcode_tip"))}" placeholder="\u5173\u6CE8\u516C\u4F17\u53F7"></label>
      </div>

      <label class="field"><span class="label">\u5907\u6848\u53F7 / \u5E95\u90E8\u8D44\u8D28\u4FE1\u606F</span>
        <input type="text" name="icp_no" value="${h(g("icp_no"))}" placeholder="\u7CA4ICP\u590709058819\u53F7"></label>
      <label class="field"><span class="label">\u516C\u7F51\u5B89\u5907</span>
        <input type="text" name="beian_no" value="${h(g("beian_no"))}" placeholder="\u7CA4\u516C\u7F51\u5B89\u590744098102441016"></label>
      <p class="muted small" style="margin:-6px 0 12px">\u586B\u5199\u540E\u81EA\u52A8\u751F\u6210\u94FE\u63A5\uFF08\u81EA\u52A8\u63D0\u53D6\u5176\u4E2D\u7684\u5F52\u6863\u53F7\u7801\uFF09\uFF1B\u7559\u7A7A\u5219\u4F7F\u7528\u9ED8\u8BA4\u503C\u3002</p>
    </div>
  </section>

  <div class="settings-actions">
    <button type="submit" class="btn btn-primary">\u4FDD\u5B58\u8BBE\u7F6E</button>
    <a class="btn" href="/wp-admin">\u8FD4\u56DE\u4EEA\u8868\u76D8</a>
  </div>
</form>

<section class="panel">
  <header class="panel-head"><h3>\u6570\u636E\u4E0E\u7248\u672C</h3></header>
  <table class="table-plain">
    <tr><th>\u7A0B\u5E8F\u7248\u672C</th><td>LiteCMS ${h(VERSION)}</td></tr>
    <tr><th>\u6570\u636E\u5E93</th><td>Cloudflare D1 \xB7 \u8868\u524D\u7F00\u65E0</td></tr>
    <tr><th>\u5A92\u4F53\u5B58\u50A8</th><td>Cloudflare R2 \xB7 \u7ED1\u5B9A\u540D <code>MEDIA</code></td></tr>
    <tr><th>\u5907\u4EFD\u5EFA\u8BAE</th><td class="muted">\u4F7F\u7528 <code>wrangler d1 export</code> \u5BFC\u51FA\u6574\u5E93\uFF1BR2 \u8D44\u6E90\u53EF\u5728\u63A7\u5236\u53F0\u76F4\u63A5\u4E0B\u8F7D\u3002</td></tr>
  </table>
</section>`;
  return adminLayout(ctx, "\u7AD9\u70B9\u8BBE\u7F6E", "settings", content, 0);
}
function pagePassword(ctx, data = {}) {
  const u = ctx.user || {};
  const content = `
<div class="grid-2 grid-cols-6-4">
  <section class="panel">
    <header class="panel-head"><h3>\u4FEE\u6539\u5BC6\u7801</h3></header>
    <form method="post" action="/wp-admin/password/save" class="pad" autocomplete="off">
      ${csrfField(ctx.csrf)}
      <label class="field"><span class="label">\u539F\u5BC6\u7801</span>
        <input type="password" name="old_password" required></label>
      <label class="field"><span class="label">\u65B0\u5BC6\u7801 <small class="hint">\u81F3\u5C11 6 \u4F4D</small></span>
        <input type="password" name="new_password" minlength="6" required></label>
      <label class="field"><span class="label">\u786E\u8BA4\u65B0\u5BC6\u7801</span>
        <input type="password" name="new_password2" minlength="6" required></label>
      <button type="submit" class="btn btn-primary btn-block">\u786E\u8BA4\u4FEE\u6539</button>
    </form>
  </section>

  <section class="panel">
    <header class="panel-head"><h3>\u8D26\u53F7\u4FE1\u606F</h3></header>
    <table class="table-plain">
      <tr><th>\u7528\u6237\u540D</th><td>${h(u.username || "\u2014")}</td></tr>
      <tr><th>\u6635\u79F0</th><td>${h(u.nickname || "\u2014")}</td></tr>
      <tr><th>\u89D2\u8272</th><td>${h(u.role || "admin")}</td></tr>
      <tr><th>\u521B\u5EFA\u65F6\u95F4</th><td>${h(fmtDate(u.created_at, true))}</td></tr>
    </table>
    <div class="pad muted small">
      \u5BC6\u7801\u4F7F\u7528 PBKDF2-SHA256\uFF0810 \u4E07\u6B21\u8FED\u4EE3\uFF09\u52A0\u76D0\u54C8\u5E0C\u540E\u5B58\u5165 D1\uFF0C\u7A0B\u5E8F\u4E0D\u4FDD\u5B58\u660E\u6587\uFF0C\u4E5F\u65E0\u6CD5\u53CD\u67E5\u539F\u5BC6\u7801。
    </div>
  </section>
</div>`;
  return adminLayout(ctx, "\u4FEE\u6539\u5BC6\u7801", "password", content, 0);
}
function pageMedia(ctx, data) {
  const { objects = [], error } = data;
  const url = (o) => mediaKeyToUrl(o.key);
  const content = `
<div class="panel">
  <header class="panel-head"><h3>\u4E0A\u4F20\u5230 R2</h3><span class="muted small">\u652F\u6301\u56FE\u7247\u4E0E\u6587\u4EF6\uFF0C\u6700\u5927 10MB</span></header>
  <div class="pad">
    ${error ? `<div class="alert alert-error"><span>${h(error)}</span></div>` : ""}
    <form method="post" action="/wp-admin/media/upload" enctype="multipart/form-data" class="filter-form">
      ${csrfField(ctx.csrf)}
      <input type="file" name="file" required style="height:auto;padding:6px 10px">
      <button class="btn btn-primary">\u4E0A\u4F20</button>
    </form>
    <p class="muted small" style="margin:10px 0 0">\u4E0A\u4F20\u5B8C\u6210\u540E\u5728\u4E0B\u8868\u4E2D\u70B9\u51FB\u8F93\u5165\u6846\u5373\u53EF\u590D\u5236\u94FE\u63A5\uFF0C\u7C98\u8D34\u5230\u6587\u7AE0\u6B63\u6587\u91CC\u4F7F\u7528\u3002</p>
  </div>
</div>

<section class="panel">
  <header class="panel-head"><h3>\u5A92\u4F53\u5217\u8868\uFF08${objects.length}\uFF09</h3></header>
  ${objects.length === 0 ? '<div class="panel-empty">\u8FD8\u6CA1\u6709\u4E0A\u4F20\u4EFB\u4F55\u5A92\u4F53\u3002</div>' : `<div class="table-wrap"><table class="data-table"><tbody>
      ${objects.map((o) => {
        const it = mediaItem(o);
        const thumb = it.isImage
          ? `<img src="${h(it.url)}" alt="${h(it.name)}" loading="lazy" style="width:76px;height:56px;object-fit:cover;border-radius:6px;border:1px solid #e4e8ed;display:block">`
          : `<a class="media-ext" href="${h(it.url)}" target="_blank" rel="noopener" title="${h(it.name)}">${h((it.ext || "file").slice(0, 4).toUpperCase())}</a>`;
        return `<tr>
        <td class="col-check" style="width:96px">${thumb}</td>
        <td>
          <div class="sub-cell muted" style="font-size:12.5px">${h(it.name)}</div>
          <input type="text" readonly value="${h(url(o))}" onclick="this.select()" style="width:100%;margin-top:4px;border:1px solid #e4e8ed;border-radius:7px;padding:6px 9px;font-size:12px;font-family:monospace;color:#4b535d">
        </td>
        <td class="col-time muted">${o.size ? Math.round(o.size / 1024) + " KB" : "\u2014"}</td>
        <td class="col-act" style="width:56px">
          <form method="post" action="/wp-admin/media/delete" class="inline-form" onsubmit="return confirm('\u5220\u9664\u6587\u4EF6\u300C${h(o.key.replace(/^media\//, "")).replace(/'/g, "&#39;")}\u300D\uFF1F\u5220\u9664\u540E\u6587\u7AE0\u4E2D\u7684\u94FE\u63A5\u5C06\u5931\u6548\u3002');">
            ${csrfField(ctx.csrf)}
            <input type="hidden" name="key" value="${h(o.key)}">
            <button type="submit" class="link danger">\u5220\u9664</button>
          </form>
        </td>
      </tr>`;
      }).join("")}
    </tbody></table></div>`}
</section>`;
  return adminLayout(ctx, "\u5A92\u4F53\u5E93\uFF08R2\uFF09", "media", content, 0);
}

// functions/[[route]].js
function failPage(title, detail, backHref, status = 400) {
  return html(`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>${h(title)}</title>
<link rel="stylesheet" href="/assets/css/admin.css?v=${encodeURIComponent(VERSION)}"></head>
<body class="auth-body"><div class="login-card" style="max-width:560px">
  <div class="login-head"><h1 style="font-size:20px">${h(title)}</h1></div>
  <div class="alert alert-error"><span>${h(detail)}</span></div>
  <div style="display:flex;gap:10px;margin-top:16px">
    ${backHref ? `<a class="btn btn-primary" href="${h(backHref)}">\u8FD4\u56DE\u91CD\u8BD5</a>` : ""}
    <a class="btn" href="/wp-admin">\u56DE\u540E\u53F0\u9996\u9875</a>
  </div>
</div></body></html>`, status);
}
function csrfFail(backHref) {
  return failPage("\u8868\u5355\u6821\u9A8C\u5931\u8D25", "\u9875\u9762\u505C\u7559\u8FC7\u4E45\u6216 Cookie \u88AB\u6D4F\u89C8\u5668\u62E6\u622A\uFF0C\u8BF7\u8FD4\u56DE\u91CD\u65B0\u63D0\u4EA4\uFF08\u5185\u5BB9\u53EF\u80FD\u5DF2\u4E22\u5931\uFF0C\u5EFA\u8BAE\u5148\u590D\u5236\u6B63\u6587\uFF09\u3002", backHref || "/wp-admin");
}
var _curHeaders = null;
var _curNext = null;
function setNextHandler(fn) {
  _curNext = fn;
}
function html(body, status = 200, headers = null) {
  const hh = headers || _curHeaders || new Headers();
  hh.set("Content-Type", "text/html; charset=utf-8");
  return new Response(body, { status, headers: hh });
}
function redirect(location, headers = null) {
  const hh = headers || _curHeaders || new Headers();
  hh.set("Location", location);
  return new Response(null, { status: 302, headers: hh });
}
function notFound() {
  return new Response("404 Not Found", { status: 404 });
}
/**
 * 轻量自动迁移：老版本升级后自动补建新表，无需手动执行 schema。
 * 只做 CREATE TABLE/INDEX IF NOT EXISTS，幂等且不影响既有数据。
 */
async function ensureUpgrades(db) {
  try {
    const has = await db.intval("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='pages'");
    if (has > 0) return;
    await db.run(`CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL DEFAULT '',
    show_in_nav INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published',
    created_at TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT ''
  )`).catch(() => {});
    await db.run("CREATE INDEX IF NOT EXISTS idx_pages_status ON pages (status)").catch(() => {});
  } catch (e) {
    console.error("UPGRADE_FAIL:", String(e));
  }
}
async function buildContext(env, request) {
  const db = new Db(env);
  const settings = new Settings(db);
  const headers = new Headers();
  const csrf = await ensureCsrf(env, request, headers);
  const installed = await db.isInstalled();
  if (installed) await ensureUpgrades(db);
  const user = installed ? await getSession(env, request) : null;
  const s = installed ? await settings.load() : defaultSettings();
  return { env, db, settings, csrf, headers, user, installed, s };
}
async function loadNav(ctx) {
  if (!ctx.installed) {
    ctx.cats = [];
    ctx.navTags = [];
    ctx.navPages = [];
    return ctx;
  }
  ctx.cats = await CategoryModel.all(ctx.db, true).catch(() => []);
  ctx.navTags = (await TagModel.all(ctx.db, true).catch(() => [])).slice(0, 8);
  ctx.navPages = await PageModel.nav(ctx.db).catch(() => []);
  return ctx;
}
async function handleInstall(ctx, request) {
  const { db } = ctx;
  const installed = await db.isInstalled();
  const usersCount = installed ? await db.intval("SELECT COUNT(*) FROM users") : 0;
  if (request.method === "POST") {
    const form = await request.formData();
    if (!csrfOk(request, form)) return csrfFail("/wp-admin/articles/new");
    const username = String(form.get("username") || "").trim();
    const pass = String(form.get("password") || "");
    const pass2 = String(form.get("password2") || "");
    const siteName = String(form.get("site_name") || "").trim() || "LiteCMS \u5185\u5BB9\u7BA1\u7406\u7CFB\u7EDF";
    const errors = [];
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) errors.push("\u7528\u6237\u540D\u9700\u4E3A 3~20 \u4F4D\u5B57\u6BCD\u3001\u6570\u5B57\u6216\u4E0B\u5212\u7EBF\u3002");
    if (pass.length < 6) errors.push("\u5BC6\u7801\u81F3\u5C11 6 \u4F4D\u3002");
    if (pass !== pass2) errors.push("\u4E24\u6B21\u8F93\u5165\u7684\u5BC6\u7801\u4E0D\u4E00\u81F4\u3002");
    if (usersCount > 0) errors.push("\u5DF2\u5B58\u5728\u7BA1\u7406\u5458\u8D26\u53F7\uFF0C\u8BF7\u76F4\u63A5\u767B\u5F55\u3002");
    if (errors.length) return html(installPage(ctx, errors, { username, site_name: siteName }), 400);
    await applySchema(db);
    const defs = defaultSettings();
    defs.site_name = siteName;
    for (const [k, v] of Object.entries(defs)) {
      await db.run("INSERT OR IGNORE INTO settings (skey, svalue) VALUES (?, ?)", k, v);
    }
    await db.run(
      "INSERT INTO users (username, password, nickname, role, created_at) VALUES (?, ?, ?, ?, ?)",
      username,
      await hashPassword(pass),
      "Admin",
      "admin",
      nowStr()
    );
    await setFlash(ctx.env, ctx.headers, "success", "\u5B89\u88C5\u5B8C\u6210\uFF0C\u8BF7\u767B\u5F55\u540E\u53F0\u3002");
    return redirect("/wp-admin/login", ctx.headers);
  }
  return html(installPage(ctx, [], {}));
}
async function getSchema() {
  return (await Promise.resolve().then(() => (init_schema_inline(), schema_inline_exports))).SCHEMA;
}
async function applySchema(db) {
  const raw = await getSchema();
  const cleaned = raw.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const stmt of cleaned.split(";")) {
    const sql = stmt.trim();
    if (sql) await db.run(sql).catch((e) => console.error("SCHEMA_FAIL:", sql.slice(0, 60), String(e)));
  }
}
function installPage(ctx, errors, form) {
  const y = (/* @__PURE__ */ new Date()).getUTCFullYear();
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>\u5B89\u88C5 LiteCMS</title><link rel="stylesheet" href="/assets/css/admin.css?v=${encodeURIComponent(VERSION)}">
<style>.install-wrap{max-width:640px;margin:40px auto;padding:0 20px}.check-list li{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:14px;list-style:none}</style>
</head><body style="background:#f4f6f8"><div class="install-wrap">
<div class="panel"><header class="panel-head"><h3>LiteCMS for Cloudflare \u5B89\u88C5\u5411\u5BFC</h3></header>
<p class="muted small">\u8FD0\u884C\u73AF\u5883\uFF1ACloudflare Pages Functions \xB7 D1\uFF08SQLite\uFF09\xB7 R2</p>
<ul class="check-list">
<li><span>D1 \u6570\u636E\u5E93\u7ED1\u5B9A</span><span class="ok">${ctx.env.DB ? "\u2713 \u5DF2\u7ED1\u5B9A" : "\u2717 \u672A\u7ED1\u5B9A"}</span></li>
<li><span>R2 \u5B58\u50A8\u6876\u7ED1\u5B9A</span><span class="${ctx.env.MEDIA ? "ok" : "no"}">${ctx.env.MEDIA ? "\u2713 \u5DF2\u7ED1\u5B9A" : "\u26A0 \u672A\u7ED1\u5B9A\uFF08\u5A92\u4F53\u5E93\u4E0D\u53EF\u7528\uFF09"}</span></li>
<li><span>SESSION_SECRET</span><span class="${ctx.env.SESSION_SECRET && ctx.env.SESSION_SECRET !== "please-change-me-to-a-long-random-string" ? "ok" : "no"}">${ctx.env.SESSION_SECRET && ctx.env.SESSION_SECRET !== "please-change-me-to-a-long-random-string" ? "\u2713 \u5DF2\u914D\u7F6E" : "\u26A0 \u8BF7\u4FEE\u6539\u4E3A\u968F\u673A\u503C"}</span></li>
</ul>
${errors.length ? `<div class="alert alert-error"><span>${errors.map(h).join(" ")}</span></div>` : ""}
${ctx.installed && ctx.env.DB ? "" : ""}
${ctx.installed ? '<div class="alert alert-info"><span>\u6570\u636E\u8868\u5DF2\u5C31\u7EEA\u3002</span></div>' : '<div class="alert alert-info"><span>\u9996\u6B21\u90E8\u7F72\uFF1A\u8BF7\u5148\u6267\u884C <code>npx wrangler d1 execute litecms --remote --file=./schema.sql</code> \u5EFA\u8868\uFF08\u6216\u76F4\u63A5\u63D0\u4EA4\u4E0B\u65B9\u8868\u5355\u81EA\u52A8\u5EFA\u8868\uFF09\u3002</span></div>'}
<form method="post" action="/install">
  ${csrfField(ctx.csrf)}
  <label class="field"><span class="label">\u7AD9\u70B9\u540D\u79F0</span><input type="text" name="site_name" value="${h(form.site_name || "LiteCMS \u5185\u5BB9\u7BA1\u7406\u7CFB\u7EDF")}" required></label>
  <label class="field"><span class="label">\u7BA1\u7406\u5458\u7528\u6237\u540D</span><input type="text" name="username" value="${h(form.username || "admin")}" required></label>
  <label class="field"><span class="label">\u5BC6\u7801\uFF08\u81F3\u5C11 6 \u4F4D\uFF09</span><input type="password" name="password" minlength="6" required></label>
  <label class="field"><span class="label">\u786E\u8BA4\u5BC6\u7801</span><input type="password" name="password2" minlength="6" required></label>
  <button type="submit" class="btn btn-primary btn-block">\u5F00\u59CB\u5B89\u88C5</button>
</form>
<p class="muted small">\xA9 ${y} LiteCMS for Cloudflare</p>
</div></div></body></html>`;
}
async function frontHome(ctx, url) {
  await loadNav(ctx);
  const perPage = Math.max(1, parseInt(ctx.s.per_page || "6", 10));
  const page = parseInt(url.searchParams.get("page") || "1", 10) || 1;
  const pager = paginate(await ArticleModel.countPublished(ctx.db, { exclude_featured: true }), perPage, page);
  const articles = await ArticleModel.published(ctx.db, { limit: pager.limit, offset: pager.offset, exclude_featured: true });
  const featured = await ArticleModel.published(ctx.db, { featured_only: true, limit: 3 });
  for (const a of featured) a.views = a.views || 0;
  return html(await pageHome(ctx, { articles, featured, pager }), 200, ctx.headers);
}
async function frontArticle(ctx, slug) {
  await loadNav(ctx);
  let article = await ArticleModel.findBySlug(ctx.db, slug);
  if (!article) return html(await page404(ctx, "\u6587\u7AE0\u4E0D\u5B58\u5728\u6216\u5DF2\u88AB\u5220\u9664\u3002"), 404, ctx.headers);
  await ArticleModel.addView(ctx.db, article.id);
  const neighbors = await ArticleModel.neighbors(ctx.db, article);
  const related = await ArticleModel.published(ctx.db, {
    category_id: article.category_id,
    exclude_id: article.id,
    limit: 3
  });
  const commentsEnabled = ctx.s.comments_enabled === "1";
  const comments = await CommentModel.treeForArticle(ctx.db, article.id);
  const commentCount = await CommentModel.countApproved(ctx.db, article.id);
  const flash = await takeFlash(ctx.env, ctx.request, ctx.headers);
  return html(await pageArticle(ctx, {
    article,
    neighbors,
    related,
    comments,
    commentCount,
    commentsEnabled,
    commentForm: { author: "", email: "", website: "", content: "", parent_id: 0, errors: {} },
    flash
  }), 200, ctx.headers);
}
async function frontList(ctx, url, kind, entity) {
  await loadNav(ctx);
  const perPage = Math.max(1, parseInt(ctx.s.per_page || "6", 10));
  const page = parseInt(url.searchParams.get("page") || "1", 10) || 1;
  const opts = kind === "category" ? { category_id: entity.id } : { tag_id: entity.id };
  const pager = paginate(await ArticleModel.countPublished(ctx.db, opts), perPage, page);
  const articles = await ArticleModel.published(ctx.db, { ...opts, limit: pager.limit, offset: pager.offset });
  return html(await pageList(ctx, {
    heading: (kind === "category" ? "\u5206\u7C7B\uFF1A" : "\u6807\u7B7E\uFF1A") + entity.name,
    subheading: kind === "category" ? entity.description || "" : `\u5171 ${pager.total} \u7BC7\u76F8\u5173\u6587\u7AE0`,
    articles,
    pager,
    active: `${kind}-${entity.id}`,
    base: kind === "category" ? `/category/${entity.slug}` : `/tag/${entity.slug}`,
    params: {}
  }), 200, ctx.headers);
}
async function frontSearch(ctx, url) {
  await loadNav(ctx);
  const q = (url.searchParams.get("q") || "").trim();
  ctx.q = q;
  const perPage = Math.max(1, parseInt(ctx.s.per_page || "6", 10));
  const page = parseInt(url.searchParams.get("page") || "1", 10) || 1;
  const opts = { keyword: q };
  const pager = paginate(await ArticleModel.countPublished(ctx.db, opts), perPage, page);
  const articles = await ArticleModel.published(ctx.db, { ...opts, limit: pager.limit, offset: pager.offset });
  return html(await pageList(ctx, {
    heading: "\u641C\u7D22\u7ED3\u679C",
    subheading: q === "" ? "\u8BF7\u8F93\u5165\u5173\u952E\u8BCD" : `\u5173\u952E\u8BCD\u300C${q}\u300D\u5171\u627E\u5230 ${pager.total} \u7BC7\u6587\u7AE0`,
    articles,
    pager,
    active: "search",
    base: "/search",
    params: { q },
    emptyText: "\u6CA1\u6709\u627E\u5230\u5339\u914D\u7684\u6587\u7AE0\uFF0C\u6362\u4E2A\u5173\u952E\u8BCD\u8BD5\u8BD5\u3002"
  }), 200, ctx.headers);
}
async function frontArchive(ctx, url) {
  await loadNav(ctx);
  const month = url.searchParams.get("month") || "";
  if (!/^\d{4}-\d{2}$/.test(month)) return redirect("/", ctx.headers);
  const perPage = Math.max(1, parseInt(ctx.s.per_page || "6", 10));
  const page = parseInt(url.searchParams.get("page") || "1", 10) || 1;
  const opts = { month };
  const pager = paginate(await ArticleModel.countPublished(ctx.db, opts), perPage, page);
  const articles = await ArticleModel.published(ctx.db, { ...opts, limit: pager.limit, offset: pager.offset });
  return html(await pageList(ctx, {
    heading: "\u5F52\u6863\uFF1A" + month,
    subheading: `\u5171 ${pager.total} \u7BC7\u6587\u7AE0`,
    articles,
    pager,
    active: "",
    base: "/archive",
    params: { month }
  }), 200, ctx.headers);
}
async function issueCommentToken(ctx, request) {
  const dateKey = nowStr().slice(0, 10);
  const cookies = parseCookies(request);
  let seed = cookies.l_visitor || "";
  if (!/^[a-f0-9]{32}$/.test(seed)) {
    seed = "";
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    seed = Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
    ctx.headers.append(
      "Set-Cookie",
      `l_visitor=${seed}; Path=/; Max-Age=${86400 * 180}; HttpOnly; SameSite=Lax`
    );
  }
  const token = await visitorPow(dateKey, seed);
  return json({ ok: true, token, date: dateKey, interval: parseInt(ctx.s.comments_interval || "30", 10) || 0 });
}
async function frontCommentPost(ctx, request) {
  const raw = await request.text();
  let form;
  const isJson = (request.headers.get("Content-Type") || "").includes("application/json");
  if (isJson) {
    let body = {};
    try {
      body = JSON.parse(raw || "{}");
    } catch (e) {
      body = {};
    }
    const obj = body;
    form = { get: (k) => obj[k] === void 0 ? null : String(obj[k]), getAll: (k) => Array.isArray(obj[k]) ? obj[k] : [] };
  } else {
    const fd = new FormData();
    const ct = request.headers.get("Content-Type") || "";
    if (ct.includes("application/x-www-form-urlencoded")) {
      const usp = new URLSearchParams(raw);
      for (const [k, v] of usp) fd.append(k, v);
    } else {
      const req2 = new Request(request.url, { method: "POST", headers: request.headers, body: raw });
      const parsed = await req2.formData();
      for (const [k, v] of parsed) fd.append(k, v);
    }
    form = fd;
  }
  const wantJson = isJson || (request.headers.get("Accept") || "").includes("application/json") || request.headers.get("X-Requested-With") === "fetch";
  const fail = (msg, status = 400, extra = {}) => {
    if (wantJson) return json({ ok: false, error: msg, errors: extra.errors || {} }, status, ctx.headers);
    return html(`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>\u63D0\u4EA4\u5931\u8D25</title>
<link rel="stylesheet" href="/assets/css/front.css?v=${encodeURIComponent(VERSION)}"></head>
<body><div class="container site-main" style="padding-top:40px">
<div class="alert alert-error"><div>${h(msg)}</div></div>
<a class="btn" href="${h(extra.back || "/")}">\u8FD4\u56DE\u4E0A\u4E00\u9875</a></div></body></html>`, status, ctx.headers);
  };
  if (!csrfOkHeader(request, form)) {
    return fail("\u8868\u5355\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u540E\u91CD\u65B0\u63D0\u4EA4\u3002", 419, { back: "/" });
  }
  await loadNav(ctx);
  const articleId = parseInt(form.get("article_id") || "0", 10);
  const article = await ArticleModel.find(ctx.db, articleId);
  const back = article ? `/article/${article.slug}#comments` : "/#comments";
  if (!article || article.status !== "published") {
    return fail("\u6587\u7AE0\u4E0D\u5B58\u5728\u6216\u672A\u53D1\u5E03\uFF0C\u65E0\u6CD5\u8BC4\u8BBA\u3002", 404, { back });
  }
  if (String(form.get("homepage") || "") !== "") {
    return wantJson ? json({ ok: true, status: "pending", message: "\u8BC4\u8BBA\u5DF2\u63D0\u4EA4\u3002" }, 200, ctx.headers) : redirect(back, ctx.headers);
  }
  if (ctx.s.comments_enabled !== "1") {
    return fail("\u672C\u7AD9\u8BC4\u8BBA\u529F\u80FD\u6682\u672A\u5F00\u653E\u3002", 403, { back });
  }
  const elapsed = Math.floor((Number(form.get("elapsed")) || 0) / 1e3);
  const result = await CommentModel.create(ctx.db, ctx.settings, {
    article_id: articleId,
    parent_id: form.get("parent_id"),
    author: form.get("author"),
    email: form.get("email"),
    website: form.get("website"),
    content: form.get("content"),
    token: form.get("token"),
    elapsed,
    is_ajax: wantJson,
    ip: clientIp(request),
    user_agent: request.headers.get("User-Agent") || ""
  });
  if (!result.ok) {
    const msg = Object.values(result.errors).join(" ");
    return fail(msg, 400, {
      back,
      errors: result.errors,
      retryAfter: String(result.errors.rate || "").match(/(\d+)\s*秒/)?.[1] || ""
    });
  }
  const pendingMsg = result.status === "approved" ? "\u8BC4\u8BBA\u53D1\u8868\u6210\u529F\uFF0C\u611F\u8C22\u4F60\u7684\u7559\u8A00\uFF01" : "\u8BC4\u8BBA\u5DF2\u63D0\u4EA4\uFF0C\u7B49\u5F85\u7AD9\u957F\u5BA1\u6838\u901A\u8FC7\u540E\u663E\u793A\u3002";
  if (!wantJson) {
    await setFlash(ctx.env, ctx.headers, "success", pendingMsg);
    return redirect(back, ctx.headers);
  }
  let commentHtml = "";
  if (result.status === "approved" && result.id > 0) {
    const row = await CommentModel.findApproved(ctx.db, result.id);
    if (row) commentHtml = renderComment(ctx, row, { canReply: true });
  }
  const count = await CommentModel.countApproved(ctx.db, articleId);
  return json({
    ok: true,
    status: result.status,
    id: result.id || 0,
    message: pendingMsg,
    commentHtml,
    count,
    parentId: Number(form.get("parent_id")) || 0
  }, 200, ctx.headers);
}
async function requireAdmin(ctx) {
  if (!ctx.user) {
    await setFlash(ctx.env, ctx.headers, "error", "\u8BF7\u5148\u767B\u5F55\u3002");
    return redirect("/wp-admin/login", ctx.headers);
  }
  return null;
}
async function adminLogin(ctx, request, url) {
  if (ctx.user) return redirect("/wp-admin", ctx.headers);
  let error = "", username = "";
  if (request.method === "POST") {
    const form = await request.formData();
    if (!csrfOk(request, form)) {
      error = "\u8868\u5355\u6821\u9A8C\u5931\u8D25\uFF1A\u9875\u9762\u505C\u7559\u8FC7\u4E45\u6216 Cookie \u88AB\u62E6\u622A\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55\u540E\u518D\u8BD5\u3002";
    } else {
      username = String(form.get("username") || "").trim();
      const password = String(form.get("password") || "");
      const user = await ctx.db.one("SELECT * FROM users WHERE username = ? LIMIT 1", username);
      if (user && await verifyPassword(password, user.password)) {
        await setSession(ctx.env, user, ctx.headers);
        const next = String(form.get("next") || "");
        return redirect(next.startsWith("/") ? next : "/wp-admin", ctx.headers);
      }
      error = "\u7528\u6237\u540D\u6216\u5BC6\u7801\u9519\u8BEF\u3002";
    }
  }
  return html(pageLogin(ctx, error, "", username, url.searchParams.get("next") || ""), 200, ctx.headers);
}
async function adminDashboard(ctx) {
  const stats = await ArticleModel.stats(ctx.db);
  const recent = await ArticleModel.adminList(ctx.db, { limit: 5 });
  const topViewed = await ctx.db.all(
    "SELECT id, title, slug, views FROM articles WHERE deleted_at IS NULL AND status='published' ORDER BY views DESC LIMIT 5"
  );
  const pending = await ctx.db.intval("SELECT COUNT(*) FROM comments WHERE status='pending'");
  return html(pageDashboard(ctx, { stats, recent, topViewed, pending }), 200, ctx.headers);
}
async function adminArticles(ctx, url) {
  const status = url.searchParams.get("status") || "all";
  const keyword = url.searchParams.get("keyword") || "";
  const catId = parseInt(url.searchParams.get("category_id") || "0", 10) || 0;
  const perPage = Math.max(5, parseInt(ctx.s.admin_per_page || "10", 10));
  const page = parseInt(url.searchParams.get("page") || "1", 10) || 1;
  const opts = { status, keyword, category_id: catId };
  const pager = paginate(await ArticleModel.adminCount(ctx.db, opts), perPage, page);
  const articles = await ArticleModel.adminList(ctx.db, { ...opts, limit: pager.limit, offset: pager.offset });
  return html(pageArticles(ctx, {
    articles,
    pager,
    status,
    keyword,
    catId,
    cats: await CategoryModel.all(ctx.db, false),
    stats: await ArticleModel.stats(ctx.db)
  }), 200, ctx.headers);
}
async function adminRecycle(ctx) {
  const articles = await ctx.db.all("SELECT a.* FROM articles a WHERE a.deleted_at IS NOT NULL ORDER BY a.deleted_at DESC").catch(() => []);
  const total = await ArticleModel.adminCount(ctx.db, { status: "trash" }).catch(() => articles.length);
  return html(pageRecycle(ctx, { articles, total }), 200, ctx.headers);
}
async function adminArticleForm(ctx, request, id) {
  let article = id > 0 ? await ArticleModel.find(ctx.db, id) : null;
  if (id > 0 && !article) {
    await setFlash(ctx.env, ctx.headers, "error", "\u6587\u7AE0\u4E0D\u5B58\u5728\u6216\u5DF2\u88AB\u5F7B\u5E95\u5220\u9664\u3002");
    return redirect("/wp-admin/articles", ctx.headers);
  }
  const cats = await CategoryModel.all(ctx.db, false);
  const allTags = await TagModel.all(ctx.db, false);
  return html(pageArticleForm(ctx, {
    article: article || { id: 0, title: "", slug: "", summary: "", content: "", category_id: 0, status: "published", is_featured: 0, published_at: "", tagNames: [] },
    articleId: id,
    errors: {},
    cats,
    allTags
  }), 200, ctx.headers);
}
async function adminArticleSave(ctx, request) {
  const form = await request.formData();
  if (!csrfOk(request, form)) return csrfFail("/wp-admin/articles/new");
  const id = parseInt(form.get("id") || "0", 10) || 0;
  const title = String(form.get("title") || "").trim();
  const summary = String(form.get("summary") || "").trim();
  const errors = {};
  if (!title) errors.title = "\u6807\u9898\u4E0D\u80FD\u4E3A\u7A7A\u3002";
  else if (title.length > 120) errors.title = "\u6807\u9898\u4E0D\u80FD\u8D85\u8FC7 120 \u4E2A\u5B57\u7B26\u3002";
  if (summary.length > 300) errors.summary = "\u6458\u8981\u4E0D\u80FD\u8D85\u8FC7 300 \u4E2A\u5B57\u7B26\u3002";
  if (Object.keys(errors).length) {
    const cats = await CategoryModel.all(ctx.db, false);
    const allTags = await TagModel.all(ctx.db, false);
    return html(pageArticleForm(ctx, {
      article: {
        id,
        title,
        slug: form.get("slug"),
        summary,
        content: form.get("content"),
        category_id: form.get("category_id"),
        status: form.get("status"),
        is_featured: form.get("is_featured"),
        tagNames: strToArr(form.get("tags"))
      },
      articleId: id,
      errors,
      cats,
      allTags
    }), 400, ctx.headers);
  }
  let slug = slugify(String(form.get("slug") || "") || title);
  if (!slug) slug = "post-" + Date.now().toString(36);
  const exist = await ctx.db.one("SELECT id FROM articles WHERE slug = ? AND id != ?", slug, id);
  if (exist) slug = slug + "-" + Date.now().toString(36);
  let publishedAt = null;
  const d = String(form.get("published_at") || "");
  if (d) publishedAt = d.replace("T", " ") + ":00";
  try {
    await ArticleModel.save(ctx.db, id, {
      title,
      slug,
      summary,
      content: String(form.get("content") || ""),
      category_id: parseInt(form.get("category_id") || "0", 10) || 0,
      author_id: ctx.user.uid,
      status: form.get("status") === "published" ? "published" : "draft",
      is_featured: form.get("is_featured") === "1" ? 1 : 0,
      published_at: publishedAt
    }, strToArr(form.get("tags")));
  } catch (e) {
    const cs0 = await CategoryModel.all(ctx.db, false).catch(() => []);
    const ts0 = await TagModel.all(ctx.db, false).catch(() => []);
    return html(pageArticleForm(ctx, {
      article: {
        id,
        title,
        slug: form.get("slug"),
        summary,
        content: form.get("content"),
        category_id: form.get("category_id"),
        status: form.get("status"),
        is_featured: form.get("is_featured"),
        tagNames: strToArr(form.get("tags")),
        published_at: form.get("published_at")
      },
      articleId: id,
      errors: { summary: "\u4FDD\u5B58\u5931\u8D25\uFF1A" + (e && e.message ? e.message : "\u6570\u636E\u5E93\u5199\u5165\u9519\u8BEF") + "\uFF08\u5185\u5BB9\u5DF2\u4FDD\u7559\uFF0C\u5EFA\u8BAE\u5148\u590D\u5236\u5907\u4EFD\uFF09" },
      cats: cs0,
      allTags: ts0
    }), 500, ctx.headers);
  }
  await setFlash(ctx.env, ctx.headers, "success", `\u6587\u7AE0\u300A${title}\u300B\u5DF2${id > 0 ? "\u66F4\u65B0" : "\u521B\u5EFA"}\u3002`);
  return redirect("/wp-admin/articles", ctx.headers);
}
async function adminArticleAction(ctx, request, id, action) {
  const form = await request.formData();
  if (!csrfOk(request, form)) return csrfFail("/wp-admin/articles/new");
  id = parseInt(id, 10) || 0;
  if (action === "trash") {
    await ArticleModel.setDeletedAt(ctx.db, id, nowStr());
    await setFlash(ctx.env, ctx.headers, "success", "\u6587\u7AE0\u5DF2\u79FB\u5165\u56DE\u6536\u7AD9\uFF0C\u53EF\u968F\u65F6\u6062\u590D\u3002");
  } else if (action === "restore") {
    await ArticleModel.setDeletedAt(ctx.db, id, null);
    await setFlash(ctx.env, ctx.headers, "success", "\u6587\u7AE0\u5DF2\u4ECE\u56DE\u6536\u7AD9\u6062\u590D\u3002");
  } else if (action === "destroy") {
    await ArticleModel.destroy(ctx.db, id);
    await setFlash(ctx.env, ctx.headers, "success", "\u6587\u7AE0\u5DF2\u5F7B\u5E95\u5220\u9664\uFF0C\u65E0\u6CD5\u6062\u590D\u3002");
  }
  return redirect(String(form.get("back") || "/wp-admin/articles"), ctx.headers);
}
async function adminArticleBatch(ctx, request) {
  const form = await request.formData();
  if (!csrfOk(request, form)) return csrfFail("/wp-admin/articles/new");
  const ids = form.getAll("ids").map(Number).filter(Boolean);
  const action = String(form.get("bulk_action") || "");
  const back = String(form.get("back") || "/wp-admin/articles");
  if (!ids.length) await setFlash(ctx.env, ctx.headers, "error", "\u8BF7\u5148\u52FE\u9009\u8981\u64CD\u4F5C\u7684\u6587\u7AE0\u3002");
  else if (action === "trash") {
    for (const id of ids) await ArticleModel.setDeletedAt(ctx.db, id, nowStr());
    await setFlash(ctx.env, ctx.headers, "success", `\u5DF2\u5BF9 ${ids.length} \u7BC7\u6587\u7AE0\u6267\u884C\u300C\u79FB\u5165\u56DE\u6536\u7AD9\u300D\u3002`);
  } else if (action === "restore") {
    for (const id of ids) await ArticleModel.setDeletedAt(ctx.db, id, null);
    await setFlash(ctx.env, ctx.headers, "success", `\u5DF2\u5BF9 ${ids.length} \u7BC7\u6587\u7AE0\u6267\u884C\u300C\u6062\u590D\u300D\u3002`);
  } else if (action === "destroy") {
    for (const id of ids) await ArticleModel.destroy(ctx.db, id);
    await setFlash(ctx.env, ctx.headers, "success", `\u5DF2\u5BF9 ${ids.length} \u7BC7\u6587\u7AE0\u6267\u884C\u300C\u5F7B\u5E95\u5220\u9664\u300D\u3002`);
  } else if (action === "publish") {
    await ArticleModel.setStatus(ctx.db, ids, "published");
    await setFlash(ctx.env, ctx.headers, "success", `\u5DF2\u5BF9 ${ids.length} \u7BC7\u6587\u7AE0\u6267\u884C\u300C\u53D1\u5E03\u300D\u3002`);
  } else if (action === "draft") {
    await ArticleModel.setStatus(ctx.db, ids, "draft");
    await setFlash(ctx.env, ctx.headers, "success", `\u5DF2\u5BF9 ${ids.length} \u7BC7\u6587\u7AE0\u6267\u884C\u300C\u8F6C\u4E3A\u8349\u7A3F\u300D\u3002`);
  } else if (action === "feature") {
    await ArticleModel.feature(ctx.db, ids);
    await setFlash(ctx.env, ctx.headers, "success", `\u5DF2\u5BF9 ${ids.length} \u7BC7\u6587\u7AE0\u6267\u884C\u300C\u8BBE\u4E3A\u7CBE\u9009\u300D\u3002`);
  } else await setFlash(ctx.env, ctx.headers, "error", "\u672A\u77E5\u7684\u6279\u91CF\u64CD\u4F5C\u3002");
  return redirect(back, ctx.headers);
}
async function adminCategories(ctx, request, url) {
  const editId = parseInt(url.searchParams.get("id") || "0", 10) || 0;
  return html(pageCategories(ctx, {
    cats: await CategoryModel.all(ctx.db, true),
    editCat: editId > 0 ? await CategoryModel.find(ctx.db, editId) : null,
    editId
  }), 200, ctx.headers);
}
async function adminCategorySave(ctx, request) {
  const form = await request.formData();
  if (!csrfOk(request, form)) return csrfFail("/wp-admin/articles/new");
  const id = parseInt(form.get("id") || "0", 10) || 0;
  const name = String(form.get("name") || "").trim();
  if (!name) {
    await setFlash(ctx.env, ctx.headers, "error", "\u5206\u7C7B\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A\u3002");
    return redirect("/wp-admin/categories", ctx.headers);
  }
  let slug = slugify(String(form.get("slug") || "") || name);
  const exist = await ctx.db.one("SELECT id FROM categories WHERE slug = ? AND id != ?", slug, id);
  if (exist) slug = slug + "-" + Date.now().toString(36);
  await CategoryModel.save(ctx.db, id, {
    name,
    slug,
    description: String(form.get("description") || ""),
    sort_order: parseInt(form.get("sort_order") || "0", 10) || 0
  });
  await setFlash(ctx.env, ctx.headers, "success", "\u5206\u7C7B\u5DF2\u4FDD\u5B58\u3002");
  return redirect("/wp-admin/categories", ctx.headers);
}
async function adminCategoryDelete(ctx, request) {
  const form = await request.formData();
  if (!csrfOk(request, form)) return csrfFail("/wp-admin/articles/new");
  await CategoryModel.destroy(ctx.db, parseInt(form.get("id") || "0", 10) || 0);
  await setFlash(ctx.env, ctx.headers, "success", "\u5206\u7C7B\u5DF2\u5220\u9664\u3002");
  return redirect("/wp-admin/categories", ctx.headers);
}
async function adminTags(ctx, request, url) {
  const editId = parseInt(url.searchParams.get("id") || "0", 10) || 0;
  return html(pageTags(ctx, {
    tags: await TagModel.all(ctx.db, true),
    editTag: editId > 0 ? await ctx.db.one("SELECT * FROM tags WHERE id = ?", editId) : null,
    editId
  }), 200, ctx.headers);
}
async function adminTagSave(ctx, request) {
  const form = await request.formData();
  if (!csrfOk(request, form)) return csrfFail("/wp-admin/articles/new");
  const id = parseInt(form.get("id") || "0", 10) || 0;
  const name = String(form.get("name") || "").trim();
  if (!name) {
    await setFlash(ctx.env, ctx.headers, "error", "\u6807\u7B7E\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A\u3002");
    return redirect("/wp-admin/tags", ctx.headers);
  }
  let slug = slugify(String(form.get("slug") || "") || name);
  const exist = await ctx.db.one("SELECT id FROM tags WHERE slug = ? AND id != ?", slug, id);
  if (exist) slug = slug + "-" + Date.now().toString(36);
  await TagModel.save(ctx.db, id, { name, slug });
  await setFlash(ctx.env, ctx.headers, "success", "\u6807\u7B7E\u5DF2\u4FDD\u5B58\u3002");
  return redirect("/wp-admin/tags", ctx.headers);
}
async function adminTagDelete(ctx, request) {
  const form = await request.formData();
  if (!csrfOk(request, form)) return csrfFail("/wp-admin/articles/new");
  await TagModel.destroy(ctx.db, parseInt(form.get("id") || "0", 10) || 0);
  await setFlash(ctx.env, ctx.headers, "success", "\u6807\u7B7E\u5DF2\u5220\u9664\u3002");
  return redirect("/wp-admin/tags", ctx.headers);
}
async function adminComments(ctx, url) {
  const status = url.searchParams.get("status") || "all";
  await ctx.db.run("UPDATE comments SET status='approved' WHERE status='approve'").catch(() => {
  });
  const perPage = 20;
  const page = parseInt(url.searchParams.get("page") || "1", 10) || 1;
  const pager = paginate(await CommentModel.adminCount(ctx.db, { status }), perPage, page);
  const comments = await CommentModel.adminList(ctx.db, { status, limit: pager.limit, offset: pager.offset });
  return html(pageComments(ctx, { comments, pager, status, stats: await CommentModel.stats(ctx.db) }), 200, ctx.headers);
}
async function adminCommentAction(ctx, request, id, action) {
  const form = await request.formData();
  if (!csrfOk(request, form)) return csrfFail("/wp-admin/articles/new");
  id = parseInt(id, 10) || 0;
  if (action === "approve") await ctx.db.run("UPDATE comments SET status='approved', updated_at=? WHERE id=?", nowStr(), id);
  else if (action === "pending") await ctx.db.run("UPDATE comments SET status='pending', updated_at=? WHERE id=?", nowStr(), id);
  else if (action === "spam") await ctx.db.run("UPDATE comments SET status='spam', updated_at=? WHERE id=?", nowStr(), id);
  else if (action === "delete") await ctx.db.run("DELETE FROM comments WHERE id=?", id);
  await setFlash(ctx.env, ctx.headers, "success", "\u64CD\u4F5C\u5DF2\u5B8C\u6210\u3002");
  return redirect("/wp-admin/comments", ctx.headers);
}
async function adminCommentBatch(ctx, request) {
  const form = await request.formData();
  if (!csrfOk(request, form)) return csrfFail("/wp-admin/articles/new");
  const ids = form.getAll("ids").map(Number).filter(Boolean);
  const action = String(form.get("bulk_action") || "");
  if (!ids.length) await setFlash(ctx.env, ctx.headers, "error", "\u8BF7\u5148\u52FE\u9009\u8981\u64CD\u4F5C\u7684\u8BC4\u8BBA\u3002");
  else if (action === "delete") {
    for (const id of ids) await ctx.db.run("DELETE FROM comments WHERE id=?", id);
    await setFlash(ctx.env, ctx.headers, "success", `\u5DF2\u5220\u9664 ${ids.length} \u6761\u8BC4\u8BBA\u3002`);
  } else if (["approve", "pending", "spam"].includes(action)) {
    const status = action === "approve" ? "approved" : action;
    for (const id of ids) await ctx.db.run("UPDATE comments SET status=?, updated_at=? WHERE id=?", status, nowStr(), id);
    await setFlash(ctx.env, ctx.headers, "success", `\u5DF2\u5BF9 ${ids.length} \u6761\u8BC4\u8BBA\u5B8C\u6210\u6279\u91CF\u64CD\u4F5C\u3002`);
  } else await setFlash(ctx.env, ctx.headers, "error", "\u672A\u77E5\u7684\u6279\u91CF\u64CD\u4F5C\u3002");
  return redirect("/wp-admin/comments", ctx.headers);
}
async function adminFriendLinksPage(ctx, url) {
  const raw = await ctx.settings.get("friend_links", "");
  const rawIdx = url ? url.searchParams.get("edit") : null;
  const editIndex = rawIdx === null ? -1 : Number(rawIdx);
  return html(pageFriendLinks(ctx, {
    links: parseFriendLinks(raw),
    raw,
    editIndex: Number.isInteger(editIndex) ? editIndex : -1
  }), 200, ctx.headers);
}
async function adminFriendLinksSave(ctx, request) {
  const form = await request.formData();
  if (!csrfOk(request, form)) return csrfFail("/wp-admin/friendlinks");
  const raw = String(form.get("friend_links") || "");
  // 规范化保存：去掉空行与首尾空白，保持用户输入顺序
  const cleaned = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).join("\n");
  await ctx.settings.set("friend_links", cleaned);
  const n = parseFriendLinks(cleaned).length;
  await setFlash(ctx.env, ctx.headers, "success", `\u53CB\u60C5\u94FE\u63A5\u5DF2\u4FDD\u5B58\uFF0C\u5171 ${n} \u6761\u3002`);
  return redirect("/wp-admin/friendlinks", ctx.headers);
}
/** 单条新增 / 编辑（index = -1 表示新增） */
async function adminFriendLinksAdd(ctx, request) {
  const form = await request.formData();
  if (!csrfOk(request, form)) return csrfFail("/wp-admin/friendlinks");
  const name = String(form.get("name") || "").trim();
  const href = normalizeHref(form.get("url"));
  const index = Number(form.get("index"));
  if (!name || !href) {
    await setFlash(ctx.env, ctx.headers, "error", "\u540D\u79F0\u548C\u5730\u5740\u4E0D\u80FD\u4E3A\u7A7A\uFF0C\u5730\u5740\u4E0D\u80FD\u4F7F\u7528\u975E\u6CD5\u534F\u8BAE\u3002");
    return redirect("/wp-admin/friendlinks", ctx.headers);
  }
  const raw = await ctx.settings.get("friend_links", "");
  const items = parseFriendLinks(raw);
  const entry = { name, href, auto: false };
  if (Number.isInteger(index) && index >= 0 && index < items.length) {
    items[index] = entry;
    await ctx.settings.set("friend_links", serializeFriendLinks(items));
    await setFlash(ctx.env, ctx.headers, "success", `\u5DF2\u66F4\u65B0\u53CB\u60C5\u94FE\u63A5\u300C${name}\u300D\u3002`);
  } else {
    // 同一地址视为重复（忽略协议与末尾斜杠），直接覆盖名称，避免列表里出现重复链接
    const same = (a, b) => String(a || "").replace(/^(https?:)?\/\//i, "").replace(/\/+$/, "").toLowerCase()
      === String(b || "").replace(/^(https?:)?\/\//i, "").replace(/\/+$/, "").toLowerCase();
    const dup = items.findIndex((l) => same(l.href, href));
    if (dup >= 0) {
      items[dup] = entry;
      await ctx.settings.set("friend_links", serializeFriendLinks(items));
      await setFlash(ctx.env, ctx.headers, "success", `\u5730\u5740\u5DF2\u5B58\u5728\uFF0C\u5DF2\u66F4\u65B0\u540D\u79F0\u4E3A\u300C${name}\u300D\u3002`);
    } else {
      items.push(entry);
      await ctx.settings.set("friend_links", serializeFriendLinks(items));
      await setFlash(ctx.env, ctx.headers, "success", `\u5DF2\u6DFB\u52A0\u53CB\u60C5\u94FE\u63A5\u300C${name}\u300D\u3002`);
    }
  }
  return redirect("/wp-admin/friendlinks", ctx.headers);
}
/** 拖拽排序：接收按新顺序排列的旧索引序列 */
async function adminFriendLinksOrder(ctx, request) {
  const form = await request.formData();
  if (!csrfOk(request, form)) return csrfFail("/wp-admin/friendlinks");
  const order = String(form.get("order") || "").split(",").map((x) => Number(x));
  const raw = await ctx.settings.get("friend_links", "");
  const items = parseFriendLinks(raw);
  const valid = (n) => Number.isInteger(n) && n >= 0 && n < items.length;
  if (order.length !== items.length || !order.every(valid) || new Set(order).size !== items.length) {
    await setFlash(ctx.env, ctx.headers, "error", "排序数据无效，未保存。");
    return redirect("/wp-admin/friendlinks", ctx.headers);
  }
  await ctx.settings.set("friend_links", serializeFriendLinks(order.map((i) => items[i])));
  await setFlash(ctx.env, ctx.headers, "success", "排序已保存。");
  return redirect("/wp-admin/friendlinks", ctx.headers);
}
/** 删除单条 */
async function adminFriendLinksDelete(ctx, request) {
  const form = await request.formData();
  if (!csrfOk(request, form)) return csrfFail("/wp-admin/friendlinks");
  const index = Number(form.get("index"));
  const raw = await ctx.settings.get("friend_links", "");
  const items = parseFriendLinks(raw);
  if (Number.isInteger(index) && index >= 0 && index < items.length) {
    const name = items[index].name;
    items.splice(index, 1);
    await ctx.settings.set("friend_links", serializeFriendLinks(items));
    await setFlash(ctx.env, ctx.headers, "success", `\u5DF2\u5220\u9664\u53CB\u60C5\u94FE\u63A5\u300C${name}\u300D\u3002`);
  } else {
    await setFlash(ctx.env, ctx.headers, "error", "\u8981\u5220\u9664\u7684\u94FE\u63A5\u4E0D\u5B58\u5728\u3002");
  }
  return redirect("/wp-admin/friendlinks", ctx.headers);
}
async function adminSettingsPage(ctx) {
  return html(pageSettings(ctx, { settings: ctx.s }), 200, ctx.headers);
}
async function adminSettingsSave(ctx, request) {
  const form = await request.formData();
  if (!csrfOk(request, form)) return csrfFail("/wp-admin/articles/new");
  const keys = [
    "site_name",
    "site_subtitle",
    "site_stats",
    "per_page",
    "admin_per_page",
    "comments_interval",
    "comments_max_links",
    "comments_max_length",
    "comments_notice",
    "comments_ip_daily",
    "banner_image",
    "qrcode_image",
    "qrcode_tip",
    "friend_links",
    "icp_no",
    "beian_no"
  ];
  for (const k of keys) {
    if (form.get(k) !== null) await ctx.settings.set(k, form.get(k));
  }
  await ctx.settings.set("comments_enabled", form.get("comments_enabled") === "1" ? "1" : "0");
  await ctx.settings.set("comments_moderation", form.get("comments_moderation") === "1" ? "1" : "0");
  await ctx.settings.set("front_tips", form.get("front_tips") === "1" ? "1" : "0");
  if (form.get("front_tips_text") !== null) await ctx.settings.set("front_tips_text", form.get("front_tips_text"));
  const tipsType = String(form.get("front_tips_type") || "info");
  await ctx.settings.set("front_tips_type", ["info", "warning", "danger"].includes(tipsType) ? tipsType : "info");
  await setFlash(ctx.env, ctx.headers, "success", "\u8BBE\u7F6E\u5DF2\u4FDD\u5B58\u3002");
  return redirect("/wp-admin/settings", ctx.headers);
}
async function adminPasswordPage(ctx) {
  return html(pagePassword(ctx), 200, ctx.headers);
}
async function adminPasswordSave(ctx, request) {
  const form = await request.formData();
  if (!csrfOk(request, form)) return csrfFail("/wp-admin/articles/new");
  const user = await ctx.db.one("SELECT * FROM users WHERE id = ?", ctx.user.uid);
  if (!user || !await verifyPassword(String(form.get("old_password") || ""), user.password)) {
    await setFlash(ctx.env, ctx.headers, "error", "\u539F\u5BC6\u7801\u4E0D\u6B63\u786E\u3002");
    return redirect("/wp-admin/password", ctx.headers);
  }
  const np = String(form.get("new_password") || "");
  if (np.length < 6 || np !== String(form.get("new_password2") || "")) {
    await setFlash(ctx.env, ctx.headers, "error", "\u65B0\u5BC6\u7801\u81F3\u5C11 6 \u4F4D\uFF0C\u4E14\u4E24\u6B21\u8F93\u5165\u4E00\u81F4\u3002");
    return redirect("/wp-admin/password", ctx.headers);
  }
  await ctx.db.run("UPDATE users SET password = ? WHERE id = ?", await hashPassword(np), user.id);
  await setFlash(ctx.env, ctx.headers, "success", "\u5BC6\u7801\u5DF2\u4FEE\u6539\u3002");
  return redirect("/wp-admin/password", ctx.headers);
}
async function adminMedia(ctx) {
  let objects = [];
  let error = "";
  if (ctx.env.MEDIA) {
    try {
      const list = await ctx.env.MEDIA.list({ limit: 60 });
      objects = (list.objects || []).filter((o) => !o.key.endsWith("/")).map((o) => ({ key: o.key, size: o.size }));
    } catch (e) {
      error = "\u8BFB\u53D6 R2 \u5931\u8D25\uFF1A" + e.message;
    }
  } else {
    error = "\u672A\u7ED1\u5B9A R2 \u5B58\u50A8\u6876\uFF08wrangler.toml \u4E2D\u914D\u7F6E MEDIA \u7ED1\u5B9A\uFF09\u3002";
  }
  return html(pageMedia(ctx, { objects, error }), 200, ctx.headers);
}
/** 删除 R2 媒体对象（列表页表单提交 / API 均可） */
async function adminMediaDelete(ctx, request) {
  if (!ctx.env.MEDIA) {
    const msg = "\u672A\u7ED1\u5B9A R2 \u5B58\u50A8\u6876\u3002";
    if (isApiRequest(request)) return json({ ok: false, error: msg }, 400);
    await setFlash(ctx.env, ctx.headers, "error", msg);
    return redirect("/wp-admin/media", ctx.headers);
  }
  const form = await request.formData();
  if (!csrfOk(request, form)) {
    if (isApiRequest(request)) return json({ ok: false, error: "\u9875\u9762\u4F1A\u8BDD\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u8BD5\u3002" }, 403);
    return csrfFail("/wp-admin/media");
  }
  const key = String(form.get("key") || "").trim();
  const safe = /^wp-uploads\/[0-9a-f]{2}\/[0-9a-f]+(\.[a-z0-9]{1,8})?$/i.test(key) || /^media\/[a-z0-9._-]+$/i.test(key);
  if (!key || !safe) {
    const msg = "\u65E0\u6548\u7684\u6587\u4EF6\u6807\u8BC6\u3002";
    if (isApiRequest(request)) return json({ ok: false, error: msg }, 400);
    await setFlash(ctx.env, ctx.headers, "error", msg);
    return redirect("/wp-admin/media", ctx.headers);
  }
  try {
    await ctx.env.MEDIA.delete(key);
  } catch (e) {
    const msg = "\u5220\u9664\u5931\u8D25\uFF1A" + e.message;
    if (isApiRequest(request)) return json({ ok: false, error: msg }, 500);
    await setFlash(ctx.env, ctx.headers, "error", msg);
    return redirect("/wp-admin/media", ctx.headers);
  }
  const okMsg = "\u5DF2\u5220\u9664\uFF1A" + key.replace(/^media\//, "");
  if (isApiRequest(request)) return json({ ok: true, key });
  await setFlash(ctx.env, ctx.headers, "success", okMsg);
  return redirect("/wp-admin/media", ctx.headers);
}
function isApiRequest(request) {
  return String(request.headers.get("Accept") || "").includes("application/json")
    || String(request.headers.get("X-Requested-With") || "") === "fetch";
}
async function adminMediaUpload(ctx, request) {
  const form = await request.formData();
  if (!csrfOk(request, form)) return csrfFail("/wp-admin/articles/new");
  if (!ctx.env.MEDIA) {
    await setFlash(ctx.env, ctx.headers, "error", "\u672A\u7ED1\u5B9A R2 \u5B58\u50A8\u6876\u3002");
    return redirect("/wp-admin/media", ctx.headers);
  }
  const file = form.get("file");
  if (!file || typeof file === "string") {
    await setFlash(ctx.env, ctx.headers, "error", "\u8BF7\u9009\u62E9\u8981\u4E0A\u4F20\u7684\u6587\u4EF6\u3002");
    return redirect("/wp-admin/media", ctx.headers);
  }
  if (file.size > 10 * 1024 * 1024) {
    await setFlash(ctx.env, ctx.headers, "error", "\u6587\u4EF6\u4E0D\u80FD\u8D85\u8FC7 10MB\u3002");
    return redirect("/wp-admin/media", ctx.headers);
  }
  const buf = await file.arrayBuffer();
  const ext = mediaExtFromName(file.name);
  const key = await mediaKeyByHash(buf, ext);
  await ctx.env.MEDIA.put(key, buf, {
    httpMetadata: { contentType: file.type || mimeByExt(ext) }
  });
  await setFlash(ctx.env, ctx.headers, "success", "\u4E0A\u4F20\u6210\u529F\uFF1A" + mediaKeyToUrl(key));
  return redirect("/wp-admin/media", ctx.headers);
}
async function mediaGet(ctx, key) {
  if (!ctx.env.MEDIA) return notFound();
  // key 为完整存储键：wp-uploads/<2位>/<其余>.<后缀>（旧键可能无后缀）或旧格式 media/<名称>
  const object = await ctx.env.MEDIA.get(key);
  if (!object) return notFound();
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  if (!headers.get("Content-Type")) headers.set("Content-Type", mimeByExt((key.match(/\.([a-z0-9]{1,8})$/i) || [, ""])[1]));
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(object.body, { headers });
}

/* ---------------------------------------------------------- 媒体存储：wp-uploads/<哈希前2位>/<哈希其余>.<后缀> */
/** 从文件名取安全后缀（小写字母数字，1-8 位），取不到回退 bin */
function mediaExtFromName(name) {
  const m = String(name || "").match(/\.([A-Za-z0-9]{1,8})$/);
  if (!m) return "bin";
  const ext = m[1].toLowerCase();
  return /^[a-z0-9]{1,8}$/.test(ext) ? ext : "bin";
}
/**
 * 内容哈希 -> 存储键。
 * 同名内容相同则键完全相同（天然去重）；不同后缀即使内容相同也会各存一份，
 * 因为 URL 后缀直接决定 Content-Type 推断与浏览器行为。
 */
async function mediaKeyByHash(buf, ext) {
  const digest = await crypto.subtle.digest("SHA-256", buf);
  const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
  const suffix = /^[a-z0-9]{1,8}$/.test(String(ext || "").toLowerCase()) ? String(ext).toLowerCase() : "bin";
  return "wp-uploads/" + hex.slice(0, 2) + "/" + hex.slice(2) + "." + suffix;
}
/** 按后缀推断 Content-Type（R2 里旧对象可能没有 httpMetadata） */
var MIME_BY_EXT = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp",
  svg: "image/svg+xml", avif: "image/avif", bmp: "image/bmp", ico: "image/x-icon",
  pdf: "application/pdf", txt: "text/plain; charset=utf-8", md: "text/markdown; charset=utf-8",
  json: "application/json", xml: "application/xml", html: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8", js: "text/javascript; charset=utf-8",
  mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
  mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg",
  zip: "application/zip", rar: "application/vnd.rar", "7z": "application/x-7z-compressed",
  doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  woff: "font/woff", woff2: "font/woff2", ttf: "font/ttf", otf: "font/otf"
};
function mimeByExt(ext) {
  return MIME_BY_EXT[String(ext || "").toLowerCase()] || "application/octet-stream";
}
/** 存储键 -> 访问 URL（新 wp-uploads 键 / 旧 media 键兼容） */
function mediaKeyToUrl(key) {
  key = String(key || "");
  if (key.startsWith("wp-uploads/")) return "/" + key;
  return "/media/" + key.replace(/^media\//, "");
}
/* ---------------------------------------------------------- 媒体库 JSON 接口（编辑器内选择/上传） */
var IMAGE_EXT = ["jpg", "jpeg", "png", "gif", "webp", "svg", "avif", "bmp", "ico"];
var MEDIA_MAX_BYTES = 10 * 1024 * 1024;
function mediaItem(o) {
  const key = String(o.key || "");
  const ext = (key.match(/\.([a-zA-Z0-9]+)$/) || [, ""])[1].toLowerCase();
  const base = key.replace(/^media\//, "").replace(/^wp-uploads\//, "");
  const name = ext
    ? base.split("/").pop()
    : (base.split("/").pop() || base).slice(0, 14) + (ext ? "" : "\u2026");
  return {
    key,
    name,
    url: mediaKeyToUrl(key),
    size: Number(o.size) || 0,
    ext,
    isImage: IMAGE_EXT.includes(ext),
    uploaded: o.uploaded ? new Date(o.uploaded).toISOString().slice(0, 19).replace("T", " ") : ""
  };
}
async function adminMediaApiList(ctx) {
  if (!ctx.env.MEDIA) return json({ ok: false, error: "\u672A\u7ED1\u5B9A R2 \u5B58\u50A8\u6876\u3002", items: [] }, 200);
  try {
    const list = await ctx.env.MEDIA.list({ limit: 200 });
    const items = (list.objects || [])
      .filter((o) => !o.key.endsWith("/"))
      .map(mediaItem)
      .sort((a, b) => (a.uploaded < b.uploaded ? 1 : -1));
    return json({ ok: true, items });
  } catch (e) {
    return json({ ok: false, error: "\u8BFB\u53D6 R2 \u5931\u8D25\uFF1A" + e.message, items: [] }, 200);
  }
}
async function adminMediaApiUpload(ctx, request) {
  if (!ctx.env.MEDIA) return json({ ok: false, error: "\u672A\u7ED1\u5B9A R2 \u5B58\u50A8\u6876\uFF08wrangler.toml \u4E2D\u914D\u7F6E MEDIA \u7ED1\u5B9A\uFF09\u3002" }, 400);
  const form = await request.formData();
  if (!csrfOkHeader(request, form)) return json({ ok: false, error: "\u9875\u9762\u4F1A\u8BDD\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u8BD5\u3002" }, 403);
  const file = form.get("file");
  if (!file || typeof file === "string") return json({ ok: false, error: "\u8BF7\u9009\u62E9\u8981\u4E0A\u4F20\u7684\u6587\u4EF6\u3002" }, 400);
  if (file.size > MEDIA_MAX_BYTES) return json({ ok: false, error: "\u6587\u4EF6\u4E0D\u80FD\u8D85\u8FC7 10MB\u3002" }, 400);
  const buf = await file.arrayBuffer();
  const ext = mediaExtFromName(file.name);
  const key = await mediaKeyByHash(buf, ext);
  await ctx.env.MEDIA.put(key, buf, {
    httpMetadata: { contentType: file.type || mimeByExt(ext) }
  });
  return json({ ok: true, item: mediaItem({ key, size: file.size, uploaded: Date.now() }) });
}
async function onRequest(context) {
  const { request, env } = context;
  setNextHandler(typeof context.next === "function" ? context.next.bind(context) : null);
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const method = request.method.toUpperCase();
  let m;
  try {
    if (!env.DB) return html("<h2>\u672A\u7ED1\u5B9A D1 \u6570\u636E\u5E93</h2><p>\u8BF7\u5728 wrangler.toml \u4E2D\u914D\u7F6E DB \u7ED1\u5B9A\u540E\u91CD\u65B0\u90E8\u7F72\u3002</p>", 500);
    const ctx = await buildContext(env, request);
    ctx.request = request;
    _curHeaders = ctx.headers;
    const tablesOk = await ctx.db.isInstalled();
    let usersCount = 0;
    if (tablesOk) {
      try {
        usersCount = await ctx.db.intval("SELECT COUNT(*) FROM users");
      } catch (e) {
        usersCount = 0;
      }
    }
    ctx.ready = tablesOk && usersCount > 0;
    if (!ctx.ready) {
      if (path === "/install") {
        return method === "POST" ? handleInstall(ctx, request) : handleInstall(ctx, request);
      }
      if (path.startsWith("/assets/")) {
        return _curNext ? _curNext() : notFound();
      }
      return redirect("/install", ctx.headers);
    }
    if (path === "/install") {
      return html('<div style="font-family:sans-serif;padding:40px"><h3>\u7CFB\u7EDF\u5DF2\u5B89\u88C5</h3><p><a href="/wp-admin/login">\u524D\u5F80\u767B\u5F55</a> \xB7 <a href="/">\u67E5\u770B\u524D\u53F0</a></p></div>', 200, ctx.headers);
    }
    if (method === "GET" && path.startsWith("/wp-uploads/") && /^\/wp-uploads\/[0-9a-f]{2}\/[0-9a-f]+(\.[a-z0-9]{1,8})?$/i.test(path)) {
      return mediaGet(ctx, path.slice(1));
    }
    if (method === "GET" && path.startsWith("/media/")) return mediaGet(ctx, path.slice(1));
    if (path.startsWith("/assets/")) {
      return _curNext ? _curNext() : notFound();
    }
    if (method === "GET") {
      if (path === "/") return frontHome(ctx, url);
      if (path === "/about") {
        await loadNav(ctx);
        return html(await pageAbout(ctx), 200, ctx.headers);
      }
      if (path === "/search") return frontSearch(ctx, url);
      // 独立页面：/slug 直达（放在已知路由之后，避免抢占）
      if (m = path.match(/^\/([a-z0-9][a-z0-9-]{0,80})$/i)) {
        const pg = await PageModel.findBySlug(ctx.db, m[1].toLowerCase());
        if (pg) {
          await loadNav(ctx);
          return html(await pageCustom(ctx, pg), 200, ctx.headers);
        }
      }
      if (path === "/archive") return frontArchive(ctx, url);
      if (m = path.match(/^\/article\/(.+)$/)) return frontArticle(ctx, decodeURIComponent(m[1]));
      if (m = path.match(/^\/category\/(.+)$/)) {
        const cat = await CategoryModel.findBySlug(ctx.db, decodeURIComponent(m[1]));
        await loadNav(ctx);
        if (!cat) return html(await page404(ctx, "\u5206\u7C7B\u4E0D\u5B58\u5728\u3002"), 404, ctx.headers);
        return frontList(ctx, url, "category", cat);
      }
      if (m = path.match(/^\/tag\/(.+)$/)) {
        const tag = await TagModel.findBySlug(ctx.db, decodeURIComponent(m[1]));
        await loadNav(ctx);
        if (!tag) return html(await page404(ctx, "\u6807\u7B7E\u4E0D\u5B58\u5728\u3002"), 404, ctx.headers);
        return frontList(ctx, url, "tag", tag);
      }
    }
    if (path === "/comment/token") return issueCommentToken(ctx, request);
    if (method === "POST" && path === "/comment") return frontCommentPost(ctx, request);
    if (path === "/admin" || path.startsWith("/admin/")) {
      return redirect("/wp-admin" + path.slice(6) + (url.search || ""), ctx.headers);
    }
    if (path === "/wp-admin" || path === "/wp-admin/") {
      if (!ctx.user) return redirect("/wp-admin/login", ctx.headers);
      return adminDashboard(ctx);
    }
    if (path === "/wp-admin/login") return adminLogin(ctx, request, url);
    if (path === "/wp-admin/logout") {
      clearSession(ctx.headers);
      return redirect("/wp-admin/login", ctx.headers);
    }
    const adminGuard = await requireAdmin(ctx);
    if (adminGuard) return adminGuard;
    if (method === "GET") {
      if (path === "/wp-admin/dashboard") return adminDashboard(ctx);
      if (path === "/wp-admin/articles") return adminArticles(ctx, url);
      if (path === "/wp-admin/recycle") return adminRecycle(ctx);
      if (path === "/wp-admin/articles/new") return adminArticleForm(ctx, request, 0);
      if (m = path.match(/^\/wp-admin\/articles\/(\d+)\/edit$/)) return adminArticleForm(ctx, request, +m[1]);
      if (path === "/wp-admin/categories") return adminCategories(ctx, request, url);
      if (path === "/wp-admin/tags") return adminTags(ctx, request, url);
      if (path === "/wp-admin/friendlinks") return adminFriendLinksPage(ctx, url);
      if (path === "/wp-admin/pages") return adminPages(ctx, request, url);
      if (path === "/wp-admin/comments") return adminComments(ctx, url);
      if (path === "/wp-admin/settings") return adminSettingsPage(ctx);
      if (path === "/wp-admin/password") return adminPasswordPage(ctx);
      if (path === "/wp-admin/media") return adminMedia(ctx);
      if (path === "/wp-admin/media/api/list") return adminMediaApiList(ctx);
    }
    if (method === "POST") {
      if (path === "/wp-admin/articles/save") return adminArticleSave(ctx, request);
      if (m = path.match(/^\/wp-admin\/articles\/(\d+)\/(trash|restore|destroy)$/)) return adminArticleAction(ctx, request, +m[1], m[2]);
      if (path === "/wp-admin/articles/batch") return adminArticleBatch(ctx, request);
      if (path === "/wp-admin/categories/save") return adminCategorySave(ctx, request);
      if (path === "/wp-admin/categories/delete") return adminCategoryDelete(ctx, request);
      if (path === "/wp-admin/tags/save") return adminTagSave(ctx, request);
      if (path === "/wp-admin/tags/delete") return adminTagDelete(ctx, request);
      if (path === "/wp-admin/friendlinks/save") return adminFriendLinksSave(ctx, request);
      if (path === "/wp-admin/friendlinks/add") return adminFriendLinksAdd(ctx, request);
      if (path === "/wp-admin/friendlinks/delete") return adminFriendLinksDelete(ctx, request);
      if (path === "/wp-admin/friendlinks/order") return adminFriendLinksOrder(ctx, request);
      if (path === "/wp-admin/pages/save") return adminPageSave(ctx, request);
      if (path === "/wp-admin/pages/delete") return adminPageDelete(ctx, request);
      if (m = path.match(/^\/wp-admin\/comments\/(\d+)\/(approve|pending|spam|delete)$/)) return adminCommentAction(ctx, request, +m[1], m[2]);
      if (path === "/wp-admin/comments/batch") return adminCommentBatch(ctx, request);
      if (path === "/wp-admin/settings/save") return adminSettingsSave(ctx, request);
      if (path === "/wp-admin/password/save") return adminPasswordSave(ctx, request);
      if (path === "/wp-admin/media/upload") return adminMediaUpload(ctx, request);
      if (path === "/wp-admin/media/delete") return adminMediaDelete(ctx, request);
      if (path === "/wp-admin/media/api/upload") return adminMediaApiUpload(ctx, request);
    }
    return html(await page404(ctx, "\u9875\u9762\u4E0D\u5B58\u5728\u6216\u5DF2\u88AB\u5220\u9664\u3002"), 404, ctx.headers);
  } catch (e) {
    return html(`<h2>\u7CFB\u7EDF\u9519\u8BEF</h2><pre>${h(e && e.stack || String(e))}</pre>`, 500);
  }
}

// functions/_worker-entry.js
var MIME = {
  js: "application/javascript; charset=utf-8",
  mjs: "application/javascript; charset=utf-8",
  css: "text/css; charset=utf-8",
  json: "application/json; charset=utf-8",
  map: "application/json; charset=utf-8",
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  ico: "image/x-icon",
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  txt: "text/plain; charset=utf-8",
  html: "text/html; charset=utf-8"
};
function mimeOf(path) {
  const ext = (path.split(".").pop() || "").toLowerCase();
  return MIME[ext] || "application/octet-stream";
}
async function serveAsset(request, next) {
  if (!next) return null;
  let res;
  try {
    res = await next(request);
  } catch (e) {
    return null;
  }
  if (!res || !res.ok) return res || null;
  const url = new URL(request.url);
  const headers = new Headers();
  for (const key of ["etag", "last-modified", "cache-control"]) {
    const v = res.headers.get(key);
    if (v) headers.set(key, v);
  }
  headers.set("Content-Type", mimeOf(url.pathname));
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}
var worker_entry_default = {
  async fetch(request, env, context) {
    let next = null;
    if (context && typeof context.next === "function") {
      next = context.next.bind(context);
    } else if (env && env.ASSETS && typeof env.ASSETS.fetch === "function") {
      next = (req) => env.ASSETS.fetch(req || request);
    }
    const pathname = new URL(request.url).pathname;
    if (pathname.startsWith("/assets/") && (request.method === "GET" || request.method === "HEAD")) {
      const fixed = await serveAsset(request, next);
      if (fixed && fixed.ok) return fixed;
    }
    setNextHandler(next);
    const waitUntil = (p) => {
      if (context && typeof context.waitUntil === "function") context.waitUntil(p);
    };
    return onRequest({ request, env, params: {}, data: {}, next, waitUntil });
  }
};
export {
  worker_entry_default as default
};
