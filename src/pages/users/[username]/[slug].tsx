import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import { appRouter } from '../../../server/trpc/router/_app';
import superjson from 'superjson';
import { createContextInner } from '../../../server/trpc/context';
import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next';
import { Post } from '../../../components/PostFeed.component';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { trpc } from '../../../utils/trpc';
import AuthCheck from '../../../components/AuthCheck.Component.jsx';
import LikeButton from '../../../components/LikeButton.component';
import { useSession } from 'next-auth/react';


function Post({ post }: InferGetStaticPropsType<typeof getStaticProps>) {
    if ( !post ) return <div>
        <p>There is nothing here...</p>
    </div>;

    const createdAt = new Date(post.createdAt);

    return (
        <div className='card'>
            <h1>{ post.title }</h1>
            <span className='text-sm'>
                    Written by{ ' ' }
                <Link href={ `/users/${ post.authorUsername }/` } className='text-info'>
                        @{ post.authorUsername }
                </Link>{ ' ' }
                on { createdAt.toUTCString() }
            </span>
            <ReactMarkdown>{ post.content }</ReactMarkdown>
        </div>
    );
}

export default function PostPage({ post }: InferGetStaticPropsType<typeof getStaticProps>) {
    const { data: session } = useSession();
    if ( !post ) return;

    let isLiked;

    const { data }  = trpc.posts.getPostBySlug.useQuery(post.slug);
    const likedPost = trpc.user.isPostLiked.useQuery(
        { userId: session?.user?.id, postId: post.id },
        { enabled: Boolean(session?.user?.id) }
    );

    if ( likedPost.data ) {
        isLiked = likedPost.data.length > 0;
    }

    const likesCount = trpc.posts.likesCount.useQuery({id: post.id})
    const likes = likesCount.data?._count.userLikes

    const postData = data || post;

    return (
        <main>
            <section>
                <Post post={ postData }/>
            </section>

            <aside className='card'>
                <p>
                    <strong>{ likesCount.isLoading ? '...' :  likes } 🤍</strong>
                </p>
                <AuthCheck>
                    <LikeButton post={ post } isLiked={ isLiked }/>
                </AuthCheck>
            </aside>
        </main>
    );
}

export async function getStaticProps({ params }: GetStaticPropsContext<Params>) {
    const ssg = await createProxySSGHelpers({
        router     : appRouter,
        ctx        : await createContextInner({ session: null }),
        transformer: superjson,
    });

    if ( !params ) {
        return {
            notFound: true,
        };
    }

    let post = null;

    const { username, slug } = params;
    const user               = await ssg.user.getUser.fetch({ username });


    if ( user ) {
        const postRef = await ssg.posts.getPostBySlug.fetch(slug);
        post          = JSON.parse(JSON.stringify(postRef)) as Post;
    }

    return {
        props     : { post },
        revalidate: 5000,
    };
}

export async function getStaticPaths() {
    const ssg = await createProxySSGHelpers({
        router     : appRouter,
        ctx        : await createContextInner({ session: null }),
        transformer: superjson,
    });

    const postsSnapshot = await ssg.posts.getInitialPostsCollection.fetch();

    const paths = postsSnapshot?.map(post => {
        const { authorUsername, slug } = post;
        return {
            params: { username: authorUsername, slug }
        };
    });

    return {
        paths,
        fallback: 'blocking'
    };
}

type Params = {
    username: string,
    slug: string
}