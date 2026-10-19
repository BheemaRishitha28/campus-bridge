import React, { useState, useEffect } from "react";
import { useStore } from "./lib/store";
import { Homepage } from "./components/landing/Homepage";
import { SignInModal } from "./components/auth/SignInModal";
import { AppLayout } from "./components/common/AppLayout";
import { FacultyDashboard } from "./components/dashboard/FacultyDashboard";
import { StudentDashboard } from "./components/dashboard/StudentDashboard";
import { StudentManagementView } from "./components/students/StudentManagementView";
import { CompanyDrivesView } from "./components/drives/CompanyDrivesView";
import { ApplicationsPipelineView } from "./components/applications/ApplicationsPipelineView";
import { NoDuesClearanceView } from "./components/nodues/NoDuesClearanceView";
import { StudentClearanceView } from "./components/nodues/StudentClearanceView";
import { StudentOffersView } from "./components/offers/StudentOffersView";
import { StudentProfileView } from "./components/profile/StudentProfileView";
import { ReportsView } from "./components/reports/ReportsView";
import { AuditLogsView } from "./components/audit/AuditLogsView";
import { SettingsView } from "./components/settings/SettingsView";
import { PublicVerificationView } from "./components/certificates/PublicVerificationView";
import { InterviewsManagementView } from "./components/interviews/InterviewsManagementView";
import { VerificationQueueView } from "./components/verifications/VerificationQueueView";

export function App() {
  const { currentUser } = useStore();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultRole, setAuthDefaultRole] = useState<"faculty" | "student" | null>(null);

  // Quick modals triggered from dashboard
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isCreateDriveModalOpen, setIsCreateDriveModalOpen] = useState(false);

  // Hash-based routing for QR verification link e.g. #verify/TOKEN
  const [isPublicVerifyMode, setIsPublicVerifyMode] = useState(false);
  const [verifyToken, setVerifyToken] = useState<string>("CB-2026-CS-8921-A9D");

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#verify")) {
        const parts = hash.split("/");
        if (parts.length > 1 && parts[1]) {
          setVerifyToken(decodeURIComponent(parts[1]));
        }
        setIsPublicVerifyMode(true);
      } else {
        setIsPublicVerifyMode(false);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // 1. If public verification route is active:
  if (isPublicVerifyMode) {
    return (
      <PublicVerificationView
        initialToken={verifyToken}
        onBackToHome={() => {
          window.location.hash = "";
          setIsPublicVerifyMode(false);
        }}
      />
    );
  }

  // 2. If user is NOT logged in: Show Public Homepage + Sign In Modal
  if (!currentUser) {
    return (
      <>
        <Homepage
          onOpenSignIn={(role) => {
            setAuthDefaultRole(role || null);
            setIsAuthOpen(true);
          }}
          onOpenPublicVerification={() => {
            setIsPublicVerifyMode(true);
          }}
        />
        <SignInModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          defaultRole={authDefaultRole}
        />
      </>
    );
  }

  // 3. Authenticated Application Shell (Role-Based)
  const isStaff = currentUser.role === "placement_admin" || currentUser.role === "faculty";

  return (
    <AppLayout activeTab={activeTab} onNavigate={(tab) => setActiveTab(tab)}>
      {activeTab === "overview" && (
        isStaff ? (
          <FacultyDashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenImport={() => {
              setActiveTab("students");
              setIsImportModalOpen(true);
            }}
            onOpenAddStudent={() => {
              setActiveTab("students");
              setIsAddStudentModalOpen(true);
            }}
            onOpenCreateDrive={() => {
              setActiveTab("drives");
              setIsCreateDriveModalOpen(true);
            }}
          />
        ) : (
          <StudentDashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenCertificateModal={() => setActiveTab("nodues")}
          />
        )
      )}

      {activeTab === "profile" && (
        <StudentProfileView onNavigate={(tab) => setActiveTab(tab)} />
      )}

      {activeTab === "students" && (
        <StudentManagementView
          isImportOpen={isImportModalOpen}
          onCloseImport={() => setIsImportModalOpen(false)}
          isAddOpen={isAddStudentModalOpen}
          onCloseAdd={() => setIsAddStudentModalOpen(false)}
        />
      )}

      {activeTab === "drives" && (
        <CompanyDrivesView
          isCreateOpen={isCreateDriveModalOpen}
          onCloseCreate={() => setIsCreateDriveModalOpen(false)}
        />
      )}

      {activeTab === "applications" && (
        <ApplicationsPipelineView onNavigate={(tab) => setActiveTab(tab)} />
      )}

      {activeTab === "interviews" && <InterviewsManagementView />}

      {activeTab === "nodues" && (
        isStaff ? (
          <NoDuesClearanceView />
        ) : (
          <StudentClearanceView onNavigate={(tab) => setActiveTab(tab)} />
        )
      )}

      {activeTab === "offers" && (
        <StudentOffersView onNavigate={(tab) => setActiveTab(tab)} />
      )}

      {activeTab === "verifications" && <VerificationQueueView />}

      {activeTab === "reports" && <ReportsView />}

      {activeTab === "audit" && <AuditLogsView />}

      {activeTab === "verify" && (
        <PublicVerificationView
          initialToken="CB-2026-CS-8921-A9D"
          onBackToHome={() => setActiveTab("overview")}
        />
      )}

      {activeTab === "settings" && <SettingsView />}
    </AppLayout>
  );
}

export default App;
