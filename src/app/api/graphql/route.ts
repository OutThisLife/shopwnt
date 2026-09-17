import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { makeExecutableSchema } from '@graphql-tools/schema'
import type { NextRequest } from 'next/server'
import { resolvers, typeDefs } from '~/server'

export const runtime = 'nodejs'
export const maxDuration = 60

const server = new ApolloServer({
  introspection: true,
  schema: makeExecutableSchema({ resolvers, typeDefs })
})

// Route Handlers provide the Data Cache and response-lifetime context needed
// for catalog pages to survive cold starts and revalidate in the background.
const handler = startServerAndCreateNextHandler<NextRequest>(server)
const route = async (request: NextRequest) => {
  const response = await handler(request)

  if (
    request.method === 'GET' &&
    !request.headers.has('authorization') &&
    !response.headers.has('set-cookie') &&
    response.status === 200 &&
    response.headers.get('content-type')?.includes('json')
  ) {
    const body = await response.clone().json()

    // Only successful public catalog reads are cacheable, never GraphQL errors.
    // A one-minute edge window avoids function startup without a long stock TTL.
    if (body.data && !body.errors?.length) {
      response.headers.set(
        'Cache-Control',
        'public, max-age=0, must-revalidate'
      )
      response.headers.set(
        'Vercel-CDN-Cache-Control',
        'public, s-maxage=30, stale-while-revalidate=30'
      )
    }
  }

  return response
}

export { route as GET, route as POST }
