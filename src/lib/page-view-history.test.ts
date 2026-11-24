import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installCountedHistoryNavigation, type CountedHistoryChange } from "./page-view-navigation";

let events: EventTarget;
const reload = vi.fn();
let location: { pathname: string; reload: typeof reload };
let dispose: (() => void) | undefined;
let historyListener: ((change: CountedHistoryChange) => void) | undefined;
const unsubscribe = vi.fn(() => { historyListener = undefined; });

function navigate(pathname: string, isHistoryReturn = true) {
  location.pathname = pathname;
  historyListener?.({ pathname, isHistoryReturn });
}

beforeEach(() => {
  reload.mockClear();
  unsubscribe.mockClear();
  events = new EventTarget();
  location = { pathname: "/konzultacio", reload };
  vi.stubGlobal("window", {
    location,
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
  });
  dispose = installCountedHistoryNavigation((listener) => {
    historyListener = listener;
    return unsubscribe;
  });
});

afterEach(() => { dispose?.(); vi.unstubAllGlobals(); });

describe("countable browser history returns", () => {
  it.each(["/termek/berszamfejto", "/en/product/berszamfejto", "/konyveles", "/en/bookkeeping"])(
    "requests a document when Back or Forward enters %s", (path) => {
      navigate(path);
      expect(reload).toHaveBeenCalledOnce();
    },
  );

  it("keeps anchors and search changes on the same counted page client-side", () => {
    navigate("/termek/berszamfejto", false);
    navigate("/termek/berszamfejto");
    expect(reload).not.toHaveBeenCalled();
  });

  it("tracks an uncounted SPA departure before a history return", () => {
    navigate("/termek/berszamfejto", false);
    navigate("/megrendeles", false);
    navigate("/termek/berszamfejto");
    expect(reload).toHaveBeenCalledOnce();
  });

  it("counts quick Back before the departure's resolved event", () => {
    navigate("/termek/berszamfejto", false);
    navigate("/megrendeles", false);
    // No resolved event is required: history owns the ordered transitions.
    navigate("/termek/berszamfejto");
    expect(reload).toHaveBeenCalledOnce();
  });

  it.each(["/termekeim", "/en/products", "/konzultacio", "/admin/statisztika"])(
    "does not reload history navigation into %s", (path) => {
      navigate(path);
      expect(reload).not.toHaveBeenCalled();
    },
  );

  it.each(["/termek/berszamfejto", "/en/tax-advisory"])(
    "requests one document after a cached restoration of %s", (path) => {
      location.pathname = path;
      events.dispatchEvent(Object.assign(new Event("pageshow"), { persisted: true }));
      navigate(path);
      expect(reload).toHaveBeenCalledOnce();
    },
  );

  it("does not reload an ordinary document's first pageshow", () => {
    location.pathname = "/termek/berszamfejto";
    events.dispatchEvent(Object.assign(new Event("pageshow"), { persisted: false }));
    expect(reload).not.toHaveBeenCalled();
  });

  it("does not reload cached uncounted pages", () => {
    events.dispatchEvent(Object.assign(new Event("pageshow"), { persisted: true }));
    expect(reload).not.toHaveBeenCalled();
  });

  it("removes all listeners on cleanup", () => {
    dispose?.();
    navigate("/termek/berszamfejto");
    events.dispatchEvent(Object.assign(new Event("pageshow"), { persisted: true }));
    expect(reload).not.toHaveBeenCalled();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});