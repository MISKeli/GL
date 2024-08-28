import {
  DashboardOutlined,
  DashboardRounded,
  PersonOutline,
  PersonRounded,
  SupervisedUserCircleOutlined,
  SupervisedUserCircleRounded,
} from "@mui/icons-material";

export const moduleSchema = [
  {
    name: "Dashboard",
    section: "Dashboard",
    icon: DashboardOutlined,
    iconOn: DashboardRounded,
    to: "/",
    subCategory: null,
  },
  {
    name: "Users Management",
    section: "users_management",
    icon: SupervisedUserCircleOutlined,
    iconOn: SupervisedUserCircleRounded,
    to: "/users_management",
    subCategory: [
      {
        name: "User Account",
        section: "users_account",
        icon: PersonOutline,
        iconOn: PersonRounded,
        to: "/users_management/users_account",
      },
      {
        name: "Role Management",
        section: "role_management",
        icon: SupervisedUserCircleOutlined,
        iconOn: SupervisedUserCircleRounded,
        to: "/users_management/role_management",
      },
    ],
  },
  
];
