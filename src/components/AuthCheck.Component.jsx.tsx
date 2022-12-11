import { useSession } from 'next-auth/react';
import Link from 'next/link';
import type { PropsWithChildren, ReactElement } from 'react';


export default function AuthCheck(props: PropsWithChildren) {
    const { data: session } = useSession();

    return (
        session && props.children ?
        props.children as ReactElement :
        <Link href="/enter">You must be signed in</Link>
    )
}
