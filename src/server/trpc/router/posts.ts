import { protectedProcedure, publicProcedure, router } from '../trpc';
import { z } from 'zod';


export const postsRouter = router({
    getInitialPostsCollection: publicProcedure
        .query(async ({ ctx }) => {
            try {
                return await ctx.prisma.post.findMany({
                    where  : {
                        published: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take   : 10,
                });
            } catch (e) {
                console.log('error getting initial posts collection', e);
            }
        }),
    getPostsCollection       : publicProcedure
        .input(
            z.object({
                skip  : z.number().optional(),
                take  : z.number().optional(),
                cursor: z.string().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            try {
                return await ctx.prisma.post.findMany({
                    where  : {
                        published: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    skip   : input.skip ?? 0,
                    take   : input.take ?? 10,
                    cursor : {
                        createdAt: input.cursor,
                    }
                });
            } catch (e) {
                console.log('error getting posts collection', e);
            }
        }),
    getPostBySlug            : publicProcedure
        .input(
            z.string().optional()
        )
        .query(async ({ ctx, input }) => {
            try {
                return await ctx.prisma.post.findFirst({
                    where: {
                        slug: input
                    }
                });
            } catch (e) {
                console.log('error getting post by slug', e);
            }
        }),
    createNewPost            : protectedProcedure
        .input(
            z.object({
                    title         : z.string(),
                    slug          : z.string(),
                    authorId      : z.string(),
                    authorUsername: z.string(),
                    content       : z.string(),
                    likesCount    : z.number()
                }
            )
        )
        .mutation(async ({ ctx, input }) => {
                try {
                    return await ctx.prisma.post.create({
                        data: {
                            title         : input.title,
                            slug          : input.slug,
                            authorId      : input.authorId,
                            authorUsername: input.authorUsername,
                            content       : input.content,
                            likesCount    : input.likesCount
                        }
                    });
                } catch (e) {
                    console.log('Error creating new post', e);
                }
            }
        ),
    updatePost               : protectedProcedure
        .input(
            z.object({
                id       : z.string(),
                content  : z.string(),
                published: z.boolean()
            })
        )
        .mutation(async ({ ctx, input }) => {
            try {
                return await ctx.prisma.post.update({
                    where: {
                        id: input.id
                    },
                    data : {
                        content  : input.content,
                        published: input.published,
                        updatedAt: new Date()
                    }
                });
            } catch (e) {
                console.log('error updating the post', e);
            }
        }),
    likePost                 : protectedProcedure
        .input(
            z.object({
                id: z.string(),
                isLiked: z.boolean()
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userLikes  = input.isLiked ?
                               { disconnect: [ { id: ctx.session.user.id } ] } :
                               { set: [ { id: ctx.session.user.id } ] };

            try {
                return await ctx.prisma.post.update({
                    where: {
                        id: input.id
                    },
                    data : {
                        userLikes
                    },
                });
            } catch (e) {
                console.log('error liking a post', e);
            }
        }),
    likesCount: publicProcedure
        .input(
            z.object({
                id: z.string()
            })
        )
        .query(async ({ctx, input}) => {
            try {
                return await ctx.prisma.post.findUnique({
                    where: {
                        id: input.id
                    },
                    select: {
                        _count: {
                            select: { userLikes: true }
                        }
                    }
                })
            } catch (e) {
                console.log('Error counting likes', e)
            }
        })
});