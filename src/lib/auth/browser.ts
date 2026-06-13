import { createAuthClient } from "better-auth/react";
import {
  inferAdditionalFields,
  organizationClient,
  twoFactorClient,
  adminClient,
  inferOrgAdditionalFields,
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
    organizationClient({ schema: inferOrgAdditionalFields<typeof auth>() }),
    adminClient(),
  ],
});
