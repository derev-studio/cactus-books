/**
 * Cloudflare Worker: AI-прокси для ТВОЕГО сайта (чат, картинки, определитель, перевод книги).
 * Размести в своём аккаунте Cloudflare — так сайт не будет блокироваться в РФ, Украине и др.
 *
 * Маршруты:
 *   POST /v1/chat/completions  → Groq Llama 3.3 70B (чат)
 *   POST /v1/image             → Cloudflare AI (генерация картинок)
 *   POST /v1/vision             → Groq Vision (определитель кактусов по фото)
 *   POST /v1/translate          → DeepL (перевод текста книги на другой язык)
 *
 * В настройках Worker:
 *   Variables → GROQ_KEY — твой API-ключ с https://console.groq.com
 *   Variables → DEEPL_API_KEY  — ключ DeepL (бесплатный тариф: https://www.deepl.com/pro-api → Free API), для перевода книги
 *   Bindings → Add → AI (для картинок)
 */

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);

    /* ── Определитель кактусов: распознавание по фото (Groq Vision) ── */
    if (url.pathname === "/v1/vision" && request.method === "POST") {
      const key = env.GROQ_KEY;
      if (!key) {
        return new Response(
          JSON.stringify({ error: "GROQ_KEY not set" }),
          { status: 503, headers: { "Content-Type": "application/json", ...cors } }
        );
      }
      let body;
      try { body = await request.json(); } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json", ...cors } });
      }
      const imageBase64 = body.image;
      if (!imageBase64 || typeof imageBase64 !== "string") {
        return new Response(JSON.stringify({ error: "Missing image (base64)" }), { status: 400, headers: { "Content-Type": "application/json", ...cors } });
      }
      const mime = (body.mime === "image/png") ? "image/png" : "image/jpeg";
      const dataUrl = "data:" + mime + ";base64," + imageBase64;

      const systemPrompt = `Ты — эксперт-кактусовод. По фото кактуса определи вид (или род, если вид не уверен).
Ответь СТРОГО в формате JSON, без markdown и без текста до/после:
{
  "name_ru": "Название на русском",
  "name_latin": "Латинское название",
  "region": "Кратко: страны и регионы, где растёт в природе (например: Мексика, юг США, Аргентина)",
  "lat": число широты центра ареала (от -90 до 90),
  "lon": число долготы центра ареала (от -180 до 180),
  "description": "Краткое описание растения: форма, колючки, цветки, размер.",
  "facts": ["интересный факт 1", "факт 2", "факт 3"],
  "care": "Уход: свет, полив, температура, почва, пересадка. Кратко и по делу."
}
Если на фото не кактус — верни {"error": "На фото не кактус или изображение не распознано."}`;

      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
          body: JSON.stringify({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
              { role: "system", content: systemPrompt },
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
        return new Response(text, { status: res.status, headers: { "Content-Type": "application/json", ...cors } });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "Vision error: " + err.message }),
          { status: 502, headers: { "Content-Type": "application/json", ...cors } }
        );
      }
    }

    /* ── Перевод текста через DeepL (для книги) ── */
    if (url.pathname === "/v1/translate" && request.method === "POST") {
      const deeplKey = env.DEEPL_API_KEY;
      if (!deeplKey) {
        return new Response(
          JSON.stringify({ error: "DEEPL_API_KEY not set. Add it in Worker Variables (see DEEPL-ИНСТРУКЦИЯ.txt)." }),
          { status: 503, headers: { "Content-Type": "application/json", ...cors } }
        );
      }
      let body;
      try { body = await request.json(); } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json", ...cors } });
      }
      const texts = body.texts;
      const targetLang = (body.target_lang || "EN").toUpperCase().slice(0, 2);
      if (!Array.isArray(texts) || texts.length === 0 || texts.length > 50) {
        return new Response(JSON.stringify({ error: "Send { texts: string[], target_lang: string } (1–50 segments)." }), { status: 400, headers: { "Content-Type": "application/json", ...cors } });
      }
      const form = new URLSearchParams();
      form.set("auth_key", deeplKey);
      form.set("target_lang", targetLang);
      texts.forEach((t) => form.append("text", typeof t === "string" ? t : String(t)));
      try {
        const res = await fetch("https://api-free.deepl.com/v2/translate", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: form.toString(),
        });
        const data = await res.json();
        if (data.message) {
          return new Response(JSON.stringify({ error: "DeepL: " + data.message }), { status: res.status || 502, headers: { "Content-Type": "application/json", ...cors } });
        }
        const translations = (data.translations || []).map((t) => t.text || "");
        return new Response(JSON.stringify({ translations }), { status: 200, headers: { "Content-Type": "application/json", ...cors } });
      } catch (err) {
        return new Response(JSON.stringify({ error: "DeepL error: " + err.message }), { status: 502, headers: { "Content-Type": "application/json", ...cors } });
      }
    }

    /* ── Генерация картинок через Cloudflare AI ── */
    if (url.pathname === "/v1/image") {
      if (!env.AI) {
        return new Response(
          JSON.stringify({ error: "AI binding not configured. Add AI binding in Worker settings." }),
          { status: 503, headers: { "Content-Type": "application/json", ...cors } }
        );
      }
      let body;
      try { body = await request.json(); } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json", ...cors } });
      }
      const prompt = body.prompt || "beautiful landscape";
      try {
        const result = await env.AI.run("@cf/black-forest-labs/flux-1-schnell", { prompt });

        let imageData;
        if (result && typeof result.getReader === "function") {
          const reader = result.getReader();
          const chunks = [];
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
          const total = chunks.reduce((s, c) => s + c.length, 0);
          imageData = new Uint8Array(total);
          let offset = 0;
          for (const chunk of chunks) { imageData.set(chunk, offset); offset += chunk.length; }
        } else if (result instanceof Uint8Array) {
          imageData = result;
        } else if (result instanceof ArrayBuffer) {
          imageData = new Uint8Array(result);
        } else if (result && result.image) {
          const bin = atob(result.image);
          imageData = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) imageData[i] = bin.charCodeAt(i);
        } else {
          return new Response(
            JSON.stringify({ error: "Unknown format", type: typeof result }),
            { status: 502, headers: { "Content-Type": "application/json", ...cors } }
          );
        }

        /* Конвертируем в base64 — браузер может сразу поставить в img.src */
        let binary = "";
        for (let i = 0; i < imageData.length; i++) {
          binary += String.fromCharCode(imageData[i]);
        }
        const base64 = btoa(binary);

        return new Response(
          JSON.stringify({ image: base64 }),
          { status: 200, headers: { "Content-Type": "application/json", ...cors } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "Image generation failed: " + err.message }),
          { status: 502, headers: { "Content-Type": "application/json", ...cors } }
        );
      }
    }

    /* ── Чат через Groq ── */
    if (request.method !== "POST") {
      return new Response("Only POST allowed", { status: 405, headers: cors });
    }

    const key = env.GROQ_KEY;
    if (!key) {
      return new Response(
        JSON.stringify({ error: { message: "GROQ_KEY not set in Worker Variables", code: 503 } }),
        { status: 503, headers: { "Content-Type": "application/json", ...cors } }
      );
    }

    let body;
    try { body = await request.text(); } catch {
      return new Response(JSON.stringify({ error: { message: "Failed to read body", code: 400 } }),
        { status: 400, headers: { "Content-Type": "application/json", ...cors } });
    }

    let parsed;
    try { parsed = JSON.parse(body); } catch {
      return new Response(JSON.stringify({ error: { message: "Invalid JSON", code: 400 } }),
        { status: 400, headers: { "Content-Type": "application/json", ...cors } });
    }

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: parsed.messages || [],
          temperature: parsed.temperature || 0.8,
          max_tokens: parsed.max_tokens || 800,
        }),
      });
      const text = await res.text();
      return new Response(text, { status: res.status, headers: { "Content-Type": "application/json", ...cors } });
    } catch (err) {
      return new Response(JSON.stringify({ error: { message: "Groq error: " + err.message, code: 502 } }),
        { status: 502, headers: { "Content-Type": "application/json", ...cors } });
    }
  },
};
