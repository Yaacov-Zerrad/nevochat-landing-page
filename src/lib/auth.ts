import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL
          
          const response = await fetch(`${backendUrl}/api/auth-token/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: credentials.email,
              password: credentials.password,
            }),
          })

          console.log('Auth response status:', response.status)

          if (!response.ok) {
            const errorText = await response.text()
            console.log('Auth error response:', errorText)
            return null
          }

          const data = await response.json()
          console.log('Auth token response:', data)

          if (data.token) {
            const userResponse = await fetch(`${backendUrl}/api/users/me/`, {
              headers: {
                'Authorization': `Token ${data.token}`,
              },
            })

            console.log('User response status:', userResponse.status)

            if (userResponse.ok) {
              const user = await userResponse.json()
              console.log('User data from API:', user) // Debug log
              return {
                id: user.id ? user.id.toString() : user.pk ? user.pk.toString() : Math.random().toString(),
                email: user.email,
                name: user.name || (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email),
                accessToken: data.token,
              }
            } else {
              const userErrorText = await userResponse.text()
              console.log('User API error:', userErrorText)
            }
          }

          return null
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken
      }
      return token
    },
    async session({ session, token }) {
      if (token.accessToken) {
        (session as any).accessToken = token.accessToken
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "jwt",
  },
}
