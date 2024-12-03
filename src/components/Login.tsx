import React from 'react'
import { Button } from './Button'
import { Input } from './Input'
import { ReactComponent as Google } from 'lib/icons/google.svg'
import { ReactComponent as Logo } from 'lib/icons/logo.svg'
import { Separator } from './Separator'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from 'components/Form'
import ErrorAlert from './ErrorAlert'
import HideButton from './chat/HideButton'
import { API_URL } from 'lib/constants'
import { useUserStore } from 'lib/stores/user'

const formSchema = z.object({
  username: z.string().email().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
})

interface Props {
}

const Login: React.FC<Props> = ({  }) => {
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { account, updateUserData } = useUserStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null)
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('username', values.username)
      formData.append('password', values.password)
      const response = await fetch(
        `${API_URL}/v1/login/session?third_party=true`,
        {
          credentials: 'include',
          method: 'POST',
          body: formData,
        },
      )
      console.log('response', response)
      if (!response.ok) {
        throw new Error('Invalid credentials')
      }
      updateUserData()
    } catch (e: any) {
      setError(e.message)
    }

    setIsSubmitting(false)
  }

  const onGoogleLogin = async () => {
    try {
      const url =
        window.location != window.parent.location
          ? document.referrer
          : document.location.href
      const response = await fetch(
        `${API_URL}/v1/login/session/oauth?provider=google&account_name=${account}&third_party=true&redirect_uri=${encodeURIComponent(url)}`,
        {
          credentials: 'include',
          method: 'GET',
        },
      )
      if (!response.ok) {
        throw new Error('Google login failed')
      }
      const googleAuthRedirectUrl = await response.text()
      //open in popup window
      if (window.top) {
        window.top.location.href = googleAuthRedirectUrl
      } else {
        window.location.href = googleAuthRedirectUrl
      }

      console.log('google login response')
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className='relative flex h-full w-full flex-col items-center justify-between border border-border bg-white p-8'>
      <div className='absolute right-0 top-0 flex gap-1 p-4'>
        <HideButton />
      </div>
      <div className='mb-6 flex justify-center'>
        <Logo />
      </div>
      <div className='my-8 flex w-[24rem] max-w-full flex-col justify-center gap-8 sm:max-w-md'>
        <h2 className='text-center text-2xl font-semibold'>Welcome back</h2>
        <Button variant='outline' className='w-full' onClick={onGoogleLogin}>
          <Google />
          Sign in with Google
        </Button>
        <Separator />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col items-center justify-between gap-4'
          >
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='name@company.com'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormControl>
                    <Input type='password' placeholder='Password' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <ErrorAlert message={error} />}

            <Button className='w-full' type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Form>
      </div>
      <p className='mt-8 text-center text-xs text-foreground/70'>
        By proceeding you agree to our{' '}
        <a href='#' className='underline'>
          Terms and Conditions
        </a>
      </p>
      <p className='mt-6 text-center text-xs text-foreground/70'>
        © 2024 Numbers Station Limited
      </p>
    </div>
  )
}

export default Login
