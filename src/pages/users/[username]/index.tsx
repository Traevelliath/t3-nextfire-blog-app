import UserProfile from '../../../components/UserProfile.component';
import PostFeed, { type Post } from '../../../components/PostFeed.component';
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import { appRouter } from '../../../server/trpc/router/_app';
import { createContextInner } from '../../../server/trpc/context';
import superjson from 'superjson';


export default function UserPage(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const { user, posts } = props;

    return <main>
        <UserProfile user={ user }/>
        <PostFeed posts={ posts } admin={ false } userPage={true}/>
    </main>;
}


export async function getServerSideProps(context: GetServerSidePropsContext<{ username: string }>) {
    const ssg      = createProxySSGHelpers({
        router     : appRouter,
        ctx        : await createContextInner({ session: null }),
        transformer: superjson,
    });
    const username = context.query.username as string;

    const user      = await ssg.user.getUser.fetch({ username }) ?? null;
    console.log(user)
    const postsData = await ssg.user.getPosts.fetch({ id: user?.id }) ?? null;
    const posts     = JSON.parse(JSON.stringify(postsData)) as Post[];

    if (!user) {
        return {
            notFound: true
        }
    }

    return {
        props: {
            trpcState: ssg.dehydrate(),
            user,
            posts
        }
    };
}
