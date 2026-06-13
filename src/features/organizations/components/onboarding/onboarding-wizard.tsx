"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { GetStartedStep } from "./get-started-step";
import { CreateOrgStep } from "./create-org-step";
import { AddMembersStep } from "./add-members-step";


type Step = "get-started" | "create-org" | "add-members";

export const OnboardingWizard = () => {
  const t = useTranslations("Onboarding.wizard");
  const router = useRouter();
  const [step, setStep] = useState<Step>("get-started");
  const [orgId, setOrgId] = useState<string | null>(null);

  const handleFinish = () => {
    toast.success(t("finishSuccess"));
    router.push("/dashboard");
    router.refresh();
  };

  const renderStep = () => {
    switch (step) {
      case "get-started":
        return <GetStartedStep onCreateClick={() => setStep("create-org")} />;
      case "create-org":
        return (
          <CreateOrgStep
            onBack={() => setStep("get-started")}
            onNext={(id) => {
              setOrgId(id);
              setStep("add-members");
            }}
          />
        );
      case "add-members":
        return <AddMembersStep orgId={orgId!} onNext={() => handleFinish()} />;

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
