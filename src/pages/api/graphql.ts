import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { resolvers, typeDefs } from '~/server'

const server = new ApolloServer({
  introspection: true,
  schema: makeExecutableSchema({ resolvers, typeDefs })
})

export default startServerAndCreateNextHandler(server)
