import React from "react";
import { Box, Chip, Container, Paper, Stack, Typography } from "@mui/material";

function InfoPageShell({ eyebrow, title, description, chips = [], actions = null, children }) {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 4 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            background: "linear-gradient(135deg, rgba(63,81,181,0.08) 0%, rgba(245,0,87,0.06) 100%)",
          }}
        >
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={2}>
              <Box sx={{ maxWidth: 820 }}>
                {eyebrow ? (
                  <Typography
                    variant="overline"
                    sx={{
                      letterSpacing: 1.2,
                      color: "primary.main",
                      fontWeight: 700,
                    }}
                  >
                    {eyebrow}
                  </Typography>
                ) : null}
                <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: "2rem", md: "2.6rem" }, mb: 1 }}>
                  {title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760 }}>
                  {description}
                </Typography>
              </Box>
              {actions ? (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={{ xs: "stretch", sm: "center" }}>
                  {actions}
                </Stack>
              ) : null}
            </Stack>

            {chips.length ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {chips.map((chip) => (
                  <Chip key={chip} label={chip} variant="outlined" color="primary" />
                ))}
              </Stack>
            ) : null}
          </Stack>
        </Paper>

        <Box sx={{ mt: 3 }}>{children}</Box>
      </Box>
    </Container>
  );
}

export default InfoPageShell;
