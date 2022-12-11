import SpinnerComponent from '../components/Spinner.component';
import type { InferGetServerSidePropsType } from 'next';
import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import { appRouter } from '../server/trpc/router/_app';
import { createContextInner } from '../server/trpc/context';
import superjson from 'superjson';
import type { Post } from '../components/PostFeed.component';
import { useState } from 'react';
import { trpc } from '../utils/trpc';
import PostFeed from '../components/PostFeed.component';


export default function Home(
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
    const [ posts, setPosts ]     = useState(props.posts);
    const [ loading, setLoading ] = useState(false);
    const [ feedEnd, setFeedEnd ] = useState(false);

    const utils = trpc.useContext();
    const TAKE  = 1;

    const getMorePosts = async () => {
        if (!posts) return setFeedEnd(true);
        setLoading(true);

        const cursor   = posts[posts.length - 1]?.createdAt.toString()
        const newPosts = await utils.posts.getPostsCollection.fetch({ skip: 1, cursor }) as Post[];

        setPosts(posts.concat(newPosts));
        setLoading(false);

        if ( newPosts.length < TAKE ) {
            setFeedEnd(true);
        }
    };

    return (
        <main>
            <PostFeed posts={ posts } admin={false} userPage={false}/>

            { !loading && !feedEnd && <button onClick={ getMorePosts }>Load more</button> }

            <SpinnerComponent show={ loading }/>

            { feedEnd && 'You have reached the end!' }
        </main>
    );
}

export async function getServerSideProps() {
    const ssg = createProxySSGHelpers({
        router     : appRouter,
        ctx        : await createContextInner({ session: null }),
        transformer: superjson,
    });
    let posts = null;


    const postsData = await ssg.posts.getInitialPostsCollection.fetch() ?? null;
    if ( postsData ) {
        posts = postsData?.map(post => JSON.parse(JSON.stringify(post))) as Post[];
    }

    return {
        props: {
            trpcState: ssg.dehydrate(),
            posts
        }
    };
}

