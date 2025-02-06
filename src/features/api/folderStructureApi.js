import { indexApi } from "./indexApi";

const folderStructureApi = indexApi
  .enhanceEndpoints({ addTagTypes: ["folder"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      GenerateSystemFolderStructurePage: builder.query({
        query: (params) => ({
          url: `/folder-structure/system-data/page`,
          method: "GET",
          params,
        }),
        providesTags: ["folder"],
      }),
      GenerateAvailableBOAPage: builder.query({
        query: (params) => ({
          url: `/folder-structure/system-boa/page`,
          method: "GET",
          params,
        }),
        providesTags: ["folder"],
      }),
    }),
  });

export const {
  useGenerateSystemFolderStructurePageQuery,
  useLazyGenerateSystemFolderStructurePageQuery,
  useGenerateAvailableBOAPageQuery,
  useLazyGenerateAvailableBOAPageQuery
} = folderStructureApi;
