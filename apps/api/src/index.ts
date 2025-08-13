import { serve } from "@hono/node-server";
import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { describeRoute, openAPISpecs } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import z from "zod";

const app = new Hono();

app.get(
	"/",
	describeRoute({
		description: "Say hello to the user",
		responses: {
			200: {
				description: "Successful greeting response",
				content: {
					"text/plain": {
						schema: resolver(z.string()),
					},
				},
			},
		},
	}),
	zValidator(
		"query",
		z.object({
			name: z.string().optional(),
		}),
	),
	(c) => {
		const query = c.req.valid("query");
		return c.text(`Hello ${query?.name ?? "Hono"}!`);
	},
);

app.get(
	"/openapi",
	openAPISpecs(app, {
		documentation: {
			info: {
				title: "Chatly",
				version: "0.0.0",
				license: {
					name: "MIT",
					url: "https://github.com/karanravindra/chatly/blob/main/LICENSE",
				},
			},
			servers: [
				{
					url: "http://localhost:3000",
					description: "Local server",
				},
			],
		},
	}),
);

app.get(
	"/docs",
	Scalar({
		url: "/openapi",
	}),
);

serve(
	{
		fetch: app.fetch,
		port: 3000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
