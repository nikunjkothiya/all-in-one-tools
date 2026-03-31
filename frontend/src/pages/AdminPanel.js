import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { adminApi, clearAdminToken } from "../services/api";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [settings, setSettings] = useState({
    googleAdsenseEnabled: false,
    googleAdsenseClientId: "",
    googleAdsenseAutoAds: false,
    metaPixelEnabled: false,
    metaPixelId: "",
    adsRenderPlaceholders: true,
  });
  const [slots, setSlots] = useState([]);
  const [audit, setAudit] = useState([]);
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [slotForm, setSlotForm] = useState({
    key: "",
    name: "",
    pageKey: "all",
    provider: "google_adsense",
    adUnitId: "",
    format: "auto",
    fullWidthResponsive: true,
    isActive: false,
    sortOrder: 0,
    notes: "",
  });

  const pageOptions = useMemo(
    () => [
      { value: "all", label: "All Pages" },
      { value: "home", label: "Homepage" },
      { value: "tools", label: "All Tool Pages" },
      { value: "text-tools", label: "Text Tools" },
      { value: "image-tools", label: "Image Tools" },
      { value: "pdf-tools", label: "PDF Tools" },
      { value: "media-tools", label: "Media Tools" },
      { value: "file-tools", label: "File Tools" },
      { value: "web-tools", label: "Web Tools" },
      { value: "data-tools", label: "Data Tools" },
      { value: "privacy-tools", label: "Privacy Tools" },
      { value: "loader-tools", label: "Loader Tools" },
      { value: "developer-tools", label: "Developer Tools" },
      { value: "misc-tools", label: "Misc Tools" },
    ],
    []
  );

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [dashboardResponse, settingsResponse, slotsResponse, auditResponse] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getMonetizationSettings(),
        adminApi.getSlots(),
        adminApi.getAudit(20),
      ]);

      setDashboard(dashboardResponse.data);
      setSettings({
        googleAdsenseEnabled: Boolean(settingsResponse.data.settings.google_adsense_enabled),
        googleAdsenseClientId: settingsResponse.data.settings.google_adsense_client_id || "",
        googleAdsenseAutoAds: Boolean(settingsResponse.data.settings.google_adsense_auto_ads),
        metaPixelEnabled: Boolean(settingsResponse.data.settings.meta_pixel_enabled),
        metaPixelId: settingsResponse.data.settings.meta_pixel_id || "",
        adsRenderPlaceholders: settingsResponse.data.settings.ads_render_placeholders !== false,
      });
      setSlots(slotsResponse.data.slots || []);
      setAudit(auditResponse.data.logs || []);
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        clearAdminToken();
        navigate("/admin/login", { replace: true });
        return;
      }

      setError(requestError.response?.data?.error || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleLogout = () => {
    clearAdminToken();
    navigate("/admin/login", { replace: true });
  };

  const handleSettingsSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await adminApi.updateMonetizationSettings(settings);
      setSuccess("Monetization settings saved.");
      await loadAdminData();
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Failed to save monetization settings");
    } finally {
      setSaving(false);
    }
  };

  const openEditSlotDialog = (slot) => {
    setEditingSlotId(slot.id);
    setSlotForm({
      key: slot.key,
      name: slot.name,
      pageKey: slot.pageKey,
      provider: slot.provider,
      adUnitId: slot.adUnitId || "",
      format: slot.format || "auto",
      fullWidthResponsive: Boolean(slot.fullWidthResponsive),
      isActive: Boolean(slot.isActive),
      sortOrder: slot.sortOrder ?? 0,
      notes: slot.notes || "",
    });
    setSlotDialogOpen(true);
  };

  const handleSlotSave = async () => {
    if (!editingSlotId) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await adminApi.updateSlot(editingSlotId, slotForm);
      setSlotDialogOpen(false);
      setSuccess("Placement updated.");
      await loadAdminData();
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Failed to save placement");
    } finally {
      setSaving(false);
    }
  };

  const renderOverview = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Google AdSense
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
              {dashboard?.providers.googleAdsenseEnabled ? "Enabled" : "Disabled"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Client ID: {dashboard?.providers.googleAdsenseClientId || "Not configured"}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Meta Pixel
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
              {dashboard?.providers.metaPixelEnabled ? "Enabled" : "Disabled"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pixel ID: {dashboard?.providers.metaPixelId || "Not configured"}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Ad Slots
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
              {dashboard?.slots.active || 0}/{dashboard?.slots.total || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active / total configured slots
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderSettings = () => (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Provider Settings
        </Typography>

        <FormControlLabel
          control={<Switch checked={settings.googleAdsenseEnabled} onChange={(event) => setSettings((current) => ({ ...current, googleAdsenseEnabled: event.target.checked }))} />}
          label="Enable Google AdSense"
        />
        <TextField
          label="Google AdSense Client ID"
          placeholder="ca-pub-xxxxxxxxxxxxxxxx"
          value={settings.googleAdsenseClientId}
          onChange={(event) => setSettings((current) => ({ ...current, googleAdsenseClientId: event.target.value }))}
          fullWidth
        />
        <FormControlLabel
          control={<Switch checked={settings.googleAdsenseAutoAds} onChange={(event) => setSettings((current) => ({ ...current, googleAdsenseAutoAds: event.target.checked }))} />}
          label="Enable Google Auto Ads"
        />

        <Box sx={{ pt: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Meta
          </Typography>
          <FormControlLabel
            control={<Switch checked={settings.metaPixelEnabled} onChange={(event) => setSettings((current) => ({ ...current, metaPixelEnabled: event.target.checked }))} />}
            label="Enable Meta Pixel"
          />
          <TextField
            label="Meta Pixel ID"
            value={settings.metaPixelId}
            onChange={(event) => setSettings((current) => ({ ...current, metaPixelId: event.target.value }))}
            fullWidth
          />
        </Box>

        <FormControlLabel
          control={<Switch checked={settings.adsRenderPlaceholders} onChange={(event) => setSettings((current) => ({ ...current, adsRenderPlaceholders: event.target.checked }))} />}
          label="Show public placeholders when IDs are missing"
        />

        <Box>
          <Button variant="contained" onClick={handleSettingsSave} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );

  const renderSlots = () => (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        AdSense Placements
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        These built-in placements are stored in the local SQLite database. Edit only the provider-specific delivery settings you need for launch.
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Key</TableCell>
            <TableCell>Page</TableCell>
            <TableCell>Ad Unit</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {slots.map((slot) => (
            <TableRow key={slot.id}>
              <TableCell>{slot.name}</TableCell>
              <TableCell>{slot.key}</TableCell>
              <TableCell>{slot.pageKey}</TableCell>
              <TableCell>{slot.adUnitId || "Not set"}</TableCell>
              <TableCell>
                <Chip label={slot.isActive ? "Active" : "Disabled"} size="small" color={slot.isActive ? "success" : "default"} />
              </TableCell>
              <TableCell align="right">
                <Button size="small" onClick={() => openEditSlotDialog(slot)}>
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );

  const renderAudit = () => (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Recent Admin Activity
      </Typography>
      <Stack spacing={1.5}>
        {audit.map((entry) => (
          <Box key={entry.id} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {entry.action} {entry.entityType}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {entry.actorEmail || "system"} at {new Date(entry.createdAt).toLocaleString()}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Monetization Admin
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage Google AdSense placements and Meta Pixel settings stored locally in the app.
            </Typography>
          </Box>
          <Button variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)} variant="scrollable" scrollButtons="auto">
            <Tab label="Overview" />
            <Tab label="Settings" />
            <Tab label="Slots" />
            <Tab label="Audit" />
          </Tabs>
        </Paper>

        {loading ? (
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Typography>Loading admin data...</Typography>
          </Paper>
        ) : (
          <>
            {tabValue === 0 && renderOverview()}
            {tabValue === 1 && renderSettings()}
            {tabValue === 2 && renderSlots()}
            {tabValue === 3 && renderAudit()}
          </>
        )}
      </Box>

      <Dialog open={slotDialogOpen} onClose={() => setSlotDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit AdSense Placement</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Placement Key" value={slotForm.key} fullWidth disabled />
            <TextField label="Placement Name" value={slotForm.name} fullWidth disabled />
            <TextField select label="Page" value={slotForm.pageKey} fullWidth disabled>
              {pageOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Format" value={slotForm.format} onChange={(event) => setSlotForm((current) => ({ ...current, format: event.target.value }))} fullWidth>
              <MenuItem value="auto">Auto</MenuItem>
              <MenuItem value="horizontal">Horizontal</MenuItem>
              <MenuItem value="vertical">Vertical</MenuItem>
              <MenuItem value="rectangle">Rectangle</MenuItem>
            </TextField>
            <TextField label="Google Ad Unit ID" value={slotForm.adUnitId} onChange={(event) => setSlotForm((current) => ({ ...current, adUnitId: event.target.value }))} fullWidth />
            <FormControlLabel control={<Switch checked={slotForm.fullWidthResponsive} onChange={(event) => setSlotForm((current) => ({ ...current, fullWidthResponsive: event.target.checked }))} />} label="Full width responsive" />
            <FormControlLabel control={<Switch checked={slotForm.isActive} onChange={(event) => setSlotForm((current) => ({ ...current, isActive: event.target.checked }))} />} label="Slot active" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSlotDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSlotSave} variant="contained" disabled={saving}>
            {saving ? "Saving..." : "Save Slot"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel;
