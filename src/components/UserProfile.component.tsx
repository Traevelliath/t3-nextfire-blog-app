// UI component for user profile
import { type Session } from 'next-auth';
import Image from 'next/image';


export default function UserProfile({ user }: UserProfileProps) {
    return (
        <div className='box-center'>
            <Image src={ user?.image || '/hacker.png' } className='card-img-center' alt='user profile picture' height={150} width={150}/>
            <p>
                <i>@{ user?.username }</i>
            </p>
            <h1>{ user?.name || 'Anonymous User' }</h1>
        </div>
    );
}

type UserProfileProps = {
    user: Session['user'] | null
}