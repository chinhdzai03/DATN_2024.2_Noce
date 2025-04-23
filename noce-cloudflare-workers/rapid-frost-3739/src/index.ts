
import OpenAI from 'openai';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
	OPEN_AI_KEY: string;
	AI : Ai;
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

app.post('/chatToDocument' , async (c) => {
	const openai = new OpenAI({
		apiKey: c.env.OPEN_AI_KEY,
	});

	const {documentData , question} = await c.req.json();

	const chatCompletion = await openai.chat.completions.create({
		messages : [
			{
				role : 'system',
				content: 'You are a assistant that helps people find information.' + documentData,
			},
			{
				role : 'user',
				content : 'My question is : ' + question,
			}
		],
		model : 'gpt-4o',
		temperature : 0.5,
	})

	const reponse = chatCompletion.choices[0].message.content;

	return c.json({message : reponse});
})


app.post('/translateDocument' , async (c) => {
	const { documentData , targetLang } = await c.req.json();

	// Generate a summary of the document
	const summaryResponse = await c.env.AI.run('@cf/facebook/bart-large-cnn' , {
		input_text : documentData,
		max_length : 1000,
	} );

	// translate the sumary into another language
	const response = await c.env.AI.run('@cf/meta/m2m100-1.2b' , {
		text : summaryResponse.summary,
		source_lang : 'english',
		target_lang : targetLang,
	} );

	return new Response(JSON.stringify(response));
})

export default app;