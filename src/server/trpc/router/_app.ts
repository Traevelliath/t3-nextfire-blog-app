import { router } from "../trpc";
import { authRouter } from "./auth";
import { usernameRouter } from './username';
import { userRouter } from './user';
import { postsRouter } from './posts';

export const appRouter = router({
  auth: authRouter,
  username: usernameRouter,
  user: userRouter,
  posts: postsRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
