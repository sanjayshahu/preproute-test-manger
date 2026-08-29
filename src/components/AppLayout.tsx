import React from "react";
import { useLocation } from "react-router-dom";

import TestCreationSidebar from "../components/TestCreationSidebar";
import AppHeader from "../components/AppHeader";

import type {
  ComponentName,
  SidebarQuestion,
} from "../types/layout";

import "./AppLayout.css";

interface AppLayoutProps {
  children: React.ReactNode;

  componentName?: ComponentName;

  totalQuestions?: number;

  questions?: SidebarQuestion[];

  activeQuestionId?: string;

  onQuestionClick?: (
    question: SidebarQuestion
  ) => void;

  onNavigate?: (
    componentName: ComponentName
  ) => void;
}


/* ==================================================
   BREADCRUMB BUILDER
================================================== */

function getBreadcrumb(pathname: string): string {
  const path = pathname
    .replace(/\/+/g, "/")
    .replace(/^\/|\/$/g, "");

  if (!path) {
    return "Dashboard";
  }

  const segments = path
    .split("/")
    .filter(Boolean);

  const labels: Record<string, string> = {
    dashboard: "Dashboard",

    tests: "Tests",
    create: "Create Test",
    tracking: "Test Tracking",
    preview: "Test Preview",
    confirmation: "Test Confirmation",

    questions: "Questions",
  };

  const breadcrumbParts = segments.map(
    (segment) => {
      const lowerSegment =
        segment.toLowerCase();

      /*
       * UUID / numeric route parameters
       * should not appear in breadcrumb.
       */
      if (
        /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(
          segment
        ) ||
        /^\d+$/.test(segment)
      ) {
        return null;
      }

      return (
        labels[lowerSegment] ||
        segment
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (char) =>
            char.toUpperCase()
          )
      );
    }
  );

  return breadcrumbParts
    .filter(Boolean)
    .join(" / ");
}


/* ==================================================
   COMPONENT
================================================== */

export default function AppLayout({
  children,
  componentName,
  totalQuestions,
  questions,
  activeQuestionId,
  onQuestionClick,
  onNavigate,
}: AppLayoutProps) {
  const location = useLocation();

  const pathname =
    location.pathname.toLowerCase();


  /* ==================================================
     ROUTE → COMPONENT
  ================================================== */

  let currentComponent:
    ComponentName;

  if (
    pathname === "/dashboard" ||
    pathname === "/"
  ) {
    currentComponent = "Dashboard";
  } else if (
    pathname === "/tests/create" ||
    pathname.startsWith("/tests/create/")
  ) {
    currentComponent = "CreateTest";
  } else if (
    pathname.startsWith("/tests/preview")
  ) {
    currentComponent = "TestPreview";
  } else if (
    pathname.startsWith("/tests/confirmation")
  ) {
    currentComponent = "TestConfirmation";
  } else if (
    pathname.startsWith("/tests/tracking")
  ) {
    currentComponent = "TestTracking";
  } else {
    /*
     * Fallback to componentName if the route
     * is not explicitly mapped above.
     */
    currentComponent =
      componentName || "Dashboard";
  }


  /* ==================================================
     BREADCRUMB
  ================================================== */

  const breadcrumb =
    getBreadcrumb(pathname);


  return (
    <div className="app-layout">

      {/* =========================================
          LEFT SIDEBAR
      ========================================== */}

      <TestCreationSidebar
        componentName={currentComponent}
        totalQuestions={totalQuestions}
        questions={questions}
        activeQuestionId={activeQuestionId}
        onQuestionClick={onQuestionClick}
        onNavigate={onNavigate}
      />


      {/* =========================================
          MAIN APPLICATION AREA
      ========================================== */}

      <main className="app-layout-content">

        <AppHeader
          breadcrumb={breadcrumb}
        />

        {children}

      </main>

    </div>
  );
}