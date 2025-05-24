import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
	OPEN_AI_KEY: string;
	AI : Ai;
	HUGGINGFACE_API_TOKEN: string;
}

const app = new Hono<{ Bindings: Bindings }>();

app.use(
	'/*',
	cors({
		origin: '*',
		allowHeaders: ['Content-Type', 'X-Custom-Header' , 'Upgrade-Insecure-Requests'],
		allowMethods: ['GET', 'POST', 'OPTIONS' , 'PUT'],
		exposeHeaders: ['X-Kuma-Revision' , 'Content-Length'],
		maxAge: 600,
		credentials: true
	})
);

async function hfInference(endpoint: string, body: any, token: string) {
	const res = await fetch(`https://api-inference.huggingface.co/models/${endpoint}`, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
	const text = await res.text();
	try {
		return JSON.parse(text);
	} catch {
		console.log('HF Non-JSON Response:', text);
		return { error: text };
	}
}

app.post('/chatToDocument', async (c) => {
	const { documentData, question } = await c.req.json();
	const context = typeof documentData === 'string' ? documentData : JSON.stringify(documentData);
	const prompt = `Context: ${context}\n\nQuestion: ${question}\n\nAnswer:`;
	const hfRes = await hfInference('tiiuae/falcon-7b-instruct', { inputs: prompt }, c.env.HUGGINGFACE_API_TOKEN);
	console.log('HF Response (chatToDocument):', JSON.stringify(hfRes));
	let message = '';
	if (hfRes && hfRes.error) {
		message = `Hugging Face API error: ${hfRes.error}`;
	} else if (Array.isArray(hfRes) && hfRes[0] && typeof hfRes[0] === 'object' && 'generated_text' in hfRes[0]) {
		message = (hfRes[0] as any).generated_text || '';
	} else if (hfRes && typeof hfRes === 'object' && 'generated_text' in hfRes) {
		message = (hfRes as any).generated_text || '';
	} else {
		message = JSON.stringify(hfRes);
	}
	return c.json({ message, raw: hfRes });
});

app.post('/translateDocument', async (c) => {
	const { documentData, targetLang } = await c.req.json();
	const context = typeof documentData === 'string' ? documentData : JSON.stringify(documentData);
	// 1. Tóm tắt
	const summaryRes = await hfInference('facebook/bart-large-cnn', { inputs: context }, c.env.HUGGINGFACE_API_TOKEN);
	console.log('Summary Response (translateDocument):', JSON.stringify(summaryRes));
	let summary = '';
	if (Array.isArray(summaryRes) && summaryRes[0] && typeof summaryRes[0] === 'object' && 'summary_text' in summaryRes[0]) {
		summary = (summaryRes[0] as any).summary_text || '';
	} else if (summaryRes && typeof summaryRes === 'object' && 'summary_text' in summaryRes) {
		summary = (summaryRes as any).summary_text || '';
	} else {
		summary = JSON.stringify(summaryRes);
	}
	// 2. Dịch
	const translateRes = await hfInference('facebook/m2m100_418M', { inputs: summary, parameters: { src_lang: 'en', tgt_lang: targetLang } }, c.env.HUGGINGFACE_API_TOKEN);
	console.log('Translate Response (translateDocument):', JSON.stringify(translateRes));
	let translated_text = '';
	if (Array.isArray(translateRes) && translateRes[0] && typeof translateRes[0] === 'object' && 'translation_text' in translateRes[0]) {
		translated_text = (translateRes[0] as any).translation_text || '';
	} else if (translateRes && typeof translateRes === 'object' && 'translation_text' in translateRes) {
		translated_text = (translateRes as any).translation_text || '';
	} else {
		translated_text = JSON.stringify(translateRes);
	}
	return c.json({ translated_text, raw: { summaryRes, translateRes } });
});

export default app;