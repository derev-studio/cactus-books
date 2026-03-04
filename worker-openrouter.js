/**
 * Worker для cactus-openrouter: определитель кактусов (OpenRouter) + перевод книги (DeepL) + картинки (Hugging Face).
 * В Cloudflare: Variables → OPENROUTER_API_KEY, DEEPL_API_KEY, HUGGINGFACE_TOKEN (все Secret).
 * Рисование в Колючем Собеседнике: добавь HUGGINGFACE_TOKEN (бесплатный на huggingface.co/settings/tokens).
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

    /* ── Генерация картинки: сначала HF (если есть токен), иначе AI Horde (бесплатно, без ключей) ── */
    if (url.pathname === "/v1/image" && request.method === "POST") {
      let imgBody;
      try { imgBody = await request.json(); } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS } });
      }
      const prompt = typeof imgBody.prompt === "string" ? imgBody.prompt.trim().slice(0, 500) : "";
      if (!prompt) {
        return new Response(JSON.stringify({ error: "Missing prompt" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS } });
      }

      const hfToken = env.HUGGINGFACE_TOKEN;
      if (hfToken) {
        try {
          const hfRes = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0", {
            method: "POST",
            headers: { "Authorization": "Bearer " + hfToken, "Content-Type": "application/json" },
            body: JSON.stringify({ inputs: prompt }),
          });
          if (hfRes.ok) {
            const blob = await hfRes.arrayBuffer();
            const bytes = new Uint8Array(blob);
            let binary = "";
            for (let i = 0; i < bytes.length; i += 8192) {
              binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
            }
            return new Response(JSON.stringify({ image: btoa(binary) }), { status: 200, headers: { "Content-Type": "application/json", ...CORS } });
          }
        } catch (_) {}
      }

      /* AI Horde (Stable Horde) — бесплатно, apikey 0000000000, без CORS-проблем ── */
      const base = "https://stablehorde.net/api/v2";
      const sub = await fetch(base + "/generate/async", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt + ", beautiful art, detailed",
          params: { width: 512, height: 512, steps: 20, n: 1 },
          apikey: "0000000000",
        }),
      });
      if (!sub.ok) {
        return new Response(JSON.stringify({ error: "Horde submit failed" }), { status: 502, headers: { "Content-Type": "application/json", ...CORS } });
      }
      const subData = await sub.json();
      const id = subData.id;
      if (!id) {
        return new Response(JSON.stringify({ error: "Horde no id" }), { status: 502, headers: { "Content-Type": "application/json", ...CORS } });
      }
      const deadline = Date.now() + 28000;
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 3000));
        const stRes = await fetch(base + "/generate/status/" + id);
        if (!stRes.ok) continue;
        const st = await stRes.json();
        if (st.faulted || st.is_possible === false) {
          return new Response(JSON.stringify({ error: "Horde faulted" }), { status: 502, headers: { "Content-Type": "application/json", ...CORS } });
        }
        if (st.done && st.generations && st.generations[0] && st.generations[0].img) {
          return new Response(JSON.stringify({ image: st.generations[0].img }), { status: 200, headers: { "Content-Type": "application/json", ...CORS } });
        }
      }
      return new Response(JSON.stringify({ error: "Horde timeout" }), { status: 504, headers: { "Content-Type": "application/json", ...CORS } });
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
