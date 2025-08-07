import { createBrowserRouter } from "react-router-dom";
import AccessPermission from "../components/AccessPermission";
import BoaPage from "../pages/BOA/BoaPage";
import ChargeOfAccountPage from "../pages/Masterlist/ChargeOfAccount/ChargeOfAccountPage";
import DashboardPage from "../pages/DashboardPage";
import MonthsPage from "../pages/Foldering/MonthPage";
import SystemFilepage from "../pages/Foldering/SystemFilePage";
import SystemNames from "../pages/Foldering/SystemNames";
import YearPage from "../pages/Foldering/YearPage";
import { LoginRoutes } from "../pages/login/LoginRoute";
import MainPage from "../pages/MainPage";
import Notfound from "../pages/NotFound";
import PrivateRoutes from "../pages/PrivateRoutes";
import SystemActivityPage from "../pages/Masterlist/SystemActivity/SystemActivityPage";
import SystemPage2 from "../pages/SystemPage2";
import MainSystemPage from "../pages/systems/MainSystemPage";
import SystemsPage from "../pages/systems/SystemsPage";
import SystemViewingPage from "../pages/systems/SystemViewingPage";
import SystemSetupPageSample from "../pages/Masterlist/systemSetup/SystemSetupPageSample";
import TrialBalanceDropDownPage from "../pages/TrailBalance/TrialBalanceDropDownPage";
import RoleManagementPage from "../pages/userManagement/RoleManagemenPage";
import UserAccountPage from "../pages/userManagement/UserAccountPage";
import UserManagementPage from "../pages/userManagement/UserManagementPage";
import CusImport from "../pages/systems/CusImport";
import CustomImport from "../components/custom/CustomImport";
import MainSystemPageV2 from "../pages/systems/MainSystemPageV2";
import AccountTitlePage from "../pages/AccountTitle/AccountTitlePage";
import MasterlistPage from "../pages/Masterlist/MasterlistPage";
import BalanceSheetPage from "../pages/BalanceSheet/BalanceSheetPage";
import PromptPage from "../pages/PromptAI/PromptPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginRoutes />,
  },
  {
    element: <PrivateRoutes />,
    children: [
      {
        path: "/",
        element: <MainPage />,
        children: [
          {
            path: "",
            element: (
              <AccessPermission permission={"Dashboard"}>
                <DashboardPage />
              </AccessPermission>
            ),
          },
          {
            path: "users_management",
            element: <UserManagementPage />,
            children: [
              {
                path: "users_account",
                element: (
                  <AccessPermission permission={"User Account"}>
                    <UserAccountPage />
                  </AccessPermission>
                ),
              },
              {
                path: "role_management",
                element: (
                  <AccessPermission permission={"Role Management"}>
                    <RoleManagementPage />
                  </AccessPermission>
                ),
              },
            ],
          },
          {
            path: "masterlist",
            element: <MasterlistPage />,
            children: [
              {
                path: "system_setup",
                element: (
                  <AccessPermission permission={"System Setup"}>
                    <SystemSetupPageSample />
                  </AccessPermission>
                ),
              },
              {
                path: "charge_of_account",
                element: (
                  <AccessPermission permission={"Charge of Account"}>
                    <ChargeOfAccountPage />
                  </AccessPermission>
                ),
              },
              {
                path: "account_title",
                element: (
                  <AccessPermission permission={"Account Title"}>
                    <AccountTitlePage />
                  </AccessPermission>
                ),
              },
            ],
          },
          // {
          //   path: "system_setup",
          //   element: <SystemSetupPageSample />,
          // },
          {
            path: "boa",
            element: <BoaPage />,
          },
          {
            path: "boa_file_manager",
            element: <SystemPage2 />,
            children: [
              {
                path: "",
                element: <YearPage />,
              },
              {
                path: ":year",
                element: <MonthsPage />,
              },
              {
                path: ":year/:month",
                element: <SystemFilepage />,
              },
              {
                path: ":year/:month/:boaName",
                element: <SystemNames />,
              },
            ],
          },
          {
            path: "main_system",
            element: <MainSystemPageV2 />,
          },
          {
            path: "system",
            element: <SystemsPage />,
            children: [
              {
                path: ":to",
                element: <SystemViewingPage />,
              },
            ],
          },
          {
            path: "trial_balance",
            element: <TrialBalanceDropDownPage />,
          },
          {
            path: "system_monitoring",
            element: <SystemActivityPage />,
          },
          {
            path: "balance_sheet",
            element: <BalanceSheetPage />,
          },
           {
            path: "promptAI",
            element: <PromptPage />,
          },
          // {
          //   path: "account_title",
          //   element: <AccountTitlePage />,
          // },
          // {
          //   path: "closed_date",
          //   element: <ClosedDatePage />,
          // },
          // {
          //   path: "closed_dialog_date",
          //   element: <ClosedDateDialogPage />,
          // },
        ],
      },
    ],
  },

  {
    path: "*",
    element: <Notfound />,
  },
]);
