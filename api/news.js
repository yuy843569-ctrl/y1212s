import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { list, put } from "@vercel/blob";

const MAX_TITLE_LENGTH = 100;
const MAX_BODY_LENGTH = 3000;
const MAX_CATEGORY_LENGTH = 24;
const FAILURE_LIMIT = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const attempts = new Map();

function json(payload, status = 200) {
  return Response.json(payload, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

function constantTimeMatch(supplied, expected) {
  const suppliedHash = createHash("sha256").update(supplied).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(suppliedHash, expectedHash);
}

function requestKey(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return createHash("sha256").update(ip).digest("hex");
}

function cleanRecord(record) {
  if (!record || typeof record !== "object") return null;
  const title = typeof record.title === "string" ? record.title.slice(0, MAX_TITLE_LENGTH) : "";
  const body = typeof record.body === "string" ? record.body.slice(0, MAX_BODY_LENGTH) : "";
  const category = typeof record.category === "string" ? record.category.slice(0, MAX_CATEGORY_LENGTH) : "お知らせ";
  const date = typeof record.date === "string" ? record.date : "";
  if (!title || !body || !/^\d{4}-\d{2}-\d{2}T/.test(date)) return null;
  return { id: String(record.id || ""), title, body, category, date };
}

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "news/", limit: 100 });
    const records = await Promise.all(blobs.map(async (blob) => {
      const response = await fetch(blob.url, { cache: "no-store" });
      if (!response.ok) return null;
      return cleanRecord(await response.json());
    }));
    records.sort((a, b) => (b?.date || "").localeCompare(a?.date || ""));
    return json({ news: records.filter(Boolean) });
  } catch {
    return json({ error: "お知らせを読み込めませんでした。Vercel Blobの設定を確認してください。" }, 503);
  }
}

export async function POST(request) {
  const expectedPin = process.env.NEWS_ADMIN_PIN;
  if (!expectedPin) return json({ error: "管理者PINが設定されていません。Vercelの環境変数を設定してください。" }, 503);

  const key = requestKey(request);
  const now = Date.now();
  const state = attempts.get(key);
  if (state?.lockedUntil > now) {
    return json({ error: "入力回数の上限に達しました。時間をおいて再度お試しください。" }, 429);
  }

  let input;
  try {
    input = await request.json();
  } catch {
    return json({ error: "送信内容を読み取れませんでした。" }, 400);
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return json({ error: "送信内容の形式が正しくありません。" }, 400);
  }

  const suppliedPin = typeof input.pin === "string" ? input.pin : "";
  if (!constantTimeMatch(suppliedPin, expectedPin)) {
    const failures = (state?.failures || 0) + 1;
    attempts.set(key, {
      failures,
      lockedUntil: failures >= FAILURE_LIMIT ? now + LOCKOUT_MS : 0,
    });
    return json({ error: "PINが正しくありません。" }, 401);
  }
  attempts.delete(key);

  const title = typeof input.title === "string" ? input.title.trim() : "";
  const body = typeof input.body === "string" ? input.body.trim() : "";
  const category = typeof input.category === "string" ? input.category.trim() : "お知らせ";
  if (!title || title.length > MAX_TITLE_LENGTH) {
    return json({ error: `タイトルは1〜${MAX_TITLE_LENGTH}文字で入力してください。` }, 400);
  }
  if (!body || body.length > MAX_BODY_LENGTH) {
    return json({ error: `本文は1〜${MAX_BODY_LENGTH}文字で入力してください。` }, 400);
  }
  if (!category || category.length > MAX_CATEGORY_LENGTH) {
    return json({ error: `カテゴリは1〜${MAX_CATEGORY_LENGTH}文字で入力してください。` }, 400);
  }

  const news = {
    id: randomUUID(),
    title,
    body,
    category,
    date: new Date().toISOString(),
  };

  try {
    await put(`news/${news.date.slice(0, 10)}-${news.id}.json`, JSON.stringify(news), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json; charset=utf-8",
      cacheControlMaxAge: 60,
    });
    return json({ ok: true, news }, 201);
  } catch {
    return json({ error: "保存できませんでした。Vercel Blobの設定を確認してください。" }, 503);
  }
}
