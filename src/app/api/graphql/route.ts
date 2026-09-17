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
const route = (request: NextRequest) => handler(request)

export { route as GET, route as POST }
