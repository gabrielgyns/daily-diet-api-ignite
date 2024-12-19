import { FastifyReply, FastifyRequest } from "fastify";

export async function checkUserIdExists(
	req: FastifyRequest,
	reply: FastifyReply
) {
	const { userId } = req.cookies;

	if (!userId) {
		return reply.status(401).send({
			error: "Action Unauthorized",
		});
	}
}
