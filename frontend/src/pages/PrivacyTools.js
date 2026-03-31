import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { ContentCopy, Lock, ManageSearch, Password, Shield } from "@mui/icons-material";
import { privacyToolsApi } from "../services/api";
import ToolPageHeader from "../components/ToolPageHeader";

const encryptionAlgorithms = [
  {
    value: "aes-256-cbc",
    label: "AES-256-CBC",
    description: "Reliable symmetric encryption for general secure text storage and transfer.",
  },
  {
    value: "aes-256-gcm",
    label: "AES-256-GCM",
    description: "Authenticated encryption with integrity protection and an auth tag.",
  },
  {
    value: "des-ede3-cbc",
    label: "DES-EDE3-CBC",
    description: "Legacy compatibility option. Prefer AES for new workflows.",
  },
];

const hashingAlgorithms = [
  {
    value: "bcrypt",
    label: "BCrypt",
    description: "Best for passwords and login-related verification flows.",
  },
  {
    value: "sha256",
    label: "SHA-256",
    description: "Good for integrity checks and deterministic hashing.",
  },
  {
    value: "sha512",
    label: "SHA-512",
    description: "A stronger SHA-family hash for larger security margins.",
  },
];

const tabMeta = [
  { label: "Encrypt", icon: <Lock fontSize="small" /> },
  { label: "Decrypt", icon: <Shield fontSize="small" /> },
  { label: "Hash", icon: <Password fontSize="small" /> },
  { label: "Verify", icon: <ManageSearch fontSize="small" /> },
  { label: "Anonymize", icon: <Shield fontSize="small" /> },
  { label: "Mask", icon: <Shield fontSize="small" /> },
];

const parseErrorMessage = (error, fallback) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.response?.data?.errors?.[0]?.msg ||
  error?.message ||
  fallback;

const parseFields = (value) =>
  value
    .split(",")
    .map((field) => field.trim())
    .filter(Boolean);

