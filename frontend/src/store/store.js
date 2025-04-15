import { configureStore } from "@reduxjs/toolkit";
import apiLogs from "../api/apiLogs";
import apiErrorsLogs from "../api/apiErrorsLogs";
import apiOperators from "../api/apiOperators";
import apiStands from "../api/apiStands";
import apiStandIds from "../api/apiStandIds";

const store = configureStore({
  reducer: {
    [apiLogs.reducerPath]: apiLogs.reducer,
    [apiErrorsLogs.reducerPath]: apiErrorsLogs.reducer,
    [apiOperators.reducerPath]: apiOperators.reducer,
    [apiStands.reducerPath]: apiStands.reducer,
    [apiStandIds.reducerPath]: apiStandIds.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiLogs.middleware)
      .concat(apiErrorsLogs.middleware)
      .concat(apiOperators.middleware)
      .concat(apiStands.middleware)
      .concat(apiStandIds.middleware),
});

export default store;
