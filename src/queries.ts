import { gql, request } from 'graphql-request'

export const searchAtomsQuery = gql`
query SearchAtoms($str: String, $likeStr: String) {
  atoms(
    order_by: { vault: { position_count: desc } }
    limit: 5
    where: {
      _or: [
        { data: { _eq: $str } }
        { value: { account: { label: { _ilike: $likeStr } } } }
        { value: { thing: { url: { _ilike: $likeStr } } } }
        { value: { thing: { name: { _ilike: $likeStr } } } }
        { value: { thing: { description: { _ilike: $likeStr } } } }
        { value: { person: { url: { _ilike: $likeStr } } } }
        { value: { organization: { url: { _ilike: $likeStr } } } }
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
      position_count
    }
    as_subject_triples(
      limit: 15,
      where: {
        _or: [
          { vault: { position_count: { _gt: 0 } } }
          { counter_vault: { position_count: { _gt: 0 } } }
        ]
      }

      order_by: { vault: { position_count: desc } }
    ) {
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
      counter_vault {
        position_count
      }
      vault {
        position_count
      }
    }
  }
}`;

export async function searchAtoms(str: string) {
  const likeStr = `%${str}%`;
  const result = await request(
    process.env.GRAPHQL_ENDPOINT as string,
    searchAtomsQuery,
    { str, likeStr }
  )
  return result
}
