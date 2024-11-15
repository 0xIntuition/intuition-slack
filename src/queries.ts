import { gql, request } from 'graphql-request'

export const searchAtomsByUriQuery = gql`
query SearchAtomsByUri($uri: String) {
  atoms(
    where: {
      _or: [
        { data: { _eq: $uri } }
        { value: { thing: { url: { _eq: $uri } } } }
        { value: { person: { url: { _eq: $uri } } } }
        { value: { organization: { url: { _eq: $uri } } } }
        { value: { book: { url: { _eq: $uri } } } }
      ]
    }
  ) {
    id
    data
    type
    label
    image
    emoji
    value {
      person {
        name
        image
        description
        email
        identifier
      }
      thing {
        url
        name
        image
        description
      }
      organization {
        name
        email
        description
        url
      }
    }
    vault {
      positionCount
      totalShares
      currentSharePrice
      positions(order_by: { shares: desc }, limit: 5) {
        shares
        account {
          id
          type
          image
          label
        }
      }
    }
    asSubject {
      id
      object {
        id
        label
        emoji
        image
      }
      predicate {
        emoji
        label
        image
        id
      }
      counterVault {
        id
        positionCount
        totalShares
        currentSharePrice
        positions(order_by: { shares: desc }, limit: 5) {
          shares
          account {
            id
            type
            image
            label
          }
        }
      }
      vault {
        id
        positionCount
        totalShares
        currentSharePrice
        positions(order_by: { shares: desc }, limit: 5) {
          shares
          account {
            id
            type
            image
            label
          }
        }
      }
    }
  }
  chainLinkPrices(limit: 1, order_by: { id: desc }) {
    usd
  }
}`;

export async function searchAtomsByUri(uri: string) {
  const result = await request(
    process.env.GRAPHQL_ENDPOINT as string,
    searchAtomsByUriQuery,
    { uri }
  )
  return result
}
