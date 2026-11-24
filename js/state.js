const $ = s => document.getElementById(s);
let view = 'pc', dark = false, labels = false, used = new Set(), remain = [...config.counts], sleep = config.initialSleep, foodUntil = 0, selected = -1, toastTimer, gesture = null;

// under-desk
let phase = 'none', eventType = null, eventTimer = null, blinkTimer = null, lastDesk = 'pc';

// pc
let monitorOn = true, pcZoomed = false, pcRemain = [...config.pcCounts], pcSaved = [...config.pcCounts], saveTimer = null;

// encounters
let powerOut = false, prePower = null;
let encounter = null, encounterTimer = null, defeated = false, riseFrame = null;
