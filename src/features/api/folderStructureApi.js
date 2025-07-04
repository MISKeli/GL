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
      //system monitoring
      GenerateImportedSystems: builder.query({
        query: (params) => ({
          url: `/folder-structure/system-imported/page`,
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
  useGenerateImportedSystemsQuery,
  useLazyGenerateAvailableBOAPageQuery
} = folderStructureApi;
