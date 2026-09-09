import React, { useEffect, useRef, useState } from 'react';
import { BankingProvider, useBanking } from './context/BankingContext';
import { ScreenTab } from './types/banking';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { SplashScreen } from './components/screens/SplashScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { AccountsScreen } from './components/screens/AccountsScreen';
import { TransfersScreen } from './components/screens/TransfersScreen';
import { CardsScreen } from './components/screens/CardsScreen';
import { MoreScreen } from './components/screens/MoreScreen';
import { AtenaPanel } from './components/agent/AtenaPanel';

const BankingAppInner: React.FC = () => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    navigateToTab,
    setNavigateToTab,
    highlightedTxId,
    setHighlightedTxId,
    highlightedCardLast4,
    isConsultingTx
  } = useBanking();
  // Some mobile browsers suspend (and on return, fully reload) the tab when
  // the customer leaves it to use the system camera — e.g. the Didit selfie
  // step. A plain reload wipes all in-memory state, so without this the app
  // always came back on 'home'/login regardless of what screen the customer
  // was on. Persisting the active tab lets a reload land back where they left
  // off instead of restarting the app.
  const TAB_STORAGE_KEY = 'hubbank_active_tab';
  const [activeTab, setActiveTab] = useState<ScreenTab>(() => {
    try {
      return (sessionStorage.getItem(TAB_STORAGE_KEY) as ScreenTab | null) || 'home';
    } catch {
      return 'home';
    }
  });
  const [isMainScrolling, setIsMainScrolling] = useState<boolean>(false);
  const scrollIdleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistTab = (tab: ScreenTab) => {
    try { sessionStorage.setItem(TAB_STORAGE_KEY, tab); } catch { /* ignore */ }
  };

  // Every in-app screen change pushes a history entry, so the mobile/browser
  // back gesture moves between HubBank's own screens instead of leaving the
  // app entirely. navigate() is the only thing that should ever change tabs;
  // the popstate listener below applies a back/forward navigation without
  // pushing a new entry for it.
  const navigate = (tab: ScreenTab) => {
    if (tab === activeTab) return;
    window.history.pushState({ tab }, '', '');
    setActiveTab(tab);
    persistTab(tab);
  };

  useEffect(() => {
    window.history.replaceState({ tab: activeTab }, '', '');
    const onPopState = (e: PopStateEvent) => {
      const tab = (e.state?.tab as ScreenTab) || 'home';
      setActiveTab(tab);
      persistTab(tab);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The live agent's tool calls (verify_transaction, report_fraud, block_card)
  // request navigation through context; apply it here and clear the request.
  useEffect(() => {
    if (navigateToTab) {
      navigate(navigateToTab);
      setNavigateToTab(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigateToTab, setNavigateToTab]);

  const handleMainScroll = () => {
    setIsMainScrolling(true);
    if (scrollIdleTimer.current) clearTimeout(scrollIdleTimer.current);
    scrollIdleTimer.current = setTimeout(() => setIsMainScrolling(false), 200);
  };

  // If on Splash or Login, render full standalone screen
  if (activeTab === 'splash') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#071411] via-[#102b26] to-[#1c3934] sm:py-8 sm:px-4 flex items-center justify-center font-sans antialiased">
        <SplashScreen onEnter={() => navigate('login')} />
      </div>
    );
  }

  if (activeTab === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#071411] via-[#102b26] to-[#1c3934] sm:py-8 sm:px-4 flex items-center justify-center font-sans antialiased">
        <LoginScreen
          onLoginSuccess={() => navigate('home')}
          onCreateAccount={() => navigate('onboarding')}
        />
      </div>
    );
  }

  if (activeTab === 'onboarding') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#071411] via-[#102b26] to-[#1c3934] sm:py-8 sm:px-4 flex items-center justify-center font-sans antialiased">
        <OnboardingScreen onBackToLogin={() => navigate('login')} />
      </div>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'accounts':
        return <AccountsScreen />;
      case 'transfers':
        return <TransfersScreen />;
      case 'cards':
        return <CardsScreen highlightedTxId={highlightedTxId} preferredCardLast4={highlightedCardLast4} />;
      case 'more':
        return <MoreScreen onLogout={() => navigate('login')} />;
      case 'home':
      default:
        return (
          <HomeScreen
            onNavigate={(tab) => navigate(tab)}
            highlightedTxId={highlightedTxId}
            isConsultingTx={isConsultingTx}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071411] via-[#102b26] to-[#1c3934] sm:py-6 sm:px-4 flex justify-center font-sans antialiased selection:bg-[#C1BA73] selection:text-[#425E5A]">
      {/* Mobile Device Frame matching PDF proportions */}
      <div className="w-full max-w-md bg-[#F4F6F8] h-screen sm:h-auto sm:min-h-[840px] sm:max-h-[880px] sm:rounded-3xl shadow-2xl flex flex-col relative overflow-hidden border border-slate-700/50">
        {/* App Top Header */}
        <AppHeader
          activeTab={activeTab}
          onOpenNito={() => setIsDrawerOpen(true)}
        />

        {/* Scrollable Screen Content */}
        <main
          className="flex-1 min-h-0 overflow-y-auto px-4 pt-3 scrollbar-thin scrollbar-thumb-slate-300"
          onScroll={handleMainScroll}
        >
          {renderScreen()}
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            setHighlightedTxId(null);
            navigate(tab);
          }}
        />

        {/* Nito Conversational Layer */}
        <AtenaPanel isMainScrolling={isMainScrolling} />
      </div>
    </div>
  );
};

export function App() {
  return (
    <BankingProvider>
      <BankingAppInner />
    </BankingProvider>
  );
}

export default App;
