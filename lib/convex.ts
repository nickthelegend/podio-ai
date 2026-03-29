import { ConvexReactClient } from "convex/react";
import { createConvexClient } from "@convex-dev/client";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

export const convex = new ConvexReactClient(convexUrl);

export const convexClient = createConvexClient(convexUrl);
