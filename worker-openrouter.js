/**
 * Worker для cactus-openrouter: определитель кактусов (OpenRouter) + перевод книги (DeepL).
 * В Cloudflare: Variables → OPENROUTER_API_KEY, DEEPL_API_KEY (оба Secret).
 */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const SYSTEM_PROMPT = `Ты — помощник-кактусовод. По фото определи кактус и общайся с пользователем по-дружески.

ПРАВИЛА:
- В начале ответа ОБЯЗАТЕЛЬНО напиши короткое предисловие в поле "message": что ты только обучаешься, стараешься, но можешь ошибиться, точность не гарантируешь. Свою версию названия дай. Обязательно спроси: «А как вы думаете, как он называется?» или «Что вы сами думаете?» — чтобы был разговор, а не просто ответ.
- Внимательно смотри на форму, рёбра, колючки. Не путай виды. Если не уверен — пиши «вероятно», «возможно».
- Только если на фото явно НЕ кактус — верни {"error": "На фото не кактус или изображение не распознано."}

Ответь СТРОГО в формате JSON, без markdown:
{
  "message": "Предисловие: я только учусь, могу ошибиться. По моим данным это возможно [название]. А как вы считаете, как он называется?",
  "name_ru": "Название на русском",
  "name_latin": "Латинское название",
  "region": "Страны и регионы, где растёт в природе",
  "lat": число широты (-90 до 90),
  "lon": число долготы (-180 до 180),
  "description": "Описание: форма, колючки, цветки.",
  "facts": ["факт 1", "факт 2", "факт 3"],
  "care": "Уход: свет, полив, температура, почва."
}`;

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);

    /* ── Перевод книги через DeepL ── */
    if (url.pathname === "/v1/translate" && request.method === "POST") {
      const deeplKey = env.DEEPL_API_KEY;
      if (!deeplKey) {
        return new Response(
          JSON.stringify({ error: "DEEPL_API_KEY not set. Add it in Worker Variables." }),
          { status: 503, headers: { "Content-Type": "application/json", ...CORS } }
        );
      }
      let body;
      try { body = await request.json(); } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS } });
      }
      const texts = body.texts;
      const targetLang = (body.target_lang || "EN").toUpperCase().slice(0, 2);
      if (!Array.isArray(texts) || texts.length === 0 || texts.length > 50) {
        return new Response(JSON.stringify({ error: "Send { texts: string[], target_lang: string } (1–50 segments)." }), { status: 400, headers: { "Content-Type": "application/json", ...CORS } });
      }
      const form = new URLSearchParams();
      form.set("target_lang", targetLang);
      texts.forEach((t) => form.append("text", typeof t === "string" ? t : String(t)));
      try {
        const res = await fetch("https://api-free.deepl.com/v2/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "DeepL-Auth-Key " + deeplKey,
          },
          body: form.toString(),
        });
        const data = await res.json();
        if (data.message) {
          return new Response(JSON.stringify({ error: "DeepL: " + data.message }), { status: res.status || 502, headers: { "Content-Type": "application/json", ...CORS } });
        }
        const translations = (data.translations || []).map((t) => t.text || "");
        return new Response(JSON.stringify({ translations }), { status: 200, headers: { "Content-Type": "application/json", ...CORS } });
      } catch (err) {
        return new Response(JSON.stringify({ error: "DeepL error: " + err.message }), { status: 502, headers: { "Content-Type": "application/json", ...CORS } });
      }
    }

    if (url.pathname !== "/v1/vision" || request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json", ...CORS } });
    }

    const key = env.OPENROUTER_API_KEY;
    if (!key) {
      return new Response(
        JSON.stringify({ error: "OPENROUTER_API_KEY not set" }),
        { status: 503, headers: { "Content-Type": "application/json", ...CORS } }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS } });
    }

    const imageBase64 = body.image;
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return new Response(JSON.stringify({ error: "Missing image (base64)" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS } });
    }

    const mime = body.mime === "image/png" ? "image/png" : "image/jpeg";
    const dataUrl = "data:" + mime + ";base64," + imageBase64;
    const prefaceHint = body.preface && typeof body.preface === "string" && body.preface.trim()
      ? " В поле message обязательно используй такой смысл или формулировку: «" + body.preface.trim().slice(0, 500) + "»."
      : "";

    const systemContent = SYSTEM_PROMPT + prefaceHint;

    const model = "qwen/qwen-2.5-vl-72b-instruct";

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + key,
          "HTTP-Referer": request.url || "https://cactus-openrouter.qerevv.workers.dev",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemContent },
            {
              role: "user",
              content: [
                { type: "text", text: "Определи этот кактус и верни JSON по инструкции." },
                { type: "image_url", image_url: { url: dataUrl } },
              ],
            },
          ],
          max_tokens: 1024,
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      });

      const text = await res.text();
      return new Response(text, { status: res.status, headers: { "Content-Type": "application/json", ...CORS } });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Vision error: " + err.message }),
        { status: 502, headers: { "Content-Type": "application/json", ...CORS } }
      );
    }
  },
};
