import { makeExecutableSchema } from '@graphql-tools/schema'
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'
import { ApolloServer } from 'apollo-server-micro'
import type { NextApiRequest, NextApiResponse } from 'next'
import { resolvers, typeDefs } from '~/server'

const server = new ApolloServer({
  introspection: true,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  schema: makeExecutableSchema({ resolvers, typeDefs })
})

const startServer = server.start()

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await startServer
  await server.createHandler({ path: '/api/graphql' })(req, res)
}

export const config = { api: { bodyParser: false } }
