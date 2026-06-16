"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { Home, ChevronRight, MoreHorizontal } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  BREADCRUMB_BASE_SEGMENT,
  BREADCRUMB_LABELS,
  BREADCRUMB_SKIP_SEGMENTS,
} from "./app-breadcrumb-config";
import { useBreadcrumb } from "./breadcrumb-context";

/**
 * Formats a URL segment into a human-readable label
 * Handles hyphens, underscores, and camelCase
 * Priority: customLabels (from context) > staticLabels (from constants) > formatted segment
 */
function formatSegment(
  segment: string,
  customLabels: Record<string, string>,
): string {
  // Check for custom label from context first (highest priority)
  if (customLabels[segment]) {
    return customLabels[segment];
  }

  // Check for static custom label from constants
  if (BREADCRUMB_LABELS[segment]) {
    return BREADCRUMB_LABELS[segment];
  }

  // Replace hyphens and underscores with spaces
  let formatted = segment.replace(/[-_]/g, " ");

  // Handle camelCase and PascalCase
  formatted = formatted.replace(/([a-z])([A-Z])/g, "$1 $2");

  // Capitalize each word
  formatted = formatted
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return formatted;
}

interface AppBreadcrumbProps {
  /** Show home icon as first item (defaults to true) */
  showHome?: boolean;
  /** Maximum number of items to show before collapsing (defaults to 5) */
  maxItems?: number;
  /** Custom class name for the breadcrumb container */
  className?: string;
}

export function AppBreadcrumb({
  showHome = true,
  maxItems = 5,
  className,
}: AppBreadcrumbProps = {}) {
  const pathname = usePathname();
  const { customLabels } = useBreadcrumb();
  const allSegments = pathname.split("/").filter(Boolean);

  // Don't show breadcrumb on home page
  if (allSegments.length === 0) return null;

  // Skip the first segment only if it matches the base segment (e.g., "dashboard")
  const shouldSkipFirst =
    showHome && allSegments[0] === BREADCRUMB_BASE_SEGMENT;
  const pathSegments = shouldSkipFirst ? allSegments.slice(1) : allSegments;

  // Filter out segments that should be skipped, but keep track of their original indices
  const segmentMap: Array<{ segment: string; pathIndex: number }> = [];
  pathSegments.forEach((segment, index) => {
    if (!BREADCRUMB_SKIP_SEGMENTS.includes(segment)) {
      const pathIndex = shouldSkipFirst ? index + 1 : index;
      segmentMap.push({
        segment,
        pathIndex,
      });
    }
  });

  const segments = segmentMap.map((item) => item.segment);

  // Determine if we need to collapse items
  const totalItems = showHome ? segments.length + 1 : segments.length;
  const shouldCollapse = totalItems > maxItems;

  // Check if we're on the base private page (e.g., /dashboard)
  const isOnBasePage = segments.length === 0;

  // Calculate which items to show
  const renderItems = () => {
    const items: React.ReactNode[] = [];

    // Home item
    if (showHome) {
      items.push(
        <React.Fragment key="home">
          <BreadcrumbItem>
            {isOnBasePage ? (
              <BreadcrumbPage className="flex items-center gap-1.5">
                <Home className="h-4 w-4" />
              </BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link
                  href={`/${BREADCRUMB_BASE_SEGMENT}`}
                  className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                >
                  <Home className="h-4 w-4" />
                </Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
        </React.Fragment>,
      );
    }

    if (shouldCollapse) {
      // Show first item
      const firstSegment = segments[0];
      const firstPathIndex = segmentMap[0].pathIndex;
      const firstHref =
        "/" + allSegments.slice(0, firstPathIndex + 1).join("/");
      items.push(
        <React.Fragment key={firstHref}>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href={firstHref}
                className="transition-colors hover:text-foreground"
              >
                {formatSegment(firstSegment, customLabels)}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
        </React.Fragment>,
      );

      // Show ellipsis dropdown with hidden items
      const hiddenSegments = segments.slice(1, -2);
      if (hiddenSegments.length > 0) {
        items.push(
          <React.Fragment key="ellipsis">
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Show more</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {hiddenSegments.map((segment, idx) => {
                    const segmentIndex = idx + 1; // position in segments array
                    const pathIndex = segmentMap[segmentIndex].pathIndex;
                    const href =
                      "/" + allSegments.slice(0, pathIndex + 1).join("/");
                    return (
                      <DropdownMenuItem key={href} asChild>
                        <Link href={href}>
                          {formatSegment(segment, customLabels)}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
          </React.Fragment>,
        );
      }

      // Show last two items
      const lastTwoSegments = segments.slice(-2);
      lastTwoSegments.forEach((segment, idx) => {
        const actualIndex = segments.length - 2 + idx;
        const pathIndex = segmentMap[actualIndex].pathIndex;
        const href = "/" + allSegments.slice(0, pathIndex + 1).join("/");
        const isLast = actualIndex === segments.length - 1;

        items.push(
          <React.Fragment key={href}>
            <BreadcrumbItem>
              {isLast ? (
                <BreadcrumbPage className="font-medium">
                  {formatSegment(segment, customLabels)}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    href={href}
                    className="transition-colors hover:text-foreground"
                  >
                    {formatSegment(segment, customLabels)}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!isLast && (
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
            )}
          </React.Fragment>,
        );
      });
    } else {
      // Show all items normally
      segments.forEach((segment, index) => {
        const pathIndex = segmentMap[index].pathIndex;
        const href = "/" + allSegments.slice(0, pathIndex + 1).join("/");
        const isLast = index === segments.length - 1;

        items.push(
          <React.Fragment key={href}>
            <BreadcrumbItem>
              {isLast ? (
                <BreadcrumbPage className="font-medium">
                  {formatSegment(segment, customLabels)}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    href={href}
                    className="transition-colors hover:text-foreground"
                  >
                    {formatSegment(segment, customLabels)}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!isLast && (
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
            )}
          </React.Fragment>,
        );
      });
    }

    return items;
  };

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>{renderItems()}</BreadcrumbList>
    </Breadcrumb>
  );
}
