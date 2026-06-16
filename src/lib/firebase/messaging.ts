import { getMessaging } from "firebase-admin/messaging";

import { firebaseAdmin } from "./server";

export const messaging = getMessaging(firebaseAdmin);
