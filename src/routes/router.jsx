import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/login/LoginPage";
import MainPage from "../pages/MainPage";
import PrivateRoutes from "../pages/PrivateRoutes";
import DashboardPage from "../pages/DashboardPage";
import UserManagementPage from "../pages/userManagement/UserManagementPage";
import AccessPermission from "../components/AccessPermission";
import UserAccountPage from "../pages/userManagement/UserAccountPage";
import RoleManagementPage from "../pages/userManagement/RoleManagemenPage";
import SystemsPage from "../pages/systems/SystemsPage";
import ArcanaPage from "../pages/systems/ArcanaPage";
import UMPage from "../pages/systems/UMPage";
import YmirPage from "../pages/systems/YmirPage";
import FistoPage from "../pages/systems/FistoPage";
import ElixirETDPage from "../pages/systems/ElixirETDPage";
import ElixirPharmacyPage from "../pages/systems/ElixirPharmacyPage";
import ImportPage from "../pages/ImportPage";

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
            path: "import",
            element: <ImportPage />,
          },
          {
            path: "systems",
            element: <SystemsPage />,
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
                path: "elixir_etd",
                element: <ElixirETDPage />,
              },
              {
                path: "elixir_pharmacy",
                element: <ElixirPharmacyPage />,
              },
              {
                path: "ymir",
                element: <YmirPage />,
              },
              {
                path: "fisto",
                element: <FistoPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
