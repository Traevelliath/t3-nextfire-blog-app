import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { type Session } from 'next-auth';


export default function PostFeed({ posts, admin, user }: PostFeedProps) {
    const userData = useSession();
    if ( posts && posts[0]?.authorId === userData.data?.user?.id ) {
        admin = true;
    }

    return <>
        {
            posts ? posts.map((post) => <PostItem post={ post } key={ post.slug } admin={ admin } user={user}/>) : null
        }
    </>;
}

function PostItem({ post, admin, user }: PostItemProps) {
    // Naive method to calc word count and read time
    const wordCount     = post?.content.trim().split(/\s+/g).length;
    const minutesToRead = (wordCount / 100 + 1).toFixed(0);
    return (
        <div className='card'>
            <Link href={ `/${ user?.username }` }>
                <strong>By @{ user?.username }</strong>
            </Link>

            <Link href={ `/${ user?.username }/${ post.slug }` }>
                <h2>
                    { post.title }
                </h2>
            </Link>

            <footer>
        <span>
          { wordCount } words. { minutesToRead } min read
        </span>
                <span className='push-left'>💗 { post.likesCount || 0 } Hearts</span>
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
    likesCount: number
    authorId: string
}

type PostItemProps = {
    post: Post
    admin: boolean
    user: Session['user'] | null
}

type PostFeedProps = {
    posts: Post[] | null
    admin: boolean
    user: Session['user'] | null
}