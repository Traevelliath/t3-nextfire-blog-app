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
        .input(
            z.object({
                id: z.string().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            try {
                return await ctx.prisma.post.findMany({
                    where: {
                        authorId : input.id,
                        published: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                });
            } catch (e) {
                console.log('Error getting user posts', e);
            }
        }),
    getAllPosts   : publicProcedure
        .input(
            z.object({
                id: z.string().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            try {
                return await ctx.prisma.post.findMany({
                    where: {
                        authorId : input.id,
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                });
            } catch (e) {
                console.log('Error getting user posts', e);
            }
        }),
    isPostLiked: publicProcedure
        .input(
            z.object({
                userId: z.string().optional(),
                postId: z.string()
            })
        )
        .query(async ({ctx, input}) => {
            try {
                const userWithLikedPosts = await ctx.prisma.user.findUnique({
                    where: {id: input.userId},
                    include: {likedPosts: true}
                });
                return userWithLikedPosts?.likedPosts
                                         .filter(post => post.id === input.postId)
                                         .map(post => post.id)
            } catch (e) {
                console.log('Error retrieving like data', e)
            }
        })
});
