import { trpc } from '../utils/trpc';
import { type Post } from './PostFeed.component';


export default function LikeButton({ post, isLiked }: LikeButtonProps) {
    const utils = trpc.useContext();
    if ( !post ) return null;

    const likePost = trpc.posts.likePost.useMutation({
        onSuccess: () => {
            // utils.posts.getPostBySlug.invalidate();
            utils.user.isPostLiked.invalidate();
            utils.posts.likesCount.invalidate();
        }
    });

    const like = async () => {
        await likePost.mutateAsync({ id: post.id, isLiked });
    };

    return <button onClick={ like }></button>;
}

type LikeButtonProps = {
    post: Post,
    isLiked: boolean
}