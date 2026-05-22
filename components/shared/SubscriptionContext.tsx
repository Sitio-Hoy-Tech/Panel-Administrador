"use client";

import { createContext, useContext } from "react";

export const SubscriptionContext = createContext({ expired: false, atRisk: false, graceDaysLeft: 0 });
export const useSubscription = () => useContext(SubscriptionContext);
