import { configureStore } from "@reduxjs/toolkit";
import apiLogs from "../api/apiLogs";
import apiErrorsLogs from "../api/apiErrorsLogs";
import apiOperators from "../api/apiOperators";
import apiStands from "../api/apiStands";
import apiStandIds from "../api/apiStandIds";
import apiUser from "../api/apiUser";

const store = configureStore({
  reducer: {
    [apiLogs.reducerPath]: apiLogs.reducer,
    [apiErrorsLogs.reducerPath]: apiErrorsLogs.reducer,
    [apiOperators.reducerPath]: apiOperators.reducer,
    [apiStands.reducerPath]: apiStands.reducer,
    [apiStandIds.reducerPath]: apiStandIds.reducer,
    [apiUser.reducerPath]: apiUser.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiLogs.middleware)
      .concat(apiErrorsLogs.middleware)
      .concat(apiOperators.middleware)
      .concat(apiStands.middleware)
      .concat(apiStandIds.middleware)
      .concat(apiUser.middleware),
});

export default store;
