import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable("meals", (table) => {
		table.uuid("id").primary();
		table.string("name").notNullable();
		table.string("description").notNullable();
		table.datetime("datetime").notNullable();
		table.boolean("isInDiet").notNullable();
		table.uuid("userId");
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable("meals");
}
