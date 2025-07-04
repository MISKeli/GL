import { Card, CardHeader, Typography, Box } from "@mui/material";

const InfoCard = ({ value, icon: Icon, subheaderLeft, subheaderRight }) => {
  return (
    <Card>
      <CardHeader
        title={
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Typography variant="body2">{value}</Typography>
            {Icon && <Icon fontSize="small" color="primary" />}
          </Box>
        }
        subheader={
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Typography variant="body2">{subheaderLeft}</Typography>
            <Typography variant="body2">{subheaderRight}</Typography>
          </Box>
        }
      />
    </Card>
  );
};

export default InfoCard;
