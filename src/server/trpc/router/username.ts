import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';


export const usernameRouter = router({
    getUsername: protectedProcedure
        .input(
            z.object({
                username: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            try {
                return await ctx.prisma.user.findFirst({
                    select: {
                        username: true
                    },
                    where: {
                        username: input.username
                    }
                });
            } catch (e) {
                console.log(e);
            }
        }),
    setUsername: protectedProcedure
        .input(
            z.object({
                username: z.string().regex(/^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/),
            })
        )
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.user.update({
                    where: {
                        id: ctx.session.user.id
                    },
                    data: {
                        username: input.username
                    }
                });
            } catch (e) {
                console.log(e);
            }
        }),
});