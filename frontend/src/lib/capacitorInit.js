import { isNativeCapacitor } from "@/lib/pwa";

export async function initCapacitor() {
  if (!isNativeCapacitor()) return;

  try {
    const { App } = await import("@capacitor/app");
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    const { SplashScreen } = await import("@capacitor/splash-screen");

    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: "#C87941" });
    await SplashScreen.hide();

    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.minimizeApp();
      }
    });
  } catch (err) {
    console.warn("Capacitor init skipped:", err);
  }
}
