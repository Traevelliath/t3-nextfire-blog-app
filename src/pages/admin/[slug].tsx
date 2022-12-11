import AuthCheck from '../../components/AuthCheck.Component.jsx';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useState } from 'react';
import { trpc } from '../../utils/trpc';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SpinnerComponent from '../../components/Spinner.component';
import { type Post } from '../../components/PostFeed.component';


export default function AdminPostEdit({}) {
    return (
        <AuthCheck>
            <PostEditor/>
        </AuthCheck>
    );
}

const PostEditor = () => {
    const [ preview, setPreview ] = useState(false);

    const router = useRouter();
    const slug   = router.query.slug as string;

    const { data: post, isLoading } = trpc.posts.getPostBySlug.useQuery(slug);

    return (
        <main>
            <SpinnerComponent show={ isLoading }/>
            { post && (
                <>
                    <section>
                        <h1>{ post.title }</h1>
                        <p>ID: { post.slug }</p>
                        <PostForm defaultValues={ post } preview={ preview }/>
                    </section>
                    <aside>
                        <h3>Tools</h3>
                        <button onClick={ () => setPreview(!preview) }>{ preview ? 'Edit' : 'Preview' }</button>
                        <Link href={ `/users/${ post.authorUsername }/${ post.slug }` }>
                            <button className='btn-blue'>Live view</button>
                        </Link>
                    </aside>
                </>
            ) }
        </main>
    );
};

const PostForm = ({ defaultValues, preview }: PostFormProps) => {
    const { register, reset, watch, handleSubmit, formState } = useForm({ defaultValues, mode: 'onChange' });
    const postUpdate                                          = trpc.posts.updatePost.useMutation({
        onSuccess: () => {
            toast.success('Post updated successfully!');
        },
        onError  : (e) => {
            toast.error('Error updating a post!');
            console.log(e);
        }
    });

    const { isValid, isDirty, errors } = formState;

    type FormValues = {
        content: string,
        published: boolean
    }

    const updatePost: SubmitHandler<FormValues> = async ({ content, published }) => {
        await postUpdate.mutateAsync({ id: defaultValues.id, content, published });

        reset({ content, published });
    };

    return (
        <form onSubmit={ handleSubmit(updatePost) }>
            { preview && (
                <div className='card'>
                    <ReactMarkdown>{ watch('content') }</ReactMarkdown>
                </div>
            ) }
            <div>
                <textarea { ...register('content') }></textarea>
                {errors.content && <p className="text-danger">{errors.content.message}</p>}
                <fieldset>
                    <input type='checkbox' { ...register('published', {
                        minLength: { value: 20, message: 'Content is too short' },
                        maxLength: { value: 20000, message: 'Content is too long' },
                        required : { value: true, message: 'Content cannot be empty' }
                    }) } />
                    <label>Published</label>
                </fieldset>
                <button type='submit' className='btn-green' disabled={ !isValid || !isDirty }>
                    Save Changes
                </button>
            </div>
        </form>
    );
};

type PostFormProps = {
    defaultValues: Post,
    preview: boolean
}