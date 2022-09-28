import { Neo4jGraphQL } from '@neo4j/graphql'
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'
import { ApolloServer } from 'apollo-server-micro'
import type { NextApiRequest, NextApiResponse } from 'next'
import { driver, resolvers, typeDefs } from '~/server'

const schema = await new Neo4jGraphQL({
  driver,
  resolvers,
  typeDefs
}).getSchema()

const server = new ApolloServer({
  introspection: true,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  schema
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
