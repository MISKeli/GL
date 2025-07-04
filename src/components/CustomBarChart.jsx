/* eslint-disable react/prop-types */
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  TextField,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import moment from "moment";

const availableStackOrder = [
  "none",
  "reverse",
  "appearance",
  "ascending",
  "descending",
];

const generateMonths = () => {
  return Array.from({ length: 12 }, (_, i) =>
    moment().year(2025).month(i).format("MMM")
  );
};

const CustomBarChart = ({ title, seriesData }) => {
  const [stackOrder, setStackOrder] = useState("none");
  const theme = useTheme();

  // Media queries for responsive behavior
  const isXs = useMediaQuery(theme.breakpoints.down("xs")); // <600px
  const isSm = useMediaQuery(theme.breakpoints.down("sm")); // <960px
  const isMd = useMediaQuery(theme.breakpoints.down("md")); // <1280px
  const isLg = useMediaQuery(theme.breakpoints.up("lg")); // >1280px

  // Set chart width based on screen size
  let chartWidth;
  if (isXs) {
    chartWidth = 300;
  } else if (isSm) {
    chartWidth = 450;
  } else if (isMd) {
    chartWidth = 600;
  } else if (isLg) {
    chartWidth = 800;
  } else {
    chartWidth = 610; // Default width
  }

  const modifiedSeries = [
    { ...seriesData[0], stackOrder },
    ...seriesData.slice(1),
  ];

  return (
    <Card>
      <CardHeader
        title={title}
        action={
          <TextField
            sx={{ minWidth: 150 }}
            select
            label="Stack Order"
            value={stackOrder}
            onChange={(event) => setStackOrder(event.target.value)}
          >
            {availableStackOrder.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        }
      />
      <CardContent>
        <BarChart
          width={chartWidth}
          height={280}
          xAxis={[
            {
              label: "Months of 2025",
              scaleType: "band",
              data: generateMonths(),
              tickLabelStyle: {
                angle: 45,
                dominantBaseline: "hanging",
                textAnchor: "start",
              },
              labelStyle: {
                transform: "translateY(15px)",
              },
            },
          ]}
          yAxis={[{ min: 0, max: 100 }]}
          series={modifiedSeries}
          margin={{ bottom: 70 }}
        />
      </CardContent>
    </Card>
  );
};

export default CustomBarChart;
