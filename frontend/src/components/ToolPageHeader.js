import React from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";

function ToolPageHeader({ title, description, chips = [] }) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", md: "center" }}
      spacing={1.5}
      sx={{ mb: 2.5 }}
    >
      <Box sx={{ maxWidth: 860 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </Box>
      {chips.length ? (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {chips.map((chip) => (
            <Chip key={chip} label={chip} variant="outlined" color="primary" />
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}

export default ToolPageHeader;
