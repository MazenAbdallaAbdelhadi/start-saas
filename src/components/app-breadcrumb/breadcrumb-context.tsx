"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface BreadcrumbContextValue {
    /** Map of path segments to custom labels */
    customLabels: Record<string, string>;
    /** Set a custom label for a specific path segment */
    setLabel: (segment: string, label: string) => void;
    /** Clear a custom label */
    clearLabel: (segment: string) => void;
    /** Clear all custom labels */
    clearAllLabels: () => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | undefined>(
    undefined
);

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
    const [customLabels, setCustomLabels] = useState<Record<string, string>>({});

    const setLabel = useCallback((segment: string, label: string) => {
        setCustomLabels((prev) => ({ ...prev, [segment]: label }));
    }, []);

    const clearLabel = useCallback((segment: string) => {
        setCustomLabels((prev) => {
            const newLabels = { ...prev };
            delete newLabels[segment];
            return newLabels;
        });
    }, []);

    const clearAllLabels = useCallback(() => {
        setCustomLabels({});
    }, []);

    return (
        <BreadcrumbContext.Provider
            value={{ customLabels, setLabel, clearLabel, clearAllLabels }}
        >
            {children}
        </BreadcrumbContext.Provider>
    );
}

export function useBreadcrumb() {
    const context = useContext(BreadcrumbContext);
    if (context === undefined) {
        throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
    }
    return context;
}

/**
 * Hook to set a custom breadcrumb label for the current page
 * Automatically clears on unmount
 */
export function useBreadcrumbLabel(segment: string, label: string) {
    const { setLabel, clearLabel } = useBreadcrumb();

    React.useEffect(() => {
        if (segment && label) {
            setLabel(segment, label);
        }
        return () => {
            if (segment) {
                clearLabel(segment);
            }
        };
    }, [segment, label, setLabel, clearLabel]);
}
