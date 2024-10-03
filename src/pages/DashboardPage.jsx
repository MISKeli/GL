import { Box, Grid, Paper, Typography } from "@mui/material";
import "../styles/DashboardPage.scss";
import React from "react";
import Telecommuting from "../assets/images/Telecommuting.svg";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const DashboardPage = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  return (
    <>
      <Box className="dashboard">
        <Grid className="dashboard__header" container>
          <Grid item xs={12} className="dashboard__header__box1">
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
          </Grid>
          <Grid item xs={2} className="dashboard__header__box2">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar showDaysOutsideCurrentMonth fixedWeekNumber={6} />
            </LocalizationProvider>
          </Grid>
        </Grid>

        <Box className="dashboard__content"></Box>
        <Box className="dashboard__footer"></Box>
      </Box>
    </>
  );
};

export default DashboardPage;
