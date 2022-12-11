import AuthCheck from '../../components/AuthCheck.Component.jsx';
import { trpc } from '../../utils/trpc';
import { useSession } from 'next-auth/react';
import PostFeed from '../../components/PostFeed.component';
import SpinnerComponent from '../../components/Spinner.component';
import kebabCase from 'lodash.kebabcase';
import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { type Session } from 'next-auth';


export default function AdminPostPage() {
    const { data: session } = useSession();

    return (
        <main>
            <AuthCheck>
                <CreateNewPost session={ session }/>
                <PostList session={ session }/>
            </AuthCheck>
        </main>
    );
}

const PostList = ({ session }: PostProps) => {
    let posts = null;

    const { data, isLoading } = trpc.user.getAllPosts.useQuery({ id: session?.user?.id  });
    if ( data ) {
        posts = JSON.parse(JSON.stringify(data));
    }

    return (
        <>
            <h1>Manage Your Posts</h1>
            { isLoading ?
              <SpinnerComponent show={ isLoading }/> :
              <PostFeed posts={ posts } admin userPage={false}/> }
        </>
    );
};

const CreateNewPost = ({ session }: PostProps) => {
    const router              = useRouter();
    const [ title, setTitle ] = useState('');

    const { data: user, isLoading } = trpc.user.getUserById.useQuery({ id: session?.user?.id });
    const username                  = user?.username;
    const setPost                   = trpc.posts.createNewPost.useMutation({
        onSuccess: () => {
            toast.success('Post created successfully!');
            router.push(`/admin/${ slug }`);
        },
        onError  : (e) => {
            toast.error('Error creating new post!');
            console.log(e);
        }
    });

    const slug = encodeURI(kebabCase(title));

    const titleValidation = title.length > 3 && title.length < 100;

    const createPost = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if ( !session || !session.user || !username ) return;

        const data = {
            title,
            slug,
            authorId      : session.user.id,
            authorUsername: username,
            content       : '# Hello World',
            likesCount    : 0
        };

        setPost.mutate(data);
    };

    return (
        <form onSubmit={ createPost }>
            <input
                value={ title }
                onChange={ (e) => setTitle(e.target.value) }
                placeholder='My Awesome Article!'
            />
            <p>
                <strong>Slug:</strong> { isLoading ? 'Loading data...' : slug }
            </p>
            <button type='submit' disabled={ !(titleValidation && slug && !isLoading) } className='btn-green'>
                Create New Post
            </button>
        </form>
    );
};

type PostProps = {
    session: Session | null
}