function PrivacyTools() {
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const [encryptionAlgorithm, setEncryptionAlgorithm] = useState("aes-256-cbc");
  const [hashAlgorithm, setHashAlgorithm] = useState("bcrypt");
  const [verifyAlgorithm, setVerifyAlgorithm] = useState("bcrypt");
  const [key, setKey] = useState("ChangeMe-Secret-Key");
  const [encryptInput, setEncryptInput] = useState("Sensitive project note");
  const [encryptOutput, setEncryptOutput] = useState("");
  const [decryptInput, setDecryptInput] = useState("");
  const [decryptOutput, setDecryptOutput] = useState("");
  const [hashInput, setHashInput] = useState("Password123!");
  const [hashOutput, setHashOutput] = useState("");
  const [verifyPasswordValue, setVerifyPasswordValue] = useState("");
  const [verifyHashValue, setVerifyHashValue] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [privacyJsonInput, setPrivacyJsonInput] = useState('{\n  "name": "Alex Doe",\n  "email": "alex@example.com",\n  "phone": "+1-202-555-0101"\n}');
  const [privacyFields, setPrivacyFields] = useState("email, phone");
  const [maskCharacter, setMaskCharacter] = useState("*");
  const [privacyOutput, setPrivacyOutput] = useState("");

  const encryptionInfo = useMemo(
    () => encryptionAlgorithms.find((item) => item.value === encryptionAlgorithm),
    [encryptionAlgorithm]
  );
  const hashingInfo = useMemo(() => hashingAlgorithms.find((item) => item.value === hashAlgorithm), [hashAlgorithm]);
  const verifyInfo = useMemo(() => hashingAlgorithms.find((item) => item.value === verifyAlgorithm), [verifyAlgorithm]);

  const clearTransientState = () => {
    setError(null);
    setSuccess(null);
  };

  const handleTabChange = (_, nextValue) => {
    setActiveTab(nextValue);
    clearTransientState();
  };

  const copyValue = async (value) => {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setSuccess("Copied to clipboard.");
  };

  const handleEncrypt = async () => {
    if (!encryptInput.trim()) {
      setError("Please enter text to encrypt.");
      return;
    }

    if (!key.trim()) {
      setError("Please enter an encryption key.");
      return;
    }

    setLoading(true);
    clearTransientState();
    try {
      const response = await privacyToolsApi.encryptText(encryptInput, encryptionAlgorithm, key);
      setEncryptOutput(JSON.stringify(response.data, null, 2));
      setSuccess("Text encrypted successfully.");
    } catch (requestError) {
      setError(parseErrorMessage(requestError, "Encryption failed."));
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!decryptInput.trim()) {
      setError("Please paste the encrypted JSON payload first.");
      return;
    }

    if (!key.trim()) {
      setError("Please enter the decryption key.");
      return;
    }

    setLoading(true);
    clearTransientState();
    try {
      const payload = JSON.parse(decryptInput);
      const response = await privacyToolsApi.decryptText(payload.encrypted, key, encryptionAlgorithm, payload.iv, payload.authTag);
      setDecryptOutput(response.data.decrypted);
      setSuccess("Text decrypted successfully.");
    } catch (requestError) {
      setError(parseErrorMessage(requestError, "Decryption failed. Ensure the JSON includes encrypted text and IV."));
    } finally {
      setLoading(false);
    }
  };

  const handleHash = async () => {
    if (!hashInput.trim()) {
      setError("Please enter text to hash.");
      return;
    }

    setLoading(true);
    clearTransientState();
    try {
      const response = await privacyToolsApi.hashPassword(hashInput, hashAlgorithm);
      setHashOutput(response.data.hashed);
      setSuccess("Hash generated successfully.");
    } catch (requestError) {
      setError(parseErrorMessage(requestError, "Hashing failed."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyPasswordValue.trim() || !verifyHashValue.trim()) {
      setError("Please enter both the source value and hashed value.");
      return;
    }

    setLoading(true);
    clearTransientState();
    try {
      const response = await privacyToolsApi.verifyPassword(verifyPasswordValue, verifyHashValue, verifyAlgorithm);
      setVerifyResult(response.data.valid);
      setSuccess("Verification completed.");
    } catch (requestError) {
      setError(parseErrorMessage(requestError, "Verification failed."));
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyTransform = async (mode) => {
    if (!privacyJsonInput.trim()) {
      setError("Please enter JSON data first.");
      return;
    }

    const fields = parseFields(privacyFields);
    if (!fields.length) {
      setError("Please enter at least one field name.");
      return;
    }

    setLoading(true);
    clearTransientState();
    try {
      const parsedData = JSON.parse(privacyJsonInput);
      const response =
        mode === "anonymize"
          ? await privacyToolsApi.anonymizeData(parsedData, fields)
          : await privacyToolsApi.maskData(parsedData, fields, maskCharacter || "*");

      const payload = mode === "anonymize" ? response.data.anonymizedData : response.data.maskedData;
      setPrivacyOutput(JSON.stringify(payload, null, 2));
      setSuccess(mode === "anonymize" ? "Sensitive fields anonymized." : "Sensitive fields masked.");
    } catch (requestError) {
      setError(parseErrorMessage(requestError, "Privacy transformation failed."));
    } finally {
      setLoading(false);
    }
  };

  const renderEncryptTab = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={5}>
        <Stack spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Algorithm</InputLabel>
            <Select value={encryptionAlgorithm} label="Algorithm" onChange={(event) => setEncryptionAlgorithm(event.target.value)}>
              {encryptionAlgorithms.map((algorithm) => (
                <MenuItem key={algorithm.value} value={algorithm.value}>
                  {algorithm.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Alert severity="info">{encryptionInfo?.description}</Alert>
          <TextField fullWidth label="Encryption Key" value={key} onChange={(event) => setKey(event.target.value)} />
          <TextField fullWidth multiline minRows={10} label="Plain Text" value={encryptInput} onChange={(event) => setEncryptInput(event.target.value)} />
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={handleEncrypt} disabled={loading}>
              {loading ? "Encrypting..." : "Encrypt"}
            </Button>
            <Button variant="outlined" startIcon={<ContentCopy />} onClick={() => copyValue(encryptOutput)} disabled={!encryptOutput}>
              Copy
            </Button>
          </Stack>
        </Stack>
      </Grid>
      <Grid item xs={12} md={7}>
        <TextField
          fullWidth
          multiline
          minRows={18}
          label="Encrypted Output"
          value={encryptOutput}
          InputProps={{
            readOnly: true,
            style: {
              fontFamily: "monospace",
            },
          }}
        />
      </Grid>
    </Grid>
  );

  const renderDecryptTab = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={5}>
        <Stack spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Algorithm</InputLabel>
            <Select value={encryptionAlgorithm} label="Algorithm" onChange={(event) => setEncryptionAlgorithm(event.target.value)}>
              {encryptionAlgorithms.map((algorithm) => (
                <MenuItem key={algorithm.value} value={algorithm.value}>
                  {algorithm.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField fullWidth label="Decryption Key" value={key} onChange={(event) => setKey(event.target.value)} />
          <TextField
            fullWidth
            multiline
            minRows={10}
            label="Encrypted JSON Input"
            placeholder='{\n  "encrypted": "...",\n  "iv": "...",\n  "authTag": "..."\n}'
            value={decryptInput}
            onChange={(event) => setDecryptInput(event.target.value)}
            InputProps={{
              style: {
                fontFamily: "monospace",
              },
            }}
          />
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={handleDecrypt} disabled={loading}>
              {loading ? "Decrypting..." : "Decrypt"}
            </Button>
            <Button variant="outlined" startIcon={<ContentCopy />} onClick={() => copyValue(decryptOutput)} disabled={!decryptOutput}>
              Copy
            </Button>
          </Stack>
        </Stack>
      </Grid>
      <Grid item xs={12} md={7}>
        <TextField fullWidth multiline minRows={18} label="Decrypted Output" value={decryptOutput} InputProps={{ readOnly: true }} />
      </Grid>
    </Grid>
  );

  const renderHashTab = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={5}>
        <Stack spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Hash Algorithm</InputLabel>
            <Select value={hashAlgorithm} label="Hash Algorithm" onChange={(event) => setHashAlgorithm(event.target.value)}>
              {hashingAlgorithms.map((algorithm) => (
                <MenuItem key={algorithm.value} value={algorithm.value}>
                  {algorithm.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Alert severity="info">{hashingInfo?.description}</Alert>
          <TextField fullWidth multiline minRows={10} label="Input Text" value={hashInput} onChange={(event) => setHashInput(event.target.value)} />
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={handleHash} disabled={loading}>
              {loading ? "Hashing..." : "Generate Hash"}
            </Button>
            <Button variant="outlined" startIcon={<ContentCopy />} onClick={() => copyValue(hashOutput)} disabled={!hashOutput}>
              Copy
            </Button>
          </Stack>
        </Stack>
      </Grid>
      <Grid item xs={12} md={7}>
        <TextField
          fullWidth
          multiline
          minRows={18}
          label="Hash Output"
          value={hashOutput}
          InputProps={{
            readOnly: true,
            style: {
              fontFamily: "monospace",
            },
          }}
        />
      </Grid>
    </Grid>
  );

  const renderVerifyTab = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={5}>
        <Stack spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Verification Algorithm</InputLabel>
            <Select value={verifyAlgorithm} label="Verification Algorithm" onChange={(event) => setVerifyAlgorithm(event.target.value)}>
              {hashingAlgorithms
                .filter((algorithm) => algorithm.value !== "sha512")
                .map((algorithm) => (
                  <MenuItem key={algorithm.value} value={algorithm.value}>
                    {algorithm.label}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Alert severity="info">{verifyInfo?.description}</Alert>
          <TextField fullWidth label="Source Value" value={verifyPasswordValue} onChange={(event) => setVerifyPasswordValue(event.target.value)} />
          <TextField fullWidth multiline minRows={8} label="Hashed Value" value={verifyHashValue} onChange={(event) => setVerifyHashValue(event.target.value)} />
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="contained" onClick={handleVerify} disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </Button>
            {verifyResult !== null ? (
              <Chip color={verifyResult ? "success" : "error"} label={verifyResult ? "Match" : "No match"} />
            ) : null}
          </Stack>
        </Stack>
      </Grid>
      <Grid item xs={12} md={7}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, minHeight: 380, bgcolor: "grey.50" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Verification Result
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Compare a source value against an existing hash to validate integrity or authentication flows.
          </Typography>
          {verifyResult !== null ? (
            <Alert severity={verifyResult ? "success" : "warning"} sx={{ mt: 2 }}>
              {verifyResult ? "The source value matches the supplied hash." : "The source value does not match the supplied hash."}
            </Alert>
          ) : null}
        </Paper>
      </Grid>
    </Grid>
  );

  const renderPrivacyDataTab = (mode) => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={5}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            multiline
            minRows={12}
            label="JSON Input"
            value={privacyJsonInput}
            onChange={(event) => setPrivacyJsonInput(event.target.value)}
            InputProps={{
              style: {
                fontFamily: "monospace",
              },
            }}
          />
          <TextField fullWidth label="Fields to target" helperText="Comma-separated field names" value={privacyFields} onChange={(event) => setPrivacyFields(event.target.value)} />
          {mode === "mask" ? <TextField fullWidth label="Mask character" value={maskCharacter} onChange={(event) => setMaskCharacter(event.target.value)} inputProps={{ maxLength: 1 }} /> : null}
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={() => handlePrivacyTransform(mode)} disabled={loading}>
              {loading ? "Processing..." : mode === "anonymize" ? "Anonymize" : "Mask"}
            </Button>
            <Button variant="outlined" startIcon={<ContentCopy />} onClick={() => copyValue(privacyOutput)} disabled={!privacyOutput}>
              Copy
            </Button>
          </Stack>
        </Stack>
      </Grid>
      <Grid item xs={12} md={7}>
        <TextField
          fullWidth
          multiline
          minRows={18}
          label="Output"
          value={privacyOutput}
          InputProps={{
            readOnly: true,
            style: {
              fontFamily: "monospace",
            },
          }}
        />
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 2 }}>
        <ToolPageHeader
          title="Privacy Tools"
          description="Encrypt, hash, verify, anonymize, and mask sensitive values in one place."
          chips={[tabMeta[activeTab].label]}
        />

        {(error || success) && (
          <Alert severity={error ? "error" : "success"} sx={{ mb: 2 }} onClose={() => (error ? setError(null) : setSuccess(null))}>
            {error || success}
          </Alert>
        )}

        <Paper sx={{ p: 1, mb: 2, borderRadius: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            {tabMeta.map((tab) => (
              <Tab key={tab.label} label={tab.label} icon={tab.icon} iconPosition="start" />
            ))}
          </Tabs>
        </Paper>

        <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3 }}>
          {activeTab === 0 && renderEncryptTab()}
          {activeTab === 1 && renderDecryptTab()}
          {activeTab === 2 && renderHashTab()}
          {activeTab === 3 && renderVerifyTab()}
          {activeTab === 4 && renderPrivacyDataTab("anonymize")}
          {activeTab === 5 && renderPrivacyDataTab("mask")}
        </Paper>
      </Box>
    </Container>
  );
}

export default PrivacyTools;
