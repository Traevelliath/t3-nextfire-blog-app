import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { trpc } from '../utils/trpc';
import Image from 'next/image';


export default function NavbarComponent() {
    // const { data }       = useSession();
    // const { data: user } = trpc.user.getUserById.useQuery({ id: data?.user?.id }, { enabled: !!data });

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
                                <Image src={ session?.user?.image || '' } alt='User Profile Picture' width={ 48 }
                                       height={ 50 }/>
                            </Link>
                        </li>
                    </>
                ) }

                { session && !username && (
                    <>
                        <li>
                            <Link href='/enter'>
                                <button className='btn-blue'>Set Up Username</button>
                            </Link>
                        </li>
                    </>
                )}

            </ul>
        </nav>
    );
}