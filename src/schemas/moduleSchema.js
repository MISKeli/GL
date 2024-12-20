import {
  AccountBalanceWalletOutlined,
  AccountBalanceWalletRounded,
  CollectionsBookmarkOutlined,
  CollectionsBookmarkRounded,
  DashboardOutlined,
  DashboardRounded,
  DeveloperBoard,
  FeedOutlined,
  FeedRounded,
  Inventory2Outlined,
  Inventory2Rounded,
  LocalPharmacyOutlined,
  LocalPharmacyRounded,
  PersonOutline,
  PersonRounded,
  SupervisedUserCircleOutlined,
  SupervisedUserCircleRounded,
  SupervisorAccountOutlined,
  SupervisorAccountRounded,
} from "@mui/icons-material";
import Ymir from "../assets/icon/Ymir";
import YmirOn from "../assets/icon/YmirOn";
import Fisto from "../assets/icon/fisto";
import UM from "../assets/icon/UM";
import UMOn from "../assets/icon/UMOn";
import Elixir from "../assets/icon/Elixir";
import ElixirOn from "../assets/icon/ElixirOn";
import FistoOn from "../assets/icon/FistoOn";
import Arcana from "../assets/icon/Arcana";
import ArcanaOn from "../assets/icon/ArcanaOn";

export const moduleSchema = [
  {
    name: "Dashboard",
    section: "dashboard",
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
  {
    name: "System Setup",
    section: "system_setup",
    icon: DeveloperBoard,
    iconOn: DeveloperBoard,
    to: "/system_setup",
    subCategory: null,
  },
  {
    name: "Import/Sync System",
    section: "main_system",
    icon: SupervisorAccountOutlined,
    iconOn: SupervisorAccountRounded,
    to: "/main_system",
    subCategory: null,
  },
  {
    name: "System",
    section: "system",
    icon: FeedOutlined,
    iconOn: FeedRounded,
    to: "/system",
    subCategory: null,
  },
  {
    name: "Import",
    section: "import",
    icon: Inventory2Outlined,
    iconOn: Inventory2Rounded,
    to: "/import",
    subCategory: null,
  },
  {
    name: "Book of Accounts",
    section: "boa",
    icon: CollectionsBookmarkOutlined,
    iconOn: CollectionsBookmarkRounded,
    to: "/boa",
    subCategory: null,
  },
  {
    name: "Trail Balance",
    section: "trial_balance",
    icon: AccountBalanceWalletOutlined,
    iconOn: AccountBalanceWalletRounded,
    to: "/trial_balance",
    subCategory: null,
  },
  {
    name: "Systems",
    section: "systems",
    icon: FeedOutlined,
    iconOn: FeedRounded,
    to: "/systems",
    subCategory: [
      {
        name: "Purchases Book",
        section: "arcana",
        icon: Arcana,
        iconOn: ArcanaOn,
        to: "/systems/arcana",
      },
      {
        name: "Cash Disbursement Book",
        section: "elixir_etd",
        icon: Elixir,
        iconOn: ElixirOn,
        to: "/systems/elixir_etd",
      },
      {
        name: "Sales Journal",
        section: "elixir_pharmacy",
        icon: LocalPharmacyOutlined,
        iconOn: LocalPharmacyRounded,
        to: "/systems/elixir_pharmacy",
      },
      {
        name: "Ultra Maverick Dry",
        section: "um",
        icon: UM,
        iconOn: UMOn,
        to: "/systems/um",
      },
      {
        name: "Ymir",
        section: "ymir",
        icon: Ymir,
        iconOn: YmirOn,
        to: "/systems/ymir",
      },
      {
        name: "Fisto",
        section: "fisto",
        icon: Fisto,
        iconOn: FistoOn,
        to: "/systems/fisto",
      },
    ],
  },
];
