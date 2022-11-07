import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { trpc } from '../utils/trpc';


export default function NavbarComponent() {
    const { data: session } = trpc.auth.getSession.useQuery();
    const username          = session?.user?.username;

    return (
        <nav className='navbar'>
            <ul>
                <li>
                    <Link href='/'>
                        <button className='btn-logo'>FEED</button>
                    </Link>
                </li>

                <li className='push-left'>
                    <Link href='/enter'>
                        {
                            session ?
                            <button className='btn-blue' onClick={ () => signOut() }>Log Out</button> :
                            <button className='btn-blue'>Log In</button>
                        }
                    </Link>
                </li>

                { username && (
                    <>
                        <li>
                            <Link href='/admin'>
                                <button className='btn-blue'>Write a Post</button>
                            </Link>
                        </li>
                        <li>
                            <Link href={ `/users/${ username }` }>
                                <img src={ session?.user?.image || '' } alt='User Profile Picture'/>
                            </Link>
                        </li>
                    </>
                ) }

            </ul>
        </nav>
    );
}