import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import "../styles/DashboardPage.scss";
import React, { useState } from "react";
import Telecommuting from "../assets/images/Telecommuting.svg";
import {
  DateCalendar,
  DatePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  ArchiveOutlined,
  MonetizationOnOutlined,
  MoreVertOutlined,
  ShoppingBasketOutlined,
  StackedLineChartOutlined,
} from "@mui/icons-material";
import InfoCard from "../components/InfoCard";
import CustomLineChart from "../components/CustomLineChart";
import CustomBarChart from "../components/CustomBarChart";
import { info } from "../schemas/info";
import moment from "moment";

const DashboardPage = () => {
  const [selectedYear, setSelectedYear] = useState(moment());
  const user = JSON.parse(sessionStorage.getItem("user"));

  const uData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
  const pData = [2400, 1398, 9800, 3908, 4800, 3800, 4300];

  const carData = [
    48.8, 56.3, 63.2, 67.3, 70.2, 72.3, 74.1, 75.8, 76.9, 78.4, 79.7, 80.5,
  ];
  const bikeData = [
    14.0, 25.9, 35.8, 45.0, 54.0, 63.1, 72.4, 81.8, 91.5, 41.2, 50.9, 30.8,
  ];

  const series = [
    { label: "Car", data: carData, stack: "total" },
    { label: "Bike", data: bikeData, stack: "total" },
  ];

  return (
    <>
      <Box className="dashboard" sx={{ overflowY: "auto", height: "100%" }}>
        <Grid className="dashboard__header" container sx={{ p: "5px" }}>
          {/* Title */}
          <Grid item>
            <Typography variant="h5" className="masterlist__header--title">
              {info.dashboard.title}
            </Typography>
            <Typography variant="caption" className="masterlist__header--title">
              {info.dashboard.subTitle}
            </Typography>
          </Grid>

          {/* Year Picker */}
          <Grid item>
            <DatePicker
              label="Year"
              // slotProps={{
              //   textField: {
              //     variant: "filled",
              //   },
              // }}
              views={["year"]}
              value={selectedYear}
              onChange={(newValue) => setSelectedYear(newValue)}
              renderInput={(params) => <TextField {...params} size="small" />}
            />
          </Grid>

          {/* <Grid
            item
            xs={12}
            className="dashboard__header__box1"
            //
            marginBottom={"1rem"}
          >
            <Typography variant="h5" className="dashboard__header__box1--title">
              Welcome Back, {user.firstName}!
            </Typography>
            <Box>
              <img
                src={Telecommuting}
                alt="Telecommuting"
                className="dashboard__header__image"
              />
            </Box>
          </Grid> */}
        </Grid>

        <Box className="dashboard__content">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <InfoCard
                value="99.9"
                icon={MonetizationOnOutlined}
                subheaderLeft="Total Revenue"
                subheaderRight="100%"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <InfoCard
                value="99.9"
                icon={StackedLineChartOutlined}
                subheaderLeft="Total Sales"
                subheaderRight="100%"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <InfoCard
                value="99.9"
                icon={ShoppingBasketOutlined}
                subheaderLeft="Total Purchase"
                subheaderRight="100%"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <InfoCard
                value="99.9"
                icon={ArchiveOutlined}
                subheaderLeft="Total Return"
                subheaderRight="100%"
              />
            </Grid>
            {/* lineGraph */}
            <Grid item xs={12} md={6}>
              <CustomLineChart
                title="Purchases and Sales"
                uData={uData}
                pData={pData}
              />
            </Grid>

            {/* barGraph */}
            <Grid item xs={12} md={6}>
              <CustomBarChart title="Overall Sales" seriesData={series} />
            </Grid>
          </Grid>
        </Box>
        <Box className="dashboard__footer"></Box>
      </Box>
    </>
  );
};

export default DashboardPage;
