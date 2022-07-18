import { ActionFunction, LoaderFunction, json, redirect } from '@remix-run/node';
import { useActionData } from '@remix-run/react';
import { Container } from '@nextui-org/react';

import { getSession, commitSession } from '~/services/sessions.server';
import { signUp } from '~/services/auth.server';
import AuthForm from '~/src/components/AuthForm';

type ActionData = {
  error: string | null;
};

export const action: ActionFunction = async ({ request }) => {
  const data = await request.clone().formData();

  const email = data.get('email')?.toString();
  const password = data.get('password')?.toString();
  const rePassword = data.get('re-password')?.toString();

  if (!email || !/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(email)) {
    return json<ActionData>({ error: 'Please enter a valid email!' });
  }

  if (!password || !rePassword || password !== rePassword) {
    return json<ActionData>({ error: 'Please enter your passwords correctly!' });
  }

  const { session: supaSession, error } = await signUp(email, password);

  if (error) {
    return json<ActionData>({ error: error.message });
  }

  const curSession = await getSession(request.headers.get('Cookie'));

  if (curSession.has('access_token')) {
    return redirect('/');
  }

  curSession.set('access_token', supaSession?.access_token);

  return redirect(request.referrer ?? '/', {
    headers: {
      'Set-Cookie': await commitSession(curSession),
    },
  });
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'));

  if (session.has('access_token')) {
    return redirect('/');
  }

  return null;
};

const SignUpPage = () => {
  const actionData = useActionData<ActionData>();

  return (
    <Container fluid justify="center" display="flex">
      <AuthForm type="sign-up" error={actionData?.error ?? null} />
    </Container>
  );
};

export default SignUpPage;
