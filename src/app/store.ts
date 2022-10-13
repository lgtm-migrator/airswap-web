import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";

import {
  balancesReducer,
  allowancesReducer,
} from "../features/balances/balancesSlice";
import cancelOtcReducer from "../features/cancelOtc/cancelOtcSlice";
import gasCostReducer from "../features/gasCost/gasCostSlice";
import makeOtcReducer from "../features/makeOtc/makeOtcSlice";
import metadataReducer from "../features/metadata/metadataSlice";
import { subscribeToSavedTokenChangesForLocalStoragePersisting } from "../features/metadata/metadataSubscriber";
import myOrdersReducer from "../features/myOrders/myOrdersSlice";
import ordersReducer from "../features/orders/ordersSlice";
import pricingReducer from "../features/pricing/pricingSlice";
import registryReducer from "../features/registry/registrySlice";
import takeOtcReducer from "../features/takeOtc/takeOtcSlice";
import tradeTermsReducer from "../features/tradeTerms/tradeTermsSlice";
import transactionsReducer from "../features/transactions/transactionsSlice";
import userSettingsReducer from "../features/userSettings/userSettingsSlice";
import walletReducer from "../features/wallet/walletSlice";

export const store = configureStore({
  reducer: {
    allowances: allowancesReducer,
    transactions: transactionsReducer,
    balances: balancesReducer,
    metadata: metadataReducer,
    tradeTerms: tradeTermsReducer,
    orders: ordersReducer,
    pricing: pricingReducer,
    gasCost: gasCostReducer,
    wallet: walletReducer,
    registry: registryReducer,
    userSettings: userSettingsReducer,
    makeOtc: makeOtcReducer,
    myOrders: myOrdersReducer,
    takeOtc: takeOtcReducer,
    cancelOtc: cancelOtcReducer,
  },
});

subscribeToSavedTokenChangesForLocalStoragePersisting();

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
