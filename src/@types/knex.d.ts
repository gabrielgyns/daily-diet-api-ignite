import { Knex } from "knex";

declare module "knex/types/tables" {
	export interface Tables {
		meals: {
			id: string;
			name: string;
			description: string;
			datetime: Date;
			isInDiet: boolean;
			userId?: string;
		};
	}
}
