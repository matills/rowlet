// AniList GraphQL Queries

export const SEARCH_ANIME_QUERY = `
query ($search: String, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
      perPage
    }
    media(search: $search, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      description
      coverImage {
        large
        extraLarge
      }
      bannerImage
      startDate {
        year
        month
        day
      }
      genres
      averageScore
      episodes
      status
      format
    }
  }
}
`;

export const GET_ANIME_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title {
      romaji
      english
      native
    }
    description
    coverImage {
      large
      extraLarge
    }
    bannerImage
    startDate {
      year
      month
      day
    }
    genres
    averageScore
    episodes
    status
    format
  }
}
`;
