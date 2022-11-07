import { router } from "../trpc";
import { authRouter } from "./auth";
import { usernameRouter } from './username';

export const appRouter = router({
  auth: authRouter,
  username: usernameRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
