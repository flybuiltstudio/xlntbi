import { toast } from "sonner";

const HWID_DOWNLOAD_URL = "/api/public/hwid-download";

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    ) || window.innerWidth < 768
  );
}

const HU_MSG =
  "A HWID program csak Windows asztali gépen futtatható. Kérjük, asztali gépről töltsd le és indítsd el.";
const EN_MSG =
  "The HWID program only runs on a Windows desktop. Please download and run it from a desktop computer.";

/**
 * Handles HWID download: on mobile shows a toast warning instead of downloading.
 * @param lang "hu" or "en"
 */
export function handleHwidDownload(lang: "hu" | "en"): void {
  if (isMobile()) {
    toast.warning(lang === "hu" ? HU_MSG : EN_MSG, {
      duration: 6000,
    });
    return;
  }
  window.location.href = HWID_DOWNLOAD_URL;
}
