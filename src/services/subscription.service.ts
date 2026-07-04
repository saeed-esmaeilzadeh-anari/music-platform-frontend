/**
 * Subscription Service
 * Endpoints:
 *  POST  /subscription/checkout  (authenticated)
 *  GET   /subscription/me        (authenticated)
 *  PATCH /subscription/cancel    (authenticated)
 */

import { apiGet, apiPost, apiPatch } from "@/lib/api/http-client";
import type {
  CreateSubscriptionDto,
  SubscriptionResponse,
  CheckoutSessionResponse,
} from "@/types";

export const subscriptionService = {
  createCheckout: (
    dto: CreateSubscriptionDto
  ): Promise<CheckoutSessionResponse> =>
    apiPost<CheckoutSessionResponse>("/subscription/checkout", dto),

  getActive: (): Promise<SubscriptionResponse> =>
    apiGet<SubscriptionResponse>("/subscription/me"),

  cancel: (): Promise<SubscriptionResponse> =>
    apiPatch<SubscriptionResponse>("/subscription/cancel"),
};
