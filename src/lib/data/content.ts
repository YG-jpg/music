import type { Banner, HomepageData, NavigationData, SiteSettings } from "@/types/ecommerce";

import type { ContentSource } from "./contracts";
import { localContentSource } from "./local-source";

let contentSource: ContentSource = localContentSource;

export function configureContentSource(source: ContentSource) {
  contentSource = source;
}

export async function getHomepageData(): Promise<HomepageData> {
  return contentSource.getHomepage();
}

export async function getNavigationData(): Promise<NavigationData> {
  return contentSource.getNavigation();
}

export const getNavigation = getNavigationData;

export async function getBanners(): Promise<Banner[]> {
  return contentSource.getBanners();
}

export async function getActiveBanners(
  placement?: Banner["placement"],
): Promise<Banner[]> {
  const banners = await getBanners();
  const now = new Date();

  return banners.filter((banner) => {
    if (!banner.active) {
      return false;
    }

    if (placement && banner.placement !== placement) {
      return false;
    }

    const startsAt = new Date(banner.startAt);
    const endsAt = banner.endAt ? new Date(banner.endAt) : null;

    return startsAt <= now && (!endsAt || endsAt >= now);
  });
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return contentSource.getSiteSettings();
}
