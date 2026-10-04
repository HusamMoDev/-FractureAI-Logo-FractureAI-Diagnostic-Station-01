import React, { useEffect, useState } from 'react';

import { PageTab, ScanRecord } from './types';

import { Sidebar } from './components/Sidebar';

import { Header } from './components/Header';

import { DashboardView } from './screens/DashboardView';

import { DetectView } from './screens/DetectView';

import { ExplainView } from './screens/ExplainView';

import { DatabaseView } from './screens/DatabaseView';

import AdminManagementView from './screens/AdminManagementView';

import { UploadModal } from './components/UploadModal';

import { ReportModal } from './components/ReportModal';

import { SettingsModal } from './components/SettingsModal';

import { ToolsOverlay } from './components/ToolsOverlay';

import { ProfileView } from './screens/ProfileView';

import { AuthLayout } from './screens/AuthLayout';

import { SplashScreen } from './screens/SplashScreen';

import { CaseDetailsView } from './screens/CaseDetailsView';

import { supabase } from './lib/supabase';
import { authService } from './services/AuthService';



type SupabasePredictionRow = {

  id: string;

  status: string | null;

  detected_fracture: boolean | null;

  confidence_overall: number | null;

  response_raw: unknown;

  message_error: string | null;

  ms_processing: number | null;

  at_created: string | null;



  boxes_prediction:

    | {

        id: string;

        id_type_fracture: string | null;

        min_x: number;

        min_y: number;

        max_x: number;

        max_y: number;

        confidence: number;

        label: string;

        at_created: string;



        types_fracture:

          | {

              id: string;

              code: string;

              en_label: string;

              ar_label: string | null;

              description: string | null;

            }

          | null;

      }[]

    | null;

};



type SupabaseCaseRow = {

  id: string;

  part_body: string | null;

  status: string | null;

  priority: string | null;

  at_created: string | null;



  patients:

    | {

        id: string;

        name_full: string | null;

        number_record_medical: string | null;

        sex: string | null;

        birth_of_date: string | null;

      }

    | {

        id: string;

        name_full: string | null;

        number_record_medical: string | null;

        sex: string | null;

        birth_of_date: string | null;

      }[]

    | null;



  images_xray:

    | {

        id: string;

        filename_original: string | null;

        status_inference: string | null;

        path_storage: string | null;

        bucket_storage: string | null;



        predictions_ai:

          | SupabasePredictionRow[]

          | null;

      }[] | null;

};



const emptyScanList: ScanRecord[] = [];



const mapCaseToScanRecord = (

  row: SupabaseCaseRow

): ScanRecord => {

  const patient = Array.isArray(row.patients)

    ? row.patients[0]

    : row.patients;



  const image = Array.isArray(row.images_xray)

    ? row.images_xray[0]

    : undefined;



  const prediction =

    image?.predictions_ai &&

    image.predictions_ai.length > 0

      ? image.predictions_ai[0]

      : undefined;



  const box =

    prediction?.boxes_prediction &&

    prediction.boxes_prediction.length > 0

      ? prediction.boxes_prediction[0]

      : undefined;



  const createdAt = row.at_created

    ? new Date(row.at_created)

    : null;



  const date =

    createdAt &&

    !Number.isNaN(createdAt.getTime())

      ? createdAt.toISOString().split('T')[0]

      : '';



  const time =

    createdAt &&

    !Number.isNaN(createdAt.getTime())

      ? createdAt.toLocaleTimeString([], {

          hour: '2-digit',

          minute: '2-digit',

        })

      : '';



  const confidence =

    prediction?.confidence_overall != null

      ? prediction.confidence_overall * 100

      : null;



  const hasSuccessfulPrediction =

    prediction?.status === 'succeeded';



  const primaryFinding = hasSuccessfulPrediction

    ? prediction.detected_fracture

      ? 'Fracture detected'

      : 'No fracture detected'

    : 'Analysis pending';



  const status: ScanRecord['status'] =

    hasSuccessfulPrediction

      ? prediction.detected_fracture

        ? 'Critical'

        : 'Normal'

      : 'Pending';



  const gender: ScanRecord['gender'] =

    patient?.sex === 'Male'

      ? 'Male'

      : patient?.sex === 'Female'

        ? 'Female'

        : 'Other';



  return {

    id: row.id,



    patientName:

      patient?.name_full || 'Unknown Patient',



    patientAge: undefined,



    dob:

      patient?.birth_of_date || '',



    mrn:

      patient?.number_record_medical || '',



    gender,



    date,



    time,



    modality: 'X-Ray',



    region:

      row.part_body || 'Not specified',



    status,



    confidence,



    primaryFinding,



    secondaryFinding: '',



    secondaryConfidence: 0,



    recommendation:

      hasSuccessfulPrediction

        ? prediction.detected_fracture

          ? 'Review the detected fracture findings.'

          : 'No fracture detected by the AI model.'

        : 'AI analysis is pending.',



    indication: '',



    technique: 'X-Ray examination',



    findingsList: [],



    impression:

      hasSuccessfulPrediction

        ? prediction.detected_fracture

          ? 'Fracture detected by the AI model.'

          : 'No fracture detected by the AI model.'

        : 'AI analysis is pending.',



    radiologist: '',



    imageUrl: '',



    obbBox: box

      ? {

          top: `${box.min_y * 100}%`,

          left: `${box.min_x * 100}%`,

          width: `${(box.max_x - box.min_x) * 100}%`,

          height: `${(box.max_y - box.min_y) * 100}%`,

          rotation: '0deg',

          label:

            box.types_fracture?.en_label ||

            box.label ||

            'Fracture',

        }

      : undefined,

  };

};



