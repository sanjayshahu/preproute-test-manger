import React from "react";
import TestCreationSidebar from "../components/TestCreationSidebar";
import "./AppLayout.css";

type ComponentName =
  | "Dashboard"
  | "CreateTest"
  | "TestTracking"
  | "TestPreview"
  | "TestConfirmation";

interface SidebarQuestion {
  id: string;
  label: string;
  status: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
  componentName: ComponentName;

  totalQuestions?: number;

  questions?: SidebarQuestion[];

  onQuestionClick?: (
    question: SidebarQuestion
  ) => void;

  onNavigate?: (
    componentName: ComponentName
  ) => void;
}

export default function AppLayout({
  children,
  componentName,
  totalQuestions,
  questions,
  onQuestionClick,
  onNavigate,
}: AppLayoutProps) {
  return (
    <div className="app-layout">
      <TestCreationSidebar
        componentName={componentName}
        totalQuestions={totalQuestions}
        questions={questions}
        onQuestionClick={onQuestionClick}
        onNavigate={onNavigate}
      />

      <main className="app-layout-content">
        {children}
      </main>
    </div>
  );
}