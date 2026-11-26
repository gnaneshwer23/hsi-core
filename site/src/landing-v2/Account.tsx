import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applySeo } from "../lib/seo/applySeo";
import { LandingV2Layout } from "./Layout";
import { SignIn } from "../pages/SignIn";
import { SignUp } from "../pages/SignUp";
import { PasswordRecovery } from "../pages/PasswordRecovery";

type Which = "sign-in" | "sign-up" | "forgot" | "reset";

/** Account pages (sign in, sign up, password recovery) in the site header and footer. The forms keep their own light card. These pages are not indexed. */
export default function Account({ which }: { which: Which }) {
  const { pathname } = useLocation();
  useEffect(() => {
    applySeo(pathname);
  }, [pathname]);
  return (
    <LandingV2Layout>
      <div className="mx-auto flex max-w-[1440px] justify-center px-5 py-16 md:px-10 md:py-24">
        {which === "sign-in" && <SignIn />}
        {which === "sign-up" && <SignUp />}
        {which === "forgot" && <PasswordRecovery key="request" mode="request" />}
        {which === "reset" && <PasswordRecovery key="reset" mode="reset" />}
      </div>
    </LandingV2Layout>
  );
}
