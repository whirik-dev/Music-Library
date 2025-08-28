import { ToastContainer } from 'react-toastify';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

import Provider from "@/components/Provider";
import HealthCheckProvider from "@/components/HealthCheckProvider";

import MainLayout from "../../components/MainLayout"
import GlobalBackdrop from "@/components/ui/GolbalBackdrop";
import SignInModal from "../../components/auth/SignInModal"
import Modal from "../../components/modal/Modal"
import TailoredModal from "@/components/tailored/TailoredModal";

import NewbiePopup from "@/components/popup/NewbiePopup";
import PopupProvider from '@/components/PopupProvider';

export const metadata = {
  title: "Prototype",
  // description: "",
};

export default function AppLayout({ children }) {
  return (
    <HealthCheckProvider>
      <Provider>
        <MainLayout>
          <div className="flex-1 ml-0 lg:ml-[280px]">
            {children}
          </div>

          <GlobalBackdrop />
          
          {/* 여러 모달들 */}
          <Modal />
          <SignInModal />
          <TailoredModal />
          <PopupProvider />
        </MainLayout>
        <ToastContainer 
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </Provider>
      <SpeedInsights />
      <Analytics />
    </HealthCheckProvider>
  );
}
