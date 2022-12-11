import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { trpc } from '../utils/trpc';


export default function PostFeed({ posts, admin, userPage }: PostFeedProps) {
    const userData = useSession();
    if ( posts && posts[0]?.authorId === userData.data?.user?.id ) {
        admin = true;
    }

    return <>
        {
            posts ?
            posts.map((post) =>
                <PostItem post={ post } key={ post.slug } admin={ admin } userPage={userPage}/>
            ) :
            null
        }
    </>;
}

function PostItem({ post, admin, userPage }: PostItemProps) {
    // Naive method to calc word count and read time
    const wordCount     = post?.content.trim().split(/\s+/g).length;
    const minutesToRead = (wordCount / 100 + 1).toFixed(0);

    const likesCount = trpc.posts.likesCount.useQuery({id: post.id})
    const likes = likesCount.data?._count.userLikes

    return (
        <div className='card'>
            <Link href={ `${userPage ? '' : 'users/'}${ post?.authorUsername }` }>
                <strong>By @{ post?.authorUsername }</strong>
            </Link>
            <Link href={ `${userPage ? '' : 'users/'}${ post?.authorUsername }/${ post.slug }` } replace>
                <h2>
                    { post.title }
                </h2>
            </Link>
            <footer>
        <span>
          { wordCount } words. { minutesToRead } min read
        </span>
                <span className='push-left'>💗 { likesCount.isLoading ? '...' :  likes } Likes</span>
            </footer>

            {/* If admin view, show extra controls for user */ }
            { admin && (
                <>
                    <Link href={ `/admin/${ post.slug }` }>
                        <h3>
                            <button className='btn-blue'>Edit</button>
                        </h3>
                    </Link>

                    { post.published ? <p className='text-success'>Live</p> : <p
                        className='text-danger'>Unpublished</p> }
                </>
            ) }
        </div>
    );
}

export type Post = {
    id: string
    title: string
    slug: string
    content: string
    published: boolean
    createdAt: Date
    updatedAt: Date
    authorId: string
    authorUsername: string
}

type PostItemProps = {
    post: Post
    admin: boolean
    userPage: boolean
}

type PostFeedProps = {
    posts: Post[] | null
    admin: boolean
    userPage: boolean
}