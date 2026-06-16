import { createAuthClient } from "better-auth/react";
import {
  inferAdditionalFields,
  twoFactorClient,
  adminClient,
} from "better-auth/client/plugins";

import { auth } from "./server";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    twoFactorClient({
      onTwoFactorRedirect: () => {
        window.location.href = "/two-factor-authentication";
      },
    }),
    adminClient(),
  ],
});
