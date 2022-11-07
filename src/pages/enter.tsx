import { signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import SpinnerComponent from '../components/Spinner.component';
import { trpc } from '../utils/trpc';
import UsernameForm from '../components/UsernameForm.component';


export default function EnterPage({}) {
    const { data: session, status } = trpc.auth.getSession.useQuery();
    const username                  = session?.user?.username;

    if ( status === 'loading' ) return <SpinnerComponent show={ true }/>;

    return (
        <main>
            {
                session ?
                (username ?
                 <SignOutButton/> :
                 <UsernameForm/>)
                        :
                <SignInButton/>
            }
        </main>
    );
}

const SignInButton = () => {
    return (
        <>
            <button className='btn-google' onClick={ () => signIn('google') }>
                <Image src='/../public/icons8-google-32.png' alt='' width='32' height='32'/> Sign In with Google
            </button>
            <button className='btn-google' onClick={ () => signIn('discord') }>
                <Image src='/../public/icons8-discord-32.png' alt='' width='32' height='32'/> Sign In with Discord
            </button>
        </>
    );
};

const SignOutButton = () => {
    return <button onClick={ () => signOut() }>SIGN OUT</button>;
};

