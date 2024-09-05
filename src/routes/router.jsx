import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/login/LoginPage";
import MainPage from "../pages/MainPage";
import PrivateRoutes from "../pages/PrivateRoutes";
import DashboardPage from "../pages/DashboardPage";
import UserManagementPage from "../pages/userManagement/UserManagementPage";
import AccessPermission from "../components/AccessPermission";
import UserAccountPage from "../pages/userManagement/UserAccountPage";
import RoleManagementPage from "../pages/userManagement/RoleManagemenPage";
import ReportPage from "../pages/reports/ReportPage";
import ArcanaPage from "../pages/reports/ArcanaPage";
import UMPage from "../pages/reports/UMPage";
import YmirPage from "../pages/reports/YmirPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
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
                  <AccessPermission permission={"User"}>
                    <UserAccountPage />
                  </AccessPermission>
                ),
              },
              {
                path: "role_management",
                element: (
                  <AccessPermission permission={"User"}>
                    <RoleManagementPage />
                  </AccessPermission>
                ),
              },
            ],
          },
          {
            path: "reports",
            element: <ReportPage />,
            children: [
              {
                path: "arcana",
                element: <ArcanaPage />,
              },
              {
                path: "um",
                element: <UMPage />,
              },
              {
                path: "ymir",
                element: <YmirPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
