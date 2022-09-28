import n from 'neo4j-driver'

export const driver = n.driver(
  `${process.env.NEO4J_URI}`,
  n.auth.basic(`${process.env.NEO4J_USER}`, `${process.env.NEO4J_PASSWORD}`)
)

export * as resolvers from './resolvers'
export { default as typeDefs } from './typeDefs'
