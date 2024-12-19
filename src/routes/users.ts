import { randomUUID } from "node:crypto";

import { FastifyInstance } from "fastify";
import { z } from "zod";

import { knex } from "../database";

export async function usersRoutes(app: FastifyInstance) {
	app.post("/", async (request, reply) => {
		const createUserBodySchema = z.object({
			name: z.string(),
			login: z.string(),
		});

		const { name, login } = createUserBodySchema.parse(request.body);

		const user = await knex("users").where({ login }).first();

		if (user) {
			return reply.status(400).send({ message: "User already exists" });
		}

		const { id } = await knex("users")
			.insert({
				id: randomUUID(),
				name,
				login,
			})
			.returning("id")
			.first();

		reply.setCookie("userId", id, {
			path: "/",
			maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
		});

		return reply.status(201).send();
	});
}
