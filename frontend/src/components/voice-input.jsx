import { useEffect, useMemo, useRef, useState } from "react";
import { alpha } from "@mui/material/styles";
import { Alert, Box, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { KeyboardVoiceOutlined, StopCircleOutlined } from "@mui/icons-material";
import { useI18n } from "../i18n/i18n-context";

const speechLocales = {
  uz: "uz-UZ",
  en: "en-US",
  ru: "ru-RU"
};

function getSpeechRecognition() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function todayWords(language) {
  if (language === "en") {
    return ["today"];
  }

  if (language === "ru") {
    return ["segodnya", "сегодня"];
  }

  return ["bugun"];
}

function toIsoDate(value) {
  return value.toISOString().slice(0, 10);
}

function normalizeNumber(transcript) {
  const compact = transcript
    .replace(/,/g, ".")
    .replace(/[^\d.\-]/g, "")
    .trim();

  if (!compact) {
    return null;
  }

  const negative = compact.startsWith("-") ? "-" : "";
  const unsigned = compact.replace(/-/g, "");
  const dotIndex = unsigned.indexOf(".");

  if (dotIndex === -1) {
    return `${negative}${unsigned}`;
  }

  return `${negative}${unsigned.slice(0, dotIndex + 1)}${unsigned.slice(dotIndex + 1).replace(/\./g, "")}`;
}

function normalizeDate(transcript, language) {
  const normalized = normalizeText(transcript);

  if (todayWords(language).some((word) => normalized === normalizeText(word))) {
    return toIsoDate(new Date());
  }

  const yearFirst = transcript.match(/(\d{4})[.\-/ ](\d{1,2})[.\-/ ](\d{1,2})/);
  if (yearFirst) {
    const [, year, month, day] = yearFirst;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const dayFirst = transcript.match(/(\d{1,2})[.\-/ ](\d{1,2})[.\-/ ](\d{4})/);
  if (dayFirst) {
    const [, day, month, year] = dayFirst;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return null;
}

function normalizeMonth(transcript) {
  const yearFirst = transcript.match(/(\d{4})[.\-/ ](\d{1,2})/);
  if (yearFirst) {
    const [, year, month] = yearFirst;
    return `${year}-${month.padStart(2, "0")}`;
  }

  const monthFirst = transcript.match(/(\d{1,2})[.\-/ ](\d{4})/);
  if (monthFirst) {
    const [, month, year] = monthFirst;
    return `${year}-${month.padStart(2, "0")}`;
  }

  return null;
}

function resolveSelectValue(transcript, options) {
  const normalizedTranscript = normalizeText(transcript);

  if (!normalizedTranscript) {
    return null;
  }

  const matchedOption = options.find((option) => {
    const candidates = [option.label, ...(option.aliases || [])]
      .map(normalizeText)
      .filter(Boolean);

    return candidates.some((candidate) => {
      return normalizedTranscript.includes(candidate) || candidate.includes(normalizedTranscript);
    });
  });

  return matchedOption?.value ?? null;
}

function resolveVoiceValue({ voiceType, transcript, currentValue, append, options, language }) {
  if (voiceType === "number") {
    return normalizeNumber(transcript);
  }

  if (voiceType === "date") {
    return normalizeDate(transcript, language);
  }

  if (voiceType === "month") {
    return normalizeMonth(transcript);
  }

  if (voiceType === "select") {
    return resolveSelectValue(transcript, options);
  }

  const nextText = transcript.trim();
  if (!nextText) {
    return null;
  }

  if (append && currentValue) {
    return `${String(currentValue).trim()} ${nextText}`.trim();
  }

  return nextText;
}

function mergeHelperText(helperText, statusText, statusTone) {
  if (!helperText && !statusText) {
    return undefined;
  }

  if (!helperText) {
    return (
      <Typography component="span" variant="caption" color={statusTone}>
        {statusText}
      </Typography>
    );
  }

  if (!statusText) {
    return helperText;
  }

  return (
    <Box component="span" sx={{ display: "grid", gap: 0.4 }}>
      <Box component="span">{helperText}</Box>
      <Typography component="span" variant="caption" color={statusTone}>
        {statusText}
      </Typography>
    </Box>
  );
}

export function VoiceFormNotice() {
  const { t } = useI18n();
  const supported = useMemo(() => Boolean(getSpeechRecognition()), []);

  return (
    <Alert severity={supported ? "info" : "warning"} variant="outlined" sx={{ mb: 2 }}>
      {supported
        ? t("Mikrofon tugmasi bilan maydonlarni ovoz orqali to‘ldiring. Sana uchun bugun yoki 2026-03-09 formatlari ishlaydi.")
        : t("Bu brauzer voice inputni qo‘llamaydi. Chrome yoki Edge orqali oching.")}
    </Alert>
  );
}

export function VoiceField({
  value,
  onValueChange,
  voiceType = "text",
  voiceAppend = false,
  voiceOptions = [],
  helperText,
  sx,
  ...props
}) {
  const { language, t } = useI18n();
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [statusTone, setStatusTone] = useState("text.secondary");
  const supported = useMemo(() => Boolean(getSpeechRecognition()), []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

  function stopListening() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }

  function startListening() {
    const Recognition = getSpeechRecognition();

    if (!Recognition) {
      setStatusTone("warning.main");
      setStatusText(t("Bu brauzer voice inputni qo‘llamaydi. Chrome yoki Edge orqali oching."));
      return;
    }

    recognitionRef.current?.stop();

    const recognition = new Recognition();
    recognition.lang = speechLocales[language] || "uz-UZ";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setStatusTone("primary.main");
      setStatusText(t("Tinglanmoqda..."));
    };

    recognition.onerror = () => {
      setListening(false);
      recognitionRef.current = null;
      setStatusTone("warning.main");
      setStatusText(t("Ovoz yozuvi ishga tushmadi. Mikrofon ruxsatini tekshiring."));
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";
      const nextValue = resolveVoiceValue({
        voiceType,
        transcript,
        currentValue: value,
        append: voiceAppend,
        options: voiceOptions,
        language
      });

      if (nextValue == null) {
        setStatusTone("warning.main");
        setStatusText(t("Ovoz tanildi, lekin maydonga mos qiymat topilmadi."));
        return;
      }

      onValueChange(nextValue);
      setStatusTone("success.main");
      setStatusText(t("Ovoz tanildi va maydon to‘ldirildi."));
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  return (
    <Stack direction="row" spacing={1} alignItems={props.multiline ? "flex-start" : "center"}>
      <TextField
        {...props}
        fullWidth
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        helperText={mergeHelperText(helperText, statusText, statusTone)}
        sx={{ flex: 1, ...sx }}
      />
      <Tooltip title={listening ? t("Mikrofonni to‘xtatish") : t("Mikrofon bilan to‘ldirish")}>
        <span>
          <IconButton
            onClick={listening ? stopListening : startListening}
            disabled={!supported && !listening}
            color={listening ? "error" : "primary"}
            sx={{
              mt: props.multiline ? 0.5 : 0,
              border: "1px solid",
              borderColor: listening ? "error.light" : alpha("#2457f5", 0.18),
              backgroundColor: listening ? alpha("#dc2626", 0.08) : alpha("#2457f5", 0.05),
              borderRadius: 3
            }}
          >
            {listening ? <StopCircleOutlined fontSize="small" /> : <KeyboardVoiceOutlined fontSize="small" />}
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}
