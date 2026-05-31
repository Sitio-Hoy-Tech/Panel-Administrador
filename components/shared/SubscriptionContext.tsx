"use client";

import { createContext, useContext } from "react";

export const SubscriptionContext = createContext({
  expired: false,
  atRisk: false,
  graceDaysLeft: 0,
  paymentUrl: null as string | null,
  planName: null as string | null,
  planPrice: null as string | null,
});
export const useSubscription = () => useContext(SubscriptionContext);
