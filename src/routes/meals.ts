import { randomUUID } from "node:crypto";

import { FastifyInstance } from "fastify";
import { z } from "zod";

import { knex } from "../database";
import { checkUserIdExists } from "../middlewares/check-user-id-exists";

export async function mealsRoutes(app: FastifyInstance) {
	app.post(
		"/",
		{
			preHandler: [checkUserIdExists],
		},
		async (request, reply) => {
			const { userId } = request.cookies;

			const createMealsBodySchema = z.object({
				name: z.string(),
				description: z.string(),
				datetime: z.coerce.date(),
				isInDiet: z.boolean(),
			});

			const { name, description, datetime, isInDiet } =
				createMealsBodySchema.parse(request.body);

			await knex("meals").insert({
				id: randomUUID(),
				name,
				description,
				datetime,
				isInDiet,
				userId,
			});

			return reply.status(201).send();
		}
	);

	app.get(
		"/",
		{
			preHandler: [checkUserIdExists],
		},
		async (request, reply) => {
			const { userId } = request.cookies;

			const meals = await knex("meals")
				.where({ userId })
				.orderBy("datetime", "desc");

			return reply.send({ meals });
		}
	);

	app.get(
		"/:id",
		{
			preHandler: [checkUserIdExists],
		},
		async (request) => {
			const getMealParamsSchema = z.object({
				id: z.string().uuid(),
			});

			const { id } = getMealParamsSchema.parse(request.params);
			const { userId } = request.cookies;

			const meal = await knex("meals").select().where({ id, userId }).first();

			return { meal };
		}
	);

	app.put(
		"/:id",
		{
			preHandler: [checkUserIdExists],
		},
		async (request, reply) => {
			const { userId } = request.cookies;

			const getMealParamsSchema = z.object({
				id: z.string().uuid(),
			});
			const { id } = getMealParamsSchema.parse(request.params);

			const createMealsBodySchema = z.object({
				name: z.string().optional(),
				description: z.string().optional(),
				datetime: z.coerce.date().optional(),
				isInDiet: z.boolean().optional(),
			});
			const { name, description, datetime, isInDiet } =
				createMealsBodySchema.parse(request.body);

			await knex("meals")
				.update({
					name,
					description,
					datetime,
					isInDiet,
				})
				.where({ id, userId });

			return reply.status(201).send();
		}
	);

	app.delete(
		"/:id",
		{
			preHandler: [checkUserIdExists],
		},
		async (request, reply) => {
			const { userId } = request.cookies;

			const getMealParamsSchema = z.object({
				id: z.string().uuid(),
			});
			const { id } = getMealParamsSchema.parse(request.params);

			await knex("meals").delete().where({ id, userId });

			return reply.status(204).send();
		}
	);

	app.get(
		"/metrics",
		{
			preHandler: [checkUserIdExists],
		},
		async (request) => {
			const { userId } = request.cookies;

			const meals = await knex("meals").where({ userId }).orderBy("datetime");

			let bestSequence = 0;
			let currentSequence = 0;

			for (const meal of meals) {
				if (meal.isInDiet) {
					currentSequence++;
					bestSequence = Math.max(bestSequence, currentSequence);
				} else {
					currentSequence = 0;
				}
			}

			return {
				totalMealsRegistered: meals.length,
				totalMealsInDiet: meals.filter((meal) => meal.isInDiet).length,
				totalMealsNotInDiet: meals.filter((meal) => !meal.isInDiet).length,
				bestSequenceInDiet: bestSequence,
			};
		}
	);
}
