import type { ChangeEvent, FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { trpc } from '../utils/trpc';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';


const UsernameForm = () => {
    const [ formValue, setFormValue ]   = useState('');
    const [ loading, setLoading ]       = useState(false);
    const [ isEligible, setIsEligible ] = useState(false);
    const [ valueCheck, setValueCheck ] = useState('');

    const validString = z.string()
                         .regex(/^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/);
    const { refetch } = trpc.username.getUsername.useQuery({ username: valueCheck });
    const setUsername = trpc.username.setUsername.useMutation();
    const router      = useRouter();


    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            await setUsername.mutate({
                username: formValue
            });
            toast.success('Username is set!');
            await router.reload();
        } catch (e) {
            toast.error('Oops, something went terribly wrong!');
            console.log('Error mutating data', e)
        }
    };

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;

        setFormValue(value);
        setIsEligible(false);
        setLoading(true);
    };

    const checkUsername = useCallback(
        debounce(async (name: string) => {
            setValueCheck(name);
            const { data } = await refetch();
            setIsEligible(!data);
            setLoading(false);
        }, 500),
        []
    );


    useEffect(() => {
        formValue && checkUsername(formValue);
    }, [ formValue, checkUsername ]);

    return (
        <section>
            <h3>Choose Username</h3>
            <form onSubmit={ onSubmit }>
                <input name='username' placeholder='my name' value={ formValue } onChange={ onChange }/>
                <UsernameMessage
                    username={ formValue }
                    isValid={ validString.safeParse(formValue).success }
                    isLoading={ loading }
                    isEligible={ isEligible }
                />
                <button type='submit'
                        className='btn-green'
                        disabled={ !isEligible || !validString.safeParse(formValue).success }>
                    Choose
                </button>

                <h3>Debug State</h3>
                <div>
                    Username: { formValue }
                    <br/>
                    Loading: { loading.toString() }
                    <br/>
                    Username Valid: { isEligible.toString() }
                </div>
            </form>
        </section>
    );
};

const UsernameMessage = ({ username, isValid, isLoading, isEligible }: UsernameMessageProps) => {
    if ( isLoading ) {
        return <p>Checking...</p>;
    } else if ( !isValid ) {
        return <p className='text-danger'>Username must be at least 3 characters long and contain only latin
            letters!</p>;
    } else if ( isValid && isEligible ) {
        return <p className='text-success'>{ username } is available!</p>;
    } else if ( username && !isEligible ) {
        return <p className='text-danger'>That username is taken!</p>;
    } else {
        return <p></p>;
    }
};

type UsernameMessageProps = {
    username: string,
    isValid: boolean,
    isLoading: boolean,
    isEligible: boolean
}

export default UsernameForm;