export function App() {

  const [showSplash, setShowSplash] =

    useState<boolean>(true);



  const [isAuthenticated, setIsAuthenticated] =

    useState<boolean>(false);

  const [authReady, setAuthReady] =
    useState<boolean>(false);



  const [scans, setScans] =

    useState<ScanRecord[]>(emptyScanList);



  const [currentScan, setCurrentScan] =

    useState<ScanRecord | null>(null);



  const [activeTab, setActiveTab] =

    useState<PageTab>('detect');



  const [searchQuery, setSearchQuery] =

    useState<string>('');



  const [lang, setLang] =

    useState<'en' | 'ar'>('en');



  const [isLoadingCases, setIsLoadingCases] =

    useState<boolean>(false);



  const [casesError, setCasesError] =

    useState<string | null>(null);



  const [isUploadOpen, setIsUploadOpen] =

    useState<boolean>(false);



  const [isReportOpen, setIsReportOpen] =

    useState<boolean>(false);



  const [isSettingsOpen, setIsSettingsOpen] =

    useState<boolean>(false);



  const [isMeasurementActive, setIsMeasurementActive] =

    useState<boolean>(false);



  const [isAngleActive, setIsAngleActive] =

    useState<boolean>(false);



  const loadCases = async () => {

    setIsLoadingCases(true);

    setCasesError(null);



    const { data, error } = await supabase

      .from('cases')

      .select(`

        id,

        part_body,

        status,

        priority,

        at_created,



        patients!cases_patient_clinic_fk (

          id,

          name_full,

          number_record_medical,

          sex,

          birth_of_date

        ),



        images_xray (

          id,

          filename_original,

          status_inference,

          path_storage,

          bucket_storage,



          predictions_ai (

            id,

            status,

            detected_fracture,

            confidence_overall,

            response_raw,

            message_error,

            ms_processing,

            at_created,



            boxes_prediction (

              id,

              id_type_fracture,

              min_x,

              min_y,

              max_x,

              max_y,

              confidence,

              label,

              at_created,



              types_fracture (

                id,

                code,

                en_label,

                ar_label,

                description

              )

            )

          )

        )

      `)

      .order('at_created', {

        ascending: false,

      });



    if (error) {

      console.error(

        'Error loading cases:',

        error

      );



      setCasesError(error.message);

      setScans([]);

      setCurrentScan(null);

      setIsLoadingCases(false);



      return;

    }



    const rows =

      (data || []) as SupabaseCaseRow[];



    const mappedScans = await Promise.all(

      rows.map(async (row) => {

        const scan =

          mapCaseToScanRecord(row);



        const image =

          Array.isArray(row.images_xray)

            ? row.images_xray[0]

            : undefined;



        if (

          image?.path_storage &&

          image?.bucket_storage

        ) {

          const {

            data: signedUrlData,

            error: signedUrlError,

          } = await supabase.storage

            .from(image.bucket_storage)

            .createSignedUrl(

              image.path_storage,

              60 * 60

            );



          if (signedUrlError) {

            console.error(

              'Error creating X-Ray signed URL:',

              signedUrlError

            );

          } else if (

            signedUrlData?.signedUrl

          ) {

            scan.imageUrl =

              signedUrlData.signedUrl;

          }

        }



        return scan;

      })

    );



    setScans(mappedScans);



    setCurrentScan((previousScan) => {

      if (previousScan) {

        const refreshedScan =

          mappedScans.find(

            (scan) =>

              scan.id === previousScan.id

          );



        if (refreshedScan) {

          return refreshedScan;

        }

      }



      return mappedScans[0] || null;

    });



    console.log(

      'Cases loaded from Supabase:',

      mappedScans

    );



    setIsLoadingCases(false);

  };



  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!mounted) return;
        setIsAuthenticated(Boolean(user));
      } catch (error) {
        console.error('Authentication initialization error:', error);
        if (mounted) setIsAuthenticated(false);
      } finally {
        if (mounted) setAuthReady(true);
      }
    };

    void initializeAuth();

    const subscription = authService.onAuthStateChange((user) => {
      if (!mounted) return;
      setIsAuthenticated(Boolean(user));
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady || !isAuthenticated) return;

    const loadCasesAfterAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsAuthenticated(false);
        return;
      }
      await loadCases();
    };

    void loadCasesAfterAuth();
  }, [authReady, isAuthenticated]);



  const filteredScans = scans.filter((s) => {

    if (!searchQuery.trim()) {

      return true;

    }



    const q =

      searchQuery.toLowerCase();



    return (

      s.id.toLowerCase().includes(q) ||

      s.patientName

        .toLowerCase()

        .includes(q) ||

      s.region

        .toLowerCase()

        .includes(q) ||

      s.primaryFinding

        .toLowerCase()

        .includes(q)

    );

  });



  const handleSelectTab = (

    tab: PageTab

  ) => {

    if (tab === 'upload') {

      setIsUploadOpen(true);

      return;

    }



    if (tab === 'report') {

      if (currentScan) {

        setIsReportOpen(true);

      }



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



  const handleScanCreated = (

    newScan: ScanRecord

  ) => {

    setScans((previousScans) => [

      newScan,

      ...previousScans,

    ]);



    setCurrentScan(newScan);

    setActiveTab('detect');



    void loadCases();

  };



  const handleUpdateScan = (

    updatedScan: ScanRecord

  ) => {

    setScans((previousScans) =>

      previousScans.map((scan) =>

        scan.id === updatedScan.id

          ? updatedScan

          : scan

      )

    );



    setCurrentScan((previousScan) =>

      previousScan?.id === updatedScan.id

        ? updatedScan

        : previousScan

    );

  };



  const handleLogout = async () => {

    const { error } =

      await supabase.auth.signOut();



    if (error) {

      console.error(

        'Logout error:',

        error

      );



      return;

    }



    setIsAuthenticated(false);

    setActiveTab('dashboard');

    setCurrentScan(null);

    setScans([]);

  };



  if (showSplash) {

    return (

      <SplashScreen

        onComplete={() =>

          setShowSplash(false)

        }

      />

    );

  }



  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="text-sm text-slate-400">Checking authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {

    return (

      <AuthLayout

        onLoginSuccess={async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) {
            console.error('Login completed but no Supabase session is available.');
            return;
          }
          setActiveTab('dashboard');
          setIsAuthenticated(true);
          setAuthReady(true);
        }}

      />

    );

  }



  return (

    <div

      className={`min-h-screen bg-[#020617] text-slate-100 medical-net-bg selection:bg-cyan-500 selection:text-white ${

        lang === 'ar'

          ? 'rtl'

          : 'ltr'

      }`}

    >

      <div className="print:hidden">

        <Sidebar

          activeTab={activeTab}

          onSelectTab={handleSelectTab}

          criticalCount={

            scans.filter(

              (scan) =>

                scan.status === 'Critical'

            ).length

          }

        />

      </div>



      <div className="md:ml-64 flex flex-col min-h-screen print:hidden">



        {currentScan && (

          <Header

            currentScan={currentScan}

            activeTab={activeTab}

            onSelectTab={handleSelectTab}

            searchQuery={searchQuery}

            onSearchChange={setSearchQuery}

            onOpenSettings={() =>

              setIsSettingsOpen(true)

            }

            onOpenUpload={() =>

              setIsUploadOpen(true)

            }

            lang={lang}

            onToggleLang={() =>

              setLang((previousLang) =>

                previousLang === 'en'

                  ? 'ar'

                  : 'en'

              )

            }

          />

        )}



        <main className="flex-1 pt-20 px-4 md:px-8 max-w-[1600px] w-full mx-auto relative">



          {isLoadingCases && (

            <div className="mb-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-sm text-cyan-300">

              Loading cases from Supabase...

            </div>

          )}



          {casesError && (

            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">

              Failed to load cases:{' '}

              {casesError}

            </div>

          )}



          {activeTab === 'dashboard' && (

            <DashboardView

              scans={filteredScans}

              onSelectScan={(scan) => {

                setCurrentScan(scan);

                setActiveTab('detect');

              }}

              onNavigateTab={

                handleSelectTab

              }

            />

          )}



          {(activeTab === 'detect' ||

            activeTab === 'analyze') &&

            currentScan && (

              <div className="relative">



                <DetectView

                  scan={currentScan}

                  onNavigateTab={

                    handleSelectTab

                  }

                  onOpenReport={() =>

                    setIsReportOpen(true)

                  }

                  onToggleMeasurementTool={() => {

                    setIsMeasurementActive(

                      (previous) =>

                        !previous

                    );



                    setIsAngleActive(false);

                  }}

                  onToggleAngleTool={() => {

                    setIsAngleActive(

                      (previous) =>

                        !previous

                    );



                    setIsMeasurementActive(false);

                  }}

                  isMeasurementActive={

                    isMeasurementActive

                  }

                  isAngleActive={

                    isAngleActive

                  }

                />



                <ToolsOverlay

                  isMeasurementActive={

                    isMeasurementActive

                  }

                  isAngleActive={

                    isAngleActive

                  }

                  onCloseTools={() => {

                    setIsMeasurementActive(false);

                    setIsAngleActive(false);

                  }}

                />



              </div>

            )}



          {(activeTab === 'detect' ||

            activeTab === 'analyze') &&

            !currentScan &&

            !isLoadingCases && (

              <div className="flex min-h-[400px] items-center justify-center">



                <div className="text-center">



                  <div className="material-symbols-outlined text-5xl text-slate-500 mb-3">

                    image_search

                  </div>



                  <h2 className="text-lg font-semibold text-white">

                    No case selected

                  </h2>



                  <p className="mt-1 text-sm text-slate-400">

                    Create or select a case to begin.

                  </p>



                </div>



              </div>

            )}



          {activeTab === 'explain' &&

            currentScan && (

              <ExplainView

                scan={currentScan}

                onOpenReportPrint={() =>

                  setIsReportOpen(true)

                }

              />

            )}



          {activeTab === 'database' && (

            <DatabaseView

              scans={filteredScans}

              onSelectScan={(scan) => {

                setCurrentScan(scan);

                setActiveTab('case-details');

              }}

              onNavigateTab={

                handleSelectTab

              }

              onOpenUpload={() =>

                setIsUploadOpen(true)

              }

            />

          )}



          {activeTab === 'case-details' &&

            currentScan && (

              <CaseDetailsView

                scan={currentScan}

                onNavigateTab={

                  handleSelectTab

                }

                onBack={() =>

                  setActiveTab('database')

                }

              />

            )}



          {activeTab === 'profile' && (

            <ProfileView

              onLogout={handleLogout}

            />

          )}



          {activeTab === 'admin-management' && (

            <AdminManagementView />

          )}



        </main>

      </div>



      <UploadModal

        isOpen={isUploadOpen}

        onClose={() =>

          setIsUploadOpen(false)

        }

        onScanCreated={

          handleScanCreated

        }

      />



      {currentScan && (

        <ReportModal

          isOpen={isReportOpen}

          onClose={() =>

            setIsReportOpen(false)

          }

          scan={currentScan}

          onUpdateScan={

            handleUpdateScan

          }

        />

      )}



      <SettingsModal

        isOpen={isSettingsOpen}

        onClose={() =>

          setIsSettingsOpen(false)

        }

      />



    </div>

  );

}



export default App;