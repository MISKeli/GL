import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/login/LoginPage";
import MainPage from "../pages/MainPage";
import PrivateRoutes from "../pages/PrivateRoutes";
import DashboardPage from "../pages/DashboardPage";
import UserManagementPage from "../pages/userManagement/UserManagementPage";
import AccessPermission from "../components/AccessPermission";
import UserAccountPage from "../pages/userManagement/UserAccountPage";
import RoleManagementPage from "../pages/userManagement/RoleManagemenPage";
// import SystemsPage from "../pages/systems/SystemsPage";

// import ImportPage from "../pages/ImportPage";
import SystemSetupPage from "../pages/systemSetup/SystemSetupPage";
//import SystemPage from "../pages/SystemPage";
import BoaPage from "../pages/BOA/BoaPage";
import MainSystemPage from "../pages/systems/MainSystemPage";
import TrialBalancePage from "../pages/TrialBalancePage";
import SystemPage2 from "../pages/SystemPage2";
import YearPage from "../pages/Foldering/YearPage";
import SystemFilepage from "../pages/Foldering/SystemFilePage";
import MonthsPage from "../pages/Foldering/MonthPage";
import SystemNames from "../pages/Foldering/SystemNames";
import { LoginRoutes } from "../pages/login/LoginRoute";

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
            element: <DashboardPage />,
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
            path: "system_setup",
            element: <SystemSetupPage />,
          },
          {
            path: "boa",
            element: <BoaPage />,
          },
          {
            path: "system",
            element: <SystemPage2 />,
            children: [
              {
                path: "",
                element: <YearPage />,
              },
              {
                path: ":year",
                element: <SystemFilepage />,
              },
              {
                path: ":year/:boaName/",
                element: <MonthsPage />,
              },
              {
                path: ":year/:boaName/:month",
                element: <SystemNames />,
              },
            ],
          },
          {
            path: "main_system",
            element: <MainSystemPage />,
          },
          // {
          //   path: "import",
          //   element: <ImportPage />,
          // },
          {
            path: "trial_balance",
            element: <TrialBalancePage />,
          },
          // {
          //   path: "systems",
          //   element: <SystemsPage />,

          // },
        ],
      },
    ],
  },
]);
