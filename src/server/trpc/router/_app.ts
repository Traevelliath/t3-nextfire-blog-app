import { router } from "../trpc";
import { authRouter } from "./auth";
import { usernameRouter } from './username';
import { userRouter } from './user';

export const appRouter = router({
  auth: authRouter,
  username: usernameRouter,
  user: userRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
