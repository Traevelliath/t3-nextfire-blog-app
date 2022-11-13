import { publicProcedure, router } from '../trpc';
import { z } from 'zod';


export const userRouter = router({
    getUser    : publicProcedure
        .input(z.object({
                username: z.string()
            }
        ))
        .query(async ({ ctx, input }) => {
            try {
                return await ctx.prisma.user.findFirst({
                    where: {
                        username: input.username
                    }
                });
            } catch (e) {
                console.log('Error getting user data', e);
            }
        }),
    getUserById: publicProcedure
        .input(z.object({
                id: z.string().optional()
            }
        ))
        .query(async ({ ctx, input }) => {
            try {
                return await ctx.prisma.user.findFirst({
                    where: {
                        id: input.id
                    }
                });
            } catch (e) {
                console.log('Error getting user data', e);
            }
        }),
    getPosts   : publicProcedure
        .input(z.object({ id: z.string().optional() }))
        .query(async ({ ctx, input }) => {
            try {
                return await ctx.prisma.post.findMany({
                    where: {
                        authorId : input.id,
                        published: true
                    }
                });
            } catch (e) {
                console.log('Error getting user posts', e);
            }
        })
});
