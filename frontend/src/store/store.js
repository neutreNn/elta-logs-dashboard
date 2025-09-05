import { configureStore } from "@reduxjs/toolkit";
import apiLogs from "../api/apiLogs";
import apiErrorsLogs from "../api/apiErrorsLogs";
import apiOperators from "../api/apiOperators";
import apiStands from "../api/apiStands";
import apiStandIds from "../api/apiStandIds";
import apiUser from "../api/apiUser";
import apiFirmware from "../api/apiFirmware";
import apiMobile from "../api/apiMobile";

const store = configureStore({
  reducer: {
    [apiLogs.reducerPath]: apiLogs.reducer,
    [apiErrorsLogs.reducerPath]: apiErrorsLogs.reducer,
    [apiOperators.reducerPath]: apiOperators.reducer,
    [apiStands.reducerPath]: apiStands.reducer,
    [apiStandIds.reducerPath]: apiStandIds.reducer,
    [apiUser.reducerPath]: apiUser.reducer,
    [apiFirmware.reducerPath]: apiFirmware.reducer,
    [apiMobile.reducerPath]: apiMobile.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiLogs.middleware)
      .concat(apiErrorsLogs.middleware)
      .concat(apiOperators.middleware)
      .concat(apiStands.middleware)
      .concat(apiStandIds.middleware)
      .concat(apiUser.middleware)
      .concat(apiFirmware.middleware)
      .concat(apiMobile.middleware),
});

export default store;
