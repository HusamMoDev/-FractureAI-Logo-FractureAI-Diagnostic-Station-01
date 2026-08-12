import React, { useState } from 'react';
import { PageTab, ScanRecord } from './types';
import { SAMPLE_SCANS } from './data/sampleScans';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './screens/DashboardView';
import { DetectView } from './screens/DetectView';
import { ExplainView } from './screens/ExplainView';
import { DatabaseView } from './screens/DatabaseView';
import { UploadModal } from './components/UploadModal';
import { ReportModal } from './components/ReportModal';
import { SettingsModal } from './components/SettingsModal';
import { ToolsOverlay } from './components/ToolsOverlay';
import { ProfileView } from './screens/ProfileView';
import { AuthLayout } from './screens/AuthLayout';
import { SplashScreen } from './screens/SplashScreen';

export function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [scans, setScans] = useState<ScanRecord[]>(SAMPLE_SCANS);
  const [currentScan, setCurrentScan] = useState<ScanRecord>(SAMPLE_SCANS[1]); // XRAY-2409-A4 (Jane Doe)
  const [activeTab, setActiveTab] = useState<PageTab>('detect');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Measurement & Angle Tools
  const [isMeasurementActive, setIsMeasurementActive] = useState<boolean>(false);
  const [isAngleActive, setIsAngleActive] = useState<boolean>(false);

  // Filtered Scans for search
  const filteredScans = scans.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.id.toLowerCase().includes(q) ||
      s.patientName.toLowerCase().includes(q) ||
      s.region.toLowerCase().includes(q) ||
      s.primaryFinding.toLowerCase().includes(q)
    );
  });

  const handleSelectTab = (tab: PageTab) => {
    if (tab === 'upload') {
      setIsUploadOpen(true);
      return;
    }
    if (tab === 'report') {
      setIsReportOpen(true);
      return;
    }
    if (tab === 'heatmap') {
      setActiveTab('detect');
      return;
    }
    if (tab === 'measurement') {
      setActiveTab('detect');
      setIsMeasurementActive(true);
      setIsAngleActive(false);
      return;
    }
    if (tab === 'angle') {
      setActiveTab('detect');
      setIsAngleActive(true);
      setIsMeasurementActive(false);
      return;
    }
    setActiveTab(tab);
  };

  const handleScanCreated = (newScan: ScanRecord) => {
    setScans([newScan, ...scans]);
    setCurrentScan(newScan);
    setActiveTab('detect');
  };

  const handleUpdateScan = (updatedScan: ScanRecord) => {
    setScans(scans.map(s => s.id === updatedScan.id ? updatedScan : s));
    if (currentScan.id === updatedScan.id) {
      setCurrentScan(updatedScan);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('dashboard'); // Reset tab state
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!isAuthenticated) {
    return (
      <AuthLayout
        onLoginSuccess={() => {
          setActiveTab('dashboard');
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-[#020617] text-slate-100 medical-net-bg selection:bg-cyan-500 selection:text-white ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Fixed Navigation Sidebar */}
      <div className="print:hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          criticalCount={scans.filter((s) => s.status === 'Critical').length}
        />
      </div>

      {/* Main Layout Area */}
      <div className="md:ml-64 flex flex-col min-h-screen print:hidden">
        {/* Top Header */}
        <Header
          currentScan={currentScan}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenUpload={() => setIsUploadOpen(true)}
          lang={lang}
          onToggleLang={() => setLang(lang === 'en' ? 'ar' : 'en')}
        />

        {/* Main Content View Container */}
        <main className="flex-1 pt-20 px-4 md:px-8 max-w-[1600px] w-full mx-auto relative">
          {activeTab === 'dashboard' && (
            <DashboardView
              scans={filteredScans}
              onSelectScan={setCurrentScan}
              onNavigateTab={handleSelectTab}
            />
          )}

          {(activeTab === 'detect' || activeTab === 'analyze') && (
            <div className="relative">
              <DetectView
                scan={currentScan}
                onNavigateTab={handleSelectTab}
                onOpenReport={() => setIsReportOpen(true)}
                onToggleMeasurementTool={() => {
                  setIsMeasurementActive(!isMeasurementActive);
                  setIsAngleActive(false);
                }}
                onToggleAngleTool={() => {
                  setIsAngleActive(!isAngleActive);
                  setIsMeasurementActive(false);
                }}
                isMeasurementActive={isMeasurementActive}
                isAngleActive={isAngleActive}
              />

              {/* Tools Canvas Overlay */}
              <ToolsOverlay
                isMeasurementActive={isMeasurementActive}
                isAngleActive={isAngleActive}
                onCloseTools={() => {
                  setIsMeasurementActive(false);
                  setIsAngleActive(false);
                }}
              />
            </div>
          )}

          {activeTab === 'explain' && (
            <ExplainView
              scan={currentScan}
              onOpenReportPrint={() => setIsReportOpen(true)}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseView
              scans={filteredScans}
              onSelectScan={(s) => {
                setCurrentScan(s);
                setActiveTab('detect');
              }}
              onNavigateTab={handleSelectTab}
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView onLogout={handleLogout} />
          )}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onScanCreated={handleScanCreated}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        scan={currentScan}
        onUpdateScan={handleUpdateScan}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
