import { Link } from "react-router-dom";
import { useLang } from "@/context/LanguageContext";

export default function AuthTabs({ active = "login", registerTo = "/register" }) {
  const { t } = useLang();

  const tabClass = (on) =>
    `flex-1 text-center py-2.5 text-sm font-medium rounded-md transition-colors ${
      on ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
    }`;

  return (
    <div
      className="flex gap-1 p-1 border border-border rounded-lg bg-muted/30 mb-6"
      data-testid="auth-tabs"
      role="tablist"
      aria-label={t("auth_tabs_label")}
    >
      <Link
        to="/login"
        role="tab"
        aria-selected={active === "login"}
        data-testid="auth-tab-login"
        className={tabClass(active === "login")}
      >
        {t("auth_tab_login")}
      </Link>
      <Link
        to={registerTo}
        role="tab"
        aria-selected={active === "register"}
        data-testid="auth-tab-register"
        className={tabClass(active === "register")}
      >
        {t("auth_tab_join")}
      </Link>
    </div>
  );
}
