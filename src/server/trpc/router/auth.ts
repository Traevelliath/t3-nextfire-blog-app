import { protectedProcedure, publicProcedure, router } from '../trpc';


export const authRouter = router({
    getSession      : publicProcedure.query(async ({ ctx }) => {
        try {
            if ( !ctx.session ) return;
            const usernameObj = await ctx.prisma.user.findFirst({
                select: {
                    username: true
                },
                where : {
                    id: ctx.session?.user?.id,
                }
            });
            if ( usernameObj ) {
                const { username }   = usernameObj;
                ctx.session.user = { ...ctx.session.user, username };
            }
            return ctx.session;
        } catch (e) {
            console.log('error in isUsername procedure', e);
        }
    }),
    getSecretMessage: protectedProcedure.query(() => {
        return 'You are logged in and can see this secret message!';
    }),
});
