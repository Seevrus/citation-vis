import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { isEmpty, isNil } from 'ramda';
import { RootState } from '../store';
import { 
  findArticle,
  findArticlesOfAuthor,
  findArticlesOfSubject,
  mapResponseToAuthorList,
  mapResponseToCitations,
  mapResponseToGraph,
  mapResponseToSubjects,
  mapResponseToTreeMap,
} from './mapper-helpers';
import {
  CitationsErrorResponseT,
  CitationsRequestT,
  CitationsResponseT,
  CitationsT,
} from './citationsTypes';

const initialState: CitationsT = {};

export const fetchCitations = createAsyncThunk<
CitationsResponseT, CitationsRequestT, { rejectValue: CitationsErrorResponseT }
>(
  'fetchCitations',
  async (requestData, { rejectWithValue }) => {
    const responseJson = await fetch('citation-vis-server/search.php', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (responseJson.status !== 200) {
      return rejectWithValue((await responseJson.json()) as CitationsErrorResponseT);
    }

    const response = (await responseJson.json()) as CitationsResponseT;
    return response;
  },
);

export const citationsSlice = createSlice({
  name: 'citations',
  initialState,
  reducers: {
    setArticleList: (state, action) => {
      if (!state.response) return;
      if (isNil(action.payload)) {
        state.articleList = [];
      } else {
        const { listType, keyword } = action.payload;
        if (listType === 'subject') {
          state.articleList = findArticlesOfSubject(state.response, keyword);
        } else if (listType === 'author') {
          state.articleList = findArticlesOfAuthor(state.response, keyword);
        }
      }
    },
    setAuthorsList: (state) => {
      if (!state.response) return;
      state.authorsList = mapResponseToAuthorList(state.response);
    },
    setGraph: (state) => {
      if (!state.response) return;
      state.graph = mapResponseToGraph(state.response);
    },
    setMinMaxCitations: (state) => {
      if (!state.response) return;
      state.minMaxCitations = mapResponseToCitations(state.response);
    },
    setSelectedArticleId: (state, action) => {
      state.selectedArticleId = action.payload;
    },
    setSubjects: (state) => {
      if (!state.response) return;
      state.subjects = mapResponseToSubjects(state.response);
    },
    setTreeMap: (state) => {
      if (!state.response) return;
      state.treeMap = mapResponseToTreeMap(state.response);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCitations.fulfilled, (state, { payload }) => {
      state.error = '';
      state.response = payload;
    });

    builder.addCase(fetchCitations.rejected, (state, { payload }) => {
      state.error = payload?.message;
    });
  },
});

export const isDataAvailable = (state: RootState) => !isNil(state.response) && !isEmpty(state.response);
export const selectArticle = (state: RootState) => {
  if (
    isNil(state.response)
    || isEmpty(state.response)
    || isNil(state.selectedArticleId)
  ) return;

  return findArticle(
    state.response as CitationsResponseT,
    state.selectedArticleId as number,
  ) as CitationsResponseT;
};
export const selectArticleList = (state: RootState) => state.articleList;
export const selectAuthorsList = (state: RootState) => state.authorsList;
export const selectErrorMessage = (state: RootState) => state.error;
export const selectGraphData = (state: RootState) => state.graph;
export const selectMinMaxCitations = (state: RootState) => state.minMaxCitations;
export const selectSubjects = (state: RootState) => state.subjects;
export const selectTreeMap = (state: RootState) => state.treeMap;

export const {
  setArticleList,
  setAuthorsList,
  setGraph,
  setMinMaxCitations,
  setSelectedArticleId,
  setSubjects,
  setTreeMap,
} = citationsSlice.actions;

export default citationsSlice.reducer;
