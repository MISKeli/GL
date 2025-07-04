import React from "react";
import { LineChart } from "@mui/x-charts/LineChart";

import {
  Card,
  CardHeader,
  CardContent,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import moment from "moment";

const CustomLineChart = ({ title, uData, pData }) => {
  const theme = useTheme();

  // Media queries for responsiveness
  const isXs = useMediaQuery(theme.breakpoints.down("xs")); // <600px
  const isSm = useMediaQuery(theme.breakpoints.down("sm")); // <960px
  const isMd = useMediaQuery(theme.breakpoints.down("md")); // <1280px
  const isLg = useMediaQuery(theme.breakpoints.up("lg")); // >1280px

  // Set chart width dynamically
  let chartWidth;
  if (isXs) {
    chartWidth = 300;
  } else if (isSm) {
    chartWidth = 400;
  } else if (isMd) {
    chartWidth = 600;
  } else if (isLg) {
    chartWidth = 750;
  } else {
    chartWidth = 400; // Default width
  }

  // Generate xLabels as months dynamically
  const xLabels = Array.from({ length: 12 }, (_, i) =>
    moment().month(i).format("MMM")
  );
  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <LineChart
          width={chartWidth}
          height={300}
          series={[
            { data: pData, label: "Purchases", yAxisId: "leftAxisId" },
            { data: uData, label: "Sales", yAxisId: "rightAxisId" },
          ]}
          xAxis={[{ scaleType: "point", data: xLabels }]}
          yAxis={[{ id: "leftAxisId" }, { id: "rightAxisId" }]}
          rightAxis="rightAxisId"
        />
      </CardContent>
    </Card>
  );
};

export default CustomLineChart;
