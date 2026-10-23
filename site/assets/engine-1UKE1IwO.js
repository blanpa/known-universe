import { C as tour, E as api, S as toggleState, T as userLayer, _ as selection, a as startLive, b as timeBar, c as encounters, d as fieldQuery, f as labels, g as searchMsg, h as nav, i as satEcl, l as facColor, m as movers, n as activeShowers, o as RESERVED, p as measure, r as groundEcl, s as camera, t as LIVE, u as facList$1, v as stats, w as transit, x as timeline, y as survey } from "./index-BmTq9Jw8.js";
//#region src/engine/canvas.js
var cv = document.getElementById("sky");
var ctx = cv.getContext("2d");
//#endregion
//#region src/engine/state.js
var S = {
	yaw: .5,
	pitch: -.5,
	camZ: 2.47,
	year: 2026,
	tOffsetDays: 0,
	autorot: false,
	freelook: false,
	rings: true,
	veil: true,
	size: true,
	galaxies: true,
	hyg: true,
	user: true,
	gpu: true,
	gaia: true,
	web: true,
	qso: true,
	ob: true,
	vars: true,
	edge: true,
	facColor: false,
	facHidden: /* @__PURE__ */ new Set(),
	solar: true,
	moons: true,
	mw: true,
	mw3d: true,
	dso: true,
	psr: true,
	oclu: true,
	ast: true,
	tno: true,
	probes: true,
	helio: true,
	belt: true,
	con: true,
	hz: true,
	lag: true,
	lens: true,
	pm: false,
	pmYears: 0,
	cme: true,
	neo: true,
	sat: true,
	sunAR: true,
	met: true,
	iso: true,
	eht: false,
	labels: true,
	radio: true,
	bubble: true,
	grid: false,
	ggrid: false,
	realScale: false,
	hover: null,
	pinned: null,
	focusStar: null,
	focusT: 0,
	skyMode: false
};
var V = {
	fovK: 1,
	roll: 0,
	skyFrom: null,
	FOLLOW: null,
	GLDPR: 1,
	NEAR: .05,
	ROUTE: null,
	TRANSFER: null,
	_earthScr: null,
	_globeOn: false,
	cx: void 0,
	cy: void 0,
	dirty: true,
	flySpeed: 1,
	foc: void 0,
	focusSys: null,
	focusSysW: null,
	gwOnScreen: false,
	lastInfo: void 0,
	navTarget: null,
	playAcc: 0,
	solarA: 0,
	sysA: 0,
	tgtCamZ: S.camZ,
	tgtPitch: S.pitch,
	tgtYaw: S.yaw
};
//#endregion
//#region src/engine/data.js
var DATA = window.__DATA__;
var META = DATA.meta;
var STARS = DATA.stars;
var CAT = window.__CATALOG__ || {};
var PC2LY = 3.261564;
var dists = STARS.map((s) => s.d).slice().sort((a, b) => a - b);
var R0 = dists[Math.floor(dists.length * .9)] || META.maxDist;
STARS.forEach((s) => {
	const r = s.d || 1e-6;
	s._dx = s.x / r;
	s._dy = s.y / r;
	s._dz = s.z / r;
	s._r = r;
	s._col = tempColor(s.t);
	s._sr = starRadius(s);
	s._search = (s.h + " " + s.p.map((p) => p.n).join(" ")).toLowerCase();
});
var BND = R0;
var GAL = DATA.galaxies || [];
GAL.forEach((g) => {
	g._gs = .5 + Math.sqrt(g.kpc || .5) / 6;
});
function tempColor(t) {
	if (!t) return [
		150,
		160,
		190
	];
	if (t >= 3e4) return [
		155,
		176,
		255
	];
	if (t >= 1e4) return [
		170,
		191,
		255
	];
	if (t >= 7500) return [
		202,
		215,
		255
	];
	if (t >= 6e3) return [
		248,
		247,
		255
	];
	if (t >= 5200) return [
		255,
		244,
		232
	];
	if (t >= 3700) return [
		255,
		210,
		161
	];
	return [
		255,
		181,
		108
	];
}
function starRadius(s) {
	if (s.lum > 0 && s.t > 0) return Math.sqrt(s.lum) / Math.pow(s.t / 5772, 2);
	if (s.t > 0) return Math.pow(s.t / 5772, 2);
	return 1;
}
var _pcYear = -1;
function planetsBy(s, year) {
	if (_pcYear !== year) {
		_pcYear = year;
		for (let i = 0; i < STARS.length; i++) STARS[i]._pcN = -1;
	}
	let n = s._pcN;
	if (n < 0) {
		n = 0;
		const ps = s.p;
		for (let k = 0; k < ps.length; k++) {
			const y = ps[k].y;
			if (y <= year || y === 0) n++;
		}
		s._pcN = n;
	}
	return n;
}
function radiusScale(sr) {
	if (!S.size || !sr) return 1;
	return Math.max(.3, Math.min(4.2, Math.pow(sr, .7)));
}
//#endregion
//#region src/engine/sky-data.js
function dirOf(raDeg, decDeg) {
	const r = raDeg * Math.PI / 180, d = decDeg * Math.PI / 180;
	return [
		Math.cos(d) * Math.cos(r),
		Math.cos(d) * Math.sin(r),
		Math.sin(d)
	];
}
var SGRA = {
	n: "Sagittarius A*",
	sgra: true,
	kind: "galactic centre",
	d: 8178,
	desc: "supermassive black hole · 4.3 million solar masses"
};
SGRA._dir = dirOf(266.41684, -29.00781);
var NGP = dirOf(192.85948, 27.12825);
var GC = SGRA._dir;
var GPv = (function() {
	const c = [
		NGP[1] * GC[2] - NGP[2] * GC[1],
		NGP[2] * GC[0] - NGP[0] * GC[2],
		NGP[0] * GC[1] - NGP[1] * GC[0]
	];
	const n = Math.hypot(c[0], c[1], c[2]);
	return [
		c[0] / n,
		c[1] / n,
		c[2] / n
	];
})();
var GPu = GC;
var DSO_T = {
	OC: {
		c: [
			150,
			190,
			255
		],
		l: "Open cluster"
	},
	GC: {
		c: [
			255,
			226,
			160
		],
		l: "Globular cluster"
	},
	EN: {
		c: [
			255,
			118,
			118
		],
		l: "Emission nebula"
	},
	PN: {
		c: [
			110,
			230,
			198
		],
		l: "Planetary nebula"
	},
	SNR: {
		c: [
			232,
			140,
			222
		],
		l: "Supernova remnant"
	},
	BH: {
		c: [
			176,
			140,
			255
		],
		l: "Stellar black hole"
	},
	NS: {
		c: [
			150,
			220,
			255
		],
		l: "Neutron star / magnetar"
	},
	BD: {
		c: [
			216,
			130,
			96
		],
		l: "Brown dwarf"
	},
	XRB: {
		c: [
			255,
			168,
			120
		],
		l: "X-ray binary"
	},
	CL: {
		c: [
			255,
			182,
			140
		],
		l: "Galaxy cluster"
	},
	SC: {
		c: [
			255,
			150,
			110
		],
		l: "Supercluster"
	},
	GW: {
		c: [
			130,
			255,
			220
		],
		l: "Gravitational-wave event"
	},
	QSOn: {
		c: [
			214,
			150,
			255
		],
		l: "Quasar"
	},
	WD: {
		c: [
			235,
			240,
			250
		],
		l: "White dwarf"
	},
	BD: {
		c: [
			205,
			140,
			95
		],
		l: "Brown dwarf"
	},
	GRB: {
		c: [
			255,
			215,
			120
		],
		l: "Gamma-ray burst"
	},
	FRB: {
		c: [
			170,
			255,
			190
		],
		l: "Fast radio burst"
	},
	MC: {
		c: [
			172,
			128,
			98
		],
		l: "Molecular cloud (Gaia 3D dust)"
	}
};
var DSO = [
	{
		n: "Pleiades · M45",
		t: "OC",
		ra: 56.75,
		dec: 24.12,
		d: 136
	},
	{
		n: "Hyades",
		t: "OC",
		ra: 66.75,
		dec: 15.87,
		d: 47
	},
	{
		n: "Praesepe · M44",
		t: "OC",
		ra: 130.05,
		dec: 19.67,
		d: 187
	},
	{
		n: "Double Cluster",
		t: "OC",
		ra: 34.74,
		dec: 57.13,
		d: 2300
	},
	{
		n: "Wild Duck · M11",
		t: "OC",
		ra: 282.77,
		dec: -6.27,
		d: 1900
	},
	{
		n: "Ptolemy · M7",
		t: "OC",
		ra: 268.46,
		dec: -34.79,
		d: 300
	},
	{
		n: "Butterfly · M6",
		t: "OC",
		ra: 265.08,
		dec: -32.21,
		d: 490
	},
	{
		n: "M35",
		t: "OC",
		ra: 92.27,
		dec: 24.33,
		d: 860
	},
	{
		n: "M67",
		t: "OC",
		ra: 132.83,
		dec: 11.81,
		d: 800
	},
	{
		n: "M13 · Hercules",
		t: "GC",
		ra: 250.42,
		dec: 36.46,
		d: 7700
	},
	{
		n: "M22",
		t: "GC",
		ra: 279.1,
		dec: -23.9,
		d: 3200
	},
	{
		n: "Omega Centauri",
		t: "GC",
		ra: 201.7,
		dec: -47.48,
		d: 5200
	},
	{
		n: "47 Tucanae",
		t: "GC",
		ra: 6.02,
		dec: -72.08,
		d: 4450
	},
	{
		n: "M5",
		t: "GC",
		ra: 229.64,
		dec: 2.08,
		d: 7500
	},
	{
		n: "M15",
		t: "GC",
		ra: 322.49,
		dec: 12.17,
		d: 10400
	},
	{
		n: "M3",
		t: "GC",
		ra: 205.55,
		dec: 28.38,
		d: 10200
	},
	{
		n: "M4",
		t: "GC",
		ra: 245.9,
		dec: -26.53,
		d: 1850
	},
	{
		n: "M92",
		t: "GC",
		ra: 259.28,
		dec: 43.14,
		d: 8200
	},
	{
		n: "Orion Nebula · M42",
		t: "EN",
		ra: 83.82,
		dec: -5.39,
		d: 388
	},
	{
		n: "Lagoon Nebula · M8",
		t: "EN",
		ra: 270.92,
		dec: -24.38,
		d: 1250
	},
	{
		n: "Eagle Nebula · M16",
		t: "EN",
		ra: 274.7,
		dec: -13.81,
		d: 1740
	},
	{
		n: "Trifid Nebula · M20",
		t: "EN",
		ra: 270.6,
		dec: -23.03,
		d: 1550
	},
	{
		n: "Omega Nebula · M17",
		t: "EN",
		ra: 275.2,
		dec: -16.17,
		d: 1700
	},
	{
		n: "Carina Nebula",
		t: "EN",
		ra: 161.27,
		dec: -59.87,
		d: 2300
	},
	{
		n: "Rosette Nebula",
		t: "EN",
		ra: 97.98,
		dec: 4.95,
		d: 1600
	},
	{
		n: "North America Nebula",
		t: "EN",
		ra: 314.75,
		dec: 44.31,
		d: 800
	},
	{
		n: "Tarantula Nebula",
		t: "EN",
		ra: 84.68,
		dec: -69.1,
		d: 49e3
	},
	{
		n: "Ring Nebula · M57",
		t: "PN",
		ra: 283.4,
		dec: 33.03,
		d: 787
	},
	{
		n: "Dumbbell Nebula · M27",
		t: "PN",
		ra: 299.9,
		dec: 22.72,
		d: 380
	},
	{
		n: "Helix Nebula",
		t: "PN",
		ra: 337.41,
		dec: -20.84,
		d: 200
	},
	{
		n: "Cat's Eye Nebula",
		t: "PN",
		ra: 269.64,
		dec: 66.63,
		d: 1e3
	},
	{
		n: "Crab Nebula · M1",
		t: "SNR",
		ra: 83.63,
		dec: 22.01,
		d: 2e3
	},
	{
		n: "Veil Nebula",
		t: "SNR",
		ra: 311.6,
		dec: 30.72,
		d: 740
	},
	{
		n: "Cygnus X-1",
		t: "BH",
		ra: 299.59,
		dec: 35.202,
		d: 2220
	},
	{
		n: "V404 Cygni",
		t: "BH",
		ra: 306.016,
		dec: 33.867,
		d: 2390
	},
	{
		n: "GRS 1915+105",
		t: "BH",
		ra: 288.798,
		dec: 10.946,
		d: 8600
	},
	{
		n: "A0620-00",
		t: "BH",
		ra: 95.676,
		dec: -.35,
		d: 1060
	},
	{
		n: "GRO J1655-40",
		t: "BH",
		ra: 253.5,
		dec: -39.846,
		d: 3200
	},
	{
		n: "LMC X-1",
		t: "BH",
		ra: 84.912,
		dec: -69.743,
		d: 49700
	},
	{
		n: "V4641 Sgr",
		t: "BH",
		ra: 274.839,
		dec: -25.407,
		d: 6200
	},
	{
		n: "Cygnus X-3",
		t: "XRB",
		ra: 308.107,
		dec: 40.958,
		d: 7400
	},
	{
		n: "Scorpius X-1",
		t: "XRB",
		ra: 244.979,
		dec: -15.64,
		d: 2800
	},
	{
		n: "Hercules X-1",
		t: "XRB",
		ra: 254.457,
		dec: 35.342,
		d: 6100
	},
	{
		n: "SS 433",
		t: "XRB",
		ra: 287.957,
		dec: 4.983,
		d: 5500
	},
	{
		n: "Vela X-1",
		t: "XRB",
		ra: 135.529,
		dec: -40.555,
		d: 1900
	},
	{
		n: "Centaurus X-3",
		t: "XRB",
		ra: 170.313,
		dec: -60.624,
		d: 5700
	},
	{
		n: "Geminga",
		t: "NS",
		ra: 98.476,
		dec: 17.77,
		d: 250
	},
	{
		n: "SGR 1806-20",
		t: "NS",
		ra: 272.163,
		dec: -20.412,
		d: 8700
	},
	{
		n: "RX J1856-3754",
		t: "NS",
		ra: 284.146,
		dec: -37.908,
		d: 120
	},
	{
		n: "SGR 1935+2154",
		t: "NS",
		ra: 293.732,
		dec: 21.897,
		d: 6600
	},
	{
		n: "Luhman 16 AB",
		t: "BD",
		ra: 162.328,
		dec: -53.319,
		d: 2
	},
	{
		n: "WISE 0855−0714",
		t: "BD",
		ra: 133.79,
		dec: -7.24,
		d: 2.28
	},
	{
		n: "Epsilon Indi Ba",
		t: "BD",
		ra: 330.87,
		dec: -56.79,
		d: 3.62
	},
	{
		n: "SCR 1845−6357 B",
		t: "BD",
		ra: 281.3,
		dec: -63.96,
		d: 3.85
	},
	{
		n: "DENIS 1048−3956",
		t: "BD",
		ra: 162.07,
		dec: -39.94,
		d: 4
	},
	{
		n: "UGPS 0722−05",
		t: "BD",
		ra: 110.61,
		dec: -5.68,
		d: 4.1
	},
	{
		n: "Gliese 229 B",
		t: "BD",
		ra: 92.64,
		dec: -21.86,
		d: 5.76
	},
	{
		n: "GJ 570 D",
		t: "BD",
		ra: 224.36,
		dec: -21.41,
		d: 5.88
	},
	{
		n: "SIMP 0136+0933",
		t: "BD",
		ra: 24.24,
		dec: 9.56,
		d: 6.1
	},
	{
		n: "2MASS 1507−1627",
		t: "BD",
		ra: 226.95,
		dec: -16.46,
		d: 7.4
	},
	{
		n: "2M1207 · has a planet",
		t: "BD",
		ra: 181.89,
		dec: -39.55,
		d: 64.4
	},
	{
		n: "Teide 1 · Pleiades",
		t: "BD",
		ra: 56.9,
		dec: 24.36,
		d: 120
	},
	{
		n: "SN 1006",
		t: "SNR",
		ra: 225.592,
		dec: -41.935,
		d: 2200
	},
	{
		n: "Tycho · SN 1572",
		t: "SNR",
		ra: 6.34,
		dec: 64.14,
		d: 2500
	},
	{
		n: "Kepler · SN 1604",
		t: "SNR",
		ra: 262.675,
		dec: -21.49,
		d: 5e3
	},
	{
		n: "Cassiopeia A",
		t: "SNR",
		ra: 350.85,
		dec: 58.815,
		d: 3400
	},
	{
		n: "SN 1987A · LMC",
		t: "SNR",
		ra: 83.867,
		dec: -69.27,
		d: 51400
	},
	{
		n: "Vela SNR",
		t: "SNR",
		ra: 128.5,
		dec: -45.833,
		d: 290
	},
	{
		n: "Puppis A",
		t: "SNR",
		ra: 125.5,
		dec: -42.9,
		d: 2e3
	},
	{
		n: "RCW 86 · SN 185",
		t: "SNR",
		ra: 220.7,
		dec: -62.5,
		d: 2500
	},
	{
		n: "M2",
		t: "GC",
		ra: 323.363,
		dec: -.823,
		d: 11500
	},
	{
		n: "M10",
		t: "GC",
		ra: 254.288,
		dec: -4.1,
		d: 4400
	},
	{
		n: "M12",
		t: "GC",
		ra: 251.809,
		dec: -1.948,
		d: 4800
	},
	{
		n: "M14",
		t: "GC",
		ra: 264.4,
		dec: -3.246,
		d: 9300
	},
	{
		n: "M19",
		t: "GC",
		ra: 255.657,
		dec: -26.268,
		d: 8800
	},
	{
		n: "M28",
		t: "GC",
		ra: 276.137,
		dec: -24.87,
		d: 5500
	},
	{
		n: "M30",
		t: "GC",
		ra: 325.092,
		dec: -23.18,
		d: 8100
	},
	{
		n: "M54",
		t: "GC",
		ra: 283.764,
		dec: -30.48,
		d: 26e3
	},
	{
		n: "M55",
		t: "GC",
		ra: 294.999,
		dec: -30.965,
		d: 5400
	},
	{
		n: "M62",
		t: "GC",
		ra: 255.303,
		dec: -30.112,
		d: 6800
	},
	{
		n: "M79",
		t: "GC",
		ra: 81.044,
		dec: -24.524,
		d: 12900
	},
	{
		n: "NGC 6752",
		t: "GC",
		ra: 287.717,
		dec: -59.985,
		d: 4e3
	},
	{
		n: "M36",
		t: "OC",
		ra: 84.05,
		dec: 34.13,
		d: 1330
	},
	{
		n: "M37",
		t: "OC",
		ra: 88.07,
		dec: 32.55,
		d: 1400
	},
	{
		n: "M38",
		t: "OC",
		ra: 82.17,
		dec: 35.85,
		d: 1070
	},
	{
		n: "M34",
		t: "OC",
		ra: 40.52,
		dec: 42.72,
		d: 500
	},
	{
		n: "M41",
		t: "OC",
		ra: 101.5,
		dec: -20.72,
		d: 710
	},
	{
		n: "M46",
		t: "OC",
		ra: 115.44,
		dec: -14.81,
		d: 1660
	},
	{
		n: "M93",
		t: "OC",
		ra: 116.14,
		dec: -23.86,
		d: 1140
	},
	{
		n: "M23",
		t: "OC",
		ra: 269.15,
		dec: -19.02,
		d: 660
	},
	{
		n: "M25",
		t: "OC",
		ra: 277.94,
		dec: -19.25,
		d: 610
	},
	{
		n: "Jewel Box",
		t: "OC",
		ra: 193.68,
		dec: -60.35,
		d: 1980
	},
	{
		n: "Owl Nebula · M97",
		t: "PN",
		ra: 168.7,
		dec: 55.02,
		d: 640
	},
	{
		n: "Little Dumbbell · M76",
		t: "PN",
		ra: 25.58,
		dec: 51.58,
		d: 780
	},
	{
		n: "Saturn Nebula",
		t: "PN",
		ra: 316.05,
		dec: -11.36,
		d: 1500
	},
	{
		n: "Eskimo Nebula",
		t: "PN",
		ra: 112.3,
		dec: 20.91,
		d: 1800
	},
	{
		n: "California Nebula",
		t: "EN",
		ra: 60,
		dec: 36.42,
		d: 300
	},
	{
		n: "Flame Nebula",
		t: "EN",
		ra: 85.43,
		dec: -1.85,
		d: 400
	},
	{
		n: "Cocoon Nebula",
		t: "EN",
		ra: 328.38,
		dec: 47.27,
		d: 1200
	},
	{
		n: "Virgo Cluster",
		t: "CL",
		ra: 187.7,
		dec: 12.4,
		d: 165e5
	},
	{
		n: "Fornax Cluster",
		t: "CL",
		ra: 54.6,
		dec: -35.5,
		d: 19e6
	},
	{
		n: "Coma Cluster",
		t: "CL",
		ra: 194.9,
		dec: 27.9,
		d: 99e6
	},
	{
		n: "Perseus Cluster",
		t: "CL",
		ra: 49.9,
		dec: 41.5,
		d: 73e6
	},
	{
		n: "Centaurus Cluster",
		t: "CL",
		ra: 192.2,
		dec: -41.3,
		d: 52e6
	},
	{
		n: "Hydra Cluster",
		t: "CL",
		ra: 159.2,
		dec: -27.5,
		d: 58e6
	},
	{
		n: "Norma Cluster",
		t: "CL",
		ra: 243.6,
		dec: -60.9,
		d: 65e6
	},
	{
		n: "Hercules Cluster",
		t: "CL",
		ra: 241.3,
		dec: 17.7,
		d: 16e7
	},
	{
		n: "Shapley · A3558",
		t: "CL",
		ra: 202,
		dec: -31.5,
		d: 2e8
	},
	{
		n: "Virgo Supercluster",
		t: "SC",
		ra: 187,
		dec: 12,
		d: 18e6
	},
	{
		n: "Laniakea · Great Attractor",
		t: "SC",
		ra: 243,
		dec: -61,
		d: 79e6
	},
	{
		n: "Perseus-Pisces SC",
		t: "SC",
		ra: 30,
		dec: 35,
		d: 7e7
	},
	{
		n: "Shapley Supercluster",
		t: "SC",
		ra: 202,
		dec: -31,
		d: 2e8
	},
	{
		n: "3C 273",
		t: "QSOn",
		ra: 187.278,
		dec: 2.052,
		d: 652e6
	},
	{
		n: "3C 48",
		t: "QSOn",
		ra: 24.422,
		dec: 33.16,
		d: 1436e6
	},
	{
		n: "ULAS J1342+0928",
		t: "QSOn",
		ra: 205.617,
		dec: 9.477,
		d: 8805e6
	},
	{
		n: "J0313-1806 · z 7.64",
		t: "QSOn",
		ra: 48.353,
		dec: -18.107,
		d: 8836e6
	},
	{
		n: "GW170817 · NGC 4993",
		t: "GW",
		ra: 197.448,
		dec: -23.384,
		d: 4e7
	},
	{
		n: "GW150914",
		t: "GW",
		ra: 112,
		dec: -70,
		d: 44e7
	},
	{
		n: "Sirius B",
		t: "WD",
		ra: 101.287,
		dec: -16.716,
		d: 2.64
	},
	{
		n: "Procyon B",
		t: "WD",
		ra: 114.826,
		dec: 5.225,
		d: 3.51
	},
	{
		n: "40 Eridani B",
		t: "WD",
		ra: 63.818,
		dec: -7.653,
		d: 5.04
	},
	{
		n: "Van Maanen 2",
		t: "WD",
		ra: 11.332,
		dec: 5.388,
		d: 4.31
	},
	{
		n: "Luhman 16",
		t: "BD",
		ra: 162.328,
		dec: -53.319,
		d: 2
	},
	{
		n: "WISE 0855-0714",
		t: "BD",
		ra: 133.787,
		dec: -7.245,
		d: 2.28
	},
	{
		n: "Epsilon Indi Ba",
		t: "BD",
		ra: 330.84,
		dec: -56.786,
		d: 3.64
	},
	{
		n: "GRB 221009A · BOAT",
		t: "GRB",
		ra: 288.265,
		dec: 19.773,
		d: 624e6
	},
	{
		n: "GRB 080319B · naked-eye",
		t: "GRB",
		ra: 217.92,
		dec: 36.303,
		d: 3148e6
	},
	{
		n: "GRB 090423 · z 8.2",
		t: "GRB",
		ra: 148.888,
		dec: 18.149,
		d: 9e9
	},
	{
		n: "GRB 130427A",
		t: "GRB",
		ra: 173.136,
		dec: 27.699,
		d: 134e7
	},
	{
		n: "FRB 121102 · repeater",
		t: "FRB",
		ra: 82.995,
		dec: 33.148,
		d: 79e7
	},
	{
		n: "FRB 180924",
		t: "FRB",
		ra: 326.105,
		dec: -40.9,
		d: 1273e6
	},
	{
		n: "FRB 20200120E · M81",
		t: "FRB",
		ra: 149.5,
		dec: 68.8,
		d: 36e5
	},
	{
		n: "Orion A cloud",
		t: "MC",
		ra: 84.1,
		dec: -7.2,
		d: 432
	},
	{
		n: "Orion B cloud",
		t: "MC",
		ra: 86.7,
		dec: -.5,
		d: 423
	},
	{
		n: "λ Orionis ring",
		t: "MC",
		ra: 83.8,
		dec: 9.9,
		d: 402
	},
	{
		n: "Taurus cloud",
		t: "MC",
		ra: 68.5,
		dec: 25.9,
		d: 141
	},
	{
		n: "Perseus cloud",
		t: "MC",
		ra: 54.1,
		dec: 31.3,
		d: 294
	},
	{
		n: "Ophiuchus cloud",
		t: "MC",
		ra: 246.8,
		dec: -24.5,
		d: 139
	},
	{
		n: "Lupus cloud",
		t: "MC",
		ra: 240.6,
		dec: -38.1,
		d: 189
	},
	{
		n: "Chamaeleon cloud",
		t: "MC",
		ra: 165.4,
		dec: -77.4,
		d: 192
	},
	{
		n: "Musca cloud",
		t: "MC",
		ra: 186.8,
		dec: -71.5,
		d: 170
	},
	{
		n: "Corona Australis cloud",
		t: "MC",
		ra: 285.5,
		dec: -36.9,
		d: 151
	},
	{
		n: "Serpens cloud",
		t: "MC",
		ra: 277.5,
		dec: .5,
		d: 438
	},
	{
		n: "Aquila Rift",
		t: "MC",
		ra: 277.8,
		dec: -3.7,
		d: 271
	},
	{
		n: "California cloud",
		t: "MC",
		ra: 60.1,
		dec: 37.2,
		d: 452
	},
	{
		n: "Cepheus cloud",
		t: "MC",
		ra: 337.4,
		dec: 75.2,
		d: 346
	},
	{
		n: "Mon R2 cloud",
		t: "MC",
		ra: 91.9,
		dec: -6.4,
		d: 788
	},
	{
		n: "Pipe Nebula",
		t: "MC",
		ra: 259.5,
		dec: -26.7,
		d: 163
	},
	{
		n: "Polaris Flare",
		t: "MC",
		ra: 344,
		dec: 87.5,
		d: 341
	},
	{
		n: "Rosette cloud",
		t: "MC",
		ra: 98.2,
		dec: 4.5,
		d: 1330
	},
	{
		n: "Cygnus X",
		t: "MC",
		ra: 307.7,
		dec: 40.8,
		d: 1400
	},
	{
		n: "W3 cloud",
		t: "MC",
		ra: 36.5,
		dec: 62.1,
		d: 1950
	},
	{
		n: "NGC 2808",
		t: "GC",
		ra: 138.013,
		dec: -64.863,
		d: 9600
	},
	{
		n: "NGC 6397",
		t: "GC",
		ra: 265.175,
		dec: -53.674,
		d: 2300
	},
	{
		n: "NGC 6541",
		t: "GC",
		ra: 272.01,
		dec: -43.715,
		d: 7500
	},
	{
		n: "NGC 3201",
		t: "GC",
		ra: 154.403,
		dec: -46.412,
		d: 4900
	},
	{
		n: "NGC 288",
		t: "GC",
		ra: 13.188,
		dec: -26.583,
		d: 8900
	},
	{
		n: "NGC 362",
		t: "GC",
		ra: 15.809,
		dec: -70.849,
		d: 8600
	},
	{
		n: "NGC 1851",
		t: "GC",
		ra: 78.528,
		dec: -40.047,
		d: 12100
	},
	{
		n: "M68",
		t: "GC",
		ra: 189.867,
		dec: -26.744,
		d: 10300
	},
	{
		n: "M53",
		t: "GC",
		ra: 198.23,
		dec: 18.169,
		d: 17900
	},
	{
		n: "M69",
		t: "GC",
		ra: 277.846,
		dec: -32.348,
		d: 8800
	},
	{
		n: "M70",
		t: "GC",
		ra: 280.803,
		dec: -32.292,
		d: 9700
	},
	{
		n: "M71",
		t: "GC",
		ra: 298.444,
		dec: 18.779,
		d: 4e3
	},
	{
		n: "M72",
		t: "GC",
		ra: 313.365,
		dec: -12.537,
		d: 16900
	},
	{
		n: "M75",
		t: "GC",
		ra: 301.52,
		dec: -21.921,
		d: 20500
	},
	{
		n: "M80",
		t: "GC",
		ra: 244.26,
		dec: -22.976,
		d: 1e4
	},
	{
		n: "M107",
		t: "GC",
		ra: 248.133,
		dec: -13.054,
		d: 6400
	},
	{
		n: "M9",
		t: "GC",
		ra: 259.799,
		dec: -18.516,
		d: 7900
	},
	{
		n: "M56",
		t: "GC",
		ra: 289.148,
		dec: 30.184,
		d: 10200
	},
	{
		n: "NGC 4833",
		t: "GC",
		ra: 194.891,
		dec: -70.876,
		d: 6600
	}
];
DSO.forEach((o) => {
	o.dso = true;
	o._dir = dirOf(o.ra, o.dec);
});
var PULSARS = CAT.pulsars;
PULSARS.forEach((q) => {
	q.psr = true;
	q._dir = dirOf(q[0], q[1]);
	q.n = q[3];
	q.d = q[2];
});
var CLUSTERS = CAT.clusters;
CLUSTERS.forEach((c) => {
	c.oclu = true;
	c.ct = 0;
	c._dir = dirOf(c[0], c[1]);
	c.n = c[3];
	c.d = c[2];
});
var GLOBS = CAT.globs;
var FRBS = CAT.frbs;
var CLU_T = [
	{
		c: [
			150,
			190,
			255
		],
		l: "Open cluster · Cantat-Gaudin 2020 (Gaia)"
	},
	{
		c: [
			255,
			215,
			140
		],
		l: "Globular cluster · Baumgardt (Gaia)"
	},
	{
		c: [
			170,
			255,
			190
		],
		l: "Fast radio burst · CHIME (distance estimated from DM)"
	}
];
GLOBS.concat(FRBS).forEach((c) => {
	c.oclu = true;
	c.ct = c[4] || 0;
	c._dir = dirOf(c[0], c[1]);
	c.n = c[3];
	c.d = c[2];
	CLUSTERS.push(c);
});
var CONS = DATA.constellations || [];
CONS.forEach((k) => {
	k._L = k.L.map((pl) => {
		const a = [];
		for (let i = 0; i < pl.length; i += 2) a.push(dirOf(pl[i], pl[i + 1]));
		return a;
	});
});
var CON_NAME = {
	Ori: "Orion",
	UMa: "Ursa Major",
	UMi: "Ursa Minor",
	Cas: "Cassiopeia",
	Cyg: "Cygnus",
	Lyr: "Lyra",
	Aql: "Aquila",
	Sco: "Scorpius",
	Sgr: "Sagittarius",
	Leo: "Leo",
	Tau: "Taurus",
	Gem: "Gemini",
	Cnc: "Cancer",
	Vir: "Virgo",
	And: "Andromeda",
	Per: "Perseus",
	Aur: "Auriga",
	Boo: "Bootes",
	Cru: "Crux",
	Cen: "Centaurus",
	CMa: "Canis Major",
	CMi: "Canis Minor",
	Peg: "Pegasus",
	Ari: "Aries",
	Psc: "Pisces",
	Aqr: "Aquarius",
	Cap: "Capricornus",
	Dra: "Draco",
	Her: "Hercules",
	Oph: "Ophiuchus",
	Car: "Carina",
	Vel: "Vela",
	Cae: "Caelum",
	Del: "Delphinus",
	Crv: "Corvus",
	Cvn: "Canes Venatici"
};
//#endregion
//#region src/engine/solar-data.js
var SUN = {
	n: "Sun",
	rk: 696340,
	c: [
		255,
		238,
		178
	],
	slug: "sun",
	kind: "Star"
};
var PLANETS = [
	{
		n: "Mercury",
		a: .387,
		rk: 2439.7,
		c: [
			176,
			168,
			158
		],
		slug: "mercury",
		moons: [],
		k: [
			.38709927,
			37e-8,
			.20563593,
			1906e-8,
			7.00497902,
			-.00594749,
			252.2503235,
			149472.67411175,
			77.45779628,
			.16047689,
			48.33076593,
			-.12534081
		]
	},
	{
		n: "Venus",
		a: .723,
		rk: 6051.8,
		c: [
			222,
			196,
			140
		],
		slug: "venus",
		moons: [],
		k: [
			.72333566,
			39e-7,
			.00677672,
			-4107e-8,
			3.39467605,
			-7889e-7,
			181.9790995,
			58517.81538729,
			131.60246718,
			.00268329,
			76.67984255,
			-.27769418
		]
	},
	{
		n: "Earth",
		a: 1,
		rk: 6371,
		c: [
			104,
			157,
			222
		],
		slug: "earth",
		moons: [{
			n: "Moon",
			am: 384,
			rk: 1737,
			c: [
				188,
				188,
				190
			]
		}],
		k: [
			1.00000261,
			562e-8,
			.01671123,
			-4392e-8,
			-1531e-8,
			-.01294668,
			100.46457166,
			35999.37244981,
			102.93768193,
			.32327364,
			0,
			0
		]
	},
	{
		n: "Mars",
		a: 1.524,
		rk: 3389.5,
		c: [
			209,
			122,
			74
		],
		slug: "mars",
		moons: [{
			n: "Phobos",
			am: 9.4,
			rk: 11,
			c: [
				150,
				140,
				130
			]
		}, {
			n: "Deimos",
			am: 23.5,
			rk: 6,
			c: [
				150,
				140,
				130
			]
		}],
		k: [
			1.52371034,
			1847e-8,
			.0933941,
			7882e-8,
			1.84969142,
			-.00813131,
			-4.55343205,
			19140.30268499,
			-23.94362959,
			.44441088,
			49.55953891,
			-.29257343
		]
	},
	{
		n: "Jupiter",
		a: 5.203,
		rk: 69911,
		c: [
			214,
			182,
			142
		],
		slug: "jupiter",
		moons: [
			{
				n: "Amalthea",
				am: 181,
				rk: 83,
				c: [
					196,
					140,
					110
				]
			},
			{
				n: "Io",
				am: 422,
				rk: 1821,
				c: [
					226,
					214,
					148
				]
			},
			{
				n: "Europa",
				am: 671,
				rk: 1560,
				c: [
					212,
					202,
					182
				]
			},
			{
				n: "Ganymede",
				am: 1070,
				rk: 2634,
				c: [
					170,
					162,
					152
				]
			},
			{
				n: "Callisto",
				am: 1883,
				rk: 2410,
				c: [
					128,
					120,
					120
				]
			}
		],
		k: [
			5.202887,
			-11607e-8,
			.04838624,
			-13253e-8,
			1.30439695,
			-.00183714,
			34.39644051,
			3034.74612775,
			14.72847983,
			.21252668,
			100.47390909,
			.20469106
		]
	},
	{
		n: "Saturn",
		a: 9.537,
		rk: 58232,
		c: [
			224,
			206,
			158
		],
		slug: "saturn",
		ring: true,
		moons: [
			{
				n: "Mimas",
				am: 185,
				rk: 198,
				c: [
					214,
					214,
					218
				]
			},
			{
				n: "Enceladus",
				am: 238,
				rk: 252,
				c: [
					222,
					222,
					226
				]
			},
			{
				n: "Tethys",
				am: 295,
				rk: 531,
				c: [
					200,
					200,
					204
				]
			},
			{
				n: "Dione",
				am: 377,
				rk: 561,
				c: [
					195,
					195,
					200
				]
			},
			{
				n: "Rhea",
				am: 527,
				rk: 764,
				c: [
					182,
					182,
					186
				]
			},
			{
				n: "Titan",
				am: 1222,
				rk: 2575,
				c: [
					214,
					170,
					86
				]
			},
			{
				n: "Iapetus",
				am: 3561,
				rk: 735,
				c: [
					150,
					140,
					130
				]
			}
		],
		k: [
			9.53667594,
			-.0012506,
			.05386179,
			-50991e-8,
			2.48599187,
			.00193609,
			49.95424423,
			1222.49362201,
			92.59887831,
			-.41897216,
			113.66242448,
			-.28867794
		]
	},
	{
		n: "Uranus",
		a: 19.191,
		rk: 25362,
		c: [
			170,
			214,
			222
		],
		slug: "uranus",
		uring: true,
		moons: [
			{
				n: "Miranda",
				am: 130,
				rk: 236,
				c: [
					170,
					170,
					175
				]
			},
			{
				n: "Ariel",
				am: 191,
				rk: 579,
				c: [
					178,
					178,
					182
				]
			},
			{
				n: "Umbriel",
				am: 266,
				rk: 585,
				c: [
					150,
					150,
					155
				]
			},
			{
				n: "Titania",
				am: 436,
				rk: 789,
				c: [
					172,
					172,
					176
				]
			},
			{
				n: "Oberon",
				am: 583,
				rk: 761,
				c: [
					160,
					155,
					155
				]
			}
		],
		k: [
			19.18916464,
			-.00196176,
			.04725744,
			-4397e-8,
			.77263783,
			-.00242939,
			313.23810451,
			428.48202785,
			170.9542763,
			.40805281,
			74.01692503,
			.04240589
		]
	},
	{
		n: "Neptune",
		a: 30.07,
		rk: 24622,
		c: [
			92,
			126,
			222
		],
		slug: "neptune",
		moons: [
			{
				n: "Proteus",
				am: 118,
				rk: 210,
				c: [
					150,
					150,
					155
				]
			},
			{
				n: "Triton",
				am: 355,
				rk: 1353,
				c: [
					192,
					196,
					202
				]
			},
			{
				n: "Nereid",
				am: 5514,
				rk: 170,
				c: [
					170,
					170,
					176
				]
			}
		],
		k: [
			30.06992276,
			26291e-8,
			.00859048,
			5105e-8,
			1.77004347,
			35372e-8,
			-55.12002969,
			218.45945325,
			44.96476227,
			-.32241464,
			131.78422574,
			-.00508664
		]
	}
];
var DWARFS = [
	{
		n: "Ceres",
		a: 2.77,
		rk: 473,
		c: [
			150,
			145,
			140
		],
		slug: "dwarf-planets",
		moons: [],
		kd: {
			a: 2.765552595,
			e: .079692295,
			i: 10.5880278,
			om: 80.24862682,
			w: 73.29421453,
			ma: 274.4193464,
			n: .21430445,
			ep: 2461200.5
		}
	},
	{
		n: "Pluto",
		a: 39.59,
		rk: 1188,
		c: [
			202,
			176,
			150
		],
		slug: "pluto",
		moons: [
			{
				n: "Charon",
				am: 19.6,
				rk: 606,
				c: [
					172,
					166,
					166
				]
			},
			{
				n: "Nix",
				am: 48.7,
				rk: 22,
				c: [
					180,
					180,
					184
				]
			},
			{
				n: "Hydra",
				am: 64.7,
				rk: 25,
				c: [
					180,
					180,
					184
				]
			}
		],
		kd: {
			a: 39.58862939,
			e: .251837878,
			i: 17.14771141,
			om: 110.2923841,
			w: 113.7090015,
			ma: 38.68366347,
			n: .003956839,
			ep: 2457588.5
		}
	},
	{
		n: "Haumea",
		a: 43.06,
		rk: 816,
		c: [
			212,
			206,
			200
		],
		slug: "haumea",
		moons: [],
		kd: {
			a: 43.06029024,
			e: .194443015,
			i: 28.20847393,
			om: 121.7860561,
			w: 240.6905473,
			ma: 223.2104119,
			n: .003488098,
			ep: 2461200.5
		}
	},
	{
		n: "Makemake",
		a: 45.57,
		rk: 715,
		c: [
			192,
			160,
			140
		],
		slug: "makemake",
		moons: [],
		kd: {
			a: 45.57093317,
			e: .158888995,
			i: 29.02785604,
			om: 79.29483382,
			w: 297.0922733,
			ma: 169.9379962,
			n: .00320385,
			ep: 2461200.5
		}
	},
	{
		n: "Eris",
		a: 67.93,
		rk: 1163,
		c: [
			206,
			206,
			212
		],
		slug: "eris",
		moons: [],
		kd: {
			a: 67.93394688,
			e: .438238535,
			i: 43.92582795,
			om: 36.00477044,
			w: 150.7949236,
			ma: 211.7744343,
			n: .001760248,
			ep: 2461200.5
		}
	}
];
var SMALL = [
	{
		n: "Vesta",
		t: "AST",
		rk: 262,
		kd: {
			a: 2.361365965,
			e: .090203744,
			i: 7.143925545,
			om: 103.7012933,
			w: 151.4686478,
			ma: 81.19015608,
			n: .271618361,
			ep: 2461200.5
		}
	},
	{
		n: "Pallas",
		t: "AST",
		rk: 256,
		kd: {
			a: 2.769559011,
			e: .2307001,
			i: 34.93279322,
			om: 172.8866193,
			w: 310.9699162,
			ma: 254.2496522,
			n: .213839603,
			ep: 2461200.5
		}
	},
	{
		n: "Hygiea",
		t: "AST",
		rk: 217,
		kd: {
			a: 3.150974034,
			e: .106709274,
			i: 3.829529946,
			om: 283.1198928,
			w: 312.4242387,
			ma: 252.0344242,
			n: .176212551,
			ep: 2461200.5
		}
	},
	{
		n: "Juno",
		t: "AST",
		rk: 127,
		kd: {
			a: 2.670989527,
			e: .255699984,
			i: 12.98659237,
			om: 169.8115953,
			w: 247.8950743,
			ma: 262.7322945,
			n: .225785369,
			ep: 2461200.5
		}
	},
	{
		n: "Psyche",
		t: "AST",
		rk: 113,
		kd: {
			a: 2.925720466,
			e: .134932474,
			i: 3.098749116,
			om: 149.9753859,
			w: 230.0326783,
			ma: 79.76939505,
			n: .196949476,
			ep: 2461200.5
		}
	},
	{
		n: "Eros",
		t: "AST",
		rk: 8.4,
		kd: {
			a: 1.458243717,
			e: .222877963,
			i: 10.8285441,
			om: 304.2679713,
			w: 178.9181319,
			ma: 62.51145502,
			n: .559704635,
			ep: 2461200.5
		}
	},
	{
		n: "Bennu",
		t: "AST",
		rk: .24,
		kd: {
			a: 1.126391026,
			e: .203745076,
			i: 6.03494377,
			om: 2.060866196,
			w: 66.22306084,
			ma: 101.703952,
			n: .82446135,
			ep: 2455562.5
		}
	},
	{
		n: "Ryugu",
		t: "AST",
		rk: .45,
		kd: {
			a: 1.190918932,
			e: .191073005,
			i: 5.866442495,
			om: 251.2897124,
			w: 211.6089939,
			ma: 62.34067434,
			n: .758369354,
			ep: 2461200.5
		}
	},
	{
		n: "1P/Halley",
		t: "COM",
		rk: 5.5,
		kd: {
			a: 17.92863505,
			e: .967935996,
			i: 162.19053,
			om: 59.09894721,
			w: 112.2414315,
			ma: 274.3823371,
			n: .012983244,
			ep: 2439875.5
		}
	},
	{
		n: "2P/Encke",
		t: "COM",
		rk: 2.4,
		kd: {
			a: 2.21968871,
			e: .847749697,
			i: 11.41227811,
			om: 334.1935846,
			w: 187.1342464,
			ma: 243.1260693,
			n: .298034105,
			ep: 2459847.5
		}
	},
	{
		n: "67P C-G",
		t: "COM",
		rk: 2,
		kd: {
			a: 3.46224949,
			e: .640908131,
			i: 7.040294907,
			om: 50.1355738,
			w: 12.79824973,
			ma: 8.859927419,
			n: .152991229,
			ep: 2457305.5
		}
	},
	{
		n: "Hale-Bopp",
		t: "COM",
		rk: 30,
		kd: {
			a: 177.4333839,
			e: .994981003,
			i: 89.28759425,
			om: 282.7334214,
			w: 130.4146671,
			ma: 3.878386339,
			n: 417014e-9,
			ep: 2459837.5
		}
	},
	{
		n: "9P/Tempel 1",
		t: "COM",
		rk: 3,
		kd: {
			a: 3.146133759,
			e: .509702833,
			i: 10.47342815,
			om: 68.75357468,
			w: 179.1972754,
			ma: 336.5854439,
			n: .176619357,
			ep: 2457470.5
		}
	}
];
SMALL.forEach((o) => {
	o.kind = o.t === "COM" ? "Comet" : "Asteroid";
});
var COMETS2 = CAT.comets;
COMETS2.forEach((o) => {
	o.kind = "Comet";
});
SMALL.push.apply(SMALL, COMETS2);
var PROBES = CAT.probes;
var TNOS = CAT.tnos;
TNOS.forEach((t) => {
	t.kind = /Chariklo|Chiron|Pholus/.test(t.n) ? "Centaur" : "Trans-Neptunian object";
	t.moons = [];
	t.slug = "dwarf-planets";
});
PROBES.forEach((p) => {
	p.kind = "Spacecraft";
	p.moons = [];
});
var MOON_EPH = CAT.moonEph;
function moonAt(kd, jd) {
	const el = keplerSB(kd, jd), q = orbPoint(el, el.E), r = Math.hypot(q[0], q[1], q[2]) || 1, d = eclDir(q[0], q[1], q[2]);
	return {
		dir: [
			d[0] / r,
			d[1] / r,
			d[2] / r
		],
		r
	};
}
function moonOrbitPoint(kd, E) {
	const q = orbPoint({
		a: kd.a,
		e: kd.e,
		I: kd.i * D2R,
		om: kd.w * D2R,
		O: kd.om * D2R,
		E
	}, E);
	return eclDir(q[0], q[1], q[2]);
}
var EXTRA_MOONS = CAT.extraMoons;
for (const b of [...PLANETS, ...DWARFS]) {
	const ex = EXTRA_MOONS[b.n];
	if (ex) for (const m of ex) {
		m.minor = true;
		m.c = [
			152,
			152,
			158
		];
		b.moons.push(m);
	}
}
var SUNHIT = { sunhit: true };
PLANETS.forEach((p) => {
	p.kind = "Planet";
	p.moons.forEach((m) => {
		m.kind = "Moon";
		m.parent = p.n;
		m.pc = p.c;
	});
	if (CAT.planetsOsc && CAT.planetsOsc[p.n]) p.osc = CAT.planetsOsc[p.n];
});
DWARFS.forEach((p) => {
	p.kind = "Dwarf planet";
	p.moons.forEach((m) => {
		m.kind = "Moon";
		m.parent = p.n;
		m.pc = p.c;
	});
});
SUN.kind = "Star";
var SOLAR_BODIES = [
	...PLANETS,
	...DWARFS,
	...TNOS
];
var D2R = Math.PI / 180;
var EPOCH_JD = (/* @__PURE__ */ new Date()).getTime() / 864e5 + 2440587.5;
function solarJD() {
	return EPOCH_JD + S.tOffsetDays;
}
function jdToDate(jd) {
	return /* @__PURE__ */ new Date((jd - 2440587.5) * 864e5);
}
function dateStr(jd) {
	return jdToDate(jd).toLocaleDateString("en-US", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric"
	});
}
function keplerEcl(k, T, E0) {
	const a = k[0] + k[1] * T, e = k[2] + k[3] * T, I = (k[4] + k[5] * T) * D2R;
	const L = k[6] + k[7] * T, wb = k[8] + k[9] * T, O = (k[10] + k[11] * T) * D2R;
	const om = wb * D2R - O;
	let M = (L - wb) * D2R;
	M = Math.atan2(Math.sin(M), Math.cos(M));
	let E = E0 !== void 0 ? E0 : M;
	for (let i = 0; i < 6; i++) E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
	return {
		a,
		e,
		I,
		om,
		O,
		E
	};
}
function orbPoint(el, E) {
	const { a, e, I, om, O } = el;
	const xp = a * (Math.cos(E) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
	const cO = Math.cos(O), sO = Math.sin(O), cI = Math.cos(I), sI = Math.sin(I), cw = Math.cos(om), sw = Math.sin(om);
	return [
		(cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
		(cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
		sw * sI * xp + cw * sI * yp
	];
}
function keplerSB(kd, jd) {
	let M = (kd.ma + kd.n * (jd - kd.ep)) * D2R;
	M = Math.atan2(Math.sin(M), Math.cos(M));
	const e = kd.e;
	let E = M + e * Math.sin(M) * (1 + e * Math.cos(M));
	for (let i = 0; i < 18; i++) {
		const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
		E -= dE;
		if (Math.abs(dE) < 1e-8) break;
	}
	return {
		a: kd.a,
		e: kd.e,
		I: kd.i * D2R,
		om: kd.w * D2R,
		O: kd.om * D2R,
		E
	};
}
var OBLQ = 23.4392911 * D2R;
var cOB = Math.cos(OBLQ);
var sOB = Math.sin(OBLQ);
function eclDir(xe, ye, ze) {
	return [
		xe,
		ye * cOB - ze * sOB,
		ye * sOB + ze * cOB
	];
}
function eclToWorld(xe, ye, ze) {
	const r = Math.hypot(xe, ye, ze) || 1e-12, R = scale(r * AU_PC) / r;
	return [
		xe * R,
		(ye * cOB - ze * sOB) * R,
		(ye * sOB + ze * cOB) * R
	];
}
var OSC_SPAN = 730;
function elementsAt(b, jd) {
	if (b.osc && Math.abs(jd - b.osc.ep) < OSC_SPAN) return keplerSB(b.osc, jd);
	if (b.k) return keplerEcl(b.k, (jd - 2451545) / 36525);
	return b.kd ? keplerSB(b.kd, jd) : null;
}
function updateSolarPositions(jd) {
	for (const b of SOLAR_BODIES) {
		b._el = elementsAt(b, jd);
		b._e = b._el ? orbPoint(b._el, b._el.E) : null;
		if (b._e) b._r = Math.hypot(b._e[0], b._e[1], b._e[2]);
	}
	for (const p of PROBES) {
		const dt = jd - p.ep;
		p._e = [
			p.p[0] + p.v[0] * dt,
			p.p[1] + p.v[1] * dt,
			p.p[2] + p.v[2] * dt
		];
		p._r = Math.hypot(p._e[0], p._e[1], p._e[2]);
	}
}
var FAC = {
	kepler: {
		c: [
			122,
			162,
			255
		],
		l: "Kepler"
	},
	tess: {
		c: [
			79,
			214,
			200
		],
		l: "TESS"
	},
	k2: {
		c: [
			168,
			150,
			255
		],
		l: "K2"
	},
	rv: {
		c: [
			255,
			207,
			107
		],
		l: "Radial velocity"
	},
	micro: {
		c: [
			255,
			143,
			176
		],
		l: "Microlensing"
	},
	imaging: {
		c: [
			127,
			224,
			138
		],
		l: "Direct imaging"
	},
	ground: {
		c: [
			214,
			217,
			226
		],
		l: "Transit (ground)"
	},
	other: {
		c: [
			150,
			161,
			190
		],
		l: "Other"
	}
};
var HYG = DATA.hyg || [];
//#endregion
//#region src/engine/motion.js
var MAS2RAD = Math.PI / (180 * 3600 * 1e3);
var KMS2PCYR = 10227e-10;
function velocityOf(dir, d, pr, pd, rv) {
	const cd = Math.hypot(dir[0], dir[1]) || 1e-6;
	const ex = -dir[1] / cd, ey = dir[0] / cd;
	const nx = -dir[2] * dir[0] / cd, ny = -dir[2] * dir[1] / cd, nz = cd;
	const vE = (pr || 0) * MAS2RAD * d, vN = (pd || 0) * MAS2RAD * d, vR = (rv || 0) * KMS2PCYR;
	return [
		ex * vE + nx * vN + dir[0] * vR,
		ey * vE + ny * vN + dir[1] * vR,
		nz * vN + dir[2] * vR
	];
}
for (const s of HYG) s._v = velocityOf([
	s.dx,
	s.dy,
	s.dz
], s.d, s.pr, s.pd, s.rv);
for (const s of STARS) s._v = velocityOf([
	s._dx,
	s._dy,
	s._dz
], s._r, s.pr, s.pd, s.rv);
var yearsSinceJ2000 = () => (Date.now() / 864e5 + 2440587.5 - 2451545) / 365.25;
var tNow = () => yearsSinceJ2000() + (S.pm ? S.pmYears : 0);
var tSince = (epoch) => tNow() - (epoch - 2e3);
var epochNow = () => 2e3 + tNow();
function hygPos(s, t) {
	return [
		s.dx * s.d + s._v[0] * t,
		s.dy * s.d + s._v[1] * t,
		s.dz * s.d + s._v[2] * t
	];
}
function hostPos(s, t) {
	return [
		s._dx * s._r + s._v[0] * t,
		s._dy * s._r + s._v[1] * t,
		s._dz * s._r + s._v[2] * t
	];
}
var ENCOUNTERS = (() => {
	const out = [];
	for (const s of HYG) {
		if (s.rv === void 0) continue;
		const v = s._v, rx = s.dx * s.d, ry = s.dy * s.d, rz = s.dz * s.d;
		const vv = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
		if (vv <= 0) continue;
		const t = -(rx * v[0] + ry * v[1] + rz * v[2]) / vv;
		if (Math.abs(t) > 2e6) continue;
		const d = Math.hypot(rx + v[0] * t, ry + v[1] * t, rz + v[2] * t);
		if (d < 1.5 && d < s.d * .9) out.push({
			s,
			t: Math.round(t - yearsSinceJ2000()),
			d,
			v: Math.sqrt(vv) / KMS2PCYR
		});
	}
	out.sort((a, b) => a.d - b.d);
	return out.slice(0, 40);
})();
encounters.set(ENCOUNTERS.map((e, i) => ({
	i,
	name: e.s.n || "HIP " + e.s.hip,
	t: e.t,
	d: e.d,
	v: e.v,
	dNow: e.s.d
})));
//#endregion
//#region src/engine/draw.js
var _sprites = {};
function blobSprite(r, g, b, a0, a1) {
	const k = r + "," + g + "," + b + "," + a0 + "," + a1;
	let sp = _sprites[k];
	if (!sp) {
		sp = document.createElement("canvas");
		sp.width = sp.height = 64;
		const c2 = sp.getContext("2d");
		const gr = c2.createRadialGradient(32, 32, 0, 32, 32, 32);
		gr.addColorStop(0, `rgba(${r},${g},${b},${a0})`);
		gr.addColorStop(.5, `rgba(${r},${g},${b},${a1})`);
		gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
		c2.fillStyle = gr;
		c2.fillRect(0, 0, 64, 64);
		_sprites[k] = sp;
	}
	return sp;
}
var _halos = {};
function haloSprite(key, stops, size) {
	let sp = _halos[key];
	if (sp) return sp;
	sp = document.createElement("canvas");
	sp.width = sp.height = size || 256;
	const h = sp.width / 2, c2 = sp.getContext("2d"), gr = c2.createRadialGradient(h, h, 0, h, h, h);
	for (const [t, col] of stops) gr.addColorStop(t, col);
	c2.fillStyle = gr;
	c2.beginPath();
	c2.arc(h, h, h, 0, 6.2832);
	c2.fill();
	_halos[key] = sp;
	return sp;
}
function drawHalo(sp, x, y, r, alpha) {
	if (!(r > .5)) return;
	if (r > 4 * Math.max(W, H)) return;
	const ga = ctx.globalAlpha;
	ctx.globalAlpha = ga * alpha;
	ctx.drawImage(sp, x - r, y - r, r * 2, r * 2);
	ctx.globalAlpha = ga;
}
var PLIM = 32768;
function offscr(p) {
	return p.depth <= V.NEAR || Math.abs(p.x - V.cx) > PLIM || Math.abs(p.y - V.cy) > PLIM;
}
var PATH = {
	n: 0,
	x: /* @__PURE__ */ new Float64Array(2048),
	y: /* @__PURE__ */ new Float64Array(2048),
	brk: /* @__PURE__ */ new Uint8Array(2048)
};
function pathBegin() {
	PATH.n = 0;
}
function pathPt(p) {
	if (offscr(p)) {
		if (PATH.n) PATH.brk[PATH.n - 1] = 1;
		return;
	}
	const i = PATH.n;
	if (i >= PATH.x.length) return;
	PATH.x[i] = p.x;
	PATH.y[i] = p.y;
	PATH.brk[i] = 0;
	PATH.n = i + 1;
}
function pathBreak() {
	if (PATH.n) PATH.brk[PATH.n - 1] = 1;
}
function pathStroke(style, lw, dash) {
	const n = PATH.n;
	if (n < 2) return;
	const M = 40, X0 = -40, Y0 = -40, X1 = W + M, Y1 = H + M;
	ctx.beginPath();
	let any = false, open = false;
	for (let i = 1; i < n; i++) {
		if (PATH.brk[i - 1]) {
			open = false;
			continue;
		}
		const ax = PATH.x[i - 1], ay = PATH.y[i - 1], dx = PATH.x[i] - ax, dy = PATH.y[i] - ay;
		let t0 = 0, t1 = 1, ok = true;
		for (let e = 0; e < 4; e++) {
			const q = e === 0 ? -dx : e === 1 ? dx : e === 2 ? -dy : dy;
			const r = e === 0 ? ax - X0 : e === 1 ? X1 - ax : e === 2 ? ay - Y0 : Y1 - ay;
			if (q === 0) {
				if (r < 0) {
					ok = false;
					break;
				}
				continue;
			}
			const t = r / q;
			if (q < 0) {
				if (t > t1) {
					ok = false;
					break;
				}
				if (t > t0) t0 = t;
			} else {
				if (t < t0) {
					ok = false;
					break;
				}
				if (t < t1) t1 = t;
			}
		}
		if (!ok) {
			open = false;
			continue;
		}
		if (!open || t0 > 0) ctx.moveTo(ax + dx * t0, ay + dy * t0);
		ctx.lineTo(ax + dx * t1, ay + dy * t1);
		any = true;
		open = t1 >= 1;
	}
	if (!any) return;
	ctx.strokeStyle = style;
	ctx.lineWidth = lw;
	if (dash) {
		ctx.setLineDash(dash);
		ctx.stroke();
		ctx.setLineDash([]);
	} else ctx.stroke();
}
var PROF = {
	on: false,
	t: Object.create(null),
	frames: 0
};
function P(k, fn) {
	if (!PROF.on) return fn();
	const a = performance.now();
	const r = fn();
	PROF.t[k] = (PROF.t[k] || 0) + (performance.now() - a);
	return r;
}
api.prof = (on) => {
	if (on) {
		PROF.on = true;
		PROF.t = Object.create(null);
		PROF.frames = 0;
		return null;
	}
	PROF.on = false;
	const f = PROF.frames || 1;
	return {
		frames: PROF.frames,
		ms: Object.fromEntries(Object.entries(PROF.t).map(([k, v]) => [k, +(v / f).toFixed(2)]).sort((a, b) => b[1] - a[1]))
	};
};
//#endregion
//#region src/engine/hyg.js
var hygProj = [];
Math.PI / (180 * 3600 * 1e3);
function projectHyg() {
	hygProj.length = 0;
	if (!S.hyg) return;
	const ty = tNow();
	for (const s of HYG) {
		let dx = s.dx, dy = s.dy, dz = s.dz, dNow = s.d;
		{
			const q = hygPos(s, ty);
			dNow = Math.hypot(q[0], q[1], q[2]) || 1e-9;
			dx = q[0] / dNow;
			dy = q[1] / dNow;
			dz = q[2] / dNow;
		}
		s._dNow = dNow;
		const dr = compress(dNow);
		const p = projectInto(dx * dr, dy * dr, dz * dr, _pj);
		if (p.depth <= V.NEAR) continue;
		if (p.x < -90 || p.x > W + 90 || p.y < -90 || p.y > H + 90) continue;
		s._mApp = s.m;
		if (S.skyMode && camDist > 1e-4) {
			const dc = Math.hypot(dx * dNow - camPos[0], dy * dNow - camPos[1], dz * dNow - camPos[2]);
			s._mApp = s.m + 5 * Math.log10(Math.max(dc, 1e-9) / Math.max(dNow, 1e-9));
		}
		let bright = 6.8 - s._mApp;
		if (bright < 0) bright = 0;
		const size = S.skyMode ? Math.min(4.5, .5 + bright * .42) * (1 + .1 * Math.log2(V.fovK)) : (.4 + bright * .34) * V.foc * .0032 / p.depth;
		if (size < .34 && s !== S.hover && s !== S.pinned) continue;
		s._sx = p.x;
		s._sy = p.y;
		s._depth = p.depth;
		s._z2 = p.z2;
		s._bright = bright;
		s._size = size;
		hygProj.push(s);
	}
	hygProj.sort((a, b) => a._z2 - b._z2);
}
function drawHyg() {
	LBL.prio = 52;
	for (const s of hygProj) {
		const bright = s._bright, size = Math.max(.35, Math.min(3.6, s._size));
		const c = s.c, a = Math.max(.22, Math.min(1, (.28 + bright * .12) * Math.min(1, 1.9 - (S.skyMode ? 0 : s._depth) * .4)));
		const sel = s === S.hover || s === S.pinned;
		ctx.beginPath();
		ctx.arc(s._sx, s._sy, sel ? size + 1.4 : size, 0, 6.2832);
		ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
		ctx.fill();
		if (bright > 5.2 || sel) {
			ctx.beginPath();
			ctx.arc(s._sx, s._sy, size * 2.6, 0, 6.2832);
			ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a * .12})`;
			ctx.fill();
		}
		if (sel) {
			ctx.beginPath();
			ctx.arc(s._sx, s._sy, size + 7, 0, 6.2832);
			ctx.strokeStyle = "rgba(79,214,200,.9)";
			ctx.lineWidth = 1.2;
			ctx.stroke();
		}
		if (s.n && (sel || s.m < hygLabelLimit() && S.camZ < 3.2)) {
			ctx.font = (sel ? "11px" : "9.5px") + " ui-monospace,monospace";
			ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${sel ? 1 : .6})`;
			LBL.prio = sel ? 92 : 52;
			ctx.fillText(s.n, s._sx + size + 4, s._sy + 3);
			LBL.prio = 52;
		}
	}
}
function hygLabelLimit() {
	return S.skyMode ? 2.9 + 2.5 * Math.log2(V.fovK) : 1.7;
}
function drawHygLabels() {
	if (!S.skyMode) return;
	const lim = hygLabelLimit();
	if (camDist > 1e-4) {
		const sp = project(0, 0, 0);
		if (sp.depth > V.NEAR) {
			const m = 4.83 + 5 * Math.log10(camDist / 10), bright = Math.max(0, 6.8 - m), size = Math.min(4.5, .5 + bright * .42) * (1 + .1 * Math.log2(V.fovK));
			ctx.beginPath();
			ctx.arc(sp.x, sp.y, Math.max(.6, size), 0, 6.2832);
			ctx.fillStyle = "rgba(255,240,190,0.95)";
			ctx.fill();
			ctx.beginPath();
			ctx.arc(sp.x, sp.y, size * 2.6 + 1, 0, 6.2832);
			ctx.fillStyle = "rgba(255,230,160,0.14)";
			ctx.fill();
			ctx.font = "10px ui-monospace,monospace";
			ctx.fillStyle = "rgba(255,238,178,0.9)";
			LBL.prio = 92;
			ctx.fillText(`Sun · ${m.toFixed(1)} mag`, sp.x + size + 4, sp.y + 3);
			LBL.prio = 52;
		}
	}
	for (const s of hygProj) {
		if (!s.n) continue;
		const sel = s === S.hover || s === S.pinned;
		if (!(sel || (s._mApp ?? s.m) < lim)) continue;
		const c = s.c, size = Math.max(.35, Math.min(4.5, s._size));
		if (sel) {
			ctx.beginPath();
			ctx.arc(s._sx, s._sy, size + 7, 0, 6.2832);
			ctx.strokeStyle = "rgba(79,214,200,.9)";
			ctx.lineWidth = 1.2;
			ctx.stroke();
		}
		ctx.font = (sel ? "11px" : "9.5px") + " ui-monospace,monospace";
		ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${sel ? 1 : .7})`;
		LBL.prio = sel ? 92 : 52;
		ctx.fillText(s.n, s._sx + size + 4, s._sy + 3);
		LBL.prio = 52;
	}
}
//#endregion
//#region src/engine/healpix.js
var JRLL = [
	2,
	2,
	2,
	2,
	3,
	3,
	3,
	3,
	4,
	4,
	4,
	4
];
var JPLL = [
	1,
	3,
	5,
	7,
	0,
	2,
	4,
	6,
	1,
	3,
	5,
	7
];
function compress$1(v) {
	v &= 1431655765;
	v = (v | v >> 1) & 858993459;
	v = (v | v >> 2) & 252645135;
	v = (v | v >> 4) & 16711935;
	v = (v | v >> 8) & 65535;
	return v;
}
function nest2xyf(order, pix) {
	const nside = 1 << order, face = pix >>> 2 * order, p = pix & nside * nside - 1;
	return {
		face,
		ix: compress$1(p),
		iy: compress$1(p >>> 1),
		nside
	};
}
function xyf2dir(x, y, face) {
	const jr = JRLL[face] - x - y;
	let nr, z;
	if (jr < 1) {
		nr = jr;
		z = 1 - nr * nr / 3;
	} else if (jr > 3) {
		nr = 4 - jr;
		z = nr * nr / 3 - 1;
	} else {
		nr = 1;
		z = (2 - jr) * 2 / 3;
	}
	let t = JPLL[face] * nr + x - y;
	if (t < 0) t += 8;
	if (t >= 8) t -= 8;
	const phi = nr < 1e-15 ? 0 : t * Math.PI / 4 / nr;
	const sth = Math.sqrt(Math.max(0, 1 - z * z));
	return [
		sth * Math.cos(phi),
		sth * Math.sin(phi),
		z
	];
}
function tileDir(order, pix, u, v) {
	const { face, ix, iy, nside } = nest2xyf(order, pix);
	return xyf2dir((ix + u) / nside, (iy + v) / nside, face);
}
var tileCentre = (order, pix) => tileDir(order, pix, .5, .5);
var tileRadiusDeg = (order) => 58.6 / (1 << order) * .75;
//#endregion
//#region src/engine/survey.js
var SURVEYS = [
	{
		id: "dss",
		n: "DSS2",
		epoch: "1983–1999",
		ep: 1992,
		base: "https://alasky.cds.unistra.fr/DSS/DSSColor",
		ext: "jpg",
		maxOrder: 9
	},
	{
		id: "2mass",
		n: "2MASS",
		epoch: "1997–2001",
		ep: 1999,
		base: "https://alasky.cds.unistra.fr/2MASS/Color",
		ext: "jpg",
		maxOrder: 9
	},
	{
		id: "wise",
		n: "AllWISE",
		epoch: "2010",
		ep: 2010.5,
		base: "https://alasky.cds.unistra.fr/AllWISE/RGB-W4-W2-W1",
		ext: "jpg",
		maxOrder: 8
	},
	{
		id: "ps1",
		n: "Pan-STARRS",
		epoch: "2010–2014",
		ep: 2012,
		base: "https://alasky.cds.unistra.fr/Pan-STARRS/DR1/color-z-zg-g",
		ext: "jpg",
		maxOrder: 11
	}
];
var SKY_R_PC = 1e4;
var ST = {
	id: "dss",
	on: false,
	blink: false,
	blinkWith: "ps1"
};
var _blinkTimer = null;
var _blinkPhase = 0;
function setSurvey(id) {
	ST.id = id;
	ST.on = !!SURVEYS.find((s) => s.id === id);
	publish$2();
	V.dirty = true;
}
function setBlink(on, withId) {
	ST.blink = !!on;
	if (withId) ST.blinkWith = withId;
	if (_blinkTimer) {
		clearInterval(_blinkTimer);
		_blinkTimer = null;
	}
	if (ST.blink) _blinkTimer = setInterval(() => {
		_blinkPhase ^= 1;
		V.dirty = true;
	}, 700);
	publish$2();
	V.dirty = true;
}
function publish$2() {
	survey.set({
		id: ST.on ? ST.id : null,
		blink: ST.blink,
		blinkWith: ST.blinkWith
	});
}
publish$2();
function activeSurvey() {
	if (!ST.on) return null;
	const id = ST.blink && _blinkPhase ? ST.blinkWith : ST.id;
	return SURVEYS.find((s) => s.id === id) || null;
}
function surveyAlpha() {
	if (!ST.on) return 0;
	if (S.skyMode && camDist > 1e-4) return 0;
	const d = camDist > 1e-9 ? invScale(camDist) : 0;
	return Math.max(0, Math.min(1, (60 - d) / 30));
}
var CACHE = /* @__PURE__ */ new Map();
var _loads = 0;
var cacheSize = () => CACHE.size;
function tileKey(sv, order, pix) {
	return sv.id + "/" + order + "/" + pix;
}
function tileURL(sv, order, pix) {
	return `${sv.base}/Norder${order}/Dir${Math.floor(pix / 1e4) * 1e4}/Npix${pix}.${sv.ext}`;
}
function requestTile(sv, order, pix) {
	const k = tileKey(sv, order, pix);
	let t = CACHE.get(k);
	if (t) return t;
	if (_loads >= 12) return null;
	t = {
		img: new Image(),
		tex: null,
		ok: false,
		failed: false,
		at: performance.now()
	};
	CACHE.set(k, t);
	_loads++;
	t.img.crossOrigin = "anonymous";
	t.img.onload = () => {
		_loads--;
		t.ok = true;
		V.dirty = true;
	};
	t.img.onerror = () => {
		_loads--;
		t.failed = true;
	};
	t.img.src = tileURL(sv, order, pix);
	if (CACHE.size > 600) {
		const old = [...CACHE.entries()].filter((e) => e[1].ok || e[1].failed).sort((a, b) => a[1].at - b[1].at).slice(0, 150);
		for (const [kk, tt] of old) {
			if (tt.tex && tt.gl) tt.gl.deleteTexture(tt.tex);
			CACHE.delete(kk);
		}
	}
	return t;
}
function bestTile(sv, order, pix) {
	let o = order, p = pix, u0 = 0, v0 = 0, size = 1;
	while (o >= 3) {
		const t = CACHE.get(tileKey(sv, o, p));
		if (t && t.ok) return {
			t,
			u0,
			v0,
			size
		};
		if (!t && o === order) requestTile(sv, o, p);
		if (o === 3) break;
		const c = p & 3;
		p >>>= 2;
		o--;
		size *= .5;
		const cx = c & 1 ? 1 : 0, cy = c & 2 ? 1 : 0;
		u0 = u0 * .5 + cx * .5;
		v0 = v0 * .5 + cy * .5;
	}
	if (!CACHE.get(tileKey(sv, 3, p))) requestTile(sv, 3, p);
	return null;
}
function fovDeg() {
	return 2 * Math.atan(Math.max(W, H) / 2 / (V.foc * V.fovK)) * 57.29578;
}
function chooseOrder(sv) {
	const fov = fovDeg(), pxPerDeg = Math.max(W, H) / fov;
	let o = Math.round(Math.log2(58.6 * pxPerDeg / 512) + .3);
	return Math.max(3, Math.min(sv.maxOrder, o));
}
function visibleTiles(order) {
	const fw = camFwd, fov = fovDeg(), half = fov * Math.hypot(W, H) / Math.max(W, H) * .5, out = [];
	const pxPerDeg = Math.max(W, H) / fov, R = scale(SKY_R_PC), o_ = {};
	function visit(o, pix) {
		const c = tileCentre(o, pix), dot = c[0] * fw[0] + c[1] * fw[1] + c[2] * fw[2];
		const r = tileRadiusDeg(o);
		if (dot < Math.cos(Math.min(179, half + r + .5) * .0174533)) return;
		if (o === order) {
			projectInto(c[0] * R, c[1] * R, c[2] * R, o_);
			const m = r * pxPerDeg * 1.3 + 8;
			if (o_.depth > 0 && o_.x > -m && o_.x < W + m && o_.y > -m && o_.y < H + m) out.push(pix);
			return;
		}
		for (let k = 0; k < 4; k++) visit(o + 1, pix << 2 | k);
	}
	for (let p = 0; p < 768; p++) visit(3, p);
	return out;
}
function tileGrid(order, pix, N) {
	const dirs = [];
	for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) dirs.push(tileDir(order, pix, i / N, j / N));
	return dirs;
}
function uvOf(u, v) {
	return [v, u];
}
//#endregion
//#region src/engine/userdata.js
var USER = {
	sets: [],
	rows: [],
	warn: ""
};
var userProj = [];
var NO_DIST_PC = 1e4;
var KEY = "ku_user_v2";
var MAX_ROWS = 5e4;
var MAX_SETS = 4;
var COLS = {
	ra: [
		"ra",
		"ra_deg",
		"radeg",
		"raj2000",
		"_raj2000",
		"ra_icrs",
		"rightascension",
		"ra(deg)",
		"rajd",
		"alpha"
	],
	dec: [
		"dec",
		"de",
		"dec_deg",
		"dedeg",
		"decdeg",
		"dej2000",
		"_dej2000",
		"de_icrs",
		"dec_icrs",
		"declination",
		"dec(deg)",
		"dejd",
		"delta"
	],
	dist: [
		"dist",
		"distance",
		"d",
		"d_pc",
		"dist_pc",
		"distance_pc",
		"r_est",
		"rgeo",
		"r_med_geo",
		"pc"
	],
	ly: [
		"ly",
		"dist_ly",
		"distance_ly",
		"lightyears",
		"light_years"
	],
	plx: [
		"plx",
		"parallax",
		"parallax_mas",
		"par",
		"pi",
		"plx_value"
	],
	mag: [
		"mag",
		"vmag",
		"gmag",
		"phot_g_mean_mag",
		"v",
		"g",
		"magnitude",
		"rmag",
		"jmag",
		"kmag",
		"imag",
		"mag_v",
		"mag_g"
	],
	name: [
		"name",
		"id",
		"designation",
		"source_id",
		"main_id",
		"object",
		"star",
		"identifier",
		"label",
		"source",
		"target",
		"ident"
	],
	pmra: [
		"pmra",
		"pm_ra",
		"pmra_cosdec",
		"pm_ra_cosdec",
		"pmracosdec"
	],
	pmdec: [
		"pmdec",
		"pm_dec",
		"pmde",
		"pm_de"
	]
};
var norm = (h) => h.trim().toLowerCase().replace(/^"|"$/g, "").replace(/[\s]+/g, "").replace(/\[.*?\]$/, "");
function splitLine(line, sep) {
	const out = [];
	let cur = "", q = false;
	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (q) if (ch === "\"") if (line[i + 1] === "\"") {
			cur += "\"";
			i++;
		} else q = false;
		else cur += ch;
		else if (ch === "\"") q = true;
		else if (ch === sep) {
			out.push(cur);
			cur = "";
		} else cur += ch;
	}
	out.push(cur);
	return out.map((s) => s.trim());
}
function angle(s, hours) {
	if (s === void 0 || s === null) return NaN;
	s = String(s).trim();
	if (!s) return NaN;
	if (/^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(s)) return +s * (hours && /h$/i.test(s) ? 15 : 1);
	const t = s.replace(/[hdms°′″'":]/gi, " ").trim().split(/\s+/).map(Number);
	if (t.some(isNaN) || !t.length) return NaN;
	const neg = /^-/.test(s);
	let v = Math.abs(t[0]) + (t[1] || 0) / 60 + (t[2] || 0) / 3600;
	if (neg) v = -v;
	return hours ? v * 15 : v;
}
function parseUserText(text) {
	const lines = text.split(/\r?\n/).filter((l) => l.trim() && !/^\s*#/.test(l));
	if (!lines.length) return {
		rows: [],
		cols: [],
		warn: "empty file"
	};
	const head = lines[0];
	const sep = [
		["	", (head.match(/\t/g) || []).length],
		[";", (head.match(/;/g) || []).length],
		[",", (head.match(/,/g) || []).length],
		["|", (head.match(/\|/g) || []).length]
	].sort((a, b) => b[1] - a[1])[0][1] > 0 ? [
		["	", (head.match(/\t/g) || []).length],
		[";", (head.match(/;/g) || []).length],
		[",", (head.match(/,/g) || []).length],
		["|", (head.match(/\|/g) || []).length]
	].sort((a, b) => b[1] - a[1])[0][0] : /\s{2,}/.test(head) ? "  " : " ";
	const cells = (l) => sep === "  " ? l.trim().split(/\s{2,}|\t/) : sep === " " ? l.trim().split(/\s+/) : splitLine(l, sep);
	const first = cells(head).map(norm);
	const known = new Set(Object.values(COLS).flat());
	const hasHeader = first.some((h) => known.has(h)) || first.filter((h) => h && isNaN(+h)).length >= 2;
	const cols = hasHeader ? first : [
		"ra",
		"dec",
		"dist",
		"mag",
		"name"
	].slice(0, first.length);
	const col = (k) => {
		for (const name of COLS[k]) {
			const i = cols.indexOf(name);
			if (i >= 0) return i;
		}
		return -1;
	};
	const ira = col("ra"), idec = col("dec"), idist = col("dist"), ily = col("ly"), iplx = col("plx"), imag = col("mag"), iname = col("name"), ipra = col("pmra"), ipde = col("pmdec");
	if (ira < 0 || idec < 0) return {
		rows: [],
		cols,
		warn: "no RA/Dec columns found (looked for ra, dec, raj2000, dej2000, …)"
	};
	const known2 = /* @__PURE__ */ new Set([
		ira,
		idec,
		idist,
		ily,
		iplx,
		imag,
		iname,
		ipra,
		ipde
	]);
	const extra = cols.map((c, i) => [c, i]).filter(([c, i]) => !known2.has(i) && c).slice(0, 10);
	const rows = [];
	let bad = 0;
	for (let li = hasHeader ? 1 : 0; li < lines.length && rows.length < MAX_ROWS; li++) {
		const f = cells(lines[li]);
		const ra = angle(f[ira], /[:hms ]/.test(f[ira] || "") && !/°/.test(f[ira] || "")), dec = angle(f[idec], false);
		if (!isFinite(ra) || !isFinite(dec) || Math.abs(dec) > 90) {
			bad++;
			continue;
		}
		let d = NaN;
		if (idist >= 0) d = +f[idist];
		if (!(d > 0) && ily >= 0) d = +f[ily] / 3.261564;
		if (!(d > 0) && iplx >= 0) {
			const p = +f[iplx];
			if (p > 0) d = 1e3 / p;
		}
		const noDist = !(d > 0);
		if (noDist) d = NO_DIST_PC;
		const r = ra * Math.PI / 180, q = dec * Math.PI / 180, cq = Math.cos(q);
		const row = {
			usr: true,
			i: rows.length,
			n: iname >= 0 ? String(f[iname] || "").replace(/^"|"$/g, "").replace(/\s+/g, " ") : "",
			ra,
			dec,
			d,
			noDist,
			m: imag >= 0 && isFinite(+f[imag]) ? +f[imag] : void 0,
			pr: ipra >= 0 ? +f[ipra] || 0 : 0,
			pd: ipde >= 0 ? +f[ipde] || 0 : 0,
			dx: cq * Math.cos(r),
			dy: cq * Math.sin(r),
			dz: Math.sin(q),
			x: {}
		};
		for (const [c, i] of extra) if (f[i] !== void 0 && f[i] !== "") row.x[c] = f[i];
		rows.push(row);
	}
	let warn = "";
	if (bad) warn += `${bad} rows skipped (no usable RA/Dec)`;
	if (lines.length - 1 > MAX_ROWS) warn += (warn ? " · " : "") + `only the first ${MAX_ROWS} rows kept`;
	return {
		rows,
		cols,
		warn
	};
}
function rebuild() {
	USER.rows = [];
	let i = 0;
	for (let k = 0; k < USER.sets.length; k++) {
		const st = USER.sets[k];
		for (const r of st.rows) {
			r.i = i++;
			r.set = k;
			r.ep = st.epoch || 2e3;
			r.src = st.src;
			USER.rows.push(r);
		}
	}
	USER.warn = USER.sets.map((st) => st.warn).filter(Boolean).join(" · ");
}
function publish$1(saved) {
	userLayer.set({
		sets: USER.sets.map((st) => ({
			name: st.name,
			src: st.src,
			n: st.rows.length,
			noDist: st.rows.filter((r) => r.noDist).length,
			warn: st.warn
		})),
		n: USER.rows.length,
		warn: USER.warn,
		saved: !!saved
	});
}
function persist() {
	try {
		const s = JSON.stringify({ sets: USER.sets.map((st) => ({
			name: st.name,
			src: st.src,
			epoch: st.epoch,
			prefix: st.prefix,
			text: st.text
		})) });
		if (s.length < 4e6) {
			localStorage.setItem(KEY, s);
			return true;
		}
		localStorage.removeItem(KEY);
		USER.warn += (USER.warn ? " · " : "") + "too large to keep after a reload";
	} catch (e) {}
	return false;
}
function parseSet(st) {
	const r = parseUserText(st.text || "");
	if (st.prefix) {
		for (const row of r.rows) if (row.n && !row.n.startsWith(st.prefix)) row.n = st.prefix + row.n;
	}
	st.rows = r.rows;
	st.warn = r.warn;
	st.n = r.rows.length;
}
function importUser(text, name, opts = {}) {
	const src = opts.src || "file";
	const st = {
		name: name || "your data",
		src,
		epoch: opts.epoch || 2e3,
		prefix: opts.prefix || "",
		text: text || ""
	};
	parseSet(st);
	USER.sets = USER.sets.filter((x) => x.src !== src);
	USER.sets.push(st);
	while (USER.sets.length > MAX_SETS) USER.sets.shift();
	rebuild();
	const saved = persist();
	if (S.pinned && S.pinned.usr) S.pinned = null;
	if (S.hover && S.hover.usr) S.hover = null;
	publish$1(saved);
	V.dirty = true;
	return st.rows.length;
}
function removeSet(k) {
	USER.sets.splice(k, 1);
	rebuild();
	const saved = persist();
	if (S.pinned && S.pinned.usr) S.pinned = null;
	if (S.hover && S.hover.usr) S.hover = null;
	publish$1(saved);
	V.dirty = true;
}
function clearUser() {
	USER.sets = [];
	rebuild();
	try {
		localStorage.removeItem(KEY);
	} catch (e) {}
	if (S.pinned && S.pinned.usr) S.pinned = null;
	if (S.hover && S.hover.usr) S.hover = null;
	publish$1(false);
	V.dirty = true;
}
function restoreUser() {
	try {
		const s = localStorage.getItem(KEY);
		if (!s) return;
		const o = JSON.parse(s);
		if (!o || !Array.isArray(o.sets)) return;
		USER.sets = o.sets.filter((st) => st && st.text).map((st) => ({
			name: st.name || "your data",
			src: st.src || "file",
			epoch: st.epoch || 2e3,
			prefix: st.prefix || "",
			text: st.text
		}));
		for (const st of USER.sets) parseSet(st);
		rebuild();
		publish$1(true);
	} catch (e) {}
}
var MAS$1 = 4.84813681e-9;
function projectUser() {
	userProj.length = 0;
	if (!S.user || !USER.rows.length) return;
	for (const o of USER.rows) {
		let dx = o.dx, dy = o.dy, dz = o.dz;
		const t = tSince(o.ep || 2e3);
		if (t && (o.pr || o.pd)) {
			const cq = Math.hypot(dx, dy) || 1e-9, ex = -dy / cq, ey = dx / cq;
			const nx = -dz * dx / cq, ny = -dz * dy / cq, nz = cq;
			const a = o.pr * t * MAS$1, b = o.pd * t * MAS$1;
			dx += ex * a + nx * b;
			dy += ey * a + ny * b;
			dz += nz * b;
			const L = Math.hypot(dx, dy, dz) || 1;
			dx /= L;
			dy /= L;
			dz /= L;
		}
		const R = compress(o.d);
		const p = projectInto(dx * R, dy * R, dz * R, _pj);
		if (p.depth <= V.NEAR) continue;
		if (p.x < -40 || p.x > W + 40 || p.y < -40 || p.y > H + 40) continue;
		o._sx = p.x;
		o._sy = p.y;
		o._depth = p.depth;
		o._z2 = p.z2;
		userProj.push(o);
	}
}
function drawUser() {
	if (!userProj.length) return;
	const many = userProj.length > 400, label = S.labels && userProj.length <= 60;
	ctx.lineWidth = 1.4;
	for (const o of userProj) {
		const sel = o === S.hover || o === S.pinned;
		const r = sel ? 8 : many ? 3.5 : 5.5;
		ctx.beginPath();
		ctx.arc(o._sx, o._sy, r, 0, 6.2832);
		ctx.strokeStyle = sel ? "rgba(79,214,200,0.95)" : "rgba(255,176,96,0.85)";
		ctx.stroke();
		if (!many || sel) {
			ctx.beginPath();
			ctx.arc(o._sx, o._sy, 1.3, 0, 6.2832);
			ctx.fillStyle = sel ? "rgba(79,214,200,1)" : "rgba(255,176,96,0.9)";
			ctx.fill();
		}
		if (o.n && (sel || label)) {
			ctx.font = (sel ? "11px" : "9.5px") + " ui-monospace,monospace";
			ctx.fillStyle = sel ? "rgba(79,214,200,1)" : "rgba(255,196,130,0.8)";
			LBL.prio = sel ? 92 : 52;
			ctx.fillText(o.n, o._sx + r + 4, o._sy + 3);
			LBL.prio = 52;
		}
	}
}
//#endregion
//#region src/engine/movers.js
var MAS = 4.84813681e-9;
var MOVERS = [];
var _key = "";
function epochOf(id) {
	const s = SURVEYS.find((x) => x.id === id);
	return s ? s.ep : 2e3;
}
function shifted(o, epoch) {
	const t = epoch - (o.ep || 2e3), a = (o.pr || 0) * t * MAS, b = (o.pd || 0) * t * MAS;
	let dx = o.dx, dy = o.dy, dz = o.dz;
	const cq = Math.hypot(dx, dy) || 1e-9, ex = -dy / cq, ey = dx / cq, nx = -dz * dx / cq, ny = -dz * dy / cq, nz = cq;
	dx += ex * a + nx * b;
	dy += ey * a + ny * b;
	dz += nz * b;
	const L = Math.hypot(dx, dy, dz) || 1;
	return [
		dx / L,
		dy / L,
		dz / L
	];
}
function updateMovers() {
	if (!S.skyMode || !ST.on || camDist > 1e-4) {
		if (MOVERS.length) {
			MOVERS = [];
			movers.set({
				list: [],
				a: "",
				b: "",
				dt: 0
			});
			_key = "";
		}
		return;
	}
	const ia = ST.id, ib = ST.blinkWith === ST.id ? ST.id === "dss" ? "ps1" : "dss" : ST.blinkWith;
	const key = [
		S.yaw.toFixed(3),
		S.pitch.toFixed(3),
		V.fovK.toFixed(2),
		ia,
		ib,
		userProj.length,
		hygProj.length,
		gaiaPm ? gaiaPm.length : 0,
		gaiaRange
	].join();
	if (key === _key) return;
	_key = key;
	const ea = epochOf(ia), eb = epochOf(ib), dt = eb - ea, pxPerDeg = Math.max(W, H) / fovDeg();
	const out = [], seen = /* @__PURE__ */ new Set();
	const add = (o, name) => {
		const pm = Math.hypot(o.pr || 0, o.pd || 0);
		if (!pm) return;
		if (o.x && o.x.otype === "Pl") return;
		const jump = pm * Math.abs(dt) / 1e3, px = jump / 3600 * pxPerDeg;
		if (jump < .5) return;
		const k = o.dx.toFixed(5) + "," + o.dy.toFixed(5) + "," + o.dz.toFixed(5);
		if (seen.has(k)) return;
		seen.add(k);
		out.push({
			o,
			name: name.replace(/^NAME /, ""),
			pm,
			jump,
			px,
			usr: !!o.usr
		});
	};
	for (const o of userProj) add(o, o.n || `Row ${o.i + 1}`);
	if (S.hyg) for (const s of hygProj) add(s, s.n || (s.hip ? "HIP " + s.hip : "star"));
	const fov = fovDeg();
	if (S.gaia && gaiaRaw && gaiaPm && fov <= 30 && (gaiaRaw.length / 8 | 0) === (gaiaPm.length / 4 | 0)) {
		const dv = new DataView(gaiaRaw.buffer, gaiaRaw.byteOffset, gaiaRaw.byteLength), pv = new DataView(gaiaPm.buffer, gaiaPm.byteOffset, gaiaPm.byteLength);
		const n = gaiaRaw.length / 8 | 0, cosLim = Math.cos(Math.min(89, fov * .75) * .0174533), D2R = Math.PI / 180;
		const fx = camFwd[0], fy = camFwd[1], fz = camFwd[2], minPm = .5 * 1e3 / Math.max(1, Math.abs(dt));
		for (let i = 0; i < n; i++) {
			const pr = pv.getInt16(i * 4, true), pd = pv.getInt16(i * 4 + 2, true);
			if (pr * pr + pd * pd < minPm * minPm) continue;
			const b = i * 8, dr = (dv.getUint16(b + 2, true) * (180 / 65535) - 90) * D2R, dz = Math.sin(dr);
			if (dz * fz + Math.sqrt(1 - dz * dz) < cosLim) continue;
			const rr = dv.getUint16(b, true) * (360 / 65535) * D2R, cd = Math.cos(dr), dx = cd * Math.cos(rr), dy = cd * Math.sin(rr);
			if (dx * fx + dy * fy + dz * fz < cosLim) continue;
			const mag = dv.getUint8(b + 6) / 255 * 28 - 2;
			add({
				dx,
				dy,
				dz,
				d: dv.getUint16(b + 4, true) / 65535 * gaiaRange,
				pr,
				pd,
				ep: 2016,
				m: mag,
				gpick: "gaia"
			}, `Gaia star · G ${mag.toFixed(1)}`);
		}
	}
	out.sort((a, b) => b.jump - a.jump);
	MOVERS = out.slice(0, 60);
	const sa = SURVEYS.find((x) => x.id === ia), sb = SURVEYS.find((x) => x.id === ib);
	movers.set({
		list: MOVERS.slice(0, 14).map((m) => ({
			name: m.name,
			pm: m.pm,
			jump: m.jump,
			px: m.px,
			usr: m.usr,
			ra: Math.atan2(m.o.dy, m.o.dx) * 57.29578,
			dec: Math.asin(m.o.dz) * 57.29578
		})),
		a: sa ? sa.n : "",
		b: sb ? sb.n : "",
		ea,
		eb,
		dt
	});
}
function drawMovers() {
	if (!S.skyMode || !ST.on || !MOVERS.length) return;
	const ea = epochOf(ST.id), eb = epochOf(ST.blinkWith === ST.id ? ST.id === "dss" ? "ps1" : "dss" : ST.blinkWith);
	compress(1e4);
	ctx.lineWidth = 1.3;
	ctx.strokeStyle = "rgba(255,176,96,0.9)";
	ctx.fillStyle = "rgba(255,176,96,0.9)";
	for (const m of MOVERS) {
		if (m.px < 3) continue;
		const o = m.o, Rr = compress(o.d || 1e4);
		const A = shifted(o, ea), B = shifted(o, eb);
		const pa = projectInto(A[0] * Rr, A[1] * Rr, A[2] * Rr, _pj);
		const ax = pa.x, ay = pa.y, da = pa.depth;
		const pb = projectInto(B[0] * Rr, B[1] * Rr, B[2] * Rr, _pj);
		const bx = pb.x, by = pb.y;
		if (da <= 0 || pb.depth <= 0) continue;
		const L = Math.hypot(bx - ax, by - ay);
		if (L < 2) continue;
		const ux = (bx - ax) / L, uy = (by - ay) / L;
		ctx.beginPath();
		ctx.moveTo(ax, ay);
		ctx.lineTo(bx, by);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(bx, by);
		ctx.lineTo(bx - ux * 6 - uy * 3, by - uy * 6 + ux * 3);
		ctx.lineTo(bx - ux * 6 + uy * 3, by - uy * 6 - ux * 3);
		ctx.closePath();
		ctx.fill();
		ctx.beginPath();
		ctx.arc(ax, ay, 2.2, 0, 6.2832);
		ctx.stroke();
	}
}
//#endregion
//#region src/engine/hud.js
function fmtDist(pc) {
	if (!isFinite(pc) || pc <= 0) return "0";
	const au = pc / AU_PC;
	if (au < .02) return (au * 1496e5).toFixed(0) + " km";
	if (au < 2e3) return (au < 10 ? au.toFixed(2) : fmt(au)) + " AU";
	const ly = pc * PC2LY;
	if (ly < 1e3) return (ly < 10 ? ly.toFixed(2) : fmt(ly)) + " ly";
	if (ly < 1e6) return (ly / 1e3).toFixed(ly < 1e4 ? 2 : 1) + " kly";
	if (ly < 1e9) return (ly / 1e6).toFixed(ly < 1e7 ? 2 : 1) + " Mly";
	return (ly / 1e9).toFixed(2) + " Gly";
}
function niceLen(v) {
	const e = Math.pow(10, Math.floor(Math.log10(v))), m = v / e;
	return (m >= 5 ? 5 : m >= 2 ? 2 : 1) * e;
}
function drawScaleBar() {
	if (!S.labels || S.skyMode) return;
	const narrow = W <= 720;
	const strip = document.body.classList.contains("show-time") ? 48 : 0;
	const x0 = 16, y0 = H - (narrow ? 92 : 30) - strip;
	const dim = "rgba(154,163,184,0.85)", ink = "rgba(232,235,244,0.95)";
	LBL.prio = 100;
	ctx.textAlign = "left";
	ctx.textBaseline = "alphabetic";
	if (S.realScale) {
		const pcPerPx = S.camZ / V.foc;
		let L = niceLen(pcPerPx * (narrow ? 90 : 150));
		let px = L / pcPerPx;
		if (px < 40) {
			L = niceLen(pcPerPx * 220);
			px = L / pcPerPx;
		}
		if (!isFinite(px) || px < 8) return;
		px = Math.min(px, W * .4);
		ctx.strokeStyle = dim;
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		ctx.moveTo(x0, y0 - 9);
		ctx.lineTo(x0, y0 - 3);
		ctx.lineTo(x0 + px, y0 - 3);
		ctx.lineTo(x0 + px, y0 - 9);
		ctx.stroke();
		ctx.font = "11px ui-monospace,monospace";
		ctx.fillStyle = ink;
		ctx.fillText(fmtDist(L), x0, y0 + 9);
	} else {
		const dec = 1 * V.foc / S.camZ;
		if (!isFinite(dec) || dec < 2) return;
		let k = 1;
		while (dec * k < 64 && k < 12) k++;
		let px = dec * k;
		if (px > W * .42) {
			px = dec;
			k = 1;
		}
		if (px < 18) return;
		ctx.strokeStyle = dim;
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		ctx.moveTo(x0, y0 - 9);
		ctx.lineTo(x0, y0 - 3);
		ctx.lineTo(x0 + px, y0 - 3);
		ctx.lineTo(x0 + px, y0 - 9);
		ctx.stroke();
		if (k === 1 && dec > 26) for (let i = 1; i < 10; i++) {
			const tx = x0 + Math.log10(i + 1) * dec;
			ctx.beginPath();
			ctx.moveTo(tx, y0 - 3);
			ctx.lineTo(tx, y0 - 6.5);
			ctx.stroke();
		}
		ctx.font = "11px ui-monospace,monospace";
		ctx.fillStyle = ink;
		ctx.fillText("×" + (k === 1 ? "10" : "10^" + k) + " distance", x0, y0 + 9);
	}
	LBL.prio = 52;
}
function drawNav() {
	LBL.prio = 100;
	if (!V.navTarget) return;
	const w = navWorld(V.navTarget);
	if (!w) return;
	const c = camXY(w[0], w[1], w[2]);
	let onscreen = false, sx = 0, sy = 0;
	if (c.depth > V.NEAR) {
		sx = V.cx + V.foc * c.x1 / c.depth;
		sy = V.cy - V.foc * c.y2 / c.depth;
		onscreen = sx > 12 && sx < W - 12 && sy > 12 && sy < H - 12;
	}
	ctx.strokeStyle = "rgba(79,214,200,0.9)";
	ctx.fillStyle = "rgba(79,214,200,0.9)";
	ctx.lineWidth = 1.4;
	if (onscreen) {
		ctx.save();
		ctx.setLineDash([6, 6]);
		ctx.strokeStyle = "rgba(79,214,200,0.4)";
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		ctx.moveTo(V.cx, V.cy);
		ctx.lineTo(sx, sy);
		ctx.stroke();
		ctx.restore();
		ctx.strokeStyle = "rgba(79,214,200,0.9)";
		const r = 13;
		ctx.beginPath();
		ctx.arc(sx, sy, r, 0, 6.2832);
		ctx.globalAlpha = .5;
		ctx.stroke();
		ctx.globalAlpha = 1;
		for (const [ex, ey] of [
			[-1, -1],
			[1, -1],
			[1, 1],
			[-1, 1]
		]) {
			ctx.beginPath();
			ctx.moveTo(sx + ex * r, sy + ey * r * .4);
			ctx.lineTo(sx + ex * r, sy + ey * r);
			ctx.lineTo(sx + ex * r * .4, sy + ey * r);
			ctx.stroke();
		}
	} else {
		let dx = c.x1, dy = -c.y2;
		if (c.depth <= V.NEAR) {
			dx = -c.x1;
			dy = c.y2;
		}
		const L = Math.hypot(dx, dy) || 1;
		dx /= L;
		dy /= L;
		const rad = Math.min(W, H) * .4, ax = V.cx + dx * rad, ay = V.cy + dy * rad;
		ctx.save();
		ctx.setLineDash([6, 6]);
		ctx.strokeStyle = "rgba(79,214,200,0.35)";
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		ctx.moveTo(V.cx, V.cy);
		ctx.lineTo(ax, ay);
		ctx.stroke();
		ctx.restore();
		ctx.save();
		ctx.translate(ax, ay);
		ctx.rotate(Math.atan2(dy, dx));
		ctx.beginPath();
		ctx.moveTo(11, 0);
		ctx.lineTo(-6, 7);
		ctx.lineTo(-6, -7);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
		ctx.font = "10px ui-monospace,monospace";
		ctx.textAlign = "center";
		ctx.fillText(V.navTarget.n || V.navTarget.h || "Target", ax - dx * 18, ay - dy * 18 + 3);
		ctx.textAlign = "left";
	}
}
function fmt(n) {
	return Math.round(n).toLocaleString("en-US");
}
var _stat = "";
var _selKey = "";
var _cam = "";
var _nav = "";
function bandOf(pc) {
	if (pc < .02) return "Solar system";
	if (pc < 300) return "Stellar neighbourhood";
	if (pc < 4e4) return "Milky Way";
	if (pc < 3e6) return "Local Group";
	if (pc < 15e8) return "Cosmic web";
	return "Observable universe";
}
function updateHUD() {
	const st = visSys + "|" + visPl + "|" + nearD + "|" + farD;
	if (st !== _stat) {
		_stat = st;
		stats.set({
			sys: visSys,
			pl: visPl,
			nearLy: isFinite(nearD) ? nearD * PC2LY : null,
			farLy: farD ? farD * PC2LY : null
		});
	}
	const s = S.pinned || S.hover;
	const key = s ? [
		s === V.navTarget,
		V.FOLLOW === s,
		!!(V.ROUTE && V.ROUTE.o === s),
		!!(V.TRANSFER && V.TRANSFER.to === s),
		s === S.pinned
	].join() : "";
	if (s !== V.lastInfo || key !== _selKey) {
		V.lastInfo = s;
		_selKey = key;
		selection.set(s ? {
			card: card(s),
			...abilities(s),
			locked: V.FOLLOW === s,
			isNav: s === V.navTarget,
			routeOn: !!(V.ROUTE && V.ROUTE.o === s),
			transferOn: !!(V.TRANSFER && V.TRANSFER.to === s),
			pinned: s === S.pinned
		} : null);
	}
	updateMovers();
	const here = camDist > 1e-9 ? invScale(camDist) : 0, inSolar = V.solarA > .5;
	const fov = S.skyMode ? fovDeg() : 0;
	let ra = 0, dec = 0;
	if (S.skyMode) {
		ra = Math.atan2(camFwd[1], camFwd[0]) * 57.29578;
		if (ra < 0) ra += 360;
		dec = Math.asin(Math.max(-1, Math.min(1, camFwd[2]))) * 57.29578;
	}
	const ck = here.toPrecision(3) + "|" + S.realScale + "|" + inSolar + "|" + S.skyMode + "|" + fov.toPrecision(3) + "|" + ra.toFixed(2) + "|" + dec.toFixed(2) + "|" + (V.skyFrom || "") + "|" + (S.pm ? S.pmYears : 0);
	if (ck !== _cam) {
		_cam = ck;
		camera.set({
			distPc: here,
			distText: here > 0 ? fmtDist(here) : "at the Sun",
			band: S.skyMode ? V.skyFrom ? "Sky from " + V.skyFrom : "Sky view" : bandOf(here),
			real: S.realScale,
			inSolar,
			camZ: S.camZ,
			sky: S.skyMode,
			skyFrom: V.skyFrom || null,
			fov,
			ra,
			dec,
			order: SKYSTAT.order,
			epoch: epochNow(),
			pxScale: S.skyMode ? fov * 3600 / Math.max(W, H) : 0
		});
	}
	if (!V.navTarget) {
		if (_nav) {
			_nav = "";
			nav.set(null);
		}
		return;
	}
	const dpc = navDistPc(), w = navWorld(V.navTarget);
	let head = "–";
	if (w) {
		const tv = [
			w[0] - camPos[0],
			w[1] - camPos[1],
			w[2] - camPos[2]
		], tl = Math.hypot(tv[0], tv[1], tv[2]) || 1;
		const dot = (tv[0] * camFwd[0] + tv[1] * camFwd[1] + tv[2] * camFwd[2]) / tl;
		const ang = Math.acos(Math.max(-1, Math.min(1, dot))) * 57.2958;
		head = ang < 3 ? "on target" : fmt(ang) + "° off";
	}
	const nk = nameOf(V.navTarget) + "|" + dpc.toPrecision(4) + "|" + head;
	if (nk !== _nav) {
		_nav = nk;
		nav.set({
			name: nameOf(V.navTarget),
			dist: fmtDist(dpc),
			light: fmtLight(dpc),
			bearing: head
		});
	}
}
//#endregion
//#region src/engine/system.js
var sysProj = [];
var _transitKey = "";
var R_EARTH_AU = 42635e-9;
var R_SUN_AU = .0046505;
function publishTransits(s, jd) {
	const key = s.h + "|" + jd.toFixed(2);
	if (key === _transitKey) return;
	_transitKey = key;
	const rstar = s._sr || 1, rsAU = rstar * R_SUN_AU;
	const planets = s.p.filter((p) => p.per > 0 && p.t0 > 0 && p.r > 0 && p.a > 0).map((p) => {
		const k = p.r * R_EARTH_AU / rsAU, dur = p.per / Math.PI * Math.asin(Math.min(1, rsAU * (1 + k) / p.a));
		return {
			n: p.n,
			per: p.per,
			t0: p.t0,
			depth: k * k,
			dur,
			ing: Math.max(1e-4, dur * k / (1 + k))
		};
	});
	transit.set({
		host: s.h,
		rstar,
		now: jd,
		planets
	});
}
function clearTransits() {
	if (_transitKey) {
		_transitKey = "";
		transit.set(null);
	}
}
function planetColor(r) {
	if (!r) return [
		180,
		185,
		195
	];
	if (r < 1.6) return [
		206,
		150,
		108
	];
	if (r < 3.5) return [
		110,
		196,
		184
	];
	if (r < 8) return [
		110,
		150,
		224
	];
	return [
		226,
		180,
		132
	];
}
function drawSystem(alpha) {
	LBL.prio = 80;
	sysProj.length = 0;
	const s = V.focusSys;
	if (!s || !V.focusSysW) return;
	const sp = project(V.focusSysW[0], V.focusSysW[1], V.focusSysW[2]);
	if (sp.depth <= V.NEAR) return;
	const A = alpha;
	ctx.globalAlpha = A;
	publishTransits(s, solarJD());
	const pls = s.p.filter((p) => p.a > 0).slice().sort((x, y) => x.a - y.a);
	const aMin = pls.length ? pls[0].a : 1, aMax = pls.length ? pls[pls.length - 1].a : 1;
	const lr = Math.log10(aMax / aMin) || 1, S0 = Math.min(W, H) * .34 * A;
	const sc = s._col;
	const gr = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, 14);
	gr.addColorStop(0, `rgba(${sc[0]},${sc[1]},${sc[2]},${A * .85})`);
	gr.addColorStop(1, `rgba(${sc[0]},${sc[1]},${sc[2]},0)`);
	ctx.fillStyle = gr;
	ctx.beginPath();
	ctx.arc(sp.x, sp.y, 14, 0, 6.2832);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(sp.x, sp.y, Math.max(3, 5 * A), 0, 6.2832);
	ctx.fillStyle = `rgba(${sc[0]},${sc[1]},${sc[2]},${A})`;
	ctx.fill();
	const HZ = S.hz && s.lum ? (() => {
		const sq = Math.sqrt(s.lum), rOf = (au) => {
			const t = Math.max(0, Math.min(1.06, pls.length > 1 ? Math.log10(au / aMin) / lr : .5));
			return S0 * (.13 + t * .84);
		};
		return [rOf(.95 * sq), rOf(1.67 * sq)];
	})() : null;
	const u = [
		-s._dx,
		-s._dy,
		-s._dz
	];
	let v = [
		0,
		0,
		1
	];
	{
		const d = v[2] * u[2];
		v = [
			-d * u[0],
			-d * u[1],
			1 - d * u[2]
		];
		const l = Math.hypot(v[0], v[1], v[2]) || 1;
		v = [
			v[0] / l,
			v[1] / l,
			v[2] / l
		];
	}
	const w = [
		u[1] * v[2] - u[2] * v[1],
		u[2] * v[0] - u[0] * v[2],
		u[0] * v[1] - u[1] * v[0]
	];
	const ringPt = (r, a, b, th) => {
		const c = Math.cos(th), sn = Math.sin(th);
		camDir2i(a[0] * c + b[0] * sn, a[1] * c + b[1] * sn, a[2] * c + b[2] * sn);
		return [sp.x + _d2x * r, sp.y + _d2y * r];
	};
	const ring = (r, a, b) => {
		ctx.beginPath();
		for (let k = 0; k <= 48; k++) {
			const q = ringPt(r, a, b, k / 48 * 6.2832);
			if (k) ctx.lineTo(q[0], q[1]);
			else ctx.moveTo(q[0], q[1]);
		}
	};
	if (HZ) {
		const [ri, ro] = HZ;
		const edgeOn = pls.some((p) => p.per > 0 && p.t0 > 0), ha = edgeOn ? u : v, hb = edgeOn ? v : w;
		ring(ro, ha, hb);
		ring(ri, ha, hb);
		ctx.fillStyle = `rgba(90,220,130,${A * .11})`;
		ctx.fill("evenodd");
		ctx.strokeStyle = `rgba(110,230,150,${A * .32})`;
		ctx.lineWidth = 1;
		ring(ri, ha, hb);
		ctx.stroke();
		ring(ro, ha, hb);
		ctx.stroke();
		ctx.font = "8.5px ui-monospace,monospace";
		ctx.fillStyle = `rgba(120,230,150,${A * .72})`;
		const lp = ringPt(ro, ha, hb, -.9);
		ctx.fillText("habitable zone", lp[0] + 4, lp[1] - 3);
	}
	pls.forEach((p, i) => {
		const t = pls.length > 1 ? Math.log10(p.a / aMin) / lr : .5;
		const orb = S0 * (.13 + t * .84);
		const transit = p.per > 0 && p.t0 > 0;
		const pa = transit ? u : v, pb = transit ? v : w;
		ring(orb, pa, pb);
		ctx.strokeStyle = `rgba(150,170,210,${A * .22})`;
		ctx.lineWidth = 1;
		ctx.stroke();
		let ang;
		if (transit) {
			const ph = (solarJD() - p.t0) / p.per % 1;
			ang = (ph < 0 ? ph + 1 : ph) * 6.2832;
		} else ang = i * 2.399 + .6;
		const [mx, my] = ringPt(orb, pa, pb, ang);
		const pc = planetColor(p.r), ppx = Math.max(2.2, Math.min(17, (p.r ? Math.pow(p.r, .4) * 2.6 : 4) * A));
		const psel = p === S.hover || p === S.pinned;
		ctx.beginPath();
		ctx.arc(mx, my, ppx, 0, 6.2832);
		ctx.fillStyle = `rgba(${pc[0]},${pc[1]},${pc[2]},${A})`;
		ctx.fill();
		if (psel) {
			ctx.beginPath();
			ctx.arc(mx, my, ppx + 6, 0, 6.2832);
			ctx.strokeStyle = "rgba(79,214,200,.9)";
			ctx.lineWidth = 1.2;
			ctx.stroke();
		}
		p._host = s.h;
		sysProj.push({
			o: p,
			x: mx,
			y: my,
			px: Math.max(7, ppx)
		});
		if (A > .55) {
			ctx.font = (psel ? "11px" : "9.5px") + " ui-monospace,monospace";
			ctx.fillStyle = `rgba(${pc[0]},${pc[1]},${pc[2]},${psel ? 1 : .82})`;
			ctx.fillText(p.n.replace(s.h, "").trim() || p.n, mx + ppx + 3, my + 3);
		}
	});
	ctx.font = "12px ui-monospace,monospace";
	ctx.fillStyle = `rgba(233,237,250,${A * .92})`;
	ctx.fillText("System " + s.h, sp.x + 16, sp.y - 6);
	ctx.font = "9px ui-monospace,monospace";
	ctx.fillStyle = `rgba(139,150,180,${A * .9})`;
	ctx.fillText(pls.length + " planet" + (pls.length !== 1 ? "s" : "") + " · " + fmt(s.d * PC2LY) + " ly", sp.x + 16, sp.y + 7);
	ctx.globalAlpha = 1;
}
//#endregion
//#region src/engine/lagrange.js
var MASS_RATIO = {
	Mercury: 166e-9,
	Venus: 2447e-9,
	Earth: 3003e-9,
	Mars: 3.227e-7,
	Jupiter: 9545e-7,
	Saturn: 2858e-7,
	Uranus: 4366e-8,
	Neptune: 5151e-8
};
var LAG_NOTE = {
	"L1 · Sun–Earth": "sunward · SOHO & DSCOVR station here",
	"L2 · Sun–Earth": "anti-sunward · JWST & Gaia orbit here",
	"L3 · Sun–Earth": "forever hidden behind the Sun",
	"L4 · Sun–Earth": "stable · leads Earth by 60°",
	"L5 · Sun–Earth": "stable · trails Earth by 60°",
	"L4 · Sun–Jupiter": "the \"Greek camp\" — thousands of trojans gather here",
	"L5 · Sun–Jupiter": "the \"Trojan camp\" — thousands of trojans gather here"
};
var LAG_PTS = [];
for (const [pl, pts] of [["Earth", [
	"L1",
	"L2",
	"L3",
	"L4",
	"L5"
]], ["Jupiter", ["L4", "L5"]]]) for (const L of pts) LAG_PTS.push({
	n: L + " · Sun–" + pl,
	lp: true,
	pl,
	L,
	kind: "Lagrange point",
	note: LAG_NOTE[L + " · Sun–" + pl]
});
function drawLagrange(A) {
	LBL.prio = 40;
	const byName = {};
	for (const b of SOLAR_BODIES) byName[b.n] = b;
	for (const b of SOLAR_BODIES) {
		const m = MASS_RATIO[b.n];
		if (!m || !b._e) continue;
		const rH = b._r * Math.cbrt(m / 3);
		const pc = project.apply(null, eclToWorld(b._e[0], b._e[1], b._e[2]));
		if (pc.depth <= V.NEAR) continue;
		const edge = project.apply(null, eclToWorld(b._e[0] + rH, b._e[1], b._e[2]));
		const rp = Math.hypot(edge.x - pc.x, edge.y - pc.y);
		if (rp < 6 || rp > Math.min(W, H) * 6) continue;
		pathBegin();
		for (let k = 0; k <= 48; k++) {
			const th = k / 48 * 6.2832;
			const w = eclToWorld(b._e[0] + Math.cos(th) * rH, b._e[1] + Math.sin(th) * rH, b._e[2]);
			pathPt(project(w[0], w[1], w[2]));
		}
		pathStroke(`rgba(150,205,255,${A * .4})`, 1, [3, 5]);
		if (rp > 30) {
			ctx.font = "9px ui-monospace,monospace";
			ctx.fillStyle = `rgba(150,205,255,${A * .7})`;
			const km = rH * 149.6;
			ctx.fillText("Hill sphere · " + (km < 1 ? Math.round(km * 1e3).toLocaleString("en-US") + ",000 km" : km.toFixed(1) + " M km"), pc.x + rp * .72, pc.y - rp * .72);
		}
	}
	const c60 = .5, s60 = .8660254;
	for (const q of LAG_PTS) {
		const b = byName[q.pl];
		if (!b || !b._e) {
			q._e = null;
			continue;
		}
		const m = MASS_RATIO[q.pl], f = Math.cbrt(m / 3), e = b._e;
		q._e = q.L === "L1" ? [
			e[0] * (1 - f),
			e[1] * (1 - f),
			e[2] * (1 - f)
		] : q.L === "L2" ? [
			e[0] * (1 + f),
			e[1] * (1 + f),
			e[2] * (1 + f)
		] : q.L === "L3" ? [
			-e[0] * (1 + 7 * m / 12),
			-e[1] * (1 + 7 * m / 12),
			-e[2] * (1 + 7 * m / 12)
		] : q.L === "L4" ? [
			e[0] * c60 - e[1] * s60,
			e[0] * s60 + e[1] * c60,
			e[2]
		] : [
			e[0] * c60 + e[1] * s60,
			-e[0] * s60 + e[1] * c60,
			e[2]
		];
		const w = eclToWorld(q._e[0], q._e[1], q._e[2]), p = project(w[0], w[1], w[2]);
		if (p.depth <= V.NEAR) continue;
		if (q.L === "L1" || q.L === "L2") {
			const pp = project.apply(null, eclToWorld(e[0], e[1], e[2]));
			if (pp.depth > V.NEAR && Math.hypot(p.x - pp.x, p.y - pp.y) < 13) continue;
		}
		const sel = q === S.hover || q === S.pinned, r = sel ? 4.5 : 3;
		ctx.beginPath();
		ctx.moveTo(p.x, p.y - r);
		ctx.lineTo(p.x + r, p.y);
		ctx.lineTo(p.x, p.y + r);
		ctx.lineTo(p.x - r, p.y);
		ctx.closePath();
		ctx.strokeStyle = `rgba(196,170,255,${A * .9})`;
		ctx.lineWidth = 1.1;
		ctx.stroke();
		if (sel) {
			ctx.beginPath();
			ctx.arc(p.x, p.y, r + 5, 0, 6.2832);
			ctx.strokeStyle = "rgba(79,214,200,.9)";
			ctx.lineWidth = 1.1;
			ctx.stroke();
		}
		solarProj.push({
			o: q,
			x: p.x,
			y: p.y,
			px: 7
		});
		ctx.font = "9px ui-monospace,monospace";
		ctx.fillStyle = `rgba(196,170,255,${A * (sel ? 1 : .78)})`;
		if (q === S.pinned || q === S.hover || !nearSun(p.x, p.y)) ctx.fillText(q.L + (q.pl === "Jupiter" ? " · Jupiter" : ""), p.x + r + 3, p.y + 3);
	}
}
//#endregion
//#region src/engine/solar-live.js
function cmeSolarMs() {
	return (solarJD() - 2440587.5) * 864e5;
}
function drawCME(A) {
	LBL.prio = 40;
	if (!LIVE.cmes.length) return;
	const earth = PLANETS.find((p) => p.n === "Earth");
	if (!earth || !earth._e) return;
	const nowMs = cmeSolarMs(), lamE = Math.atan2(earth._e[1], earth._e[0]);
	const cE = Math.cos(lamE), sE = Math.sin(lamE);
	for (const c of LIVE.cmes) {
		const dt = (nowMs - c.t) / 1e3;
		if (dt <= 0) continue;
		const rAU = .1 + c.v * dt / 1496e5;
		if (rAU > 2.6) continue;
		const fade = Math.max(0, Math.min(1, (2.6 - rAU) / .7));
		const la = c.lat * D2R, lo = c.lon * D2R, cb = Math.cos(la);
		const hx = cb * Math.cos(lo), hy = cb * Math.sin(lo), hz = Math.sin(la);
		const d = [
			hx * cE - hy * sE,
			hx * sE + hy * cE,
			hz
		];
		let u = [
			-d[1],
			d[0],
			0
		];
		const ul = Math.hypot(u[0], u[1], u[2]) || 1;
		u = [
			u[0] / ul,
			u[1] / ul,
			u[2] / ul
		];
		const v = [
			d[1] * u[2] - d[2] * u[1],
			d[2] * u[0] - d[0] * u[2],
			d[0] * u[1] - d[1] * u[0]
		];
		const col = c.v >= 800 ? [
			255,
			96,
			80
		] : c.v >= 500 ? [
			255,
			150,
			80
		] : [
			255,
			200,
			110
		];
		const H = Math.min(1.2, c.half * D2R), cH = Math.cos(H), sH = Math.sin(H);
		if (rAU < .11) continue;
		const sunp = project(0, 0, 0);
		const fw = eclToWorld(rAU * d[0], rAU * d[1], rAU * d[2]), fp = project(fw[0], fw[1], fw[2]);
		const rim = [];
		let rimVis = 0;
		for (let k = 0; k <= 48; k++) {
			const th = k / 48 * 6.2832, ct = Math.cos(th), st = Math.sin(th);
			const w = eclToWorld(rAU * (cH * d[0] + sH * (ct * u[0] + st * v[0])), rAU * (cH * d[1] + sH * (ct * u[1] + st * v[1])), rAU * (cH * d[2] + sH * (ct * u[2] + st * v[2]))), p = project(w[0], w[1], w[2]);
			if (p.depth <= V.NEAR || offscr(p)) {
				rim.push(null);
				continue;
			}
			rim.push(p);
			rimVis++;
		}
		if (sunp.depth > V.NEAR && !offscr(sunp) && fp.depth > V.NEAR && !offscr(fp) && rimVis === 49) {
			const g = ctx.createLinearGradient(sunp.x, sunp.y, fp.x, fp.y);
			g.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},0)`);
			g.addColorStop(.6, `rgba(${col[0]},${col[1]},${col[2]},${A * fade * .09})`);
			g.addColorStop(.93, `rgba(${col[0]},${col[1]},${col[2]},${A * fade * .26})`);
			g.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);
			ctx.beginPath();
			ctx.moveTo(sunp.x, sunp.y);
			for (const p of rim) ctx.lineTo(p.x, p.y);
			ctx.closePath();
			ctx.fillStyle = g;
			ctx.fill();
		}
		if (sunp.depth > V.NEAR) {
			ctx.lineWidth = 1.1;
			ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${A * fade * .38})`;
			ctx.beginPath();
			for (let i = 0; i < 12; i++) {
				const th = i / 12 * 6.2832 + .35, ct = Math.cos(th), st = Math.sin(th);
				const mH = H * (.25 + i * 17 % 13 / 13 * .72), cM = Math.cos(mH), sM = Math.sin(mH);
				const dx = cM * d[0] + sM * (ct * u[0] + st * v[0]), dy = cM * d[1] + sM * (ct * u[1] + st * v[1]), dz = cM * d[2] + sM * (ct * u[2] + st * v[2]);
				const r2 = rAU * (.72 + i * 37 % 23 / 23 * .2), r1 = r2 * .42;
				const w1 = eclToWorld(r1 * dx, r1 * dy, r1 * dz), p1 = project(w1[0], w1[1], w1[2]);
				const w2 = eclToWorld(r2 * dx, r2 * dy, r2 * dz), p2 = project(w2[0], w2[1], w2[2]);
				if (p1.depth > V.NEAR && p2.depth > V.NEAR && !offscr(p1) && !offscr(p2)) {
					ctx.moveTo(p1.x, p1.y);
					ctx.lineTo(p2.x, p2.y);
				}
			}
			ctx.stroke();
		}
		ctx.beginPath();
		let first = true;
		for (const p of rim) {
			if (!p) {
				first = true;
				continue;
			}
			if (first) {
				ctx.moveTo(p.x, p.y);
				first = false;
			} else ctx.lineTo(p.x, p.y);
		}
		ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${A * fade * .14})`;
		ctx.lineWidth = 5.5;
		ctx.stroke();
		ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${A * fade * .75})`;
		ctx.lineWidth = 1.7;
		ctx.stroke();
		const tw = eclToWorld(rAU * d[0], rAU * d[1], rAU * d[2]), tp = project(tw[0], tw[1], tw[2]);
		if (tp.depth > V.NEAR) {
			if (!c._o) c._o = {
				cme: c,
				n: "Coronal mass ejection",
				c: col
			};
			const sel = c._o === S.hover || c._o === S.pinned;
			ctx.font = (sel ? "10px" : "9px") + " ui-monospace,monospace";
			ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${A * fade * (sel ? 1 : .85)})`;
			ctx.fillText(`CME · ${Math.round(c.v)} km/s${c.earthDir ? " · → Earth" : ""}`, tp.x + 6, tp.y - 4);
			if (sel) {
				ctx.beginPath();
				ctx.arc(tp.x, tp.y, 9, 0, 6.2832);
				ctx.strokeStyle = "rgba(79,214,200,.9)";
				ctx.lineWidth = 1.1;
				ctx.stroke();
			}
			solarProj.push({
				o: c._o,
				x: tp.x,
				y: tp.y,
				px: 12
			});
		}
	}
}
function drawLiveNeo(A) {
	LBL.prio = 40;
	if (!LIVE.neos.length) return;
	const jd = solarJD(), nowMs = cmeSolarMs();
	const earth = PLANETS.find((p) => p.n === "Earth");
	let ep = null;
	if (earth && earth._e) {
		const w = eclToWorld(earth._e[0], earth._e[1], earth._e[2]);
		const p = project(w[0], w[1], w[2]);
		if (p.depth > V.NEAR) ep = p;
	}
	for (const o of LIVE.neos) {
		if (!o.kd) continue;
		o._el = keplerSB(o.kd, jd);
		o._e = orbPoint(o._el, o._el.E);
		o._r = Math.hypot(o._e[0], o._e[1], o._e[2]);
		const sel = o === S.hover || o === S.pinned;
		drawOrbitEllipse(o._el, `rgba(255,168,88,${A * (sel ? .55 : .2)})`);
		const w = eclToWorld(o._e[0], o._e[1], o._e[2]), p = project(w[0], w[1], w[2]);
		if (p.depth <= V.NEAR) continue;
		const dtd = (o.t - nowMs) / 864e5;
		if (ep && Math.abs(dtd) < 5) {
			pathBegin();
			pathPt(ep);
			pathPt(p);
			pathStroke(`rgba(255,168,88,${A * .3})`, .8, [3, 4]);
		}
		const px = sel ? 6 : 4.5;
		ctx.beginPath();
		ctx.moveTo(p.x, p.y - px);
		ctx.lineTo(p.x + px, p.y);
		ctx.lineTo(p.x, p.y + px);
		ctx.lineTo(p.x - px, p.y);
		ctx.closePath();
		ctx.strokeStyle = `rgba(255,178,96,${A * (sel ? 1 : .9)})`;
		ctx.lineWidth = 1.3;
		ctx.stroke();
		if (o.pha || o.sentry) {
			ctx.beginPath();
			ctx.arc(p.x, p.y, px + 3.5, 0, 6.2832);
			ctx.strokeStyle = `rgba(255,110,90,${A * .7})`;
			ctx.lineWidth = .9;
			ctx.stroke();
		}
		if (sel) {
			ctx.beginPath();
			ctx.arc(p.x, p.y, px + 7, 0, 6.2832);
			ctx.strokeStyle = "rgba(79,214,200,.9)";
			ctx.lineWidth = 1.2;
			ctx.stroke();
		}
		const rel = Math.abs(dtd) < .04 ? "now" : dtd > 0 ? `in ${dtd >= 1 ? Math.floor(dtd) + "d " : ""}${Math.round(dtd % 1 * 24)}h` : `${Math.abs(dtd).toFixed(1)}d ago`;
		const ldStr = o.ld < 10 ? o.ld.toFixed(1) : Math.round(o.ld);
		ctx.font = (sel ? "10px" : "9px") + " ui-monospace,monospace";
		ctx.fillStyle = `rgba(255,190,120,${A * (sel ? 1 : .8)})`;
		ctx.fillText(`${o.n} · ${rel} · ${ldStr} LD`, p.x + px + 4, p.y + 3);
		solarProj.push({
			o,
			x: p.x,
			y: p.y,
			px: Math.max(8, px + 3)
		});
	}
}
function dirScreen(u) {
	const cyw = Math.cos(S.yaw), syw = Math.sin(S.yaw), cp2 = Math.cos(S.pitch), sp2 = Math.sin(S.pitch);
	const x1 = u[0] * cyw + u[2] * syw, z1 = -u[0] * syw + u[2] * cyw;
	return [
		x1,
		-(u[1] * cp2 - z1 * sp2),
		u[1] * sp2 + z1 * cp2
	];
}
function stonyhurstEcl(latDeg, lonDeg, lamE) {
	const la = latDeg * D2R, lo = lonDeg * D2R, cb = Math.cos(la);
	const hx = cb * Math.cos(lo), hy = cb * Math.sin(lo), hz = Math.sin(la);
	const cE = Math.cos(lamE), sE = Math.sin(lamE);
	return [
		hx * cE - hy * sE,
		hx * sE + hy * cE,
		hz
	];
}
function drawSunspots(A, sp, spx) {
	LBL.prio = 40;
	if (!LIVE.regions.length || spx < 10) return;
	const earth = PLANETS.find((p) => p.n === "Earth");
	if (!earth || !earth._e) return;
	const lamE = Math.atan2(earth._e[1], earth._e[0]);
	for (const r of LIVE.regions) {
		const e = stonyhurstEcl(r.lat, r.lon, lamE);
		const d = dirScreen(eclDir(e[0], e[1], e[2]));
		if (d[2] <= .05) continue;
		const x = sp.x + d[0] * spx * .94, y = sp.y + d[1] * spx * .94;
		const rr = Math.max(1.2, Math.sqrt(r.area || 20) * spx / 280);
		const hot = r.xp >= 5 || r.mp >= 40 || r.xx > 0;
		ctx.beginPath();
		ctx.arc(x, y, rr, 0, 6.2832);
		ctx.fillStyle = `rgba(96,48,22,${A * .92})`;
		ctx.fill();
		if (hot) {
			ctx.beginPath();
			ctx.arc(x, y, rr + 1.6, 0, 6.2832);
			ctx.strokeStyle = `rgba(255,90,60,${A * .85})`;
			ctx.lineWidth = 1;
			ctx.stroke();
		}
		if (!r._o) r._o = {
			spot: r,
			n: "AR " + r.no
		};
		const sel = r._o === S.hover || r._o === S.pinned;
		if (sel) {
			ctx.beginPath();
			ctx.arc(x, y, rr + 5, 0, 6.2832);
			ctx.strokeStyle = "rgba(79,214,200,.9)";
			ctx.lineWidth = 1.1;
			ctx.stroke();
		}
		if (spx > 34 || sel) {
			ctx.font = "8.5px ui-monospace,monospace";
			ctx.fillStyle = `rgba(70,35,15,${A * .95})`;
			ctx.fillText("AR" + r.no, x + rr + 2, y + 3);
		}
		solarProj.push({
			o: r._o,
			x,
			y,
			px: Math.max(7, rr + 3)
		});
	}
}
var SATCUR = 0;
function drawSats(A) {
	LBL.prio = 40;
	if (!LIVE.sats.length) return;
	const earth = PLANETS.find((p) => p.n === "Earth");
	if (!earth || !earth._e || !earth._p) return;
	const ep = earth._p, px = bodyPx(earth.rk, ep.depth);
	if (px < 10) return;
	const jd = solarJD();
	let drawn = 0, nSl = 0, nDeb = 0;
	const LOG_LO = Math.log10(6600), LOG_HI = Math.log10(5e4);
	const N = LIVE.sats.length, BUD = Math.min(N, 1500);
	const cNamed = `rgba(150,235,255,${A})`, cDef = `rgba(140,215,250,${A * .7})`, cSl = `rgba(168,196,232,${A * .5})`, cOw = `rgba(196,176,232,${A * .55})`, cDeb = `rgba(160,158,168,${A * .38})`;
	for (let k = 0; k < N; k++) {
		const s = LIVE.sats[k];
		let e;
		if ((k - SATCUR + N) % N < BUD) {
			e = satEcl(s, jd);
			s._e3 = e || null;
		} else e = s._e3;
		if (!e) continue;
		const l = Math.hypot(e[0], e[1], e[2]);
		if (!isFinite(l) || l < 6400) continue;
		let x, y;
		if (S.realScale) {
			const K = 1496e5;
			const w = eclToWorld(earth._e[0] + e[0] / K, earth._e[1] + e[1] / K, earth._e[2] + e[2] / K);
			const p = project(w[0], w[1], w[2]);
			if (p.depth <= V.NEAR) continue;
			x = p.x;
			y = p.y;
		} else {
			const d2 = camDir2([
				e[0] / l,
				e[2] / l,
				e[1] / l
			]);
			const t = Math.min(1.25, Math.max(0, (Math.log10(l) - LOG_LO) / (LOG_HI - LOG_LO)));
			const sep = px + 5 + t * (px * 2 + 36);
			x = ep.x + d2[0] * sep;
			y = ep.y + d2[1] * sep;
		}
		const named = s.iss || s.hst || s.css, sel = s === S.hover || s === S.pinned;
		s.alt = l - 6371;
		s.sat = true;
		s.kind = "Satellite";
		if (s.sl) nSl++;
		if (s.deb) nDeb++;
		if (named) {
			ctx.beginPath();
			ctx.arc(x, y, 2.4, 0, 6.2832);
			ctx.fillStyle = cNamed;
			ctx.fill();
		} else {
			ctx.fillStyle = s.deb ? cDeb : s.sl ? cSl : s.ow ? cOw : cDef;
			ctx.fillRect(x - .9, y - .9, 1.8, 1.8);
		}
		if (sel) {
			ctx.beginPath();
			ctx.arc(x, y, 7, 0, 6.2832);
			ctx.strokeStyle = "rgba(79,214,200,.9)";
			ctx.lineWidth = 1.1;
			ctx.stroke();
		}
		if (named || sel) {
			ctx.font = "8.5px ui-monospace,monospace";
			ctx.fillStyle = `rgba(160,230,255,${A * .9})`;
			ctx.fillText(s.iss ? "ISS" : s.css ? "CSS" : s.hst ? "Hubble" : s.n, x + 4, y - 3);
		}
		solarProj.push({
			o: s,
			x,
			y,
			px: named ? 7 : 4
		});
		drawn++;
	}
	SATCUR = N ? (SATCUR + BUD) % N : 0;
	if (drawn) {
		if (px > 13) {
			ctx.font = "8.5px ui-monospace,monospace";
			ctx.fillStyle = `rgba(140,215,250,${A * .55})`;
			ctx.fillText(drawn.toLocaleString("en-US") + " satellites · live" + (nSl ? " · " + nSl.toLocaleString("en-US") + " Starlink" : "") + (nDeb ? " · " + nDeb.toLocaleString("en-US") + " debris" : ""), ep.x + px + 4, ep.y + 16);
		}
		V.dirty = true;
	}
}
function drawFireballs(A) {
	LBL.prio = 40;
	const fb = LIVE.extra && LIVE.extra.fireballs;
	if (!fb || !fb.length) return;
	const earth = PLANETS.find((p) => p.n === "Earth");
	if (!earth || !earth._p) return;
	const ep = earth._p, px = bodyPx(earth.rk, ep.depth);
	if (px < 12) return;
	const nowMs = cmeSolarMs();
	for (const f of fb) {
		if (f.lat == null || f.lon == null) continue;
		const age = (nowMs - f.t) / 864e5;
		if (age < 0 || age > 30) continue;
		const e = groundEcl(f.lat, f.lon, f.t);
		const d = dirScreen(eclDir(e[0], e[1], e[2]));
		if (d[2] <= .05) continue;
		const x = ep.x + d[0] * px * .97, y = ep.y + d[1] * px * .97;
		const rr = Math.max(1.6, 2.2 + Math.log10(f.kt || .1));
		ctx.beginPath();
		ctx.arc(x, y, rr, 0, 6.2832);
		ctx.fillStyle = `rgba(255,150,60,${A * (age < 7 ? .95 : .55)})`;
		ctx.fill();
		ctx.beginPath();
		ctx.arc(x, y, rr + 1.8, 0, 6.2832);
		ctx.strokeStyle = `rgba(255,110,50,${A * .4})`;
		ctx.lineWidth = .8;
		ctx.stroke();
		if (!f._o) f._o = {
			fb: f,
			n: "Fireball"
		};
		if (f._o === S.hover || f._o === S.pinned) {
			ctx.beginPath();
			ctx.arc(x, y, rr + 5, 0, 6.2832);
			ctx.strokeStyle = "rgba(79,214,200,.9)";
			ctx.lineWidth = 1.1;
			ctx.stroke();
		}
		solarProj.push({
			o: f._o,
			x,
			y,
			px: Math.max(6, rr + 3)
		});
	}
}
api.liveNeoFocus = (id) => {
	const o = LIVE.neos.find((n) => n.id === id);
	if (!o) return;
	if (o.kd) {
		o._el = keplerSB(o.kd, solarJD());
		o._e = orbPoint(o._el, o._el.E);
		const w = eclToWorld(o._e[0], o._e[1], o._e[2]);
		S.pinned = o;
		aim(w[0], w[1], w[2], scale(2.2 * AU_PC));
	} else {
		S.pinned = null;
		enterSolar();
	}
	V.dirty = true;
};
//#endregion
//#region src/engine/solar.js
var solarProj = [];
function orbitR(a) {
	return scale(a * AU_PC);
}
var SYM_PX = 3;
var SYM_K = .35;
var SYM_MIN = 1.3;
function symPx(rk, de) {
	return Math.max(SYM_MIN, SYM_PX * Math.pow(rk / 6371, SYM_K) * (3.2 / de) * (V.foc / 560));
}
function bodyPx(rk, depth) {
	const de = S.realScale ? depth / S.camZ * 3.2 : depth;
	const sym = Math.min(Math.min(W, H) * 4, symPx(rk, de));
	if (!S.realScale) return sym;
	const truePx = V.foc * (rk * 32408e-18) / depth;
	return Math.min(Math.max(sym, truePx), Math.min(W, H) * .75);
}
function saturnRings(x, y, px, A, near) {
	const R = px * 2.35 + Math.max(1, px * .11);
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(-.42);
	ctx.beginPath();
	ctx.rect(-R, near ? 0 : -R, 2 * R, R);
	ctx.clip();
	for (const rr of [
		2.35,
		1.98,
		1.55
	]) {
		ctx.beginPath();
		ctx.ellipse(0, 0, px * rr, px * rr * .34, 0, 0, 6.2832);
		ctx.strokeStyle = `rgba(226,208,160,${A * (rr > 2 ? .7 : .4)})`;
		ctx.lineWidth = Math.max(1, px * .11);
		ctx.stroke();
	}
	ctx.restore();
}
var _ballSun = null;
var _sunPx = 0;
function nearSun(x, y) {
	return !!_ballSun && Math.hypot(x - _ballSun.x, y - _ballSun.y) < _sunPx + 10;
}
function ballFill(x, y, r, c, A) {
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 6.2832);
	if (r < 5) {
		ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${A})`;
		ctx.fill();
		return;
	}
	let lx = -.5, ly = -.5;
	if (_ballSun) {
		const dx = _ballSun.x - x, dy = _ballSun.y - y, l = Math.hypot(dx, dy);
		if (l > 1) {
			lx = dx / l;
			ly = dy / l;
		} else {
			lx = 0;
			ly = 0;
		}
	}
	const hi = c.map((v) => Math.min(255, Math.round(v * .62 + 255 * .38)));
	const lo = c.map((v) => Math.round(v * .16));
	const g = ctx.createRadialGradient(x + lx * r * .48, y + ly * r * .48, r * .08, x + lx * r * .14, y + ly * r * .14, r * 1.12);
	g.addColorStop(0, `rgba(${hi[0]},${hi[1]},${hi[2]},${A})`);
	g.addColorStop(.45, `rgba(${c[0]},${c[1]},${c[2]},${A})`);
	g.addColorStop(.8, `rgba(${Math.round(c[0] * .55)},${Math.round(c[1] * .55)},${Math.round(c[2] * .55)},${A})`);
	g.addColorStop(1, `rgba(${lo[0]},${lo[1]},${lo[2]},${A})`);
	ctx.fillStyle = g;
	ctx.fill();
}
function orbitRing(r, style, dash) {
	pathBegin();
	for (let k = 0; k <= 96; k++) {
		const th = k / 96 * 6.2832;
		pathPt(project(Math.cos(th) * r, 0, Math.sin(th) * r));
	}
	pathStroke(style, 1, dash);
}
function drawOrbitEllipse(el, style) {
	pathBegin();
	for (let j = 0; j <= 120; j++) {
		const q = orbPoint(el, j / 120 * 6.2832), w = eclToWorld(q[0], q[1], q[2]);
		pathPt(project(w[0], w[1], w[2]));
	}
	pathStroke(style, 1);
}
var _suvi = {
	im: null,
	ok: false,
	t: 0,
	loading: false
};
function suviImage() {
	if (!_suvi.loading && Date.now() - _suvi.t > 10 * 6e4) {
		_suvi.loading = true;
		const im = new Image();
		im.crossOrigin = "anonymous";
		im.onload = () => {
			_suvi.im = im;
			_suvi.ok = true;
			_suvi.t = Date.now();
			_suvi.loading = false;
			V.dirty = true;
		};
		im.onerror = () => {
			_suvi.t = Date.now();
			_suvi.loading = false;
		};
		im.src = "https://services.swpc.noaa.gov/images/animations/suvi/primary/304/latest.png";
	}
	return _suvi.ok ? _suvi.im : null;
}
function drawSolar(alpha) {
	LBL.prio = 80;
	ctx.globalAlpha = alpha;
	solarProj.length = 0;
	const A = alpha;
	updateSolarPositions(solarJD());
	orbitRing(orbitR(2.7), `rgba(150,140,120,${A * .16})`, [2, 4]);
	orbitRing(orbitR(43), `rgba(120,150,190,${A * .13})`, [2, 5]);
	if (S.hz) {
		orbitRing(orbitR(.95), `rgba(110,230,150,${A * .3})`);
		orbitRing(orbitR(1.67), `rgba(110,230,150,${A * .3})`);
		const hp = project(orbitR(1.28), 0, 0), h0 = project(0, 0, 0);
		if (hp.depth > V.NEAR && Math.hypot(hp.x - h0.x, hp.y - h0.y) > 34) {
			ctx.font = "9px ui-monospace,monospace";
			ctx.fillStyle = `rgba(120,230,150,${A * .72})`;
			ctx.fillText("habitable zone", hp.x + 4, hp.y - 3);
		}
	}
	for (const b of SOLAR_BODIES) {
		if (outerHidden(b)) continue;
		const faint = b.kind !== "Planet";
		if (b._el) drawOrbitEllipse(b._el, faint ? `rgba(150,160,195,${A * .18})` : `rgba(150,170,210,${A * .3})`);
	}
	const sp = project(0, 0, 0);
	_ballSun = sp.depth > V.NEAR ? {
		x: sp.x,
		y: sp.y
	} : null;
	if (sp.depth > V.NEAR && !S.skyMode) {
		const spx = bodyPx(SUN.rk, sp.depth);
		drawHalo(haloSprite("sun", [
			[0, "rgba(255,240,190,0.9)"],
			[.4, "rgba(255,210,120,0.35)"],
			[1, "rgba(255,180,80,0)"]
		], 512), sp.x, sp.y, spx * 3.2, A);
		ctx.beginPath();
		ctx.arc(sp.x, sp.y, spx, 0, 6.2832);
		ctx.fillStyle = `rgba(255,240,190,${A})`;
		ctx.fill();
		if (spx >= 14) {
			const im = suviImage();
			if (im) {
				const s = im.width * .3;
				ctx.save();
				ctx.beginPath();
				ctx.arc(sp.x, sp.y, spx, 0, 6.2832);
				ctx.clip();
				ctx.drawImage(im, im.width / 2 - s, im.height / 2 - s, s * 2, s * 2, sp.x - spx, sp.y - spx, spx * 2, spx * 2);
				ctx.restore();
				if (spx > 46) {
					ctx.font = "9px ui-monospace,monospace";
					ctx.fillStyle = `rgba(255,200,140,${A * .7})`;
					ctx.fillText("GOES SUVI 304 Å · live (~4 min)", sp.x + spx + 4, sp.y + 16);
				}
			}
		}
		_sunPx = spx;
		solarProj.push({
			o: SUN,
			x: sp.x,
			y: sp.y,
			px: spx
		});
		window.__solarProj = solarProj;
		ctx.font = "11px ui-monospace,monospace";
		ctx.fillStyle = `rgba(255,238,178,${A * .9})`;
		ctx.fillText("Sun", sp.x + spx + 4, sp.y + 3);
		const au1 = project(orbitR(1), 0, 0);
		if (au1.depth > V.NEAR && Math.hypot(au1.x - sp.x, au1.y - sp.y) > spx + 30) {
			ctx.font = "9px ui-monospace,monospace";
			ctx.fillStyle = `rgba(200,208,225,${A * .6})`;
			ctx.fillText("Orbital positions · " + dateStr(solarJD()), sp.x + spx + 4, sp.y + 16);
		}
		if (S.sunAR) drawSunspots(A, sp, spx);
	}
	const drawn = [];
	SOLAR_BODIES.forEach((b) => {
		if (!b._e || outerHidden(b)) return;
		const w = eclToWorld(b._e[0], b._e[1], b._e[2]);
		const p = project(w[0], w[1], w[2]);
		if (p.depth <= V.NEAR) return;
		b._p = p;
		drawn.push(b);
	});
	drawn.sort((a, b) => a._p.z2 - b._p.z2);
	for (const b of drawn) {
		const p = b._p, px = bodyPx(b.rk, p.depth), c = b.c;
		const sel = b === S.hover || b === S.pinned;
		if (b.ring) saturnRings(p.x, p.y, px, A, false);
		if (b.uring) for (const rr of [1.95, 1.55]) {
			ctx.beginPath();
			ctx.ellipse(p.x, p.y, px * rr * .32, px * rr, .36, 0, 6.2832);
			ctx.strokeStyle = `rgba(190,214,220,${A * (rr > 1.8 ? .5 : .32)})`;
			ctx.lineWidth = Math.max(1, px * .09);
			ctx.stroke();
		}
		ballFill(p.x, p.y, px, c, A);
		if (b.n === "Earth") V._earthScr = px > Math.min(W, H) * .5 ? {
			x: p.x,
			y: p.y,
			r: px
		} : null;
		if (b.n === "Earth" && px >= 16) {
			let credit = null;
			V._globeOn = false;
			if (px >= 26) {
				const gcv = earthGlobe(px, solarJD());
				if (gcv) {
					ctx.drawImage(gcv, p.x - px, p.y - px, px * 2, px * 2);
					V._globeOn = true;
					credit = `3D · GIBS VIIRS ${_gbl.texDate} · drag to rotate — the terminator is real`;
				}
			}
			if (!V._globeOn) {
				const { im, live } = earthImage(px);
				if (im) {
					ctx.save();
					ctx.beginPath();
					ctx.arc(p.x, p.y, px, 0, 6.2832);
					ctx.clip();
					ctx.drawImage(im, p.x - px, p.y - px, px * 2, px * 2);
					ctx.restore();
					credit = (live ? "GOES-East GEOCOLOR · live (~10 min)" : "NASA EPIC (DSCOVR) · daily") + (_gbl && _gbl.gl && !_gbl.texReady ? " — 3D globe loading…" : _gbl && !_gbl.gl ? " — fixed view (3D globe unavailable: WebGL)" : "");
				}
			}
			if (credit && px > 70) {
				ctx.font = "9px ui-monospace,monospace";
				ctx.fillStyle = `rgba(160,200,240,${A * .7})`;
				if (p.x + px + 8 < W) ctx.fillText(credit, p.x + px + 4, p.y + 16);
				else ctx.fillText(credit, 16, H - 64);
			}
		} else if (px >= 26 && PTEX[b.n]) {
			const gcv = bodyGlobe(b, px, solarJD());
			if (gcv) {
				ctx.drawImage(gcv, p.x - px, p.y - px, px * 2, px * 2);
				if (px > 70) {
					ctx.font = "9px ui-monospace,monospace";
					ctx.fillStyle = `rgba(160,200,240,${A * .7})`;
					const cr = "texture · Solar System Scope (CC-BY)";
					if (p.x + px + 8 < W) ctx.fillText(cr, p.x + px + 4, p.y + 16);
					else ctx.fillText(cr, 16, H - 64);
				}
			}
		}
		if (b.ring) saturnRings(p.x, p.y, px, A, true);
		if (sel) {
			ctx.beginPath();
			ctx.arc(p.x, p.y, px + 7, 0, 6.2832);
			ctx.strokeStyle = "rgba(79,214,200,.9)";
			ctx.lineWidth = 1.2;
			ctx.stroke();
		}
		solarProj.push({
			o: b,
			x: p.x,
			y: p.y,
			px
		});
		const faint = b.kind !== "Planet";
		if (sel || Math.hypot(p.x - sp.x, p.y - sp.y) > px + 10) {
			ctx.font = (sel ? "11px" : "10px") + " ui-monospace,monospace";
			ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${A * (faint ? .72 : .95)})`;
			ctx.fillText(b.n, p.x + px + 4, p.y + 3);
		}
		if (S.moons && b.moons.length) {
			if (!b._ms) {
				b._ms = b.moons.slice().sort((x, y) => x.am - y.am);
				b._amMax = b.moons.reduce((a, m) => m.am > a ? m.am : a, 0);
			}
			const amMax = b._amMax, ms = b._ms;
			const jdM = solarJD();
			if (!S.realScale || V.foc * (amMax * 32408e-15) / p.depth > 1.2 || S.pinned && S.pinned.parent === b.n || S.hover && S.hover.parent === b.n) ms.forEach((m, mi) => {
				const msel0 = m === S.hover || m === S.pinned;
				if (m.minor && px < 9 && !msel0) return;
				const t = Math.log10(m.am + 1) / Math.log10(amMax + 1);
				const rr = px + 12 + t * Math.min(130, px * 3.2 + 80);
				const sepPx = Math.min(S.realScale ? V.foc * (m.am * 32408e-15) / p.depth : rr, 8 * Math.max(W, H));
				const eph = MOON_EPH[m.n];
				let mx, my;
				if (eph && eph.a) {
					const mp = moonAt(eph, jdM);
					const kmPx = S.realScale ? V.foc * 32408e-18 / p.depth : sepPx / (m.am * 1e3 || eph.a);
					camDir2i(mp.dir[0], mp.dir[1], mp.dir[2]);
					mx = p.x + _d2x * mp.r * kmPx;
					my = p.y + _d2y * mp.r * kmPx;
					const seg = sepPx < 7 ? 0 : sepPx < 40 ? 12 : 24;
					if (seg) {
						ctx.beginPath();
						for (let k = 0; k <= seg; k++) {
							const rp = moonOrbitPoint(eph, k / seg * 6.2832);
							camDir2i(rp[0], rp[1], rp[2]);
							const qx = p.x + _d2x * kmPx, qy = p.y + _d2y * kmPx;
							if (k === 0) ctx.moveTo(qx, qy);
							else ctx.lineTo(qx, qy);
						}
						ctx.strokeStyle = `rgba(160,175,205,${A * .15})`;
						ctx.lineWidth = .6;
						ctx.stroke();
					}
				} else {
					const ang = mi * 2.24 + .7;
					mx = p.x + Math.cos(ang) * sepPx;
					my = p.y + Math.sin(ang) * sepPx * .9;
					ctx.beginPath();
					ctx.ellipse(p.x, p.y, sepPx, sepPx * .9, -.3, 0, 6.2832);
					ctx.strokeStyle = `rgba(160,175,205,${A * .13})`;
					ctx.lineWidth = .6;
					ctx.stroke();
				}
				const mde = S.realScale ? p.depth / S.camZ * 3.2 : p.depth;
				let mpx = Math.min(Math.min(W, H) * 4, symPx(m.rk, mde) * .8);
				if (S.realScale) mpx = Math.min(Math.max(mpx, V.foc * (m.rk * 32408e-18) / p.depth), Math.min(W, H) * 4);
				ballFill(mx, my, mpx, m.c, A);
				if (m.n === "Moon" && mpx >= 26) {
					const gcv = bodyGlobe({
						n: "Moon",
						_e: b._e
					}, mpx, jdM);
					if (gcv) ctx.drawImage(gcv, mx - mpx, my - mpx, mpx * 2, mpx * 2);
				}
				const msel = m === S.hover || m === S.pinned;
				if (msel) {
					ctx.beginPath();
					ctx.arc(mx, my, mpx + 5, 0, 6.2832);
					ctx.strokeStyle = "rgba(79,214,200,.9)";
					ctx.lineWidth = 1;
					ctx.stroke();
				}
				solarProj.push({
					o: m,
					x: mx,
					y: my,
					px: Math.max(4, mpx)
				});
				if ((px > 6 || msel) && (!m.minor || msel)) {
					ctx.font = "9px ui-monospace,monospace";
					ctx.fillStyle = `rgba(${m.c[0]},${m.c[1]},${m.c[2]},${A * .8})`;
					ctx.fillText(m.n, mx + mpx + 3, my + 3);
				}
			});
		}
	}
	if (S.lag) drawLagrange(A);
	const bl = project(orbitR(2.7), 0, 0);
	if (bl.depth > V.NEAR) {
		ctx.font = "9px ui-monospace,monospace";
		ctx.fillStyle = `rgba(170,158,130,${A * .6})`;
		ctx.fillText("Asteroid belt", bl.x + 4, bl.y - 3);
	}
	if (S.ast) drawSmall(A, solarJD());
	if (S.helio) {
		const rTS = orbitR(90), rHP = orbitR(122), sunp = project(0, 0, 0);
		if (sunp.depth > V.NEAR) {
			const rr = Math.abs(project(rHP, 0, 0).x - sunp.x) || 0;
			drawHalo(haloSprite("helio", [
				[0, "rgba(90,140,220,0)"],
				[.72, "rgba(90,150,225,0.05)"],
				[1, "rgba(120,170,235,0.11)"]
			]), sunp.x, sunp.y, rr, A);
		}
		orbitRing(rTS, `rgba(135,195,238,${A * .5})`, [3, 5]);
		orbitRing(rHP, `rgba(165,180,242,${A * .62})`, [2, 5]);
		const ts = project(rTS, 0, 0), hp2 = project(rHP, 0, 0);
		ctx.font = "9px ui-monospace,monospace";
		if (ts.depth > V.NEAR) {
			ctx.fillStyle = `rgba(145,200,238,${A * .8})`;
			ctx.fillText("termination shock ~90 AU", ts.x + 4, ts.y + 11);
		}
		if (hp2.depth > V.NEAR) {
			ctx.fillStyle = `rgba(172,190,244,${A * .85})`;
			ctx.fillText("heliopause ~120 AU", hp2.x + 4, hp2.y - 3);
		}
	}
	if (S.probes) drawProbes(A);
	if (S.iso) drawISO(A);
	if (S.cme) drawCME(A);
	if (S.neo) {
		drawLiveNeo(A);
		drawFireballs(A);
	}
	if (S.sat) drawSats(A);
	if (V.TRANSFER) drawTransfer(A);
	ctx.globalAlpha = 1;
}
function outerHidden(b) {
	return (b.kind === "Trans-Neptunian object" || b.kind === "Centaur") && !S.tno;
}
function drawProbes(A) {
	LBL.prio = 70;
	const sun = project(0, 0, 0);
	const drawn = PROBES.map((p) => {
		const w = eclToWorld(p._e[0], p._e[1], p._e[2]);
		return {
			p,
			pr: project(w[0], w[1], w[2])
		};
	}).filter((d) => d.pr.depth > V.NEAR).sort((a, b) => a.pr.z2 - b.pr.z2);
	for (const { p, pr } of drawn) {
		const c = p.c, sel = p === S.hover || p === S.pinned;
		pathBegin();
		pathPt(sun);
		pathPt(pr);
		pathStroke(`rgba(${c[0]},${c[1]},${c[2]},${A * .16})`, .7, [2, 4]);
		const sz = 4.5;
		ctx.beginPath();
		ctx.moveTo(pr.x, pr.y - sz);
		ctx.lineTo(pr.x + sz, pr.y);
		ctx.lineTo(pr.x, pr.y + sz);
		ctx.lineTo(pr.x - sz, pr.y);
		ctx.closePath();
		ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${A})`;
		ctx.fill();
		if (sel) {
			ctx.beginPath();
			ctx.arc(pr.x, pr.y, 10.5, 0, 6.2832);
			ctx.strokeStyle = "rgba(79,214,200,.9)";
			ctx.lineWidth = 1.2;
			ctx.stroke();
		}
		solarProj.push({
			o: p,
			x: pr.x,
			y: pr.y,
			px: Math.max(7, 7.5)
		});
		ctx.font = (sel ? "10px" : "9px") + " ui-monospace,monospace";
		ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${A * .92})`;
		if (sel || !nearSun(pr.x, pr.y)) ctx.fillText(p.n, pr.x + sz + 4, pr.y + 3);
	}
}
var ISO = [
	{
		n: "1I/ʻOumuamua",
		q: .255343,
		e: 1.20113,
		i: 122.7417,
		om: 24.5997,
		w: 241.8105,
		tp: 2458005.99,
		rk: .11,
		note: "first interstellar visitor (2017) — elongated, tumbling, origin still debated"
	},
	{
		n: "2I/Borisov",
		q: 2.00664,
		e: 3.3565,
		i: 44.0526,
		om: 308.149,
		w: 209.1246,
		tp: 2458826.05,
		rk: .4,
		note: "first clearly cometary interstellar visitor (2019)"
	},
	{
		n: "3I/ATLAS",
		q: 1.35638,
		e: 6.1395,
		i: 175.1131,
		om: 322.1577,
		w: 127.9889,
		tp: 2460978.03,
		rk: 1.4,
		note: "third interstellar visitor (2025) — fastest yet, ~58 km/s hyperbolic excess"
	}
];
ISO.forEach((o) => {
	o.kind = "Interstellar object";
	o.c = [
		110,
		255,
		180
	];
	o.iso = true;
});
function isoEcl(o, jd) {
	const a = o.q / (1 - o.e), M = .01720209895 / Math.sqrt(-a * a * a) * (jd - o.tp);
	let H = Math.sign(M || 1) * Math.log(2 * Math.abs(M) / o.e + 1.8);
	for (let k = 0; k < 40; k++) {
		const d = (o.e * Math.sinh(H) - H - M) / (o.e * Math.cosh(H) - 1);
		H -= d;
		if (Math.abs(d) < 1e-12) break;
	}
	const nu = 2 * Math.atan(Math.sqrt((o.e + 1) / (o.e - 1)) * Math.tanh(H / 2)), r = a * (1 - o.e * Math.cosh(H));
	const xw = r * Math.cos(nu), yw = r * Math.sin(nu);
	const cw = Math.cos(o.w * D2R), sw = Math.sin(o.w * D2R), ci = Math.cos(o.i * D2R), si = Math.sin(o.i * D2R), cO = Math.cos(o.om * D2R), sO = Math.sin(o.om * D2R);
	return [
		(cO * cw - sO * sw * ci) * xw + (-cO * sw - sO * cw * ci) * yw,
		(sO * cw + cO * sw * ci) * xw + (-sO * sw + cO * cw * ci) * yw,
		sw * si * xw + cw * si * yw
	];
}
function drawISO(A) {
	LBL.prio = 70;
	const jd = solarJD();
	for (const o of ISO) {
		o._e = isoEcl(o, jd);
		o._r = Math.hypot(o._e[0], o._e[1], o._e[2]);
		if (!o._path) {
			o._path = [];
			for (let k = 0; k <= 120; k++) {
				const e2 = isoEcl(o, o.tp - 1460 + k / 120 * 2920);
				o._path.push(Math.hypot(e2[0], e2[1], e2[2]) <= 35 ? e2 : null);
			}
		}
		pathBegin();
		for (const e2 of o._path) {
			if (!e2) {
				pathBreak();
				continue;
			}
			const w = eclToWorld(e2[0], e2[1], e2[2]);
			pathPt(project(w[0], w[1], w[2]));
		}
		pathStroke(`rgba(110,255,180,${A * .42})`, 1, [4, 4]);
		const w = eclToWorld(o._e[0], o._e[1], o._e[2]), p = project(w[0], w[1], w[2]);
		if (p.depth <= V.NEAR || offscr(p)) continue;
		const sel = o === S.hover || o === S.pinned, sz = sel ? 6 : 5;
		ctx.beginPath();
		ctx.moveTo(p.x, p.y - sz);
		ctx.lineTo(p.x + sz, p.y);
		ctx.lineTo(p.x, p.y + sz);
		ctx.lineTo(p.x - sz, p.y);
		ctx.closePath();
		ctx.fillStyle = `rgba(110,255,180,${A})`;
		ctx.fill();
		ctx.beginPath();
		ctx.arc(p.x, p.y, sz + 4, 0, 6.2832);
		ctx.strokeStyle = `rgba(110,255,180,${A * (sel ? .9 : .45)})`;
		ctx.lineWidth = 1.1;
		ctx.stroke();
		solarProj.push({
			o,
			x: p.x,
			y: p.y,
			px: sz + 5
		});
		ctx.font = (sel ? "10px" : "9px") + " ui-monospace,monospace";
		ctx.fillStyle = `rgba(150,255,200,${A * .95})`;
		if (sel || !nearSun(p.x, p.y)) ctx.fillText(o.n + " · interstellar", p.x + sz + 4, p.y + 3);
	}
}
function drawSmall(A, jd) {
	LBL.prio = 40;
	const sun = project(0, 0, 0);
	for (const o of SMALL) {
		o._el = keplerSB(o.kd, jd);
		o._e = orbPoint(o._el, o._el.E);
		o._r = Math.hypot(o._e[0], o._e[1], o._e[2]);
		const com = o.t === "COM", bulk = o.t === "COM2";
		if (!bulk || o === S.hover || o === S.pinned) drawOrbitEllipse(o._el, com || bulk ? `rgba(120,210,228,${A * (bulk ? .3 : .26)})` : `rgba(172,166,150,${A * .18})`);
	}
	const drawn = SMALL.map((o) => {
		const w = eclToWorld(o._e[0], o._e[1], o._e[2]);
		return {
			o,
			p: project(w[0], w[1], w[2])
		};
	}).filter((d) => d.p.depth > V.NEAR).sort((a, b) => a.p.z2 - b.p.z2);
	for (const { o, p } of drawn) {
		const com = o.t === "COM", bulk = o.t === "COM2";
		const c = com ? [
			135,
			222,
			234
		] : bulk ? [
			110,
			190,
			205
		] : [
			190,
			180,
			158
		];
		const px = bulk ? 1.8 : Math.max(2.2, Math.min(6, 3 * A + (com ? 1 : 0)));
		if (com && sun.depth > V.NEAR) {
			let tx = p.x - sun.x, ty = p.y - sun.y, tl = Math.hypot(tx, ty) || 1;
			tx /= tl;
			ty /= tl;
			const g = ctx.createLinearGradient(p.x, p.y, p.x + tx * 22, p.y + ty * 22);
			g.addColorStop(0, `rgba(150,230,240,${A * .6})`);
			g.addColorStop(1, "rgba(150,230,240,0)");
			ctx.strokeStyle = g;
			ctx.lineWidth = 2.4;
			ctx.beginPath();
			ctx.moveTo(p.x, p.y);
			ctx.lineTo(p.x + tx * 22, p.y + ty * 22);
			ctx.stroke();
		}
		const sel = o === S.hover || o === S.pinned;
		ctx.beginPath();
		ctx.arc(p.x, p.y, px, 0, 6.2832);
		ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${A})`;
		ctx.fill();
		if (sel) {
			ctx.beginPath();
			ctx.arc(p.x, p.y, px + 5, 0, 6.2832);
			ctx.strokeStyle = "rgba(79,214,200,.9)";
			ctx.lineWidth = 1.1;
			ctx.stroke();
		}
		solarProj.push({
			o,
			x: p.x,
			y: p.y,
			px: Math.max(6, px)
		});
		if ((A > .5 || sel) && (!bulk || sel) && (sel || !nearSun(p.x, p.y))) {
			ctx.font = (sel ? "10px" : "8.5px") + " ui-monospace,monospace";
			ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${sel ? 1 : .72})`;
			LBL.prio = sel ? 92 : 40;
			ctx.fillText(o.n, p.x + px + 3, p.y + 3);
			LBL.prio = 40;
		}
	}
}
//#endregion
//#region src/engine/transfer.js
var MU_S = .00029591220828559093;
var AUD2KMS = 1731.456;
function stC(z) {
	if (z > 1e-6) return (1 - Math.cos(Math.sqrt(z))) / z;
	if (z < -1e-6) return (Math.cosh(Math.sqrt(-z)) - 1) / -z;
	return .5 - z / 24;
}
function stS(z) {
	if (z > 1e-6) {
		const s = Math.sqrt(z);
		return (s - Math.sin(s)) / (s * s * s);
	}
	if (z < -1e-6) {
		const s = Math.sqrt(-z);
		return (Math.sinh(s) - s) / (s * s * s);
	}
	return 1 / 6 - z / 120;
}
function lambert(r1v, r2v, tof) {
	const r1 = Math.hypot(r1v[0], r1v[1], r1v[2]), r2 = Math.hypot(r2v[0], r2v[1], r2v[2]);
	let cosD = (r1v[0] * r2v[0] + r1v[1] * r2v[1] + r1v[2] * r2v[2]) / (r1 * r2);
	cosD = Math.max(-1, Math.min(1, cosD));
	let dth = Math.acos(cosD);
	if (r1v[0] * r2v[1] - r1v[1] * r2v[0] < 0) dth = 2 * Math.PI - dth;
	const Ac = Math.sin(dth) * Math.sqrt(r1 * r2 / (1 - cosD));
	if (!isFinite(Ac) || Math.abs(Ac) < 1e-12) return null;
	const y = (z) => r1 + r2 + Ac * (z * stS(z) - 1) / Math.sqrt(stC(z));
	const F = (z) => {
		const yy = y(z);
		return yy < 0 ? NaN : Math.pow(yy / stC(z), 1.5) * stS(z) + Ac * Math.sqrt(yy) - Math.sqrt(MU_S) * tof;
	};
	let zlo = -64, zhi = 4 * Math.PI * Math.PI - 1e-9;
	while (zlo < zhi && !(y(zlo) > 0 && isFinite(F(zlo)))) zlo += 4;
	if (!(F(zlo) < 0)) return null;
	let z = 0;
	for (let i = 0; i < 80; i++) {
		z = (zlo + zhi) / 2;
		const f = F(z);
		if (isNaN(f) || f < 0) zlo = z;
		else zhi = z;
	}
	const yy = y(z), f = 1 - yy / r1, g = Ac * Math.sqrt(yy / MU_S), gd = 1 - yy / r2;
	const v1 = [
		0,
		0,
		0
	], v2 = [
		0,
		0,
		0
	];
	for (let i = 0; i < 3; i++) {
		v1[i] = (r2v[i] - f * r1v[i]) / g;
		v2[i] = (gd * r2v[i] - r1v[i]) / g;
	}
	return {
		v1,
		v2
	};
}
function propagateUV(r0v, v0v, dt) {
	const r0 = Math.hypot(r0v[0], r0v[1], r0v[2]), v02 = v0v[0] * v0v[0] + v0v[1] * v0v[1] + v0v[2] * v0v[2];
	const vr0 = (r0v[0] * v0v[0] + r0v[1] * v0v[1] + r0v[2] * v0v[2]) / r0;
	const alpha = 2 / r0 - v02 / MU_S, sq = Math.sqrt(MU_S);
	let x = Math.abs(alpha) > 1e-9 ? sq * Math.abs(alpha) * dt : sq * dt / r0;
	for (let i = 0; i < 40; i++) {
		const z = alpha * x * x, C = stC(z), Sz = stS(z);
		const dx = (r0 * vr0 / sq * x * x * C + (1 - alpha * r0) * x * x * x * Sz + r0 * x - sq * dt) / (r0 * vr0 / sq * x * (1 - z * Sz) + (1 - alpha * r0) * x * x * C + r0);
		x -= dx;
		if (Math.abs(dx) < 1e-10) break;
	}
	const z = alpha * x * x, f = 1 - x * x / r0 * stC(z), g = dt - x * x * x / sq * stS(z);
	return [
		f * r0v[0] + g * v0v[0],
		f * r0v[1] + g * v0v[1],
		f * r0v[2] + g * v0v[2]
	];
}
function bodyEclAt(b, jd) {
	const el = elementsAt(b, jd);
	return orbPoint(el, el.E);
}
function bodyVelAt(b, jd) {
	const p = bodyEclAt(b, jd + .5), m = bodyEclAt(b, jd - .5);
	return [
		p[0] - m[0],
		p[1] - m[1],
		p[2] - m[2]
	];
}
function findWindow(bA, bB, jd0) {
	const aA = bA.k ? bA.k[0] : bA.kd.a, aB = bB.k ? bB.k[0] : bB.kd.a;
	const Ta = Math.sqrt(aA * aA * aA) * 365.25, Tb = Math.sqrt(aB * aB * aB) * 365.25;
	const syn = 1 / Math.max(1e-9, Math.abs(1 / Ta - 1 / Tb));
	const span = Math.min(1e3, Math.max(420, syn * 1.15));
	const hoh = Math.PI * Math.sqrt(Math.pow((aA + aB) / 2, 3) / MU_S);
	const tofLo = hoh * .55, tofHi = Math.min(hoh * 1.6, 73e3);
	let best = null;
	const evalPt = (dep, tof) => {
		const L = lambert(bodyEclAt(bA, dep), bodyEclAt(bB, dep + tof), tof);
		if (!L) return;
		const vA = bodyVelAt(bA, dep), vB = bodyVelAt(bB, dep + tof);
		const dv = (Math.hypot(L.v1[0] - vA[0], L.v1[1] - vA[1], L.v1[2] - vA[2]) + Math.hypot(L.v2[0] - vB[0], L.v2[1] - vB[1], L.v2[2] - vB[2])) * AUD2KMS;
		if (!best || dv < best.dv) best = {
			dep,
			tof,
			dv,
			v1: L.v1
		};
	};
	for (let i = 0; i <= 70; i++) for (let j = 0; j <= 20; j++) evalPt(jd0 + i * span / 70, tofLo + j * (tofHi - tofLo) / 20);
	if (!best) return null;
	const ds = span / 70, ts = (tofHi - tofLo) / 20, c = {
		dep: best.dep,
		tof: best.tof
	};
	for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) evalPt(c.dep + i * ds / 6, Math.max(20, c.tof + j * ts / 6));
	return best;
}
function computeTransfer(b) {
	const earth = PLANETS.find((p) => p.n === "Earth");
	const w = findWindow(earth, b, solarJD());
	if (!w) {
		msg("no transfer window found");
		return;
	}
	const r1 = bodyEclAt(earth, w.dep), pts = [], N = 96;
	for (let i = 0; i <= N; i++) pts.push(propagateUV(r1, w.v1, w.tof * i / N));
	V.TRANSFER = {
		to: b,
		dep: w.dep,
		tof: w.tof,
		dv: w.dv,
		r1,
		v1: w.v1,
		pts
	};
	V.TRANSFER._o = {
		xfer: true,
		n: "Earth → " + b.n + " transfer",
		T: V.TRANSFER
	};
	msg(`launch ${dateStr(w.dep)} · ${Math.round(w.tof)} d · Δv ${w.dv.toFixed(1)} km/s — ride the time slider`);
	V.lastInfo = void 0;
	V.dirty = true;
}
function drawTransfer(A) {
	LBL.prio = 70;
	const T = V.TRANSFER;
	if (!T) return;
	pathBegin();
	for (const q of T.pts) {
		const w = eclToWorld(q[0], q[1], q[2]);
		pathPt(project(w[0], w[1], w[2]));
	}
	pathStroke(`rgba(79,214,200,${A * .8})`, 1.5, [5, 4]);
	const ends = [[T.pts[0], `launch ${dateStr(T.dep)} · Δv ${T.dv.toFixed(1)} km/s`], [T.pts[T.pts.length - 1], `${T.to.n} at arrival · ${dateStr(T.dep + T.tof)}`]];
	ctx.font = "9px ui-monospace,monospace";
	for (const [q, txt] of ends) {
		const w = eclToWorld(q[0], q[1], q[2]), p = project(w[0], w[1], w[2]);
		if (p.depth <= V.NEAR) continue;
		ctx.beginPath();
		ctx.arc(p.x, p.y, 4, 0, 6.2832);
		ctx.strokeStyle = `rgba(79,214,200,${A * .9})`;
		ctx.lineWidth = 1.2;
		ctx.stroke();
		ctx.fillStyle = `rgba(140,235,225,${A * .85})`;
		ctx.fillText(txt, p.x + 7, p.y - 4);
	}
	const jd = solarJD();
	if (jd >= T.dep && jd <= T.dep + T.tof) {
		const q = propagateUV(T.r1, T.v1, jd - T.dep);
		const w = eclToWorld(q[0], q[1], q[2]), p = project(w[0], w[1], w[2]);
		if (p.depth > V.NEAR) {
			const sel = T._o === S.hover || T._o === S.pinned, sz = sel ? 6 : 5;
			ctx.beginPath();
			ctx.moveTo(p.x, p.y - sz);
			ctx.lineTo(p.x + sz, p.y);
			ctx.lineTo(p.x, p.y + sz);
			ctx.lineTo(p.x - sz, p.y);
			ctx.closePath();
			ctx.fillStyle = `rgba(120,255,235,${A})`;
			ctx.fill();
			if (sel) {
				ctx.beginPath();
				ctx.arc(p.x, p.y, sz + 6, 0, 6.2832);
				ctx.strokeStyle = "rgba(79,214,200,.9)";
				ctx.lineWidth = 1.2;
				ctx.stroke();
			}
			ctx.font = "10px ui-monospace,monospace";
			ctx.fillStyle = `rgba(140,255,240,${A * .95})`;
			const prog = Math.round((jd - T.dep) / T.tof * 100);
			ctx.fillText(`Earth → ${T.to.n} · ${prog}%`, p.x + sz + 4, p.y + 3);
			solarProj.push({
				o: T._o,
				x: p.x,
				y: p.y,
				px: Math.max(8, sz + 3)
			});
		}
	}
}
var G_LYR = 1.0323;
function route1g(Dly) {
	const d = Dly / 2;
	const t1 = Math.sqrt(Math.pow(1 + G_LYR * d, 2) - 1) / G_LYR;
	const tau1 = Math.acosh(1 + G_LYR * d) / G_LYR;
	return {
		T: 2 * t1,
		TAU: 2 * tau1
	};
}
function route1gAt(Dly, t) {
	const { T } = route1g(Dly), t1 = T / 2;
	const leg = (tt) => (Math.sqrt(1 + Math.pow(G_LYR * tt, 2)) - 1) / G_LYR;
	if (t >= T) return {
		x: Dly,
		v: 0,
		done: true
	};
	const x = t <= t1 ? leg(t) : Dly - leg(T - t);
	const ta = t <= t1 ? t : T - t;
	return {
		x,
		v: G_LYR * ta / Math.sqrt(1 + Math.pow(G_LYR * ta, 2)),
		tau: (t <= t1 ? Math.asinh(G_LYR * t) : 2 * Math.asinh(G_LYR * t1) - Math.asinh(G_LYR * (T - t))) / G_LYR,
		done: false
	};
}
function computeRoute(o) {
	const P = navPhys(o);
	if (!P) return;
	const distPc = Math.hypot(P[0], P[1], P[2]);
	if (!(distPc > 0)) return;
	const w = navWorld(o), wl = Math.hypot(w[0], w[1], w[2]) || 1;
	V.ROUTE = {
		o,
		n: o.n || o.h || "target",
		distPc,
		dir: [
			w[0] / wl,
			w[1] / wl,
			w[2] / wl
		],
		dep: solarJD()
	};
	V.ROUTE._o = {
		iroute: true,
		n: "Route: Earth → " + V.ROUTE.n,
		R: V.ROUTE
	};
	const r = route1g(distPc * PC2LY);
	msg(`1g starship: ${fmtYears(r.T)} Earth time · ${fmtYears(r.TAU)} ship time — ride the time slider`);
	V.lastInfo = void 0;
	V.dirty = true;
}
function fmtYears(y) {
	if (y < 1) return Math.round(y * 365.25) + " d";
	if (y < 1e4) return y.toFixed(y < 20 ? 1 : 0).replace(/\.0$/, "") + " yr";
	if (y < 1e6) return (y / 1e3).toFixed(1) + " kyr";
	if (y < 1e9) return (y / 1e6).toFixed(2) + " Myr";
	return (y / 1e9).toFixed(2) + " Gyr";
}
function drawRoute() {
	LBL.prio = 92;
	const R = V.ROUTE, w = navWorld(R.o);
	if (!w) return;
	const wr = Math.hypot(w[0], w[1], w[2]);
	pathBegin();
	for (let i = 0; i <= 40; i++) {
		const r = wr * i / 40;
		pathPt(project(R.dir[0] * r, R.dir[1] * r, R.dir[2] * r));
	}
	pathStroke("rgba(120,255,235,0.55)", 1.3, [6, 5]);
	const tp = project(w[0], w[1], w[2]);
	if (tp.depth > V.NEAR) {
		ctx.font = "9px ui-monospace,monospace";
		ctx.fillStyle = "rgba(140,255,240,0.8)";
		const D = R.distPc * PC2LY, r = route1g(D);
		ctx.fillText(`${R.n} · ${D < 1e4 ? D.toFixed(1) + " ly" : fmt(D) + " ly"} · 1g: ${fmtYears(r.T)} (ship ${fmtYears(r.TAU)})`, tp.x + 8, tp.y + 12);
	}
	const tYr = (solarJD() - R.dep) / 365.25;
	if (tYr > 0) {
		const st = route1gAt(R.distPc * PC2LY, tYr);
		const xr = scale(Math.min(R.distPc, Math.max(1e-9, st.x / PC2LY)));
		const p = project(R.dir[0] * xr, R.dir[1] * xr, R.dir[2] * xr);
		if (p.depth > V.NEAR) {
			const sel = R._o === S.hover || R._o === S.pinned, sz = sel ? 6 : 5;
			ctx.beginPath();
			ctx.moveTo(p.x, p.y - sz);
			ctx.lineTo(p.x + sz, p.y);
			ctx.lineTo(p.x, p.y + sz);
			ctx.lineTo(p.x - sz, p.y);
			ctx.closePath();
			ctx.fillStyle = "rgba(120,255,235,0.95)";
			ctx.fill();
			if (sel) {
				ctx.beginPath();
				ctx.arc(p.x, p.y, sz + 6, 0, 6.2832);
				ctx.strokeStyle = "rgba(79,214,200,.9)";
				ctx.lineWidth = 1.2;
				ctx.stroke();
			}
			ctx.font = "10px ui-monospace,monospace";
			ctx.fillStyle = "rgba(150,255,242,0.95)";
			ctx.fillText(st.done ? `arrived at ${R.n}` : `1g starship · ${st.v.toFixed(st.v > .99 ? 4 : 2)} c · ship +${fmtYears(st.tau)}`, p.x + sz + 4, p.y + 3);
			R._sx = p.x;
			R._sy = p.y;
		} else R._sx = void 0;
	} else R._sx = void 0;
}
//#endregion
//#region src/engine/entity.js
var GTYPE = {
	Sp: "Spiral galaxy",
	E: "Elliptical galaxy",
	S0: "Lenticular galaxy",
	Irr: "Irregular galaxy",
	dSph: "Dwarf galaxy"
};
function kindOf(o) {
	if (!o) return null;
	if (o.gpick) return "gpick";
	if (o.usr) return "user";
	if (o.oclu) return "cluster";
	if (o.psr) return "pulsar";
	if (o.lp) return "lagrange";
	if (o.cme) return "cme";
	if (o.iroute) return "route";
	if (o.xfer) return "transfer";
	if (o.spot) return "spot";
	if (o.rec) return "satellite";
	if (o.fb) return "fireball";
	if (o.rk !== void 0) {
		if (o === SUN) return "sun";
		if (o.kind === "Spacecraft") return "probe";
		if (o.kind === "Moon") return "moon";
		if (o.iso) return "iso";
		if (o.kind === "Comet") return "comet";
		if (o.kind === "Asteroid") return "asteroid";
		if (o.kind === "Trans-Neptunian object" || o.kind === "Centaur") return "tno";
		if (o.kind === "Dwarf planet") return "dwarf";
		if (o.kind === "Near-Earth object" || o.kd && o.t !== void 0 && o.ld !== void 0) return "neo";
		return "planet";
	}
	if (o.dso) return "dso";
	if (o.sgra) return "sgra";
	if (o.fc !== void 0) return "exoplanet";
	if (o.mpc !== void 0) return "galaxy";
	if (!o.p) return "star";
	return "host";
}
function nameOf(o) {
	return o ? o.n || o.h || "object" : "";
}
var SOLAR_KINDS = /* @__PURE__ */ new Set([
	"sun",
	"planet",
	"dwarf",
	"moon",
	"tno",
	"probe",
	"comet",
	"asteroid",
	"iso",
	"neo",
	"lagrange"
]);
var isSolar = (o) => SOLAR_KINDS.has(kindOf(o));
function colorOf(o) {
	switch (kindOf(o)) {
		case "gpick": return [
			207,
			216,
			242
		];
		case "user": return [
			255,
			176,
			96
		];
		case "cluster": return (CLU_T[o.ct || 0] || CLU_T[0]).c;
		case "pulsar": return [
			150,
			220,
			255
		];
		case "lagrange": return [
			196,
			170,
			255
		];
		case "cme": return o.c || [
			255,
			150,
			80
		];
		case "route":
		case "transfer": return [
			120,
			255,
			235
		];
		case "spot": return [
			200,
			100,
			50
		];
		case "satellite": return [
			150,
			235,
			255
		];
		case "fireball": return [
			255,
			150,
			80
		];
		case "dso": return (DSO_T[o.t] || DSO_T.EN).c;
		case "sgra": return [
			255,
			205,
			130
		];
		case "exoplanet": return planetColor(o.r);
		case "host": return o._col || [
			230,
			230,
			240
		];
		case "galaxy":
		case "star": return o.c || [
			200,
			205,
			215
		];
		default: return o.c || [
			190,
			215,
			235
		];
	}
}
function physPos(o) {
	switch (kindOf(o)) {
		case "sun": return [
			0,
			0,
			0
		];
		case "user": return o.noDist ? null : [
			o.dx * o.d,
			o.dy * o.d,
			o.dz * o.d
		];
		case "gpick":
		case "sgra":
		case "dso":
		case "pulsar":
		case "cluster": return [
			o._dir[0] * o.d,
			o._dir[1] * o.d,
			o._dir[2] * o.d
		];
		case "galaxy": {
			const d = o.mpc * 1e6;
			return [
				o.dx * d,
				o.dy * d,
				o.dz * d
			];
		}
		case "host": return hostPos(o, tNow());
		case "star": return hygPos(o, tNow());
		case "moon": {
			const p = SOLAR_BODIES.find((b) => b.n === o.parent);
			return p && p._e ? eclPos(p._e) : null;
		}
		case "satellite": {
			const e = SOLAR_BODIES.find((b) => b.n === "Earth");
			return e && e._e ? eclPos(e._e) : null;
		}
		default: return o._e ? eclPos(o._e) : null;
	}
}
function eclPos(e) {
	const d = eclDir(e[0], e[1], e[2]);
	return [
		d[0] * AU_PC,
		d[1] * AU_PC,
		d[2] * AU_PC
	];
}
function worldPos(o) {
	const w = objWorld(o);
	if (w) return w;
	switch (kindOf(o)) {
		case "sun": return [
			0,
			0,
			0
		];
		case "moon": {
			const p = SOLAR_BODIES.find((b) => b.n === o.parent);
			return p && p._e ? eclToWorld(p._e[0], p._e[1], p._e[2]) : null;
		}
		case "satellite": {
			const e = SOLAR_BODIES.find((b) => b.n === "Earth");
			return e && e._e ? eclToWorld(e._e[0], e._e[1], e._e[2]) : null;
		}
		default: return o._e ? eclToWorld(o._e[0], o._e[1], o._e[2]) : null;
	}
}
function abilities(o) {
	const k = kindOf(o), pos = physPos(o);
	return {
		lockable: !!worldPos(o),
		navigable: !!pos,
		routable: !!pos && !isSolar(o) && k !== "route" && k !== "transfer",
		transferable: (k === "planet" || k === "dwarf" || k === "tno" || k === "comet" || k === "asteroid") && !!(o.k || o.kd) && o.n !== "Earth"
	};
}
function radec(dx, dy, dz) {
	let ra = Math.atan2(dy, dx) * 57.29578;
	if (ra < 0) ra += 360;
	const dec = Math.asin(Math.max(-1, Math.min(1, dz))) * 57.29578;
	return [ra, dec];
}
function hmsOf(ra, secDigits = 1) {
	ra = (ra % 360 + 360) % 360;
	const h = ra / 15, hh = Math.floor(h), m = (h - hh) * 60, mm = Math.floor(m);
	let ss = ((m - mm) * 60).toFixed(secDigits);
	if (+ss >= 60) ss = 0 .toFixed(secDigits);
	return `${String(hh).padStart(2, "0")}h${String(mm).padStart(2, "0")}m${ss.padStart(secDigits ? 3 + secDigits : 2, "0")}s`;
}
function dmsOf(dec, secDigits = 0) {
	const sg = dec < 0 ? "−" : "+", a = Math.abs(dec), dd = Math.floor(a), m = (a - dd) * 60, mm = Math.floor(m), s = (m - mm) * 60;
	return `${sg}${String(dd).padStart(2, "0")}°${String(mm).padStart(2, "0")}′${s.toFixed(secDigits).padStart(secDigits ? 3 + secDigits : 2, "0")}″`;
}
var GAL_M = [
	[
		-.0548755604162154,
		-.873437090234885,
		-.4838350155487132
	],
	[
		.4941094278755837,
		-.4448296299600112,
		.746982244497219
	],
	[
		-.8676661490190047,
		-.1980763734312015,
		.4559837761750669
	]
];
function galactic(dx, dy, dz) {
	const x = GAL_M[0][0] * dx + GAL_M[0][1] * dy + GAL_M[0][2] * dz, y = GAL_M[1][0] * dx + GAL_M[1][1] * dy + GAL_M[1][2] * dz, z = GAL_M[2][0] * dx + GAL_M[2][1] * dy + GAL_M[2][2] * dz;
	let l = Math.atan2(y, x) * 57.29577951;
	if (l < 0) l += 360;
	return [l, Math.asin(Math.max(-1, Math.min(1, z))) * 57.29577951];
}
function coordText(dx, dy, dz) {
	const [ra, dec] = radec(dx, dy, dz);
	return `${hmsOf(ra)} ${dmsOf(dec)}`;
}
function galText(dx, dy, dz) {
	const [l, b] = galactic(dx, dy, dz);
	return `l ${l.toFixed(3)}° b ${b >= 0 ? "+" : "−"}${Math.abs(b).toFixed(3)}°`;
}
function radecText(dx, dy, dz) {
	return coordText(dx, dy, dz);
}
function pmText(pr, pd) {
	const t = Math.hypot(pr || 0, pd || 0);
	if (!t) return "—";
	let pa = Math.atan2(pr || 0, pd || 0) * 57.29578;
	if (pa < 0) pa += 360;
	return `${t >= 1e3 ? (t / 1e3).toFixed(2) + "″/yr" : t.toFixed(1) + " mas/yr"} · PA ${pa.toFixed(0)}°`;
}
var KMS_PER_PCYR_MAS = 4.74047;
var simbadCoo = (ra, dec, r) => `https://simbad.cds.unistra.fr/simbad/sim-coo?Coord=${ra.toFixed(4)}%20${dec.toFixed(4)}&Radius=${r}&Radius.unit=arcmin`;
var simbadId = (id) => `https://simbad.cds.unistra.fr/simbad/sim-id?Ident=${encodeURIComponent(id)}`;
var aladin = (ra, dec, fov) => `https://aladin.cds.unistra.fr/AladinLite/?target=${ra.toFixed(4)}%20${dec.toFixed(4)}&fov=${fov}`;
var dtime = (t) => new Date(t).toLocaleString("en-US", {
	month: "short",
	day: "numeric",
	hour: "2-digit",
	minute: "2-digit"
});
var ly$1 = (pc) => fmt(pc * PC2LY) + " ly";
function card(o) {
	const k = kindOf(o), color = colorOf(o);
	const c = {
		kind: k,
		title: nameOf(o),
		color,
		rows: [],
		links: [],
		hint: ""
	};
	const pin = S.pinned ? "Click empty space to release" : "Click to pin";
	switch (k) {
		case "user": {
			const setName = (USER.sets[o.set] || {}).name || "your data";
			c.title = o.n || `Row ${o.i + 1}`;
			c.kindLabel = `Your data · ${setName}`;
			c.rows.push(["Source", setName], ["Position", coordText(o.dx, o.dy, o.dz)], ["Galactic", galText(o.dx, o.dy, o.dz)], ["Epoch", `J${(o.ep || 2e3).toFixed(1)}${o.pr || o.pd ? " · shown at J" + epochNow().toFixed(2) : ""}`]);
			c.rows.push(["Distance", o.noDist ? "not given — placed on the sky" : `${ly$1(o.d)} · ${o.d < 100 ? o.d.toFixed(2) : fmt(o.d)} pc`]);
			if (o.m !== void 0) c.rows.push(["Magnitude", o.m.toFixed(2)]);
			if (o.pr || o.pd) c.rows.push(["Proper motion", `${o.pr.toFixed(1)} · ${o.pd.toFixed(1)} mas/yr · ${Math.hypot(o.pr, o.pd).toFixed(0)} total`]);
			for (const [kx, vx] of Object.entries(o.x || {}).slice(0, 8)) c.rows.push([kx, String(vx).slice(0, 60)]);
			c.links = [{
				t: "SIMBAD",
				u: simbadCoo(o.ra, o.dec, 2)
			}, {
				t: "Aladin",
				u: aladin(o.ra, o.dec, .3)
			}];
			c.hint = "from your file · the links query the catalogues at this position";
			break;
		}
		case "gpick": {
			const [ra, dec] = radec(o._dir[0], o._dir[1], o._dir[2]);
			if (o.gpick === "gaia") {
				c.rows.push(["Type", "Star · Gaia DR3"], ["Position", coordText(o._dir[0], o._dir[1], o._dir[2]) + " (±20″, packed)"], ["Galactic", galText(o._dir[0], o._dir[1], o._dir[2])], ["G magnitude", o.mag.toFixed(1)], ["Colour BP−RP", o.bprp.toFixed(2)], ["Distance", `${ly$1(o.d)} · ${o.d.toFixed(1)} pc · ϖ ≈ ${(1e3 / o.d).toFixed(1)} mas`]);
				if (o.pr !== void 0) c.rows.push(["Proper motion", pmText(o.pr, o.pd)], ["Tangential velocity", `${(KMS_PER_PCYR_MAS * Math.hypot(o.pr, o.pd) / 1e3 * o.d).toFixed(1)} km/s`]);
			} else if (o.gpick === "web") c.rows.push(["Type", "Galaxy · 2MRS survey"], ["Mag K", o.kmag.toFixed(1)], ["Distance", `${(o.d / 1e6).toFixed(1)} Mpc · ${(o.d * PC2LY / 1e6).toFixed(0)} Mly`]);
			else if (o.gpick === "qso") c.rows.push(["Type", "Quasar · Milliquas"], ["Redshift", `z ≈ ${o.z.toFixed(2)}`], ["Distance", `${(o.d / 1e9).toFixed(2)} Gpc comoving`]);
			else c.rows.push(["Type", `${o.n} · JPL SBDB`], ["Abs. mag H", o.H.toFixed(1)], ["Distance", `${o.rAU.toFixed(2)} AU from the Sun`]);
			c.links = [{
				t: "SIMBAD",
				u: simbadCoo(ra, dec, 2)
			}, {
				t: "Aladin",
				u: aladin(ra, dec, .5)
			}];
			c.hint = "catalogue point — no individual name";
			break;
		}
		case "cluster": {
			const frb = o.ct === 2;
			c.rows.push(["Type", (CLU_T[o.ct || 0] || CLU_T[0]).l], ["Distance", frb ? fmt(o.d / 1e6) + " Mpc" : ly$1(o.d)], [frb ? "Estimate" : "Measured", frb ? "redshift from the dispersion measure — approximate" : fmt(o.d) + " pc"]);
			c.links = [{
				t: "SIMBAD",
				u: simbadId(o.n)
			}, {
				t: "Aladin",
				u: aladin(o[0], o[1], 2)
			}];
			c.hint = pin;
			break;
		}
		case "pulsar":
			c.rows.push(["Type", "Pulsar · rotating neutron star"], ["Distance", ly$1(o.d)], ["Measured", fmt(o.d) + " pc, from the dispersion measure"]);
			c.links = [{
				t: "ATNF",
				u: "https://www.atnf.csiro.au/research/pulsar/psrcat/"
			}, {
				t: "SIMBAD",
				u: simbadCoo(o[0], o[1], 5)
			}];
			c.hint = pin;
			break;
		case "lagrange": {
			const rAU = o._e ? Math.hypot(o._e[0], o._e[1], o._e[2]) : 0;
			c.rows.push(["Type", "Lagrange point · gravity balance"], ["System", `Sun–${o.pl}`], ["Distance", `${rAU.toFixed(2)} AU from the Sun`]);
			if (o.note) c.rows.push(["Note", o.note]);
			c.links = [{
				t: "Wikipedia",
				u: "https://en.wikipedia.org/wiki/Lagrange_point"
			}];
			c.hint = `where the Sun's and ${o.pl}'s gravity balance the orbit`;
			break;
		}
		case "cme": {
			const m = o.cme, dir = `${m.lat >= 0 ? "N" : "S"}${Math.abs(m.lat).toFixed(0)} ${m.lon >= 0 ? "W" : "E"}${Math.abs(m.lon).toFixed(0)}`;
			c.title = "Coronal mass ejection";
			c.rows.push(["Type", `CME · class ${m.type} · NASA DONKI`], ["Erupted", `${dtime(m.t)} UTC (at 21.5 R☉)`], ["Speed", `${Math.round(m.v)} km/s`], ["Width", `±${Math.round(m.half)}° · from ${dir}`], m.earthDir ? ["Earth arrival", `~ ${dtime(m.eta)} UTC`] : ["Direction", "not Earth-directed"]);
			c.links = [{
				t: "DONKI",
				u: "https://kauai.ccmc.gsfc.nasa.gov/DONKI/"
			}, {
				t: "SWPC",
				u: "https://www.swpc.noaa.gov/"
			}];
			c.hint = "ballistic estimate — real fronts decelerate in the solar wind";
			break;
		}
		case "route": {
			const D = o.R.distPc * PC2LY, r = route1g(D);
			c.rows.push(["Distance", D < 1e4 ? `${D.toFixed(1)} ly` : `${fmt(D)} ly`], ["Light", fmtYears(D)], ["Voyager 1 (17 km/s)", fmtYears(D / 567e-7)], ["Probe at 0.1 c", fmtYears(D * 10)], ["1g ship · Earth clock", fmtYears(r.T)], ["1g ship · on board", fmtYears(r.TAU)]);
			c.links = [{
				t: "Wikipedia",
				u: "https://en.wikipedia.org/wiki/Space_travel_under_constant_acceleration"
			}];
			c.hint = "accelerate at 1 g to the midpoint, flip, brake — time dilation makes even galaxies reachable within a life on board";
			break;
		}
		case "transfer": {
			const T = o.T;
			c.rows.push(["Type", "Two-impulse transfer (Lambert)"], ["Launch", dateStr(T.dep)], ["Arrival", dateStr(T.dep + T.tof)], ["Time of flight", `${Math.round(T.tof)} days`], ["Δv (heliocentric)", `${T.dv.toFixed(2)} km/s`]);
			c.links = [{
				t: "Wikipedia",
				u: "https://en.wikipedia.org/wiki/Hohmann_transfer_orbit"
			}];
			c.hint = "min-Δv window from a departure × flight-time search — drag the timeline to fly it";
			break;
		}
		case "spot": {
			const r = o.spot;
			c.title = `Active region ${r.no}`;
			c.rows.push(["Type", "Sunspot group · NOAA SWPC"], ["Class", `${r.cls || "—"}${r.mag ? " · mag " + r.mag : ""}`], ["Area", `${r.area} millionths · ${r.spots} spots`], ["Flares 24 h", `${r.cx} C · ${r.mx} M · ${r.xx} X`], ["Flare odds", `C ${r.cp}% · M ${r.mp}% · X ${r.xp}%`]);
			c.links = [{
				t: "SWPC",
				u: "https://www.swpc.noaa.gov/products/solar-region-summary"
			}];
			c.hint = `observed ${r.date} — sunspots this size dwarf the Earth`;
			break;
		}
		case "satellite":
			c.rows.push(["Type", `Satellite · NORAD ${o.rec.satnum}`], ["Altitude", `${fmt(o.alt || 0)} km`], ["Period", `${(2 * Math.PI / o.rec.no).toFixed(0)} min`], ["Inclination", `${(o.rec.inclo * 57.2958).toFixed(1)}°`]);
			c.links = [{
				t: "N2YO",
				u: `https://www.n2yo.com/satellite/?s=${o.rec.satnum}`
			}, {
				t: "CelesTrak",
				u: "https://celestrak.org/"
			}];
			c.hint = "real orbit, SGP4-propagated — it moves as you watch";
			break;
		case "fireball": {
			const f = o.fb;
			c.title = "Fireball";
			c.rows.push(["Type", "Atmospheric impact · JPL CNEOS"], ["When", `${dtime(f.t)} UTC`], ["Energy", `${f.kt} kt TNT`], ["Location", `${Math.abs(f.lat).toFixed(1)}°${f.lat >= 0 ? "N" : "S"} ${Math.abs(f.lon).toFixed(1)}°${f.lon >= 0 ? "E" : "W"}`]);
			if (f.vel) c.rows.push(["Velocity", `${f.vel} km/s`]);
			c.links = [{
				t: "CNEOS",
				u: "https://cneos.jpl.nasa.gov/fireballs/"
			}];
			c.hint = "a small asteroid burning up — most are never seen by anyone";
			break;
		}
		case "sun":
		case "planet":
		case "dwarf":
		case "moon":
		case "tno":
		case "probe":
		case "comet":
		case "asteroid":
		case "iso":
		case "neo": {
			const er = o.rk / 6371;
			const dist = o.am !== void 0 ? `${fmt(o.am * 1e3)} km from ${o.parent}` : o._r !== void 0 ? `${o._r.toFixed(2)} AU from the Sun` : o.a !== void 0 ? `${o.a} AU (semi-major axis)` : "—";
			c.kindLabel = k === "moon" ? `Moon of ${o.parent}` : k === "probe" ? "Spacecraft · human-made" : o.kind || "Body";
			if (k === "probe") {
				const lt = o._r !== void 0 ? o._r * 8.317 > 120 ? (o._r * 8.317 / 60).toFixed(1) + " h" : (o._r * 8.317).toFixed(0) + " min" : "—";
				if (o.launch) c.rows.push(["Launched", String(o.launch)]);
				c.rows.push(["Distance", dist], ["Signal delay", `${lt} · one way`]);
			} else c.rows.push(["Radius", `${fmt(o.rk)} km`], ["Earth radii", `${er < .1 ? er.toFixed(3) : er.toFixed(2)} ⊕`], ["Distance", dist]);
			if (o.note) c.rows.push(["Note", o.note]);
			c.links = [{
				t: "NASA",
				u: o.slug ? `https://science.nasa.gov/${o.slug}/` : `https://science.nasa.gov/?search=${encodeURIComponent(o.n)}`
			}, {
				t: "Wikipedia",
				u: `https://en.wikipedia.org/wiki/${encodeURIComponent(o.n)}`
			}];
			c.hint = pin;
			break;
		}
		case "dso": {
			const [ra, dec] = radec(o._dir[0], o._dir[1], o._dir[2]);
			c.rows.push(["Type", (DSO_T[o.t] || DSO_T.EN).l], ["Distance", `${ly$1(o.d)} · ${fmt(o.d)} pc`], ["RA / Dec", radecText(o._dir[0], o._dir[1], o._dir[2])]);
			c.links = [{
				t: "SIMBAD",
				u: simbadCoo(ra, dec, 10)
			}, {
				t: "Aladin",
				u: aladin(ra, dec, 1)
			}];
			c.hint = pin;
			break;
		}
		case "sgra": {
			const [ra, dec] = radec(o._dir[0], o._dir[1], o._dir[2]);
			c.rows.push(["Object", "Supermassive black hole"], ["Mass", "4.3 million M☉"], ["Distance", `${ly$1(o.d)} · ${fmt(o.d)} pc`], ["Where", "centre of the Milky Way"]);
			c.links = [{
				t: "SIMBAD",
				u: simbadId("Sgr A*")
			}, {
				t: "Aladin",
				u: aladin(ra, dec, .3)
			}];
			c.hint = "We orbit it every ~225 million years";
			break;
		}
		case "exoplanet": {
			const cls = !o.r ? "—" : o.r < 1.6 ? "Rocky planet" : o.r < 3.5 ? "Super-Earth" : o.r < 8 ? "Neptune-like" : "Gas giant";
			c.rows.push(["Type", cls]);
			if (o.r) c.rows.push(["Radius", `${o.r} R⊕`]);
			if (o.ma) c.rows.push(["Mass", `${o.ma} M⊕`]);
			if (o.a) c.rows.push(["Orbit (a)", `${o.a} AU`]);
			c.rows.push(["Discovered", `${o.y || "—"} · ${o.m || ""}`]);
			c.links = [{
				t: "NASA archive",
				u: `https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(o._host || o.n)}`
			}, {
				t: "SIMBAD",
				u: simbadId(o._host || o.n)
			}];
			c.hint = `Planet in the ${o._host || ""} system`;
			break;
		}
		case "galaxy": {
			const mly = o.mpc * PC2LY, [ra, dec] = radec(o.dx, o.dy, o.dz);
			c.rows.push(["Distance", mly < 10 ? mly.toFixed(2) + " Mly" : fmt(mly) + " Mly"], ["Type", `${GTYPE[o.t] || "Galaxy"} · ${o.mpc} Mpc`], ["Catalogue", o.id]);
			if (o.kpc) c.rows.push(["Diameter", `${o.kpc} kpc`]);
			c.links = [
				{
					t: "SIMBAD",
					u: simbadId(o.id)
				},
				{
					t: "NED",
					u: `https://ned.ipac.caltech.edu/byname?objname=${encodeURIComponent(o.id)}`
				},
				{
					t: "Aladin",
					u: aladin(ra, dec, 1)
				}
			];
			c.hint = pin;
			break;
		}
		case "star": {
			const [ra, dec] = radec(o.dx, o.dy, o.dz);
			c.title = o.n || (o.hip ? `HIP ${o.hip}` : "Star");
			const q = hygPos(o, tNow()), L = Math.hypot(q[0], q[1], q[2]) || 1e-9;
			c.rows.push(["Position", coordText(q[0] / L, q[1] / L, q[2] / L)], ["Galactic", galText(q[0] / L, q[1] / L, q[2] / L)], ["Epoch", `J${epochNow().toFixed(2)} (J2000 + μ)`]);
			c.rows.push(["Distance", `${ly$1(o.d)} · ${o.d} pc · ϖ ${(1e3 / o.d).toFixed(2)} mas`], ["V magnitude", String(o.m)], ["Proper motion", pmText(o.pr, o.pd)]);
			if (o.pr !== void 0) {
				const vt = KMS_PER_PCYR_MAS * Math.hypot(o.pr || 0, o.pd || 0) / 1e3 * o.d;
				c.rows.push(["Velocity", o.rv !== void 0 ? `v_t ${vt.toFixed(1)} · v_r ${o.rv > 0 ? "+" : ""}${o.rv.toFixed(1)} · ${Math.hypot(vt, o.rv).toFixed(1)} km/s` : `v_t ${vt.toFixed(1)} km/s · no radial velocity`]);
			}
			if (o.hip) c.rows.push(["Hipparcos", `HIP ${o.hip}`]);
			if (S.pm) {
				const q = hygPos(o, tNow()), L = Math.hypot(q[0], q[1], q[2]);
				c.rows.push(["On the timeline", `${L < .5 ? (L * 206265).toFixed(0) + " AU" : ly$1(L)} away`]);
			}
			if (o.con) c.rows.push(["Constellation", o.con]);
			c.links = [{
				t: "SIMBAD",
				u: o.n ? simbadId(o.n) : o.hip ? simbadId("HIP " + o.hip) : simbadCoo(ra, dec, 2)
			}, {
				t: "Aladin",
				u: aladin(ra, dec, .5)
			}];
			c.hint = "HYG v4.1 (Hipparcos · Yale · Gliese) · ICRS, position propagated to the displayed epoch";
			break;
		}
		case "host": {
			const pls = o.p.filter((p) => p.y <= S.year || p.y === 0).sort((a, b) => (a.y || 9999) - (b.y || 9999));
			const fc = FAC[o.fac] || FAC.other, [ra, dec] = radec(o.x / o.d, o.y / o.d, o.z / o.d);
			{
				const q = hostPos(o, tNow()), L = Math.hypot(q[0], q[1], q[2]) || 1e-9;
				c.rows.push(["Position", coordText(q[0] / L, q[1] / L, q[2] / L)], ["Galactic", galText(q[0] / L, q[1] / L, q[2] / L)]);
			}
			c.rows.push(["Distance", `${ly$1(o.d)} · ${fmt(o.d)} pc · ϖ ${(1e3 / o.d).toFixed(2)} mas`], ["Star", o.sp ? o.sp : o.t ? fmt(o.t) + " K" : "—"], ["Discovered", String(o.fy || "—")], ["Instrument", fc.l]);
			if (o.pr !== void 0 || o.pd !== void 0) c.rows.push(["Proper motion", pmText(o.pr, o.pd)]);
			if (o.rv !== void 0) c.rows.push(["Radial velocity", `${o.rv > 0 ? "+" : ""}${(+o.rv).toFixed(1)} km/s`]);
			if (S.pm) {
				const q = hostPos(o, tNow()), L = Math.hypot(q[0], q[1], q[2]);
				c.rows.push(["On the timeline", `${ly$1(L)} away`]);
			}
			c.instrumentColor = fc.c;
			c.planets = pls.slice(0, 6).map((p) => ({
				n: p.n,
				y: p.y || "",
				extra: p.r ? `${p.r} R⊕` : p.ma ? `${p.ma} M⊕` : ""
			}));
			c.planetsTotal = pls.length;
			c.links = [
				{
					t: "NASA archive",
					u: `https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(o.h)}`
				},
				{
					t: "SIMBAD",
					u: simbadId(o.h)
				},
				{
					t: "Aladin",
					u: aladin(ra, dec, .4)
				}
			];
			c.hint = "Click → fly into the system and see the orbits";
			break;
		}
	}
	return c;
}
//#endregion
//#region src/engine/nav.js
var navWorld = worldPos;
var navPhys = physPos;
function camXY(px, py, pz) {
	px -= ctr.x;
	py -= ctr.y;
	pz -= ctr.z;
	const c = Math.cos(S.yaw), s = Math.sin(S.yaw), x1 = px * c + pz * s, z1 = -px * s + pz * c, y1 = py;
	const cp = Math.cos(S.pitch), sp = Math.sin(S.pitch), y2 = y1 * cp - z1 * sp, z2 = y1 * sp + z1 * cp;
	return {
		x1,
		y2,
		z2,
		depth: S.camZ - z2
	};
}
function camPhysPos() {
	const cd = Math.hypot(camPos[0], camPos[1], camPos[2]);
	if (cd < 1e-15) return [
		0,
		0,
		0
	];
	const p = invScale(cd) / cd;
	return [
		camPos[0] * p,
		camPos[1] * p,
		camPos[2] * p
	];
}
function navDistPc() {
	if (!V.navTarget) return 0;
	const t = navPhys(V.navTarget);
	if (!t) return 0;
	const c = camPhysPos();
	return Math.hypot(t[0] - c[0], t[1] - c[1], t[2] - c[2]);
}
function fmtLight(pc) {
	const ly = pc * 3.261564;
	if (ly < 1) {
		const min = ly * 365.25 * 24 * 60;
		if (min < 90) return Math.max(1, Math.round(min)) + " light-minutes";
		if (min < 2880) return (min / 60).toFixed(1) + " light-hours";
		return fmt(min / 1440) + " light-days";
	}
	if (ly < 1e3) return fmt(ly) + " years";
	if (ly < 1e6) return (ly / 1e3).toFixed(1) + " thousand years";
	return (ly / 1e6).toFixed(2) + " million years";
}
var SGRA_RS = 41e-8;
var lensPar = null;
function calcLens() {
	lensPar = null;
	if (!S.lens) return;
	const R = scale(SGRA.d);
	const p = project(SGRA._dir[0] * R, SGRA._dir[1] * R, SGRA._dir[2] * R);
	if (p.depth <= V.NEAR) return;
	const c = camPhysPos();
	const D = Math.max(1e-9, Math.hypot(SGRA._dir[0] * SGRA.d - c[0], SGRA._dir[1] * SGRA.d - c[1], SGRA._dir[2] * SGRA.d - c[2]));
	const px = V.foc * Math.sqrt(2 * SGRA_RS / D) * 300;
	if (px < .7) return;
	lensPar = {
		x: p.x,
		y: p.y,
		e: Math.min(px, Math.min(W, H) * .22),
		depth: p.depth
	};
}
var sgraScreen = null;
var MW_R0 = 8178;
function mwWorld(r, th) {
	const u = MW_R0 - r * Math.cos(th), v = r * Math.sin(th);
	const dx = GPu[0] * u + GPv[0] * v, dy = GPu[1] * u + GPv[1] * v, dz = GPu[2] * u + GPv[2] * v;
	const dist = Math.hypot(dx, dy, dz) || 1e-6, R = scale(dist) / dist;
	return [
		dx * R,
		dy * R,
		dz * R,
		dist
	];
}
var MW_ARMS = [
	{
		n: "Perseus Arm",
		t0: .35,
		c: [
			150,
			185,
			255
		]
	},
	{
		n: "Sagittarius Arm",
		t0: 1.92,
		c: [
			165,
			205,
			255
		]
	},
	{
		n: "Scutum-Centaurus Arm",
		t0: 3.49,
		c: [
			150,
			185,
			255
		]
	},
	{
		n: "Norma / Outer Arm",
		t0: 5.06,
		c: [
			165,
			200,
			255
		]
	}
];
function drawGalaxyModel() {
	LBL.prio = 30;
	const k = .235;
	{
		const w = mwWorld(1e-4, 0), p = project(w[0], w[1], w[2]);
		if (p.depth > V.NEAR) {
			const sz = Math.max(6, Math.min(70, V.foc * .14 / p.depth));
			const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz);
			g.addColorStop(0, "rgba(255,232,190,0.32)");
			g.addColorStop(.5, "rgba(255,206,150,0.12)");
			g.addColorStop(1, "rgba(255,190,120,0)");
			ctx.fillStyle = g;
			ctx.beginPath();
			ctx.arc(p.x, p.y, sz, 0, 6.2832);
			ctx.fill();
		}
	}
	ctx.fillStyle = "rgba(255,214,160,0.5)";
	for (let t = -1; t <= 1; t += .06) {
		const w = mwWorld(Math.abs(t) * 3200, (t < 0 ? Math.PI : 0) + .44), p = project(w[0], w[1], w[2]);
		if (p.depth <= V.NEAR) continue;
		const sz = Math.max(.9, Math.min(3, V.foc * .02 / p.depth));
		ctx.beginPath();
		ctx.arc(p.x, p.y, sz, 0, 6.2832);
		ctx.fill();
	}
	for (const arm of MW_ARMS) {
		ctx.fillStyle = `rgba(${arm.c[0]},${arm.c[1]},${arm.c[2]},0.55)`;
		let mid = null;
		for (let th = .15; th < 7.4; th += .075) {
			const r = 2600 * Math.exp(k * th);
			if (r > 17e3) break;
			const w = mwWorld(r, th + arm.t0), p = project(w[0], w[1], w[2]);
			if (p.depth <= V.NEAR) continue;
			if (p.x < -30 || p.x > W + 30 || p.y < -30 || p.y > H + 30) continue;
			const sz = Math.max(.8, Math.min(2.6, V.foc * .02 / p.depth));
			ctx.beginPath();
			ctx.arc(p.x, p.y, sz, 0, 6.2832);
			ctx.fill();
			if (th > 2.4 && th < 2.55) mid = p;
		}
		if (mid) {
			ctx.font = "9px ui-monospace,monospace";
			ctx.fillStyle = `rgba(${arm.c[0]},${arm.c[1]},${arm.c[2]},0.72)`;
			ctx.fillText(arm.n, mid.x + 4, mid.y);
		}
	}
	{
		const w = mwWorld(MW_R0, 0), p = project(w[0], w[1], w[2]);
		if (p.depth > V.NEAR) {
			ctx.fillStyle = "rgba(120,230,255,0.95)";
			ctx.beginPath();
			ctx.arc(p.x, p.y, 2.4, 0, 6.2832);
			ctx.fill();
			ctx.font = "9px ui-monospace,monospace";
			ctx.fillStyle = "rgba(150,235,255,0.8)";
			ctx.fillText("Sun · Orion Spur", p.x + 5, p.y + 3);
		}
	}
	pathBegin();
	for (let a = 0; a <= 6.2833; a += .1) {
		const w = mwWorld(16e3, a);
		pathPt(project(w[0], w[1], w[2]));
	}
	pathStroke("rgba(150,175,235,0.14)", 1);
}
function drawMW() {
	LBL.prio = 62;
	sgraScreen = null;
	if (!S.mw) return;
	{
		const R = scale(SGRA.d);
		SGRA._x = SGRA._dir[0] * R;
		SGRA._y = SGRA._dir[1] * R;
		SGRA._z = SGRA._dir[2] * R;
	}
	[
		500,
		1500,
		5e3
	].forEach((pc, idx) => {
		const R = scale(pc), mid = idx === 1;
		pathBegin();
		for (let t = 0; t <= 100; t++) {
			const th = t / 100 * 6.2832, c = Math.cos(th), s = Math.sin(th);
			pathPt(project((GPu[0] * c + GPv[0] * s) * R, (GPu[1] * c + GPv[1] * s) * R, (GPu[2] * c + GPv[2] * s) * R));
		}
		pathStroke(`rgba(140,165,235,${mid ? .16 : .08})`, mid ? 2 : 1);
	});
	const sp = project(SGRA._x, SGRA._y, SGRA._z);
	if (sp.depth > V.NEAR) {
		sgraScreen = {
			x: sp.x,
			y: sp.y
		};
		const rbh = Math.min(Math.min(W, H) * .28, V.foc * (S.realScale ? 60 : .08) / sp.depth);
		if (rbh >= 10) {
			drawBlackHole(sp.x, sp.y, rbh, 1, S.eht);
			ctx.font = "10px ui-monospace,monospace";
			ctx.fillStyle = "rgba(255,205,150,0.92)";
			ctx.fillText(S.eht ? "Sagittarius A* · hot accretion flow (EHT 2022 geometry)" : "Sagittarius A* · 4.15 million M☉", sp.x + rbh * 1.15, sp.y - rbh * 1.35);
			return;
		}
		const gr = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, 11);
		gr.addColorStop(0, "rgba(255,180,90,0.55)");
		gr.addColorStop(.5, "rgba(255,120,60,0.22)");
		gr.addColorStop(1, "rgba(255,120,60,0)");
		ctx.fillStyle = gr;
		ctx.beginPath();
		ctx.arc(sp.x, sp.y, 11, 0, 6.2832);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(sp.x, sp.y, 3.4, 0, 6.2832);
		ctx.fillStyle = "#0a0a12";
		ctx.fill();
		ctx.beginPath();
		ctx.arc(sp.x, sp.y, 3.4, 0, 6.2832);
		ctx.strokeStyle = "rgba(255,205,130,0.95)";
		ctx.lineWidth = 1.5;
		ctx.stroke();
		ctx.font = "10px ui-monospace,monospace";
		ctx.fillStyle = "rgba(255,205,150,0.92)";
		ctx.fillText("Sagittarius A * · galactic centre", sp.x + 9, sp.y + 3);
	}
}
//#endregion
//#region src/engine/gl.js
var glOK = false;
var GL = null;
var glcv = null;
var progF = null;
var progU = null;
var progT = null;
var progS = null;
var hdrOK = false;
var hdrFB = null;
var hdrTex = null;
var glMaxPt = 64;
var glBuf = null;
var glBufH = null;
var glBufP = null;
var glBufC = null;
var CL = {
	G: null,
	B: null,
	W: null,
	Q: null,
	O: null,
	V: null
};
var gaiaRaw = null;
var gaiaPm = null;
var gaiaRange = 100;
var webRaw = null;
var qsoRaw = null;
var beltRaw = null;
var obRaw = null;
var varRaw = null;
var beltEpoch = 0;
var GL_UNI = `
uniform float u_yaw,u_pitch,u_camZ,u_foc,u_dpr,u_LOG0,u_KDEC,u_REALK,u_cull,u_minPx,u_alphaK,u_maxPt,u_fovK,u_roll,u_sky;
uniform vec3 u_ctr; uniform vec2 u_res; uniform bool u_real;
uniform vec4 u_lens; uniform float u_lensOn;   // xy: lens device px · z: Einstein radius px · w: lens depth
out vec3 v_color; out float v_alpha;
float scl(float pc){ if(u_real) return pc*u_REALK; return max(0.0,(log(pc)/2.302585093 - u_LOG0)*u_KDEC); }
`;
function glTail(host) {
	return `
  float R=scl(dist);
  vec3 p=dir*R - u_ctr;
  float c=cos(u_yaw), sy=sin(u_yaw);
  float x1=p.x*c + p.z*sy;
  float z1=-p.x*sy + p.z*c;
  float y1=p.y;
  float cp=cos(u_pitch), sp=sin(u_pitch);
  float y2=y1*cp - z1*sp;
  float z2=y1*sp + z1*cp;
  float depth=u_camZ - z2;
  float cr=cos(u_roll), sr=sin(u_roll);
  float x3=x1*cr - y2*sr, y3=x1*sr + y2*cr;
  // Size and fade work on the depth RELATIVE to the framing distance (3.2 at the
  // centre of the view), as the 2D glyphs do. In real scale an absolute depth in
  // parsec made every far cloud sub-pixel: the cosmic web was culled wholesale.
  float dz = u_real ? depth/u_camZ*3.2 : depth;
  float focCss=u_foc/u_dpr;
  // sky view: brightness as seen from the vantage — the Sun's sky is the catalogue's,
  // from another star the distance modulus shifts every magnitude
  float mgV = u_sky>0.5 ? mg + 5.0*log(max(length(p),1e-9)/max(R,1e-9))/2.302585 : mg;
  float bright=max(0.0, 6.8 - mgV);
  float sizeCss;
  ${host ? `if(u_hostMode>0.5) sizeCss=min(20.0, max(0.7, focCss*0.0075/dz*rs));
  else ` : ""}sizeCss=clamp((0.4+bright*0.34)*focCss*0.0032/dz, 0.0, 3.6);
  // sky view: the camera sits at the Sun, so size follows apparent magnitude alone
  if(u_sky>0.5) sizeCss=${host ? "u_hostMode>0.5 ? 1.8 : " : ""}clamp(0.5+bright*0.42, 0.0, 4.5)*(1.0+0.1*log2(u_fovK));
  float nearP=u_real?u_camZ*0.02:0.05; if(depth<=nearP || sizeCss<u_cull){ gl_Position=vec4(2.0,0.0,0.0,1.0); gl_PointSize=0.0; return; }
  float px=max(sizeCss, u_minPx);
  ${host ? `if(u_glow>0.5){
    if(mg>2.6){ gl_Position=vec4(2.0,0.0,0.0,1.0); gl_PointSize=0.0; return; }
    px=min(sizeCss*6.0, 26.0);                           // soft halo for the brightest stars
  }` : ""}
  float dvx=u_res.x*0.5 + u_foc*u_fovK*x3/depth;
  float dvy=u_res.y*0.5 - u_foc*u_fovK*y3/depth;
  if(u_lensOn>0.5 && depth>u_lens.w){            // gravitational lens: sources behind
    vec2 lv=vec2(dvx,dvy)-u_lens.xy;             // Sgr A* deflect outward (point-mass
    float lr=max(length(lv),1e-3);               // lens equation, exaggerated scale)
    float lm=0.5*(lr+sqrt(lr*lr+4.0*u_lens.z*u_lens.z))/lr;
    dvx=u_lens.x+lv.x*lm; dvy=u_lens.y+lv.y*lm;
  }
  gl_Position=vec4(dvx/u_res.x*2.0-1.0, 1.0-dvy/u_res.y*2.0, 0.0, 1.0);
  gl_PointSize=min(px*u_dpr, u_maxPt);
  v_color=col;
  ${host ? `if(u_hostMode>0.5){
    float av=u_sky>0.5 ? 0.9 : clamp(1.9-dz*0.55, 0.12, 1.0);
    if(u_veil>0.5 && dist>u_bnd){                        // red veil beyond the charted edge
      float t=min(1.0,(dist-u_bnd)/(u_bnd*1.6));
      v_color=mix(v_color, vec3(0.9098,0.2275,0.1961), t*0.85); av*=(1.0-t*0.4);
    }
    if(a_pm.y>0.5 && abs(a_pm.y-u_year)<0.5){ v_color=vec3(0.3098,0.8392,0.7843); av=1.0; }
    v_alpha=av;
  } else {` : "{"}
    float fade=u_sky>0.5 ? 1.0 : clamp(1.9-dz*0.4, 0.22, 1.0);
    v_alpha=clamp((0.28+bright*0.12)*fade, 0.0, 1.0);
    if(u_minPx>0.0) v_alpha=max(v_alpha, 0.17);          // Gaia: keep faint dwarfs visible
  }
  ${host ? `if(u_glow>0.5) v_alpha*=0.05;` : ""}
  v_alpha*=u_alphaK;
`;
}
var GL_VSF = `#version 300 es
precision highp float;
in vec3 a_dir; in float a_dist; in float a_mag; in vec3 a_color; in vec2 a_pm; in vec3 a_vel;
${GL_UNI}
uniform float u_pmYears,u_hostMode,u_year,u_facColor,u_sizeOn,u_veil,u_bnd,u_glow;
uniform float u_facVis[8]; uniform vec3 u_pal[8];
void main(){
  vec3 dir=a_dir; float distM=a_dist;
  if(u_pmYears!=0.0){                                    // straight-line 3D motion, pc/yr
    vec3 pos=a_dir*a_dist + a_vel*u_pmYears;
    distM=max(1e-6, length(pos)); dir=pos/distM;
  }
  vec3 col=a_color; float rs=1.0;
  if(u_hostMode>0.5){
    float fy=a_pm.y;                                     // discovery-year filter on the GPU
    if(fy>u_year+0.5 && fy>0.5){ gl_Position=vec4(2.0,0.0,0.0,1.0); gl_PointSize=0.0; return; }
    int ci=int(a_pm.x+0.5);                              // facility category
    if(u_facVis[ci]<0.5){ gl_Position=vec4(2.0,0.0,0.0,1.0); gl_PointSize=0.0; return; }
    if(u_facColor>0.5) col=u_pal[ci];
    if(u_sizeOn>0.5) rs=a_mag;                           // a_mag carries radiusScale for hosts
  }
  float dist=distM, mg=a_mag;
  ${glTail(true)}
}`;
var GL_VSU = `#version 300 es
precision highp float;
in uvec4 a_rec;                                          // one raw 8-byte catalogue record
in ivec2 a_pm;                                           // Gaia only: pmRA*, pmDec in mas/yr (0 elsewhere)
${GL_UNI}
uniform float u_decDist,u_colMode,u_isBelt,u_beltDt,u_hasPm,u_pmYearsU;
uniform vec2 u_decMag; uniform vec3 u_colFix; uniform vec3 u_decPal[4];
vec3 gaiaCol(float bprp){                                // bp_rp -> Teff (Ballesteros) -> colour
  float t=4600.0*(1.0/(0.92*bprp+1.7)+1.0/(0.92*bprp+0.62));
  if(t>=30000.0) return vec3(0.608,0.690,1.0);
  if(t>=10000.0) return vec3(0.667,0.749,1.0);
  if(t>=7500.0)  return vec3(0.792,0.843,1.0);
  if(t>=6000.0)  return vec3(0.973,0.969,1.0);
  if(t>=5200.0)  return vec3(1.0,0.957,0.910);
  if(t>=3700.0)  return vec3(1.0,0.824,0.631);
  return vec3(1.0,0.710,0.424);
}
void main(){
  float D2R=0.017453292519943295;
  float rr=float(a_rec.x)*(360.0/65535.0)*D2R;
  float dr=(float(a_rec.y)*(180.0/65535.0)-90.0)*D2R;
  float u=float(a_rec.z)*(1.0/65535.0);
  float b6=float(a_rec.w & 255u), b7=float(a_rec.w >> 8);
  float cd=cos(dr);
  vec3 dir=vec3(cd*cos(rr), cd*sin(rr), sin(dr));
  if(u_hasPm>0.5 && u_pmYearsU!=0.0){                     // proper motion along a great circle
    float k=u_pmYearsU*4.84813681e-9;                    // mas → rad, times years
    vec3 e=vec3(-sin(rr), cos(rr), 0.0), nn=vec3(-sin(dr)*cos(rr), -sin(dr)*sin(rr), cd);
    vec3 m=e*(float(a_pm.x)*k) + nn*(float(a_pm.y)*k);
    float th=length(m); if(th>1e-12) dir=normalize(dir*cos(th) + (m/th)*sin(th));
  }
  float dist=u*u_decDist;
  float mg=(b6/255.0)*u_decMag.x + u_decMag.y;
  vec3 col = u_colMode<0.5 ? u_colFix
           : u_colMode<1.5 ? gaiaCol((b7/255.0)*6.0-1.0)
           : u_decPal[int(min(b7,3.0))];
  if(u_isBelt>0.5 && u_beltDt!=0.0){
    // approximate Kepler drift: circular mean motion at the body's heliocentric distance
    float rAU=max(0.05, dist/0.0000048481368);
    float ang=0.0172021242/pow(rAU,1.5)*u_beltDt;
    float ca=cos(ang), sa=sin(ang);
    vec3 k=vec3(0.0,-0.39777716,0.91748206);                      // the ecliptic pole in the equatorial world
    dir=dir*ca + cross(k,dir)*sa + k*dot(k,dir)*(1.0-ca);           // Rodrigues: rotate about the pole
  }
  ${glTail(false)}
}`;
var GL_FSP = `#version 300 es
precision mediump float;
in vec3 v_color; in float v_alpha;
out vec4 o;
void main(){
  float r=length(gl_PointCoord-vec2(0.5));
  if(r>0.5) discard;
  float a=v_alpha*smoothstep(0.5,0.12,r);
  o=vec4(v_color*a, a);                                  // premultiplied additive (ONE, ONE)
}`;
var TM_VS = `#version 300 es
void main(){                                             // fullscreen triangle from gl_VertexID
  vec2 p=vec2(float((gl_VertexID<<1)&2), float(gl_VertexID&2));
  gl_Position=vec4(p*2.0-1.0, 0.0, 1.0);
}`;
var TM_FS = `#version 300 es
precision mediump float;
uniform sampler2D u_tex; out vec4 o;
void main(){                                             // soft shoulder above 0.55: dense star
  vec3 x=texelFetch(u_tex, ivec2(gl_FragCoord.xy), 0).rgb;   // fields roll off instead of clipping
  vec3 hi=vec3(0.55) + 0.45*(1.0-exp(-(x-vec3(0.55))/0.45));
  o=vec4(mix(x, hi, step(vec3(0.55), x)), 1.0);
}`;
function glCompile(gl, type, src) {
	const sh = gl.createShader(type);
	gl.shaderSource(sh, src);
	gl.compileShader(sh);
	if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
		try {
			console.error("shader:", gl.getShaderInfoLog(sh));
		} catch (_) {}
		return null;
	}
	return sh;
}
function mkProg(gl, vsSrc, fsSrc) {
	const vs = glCompile(gl, gl.VERTEX_SHADER, vsSrc), fs = glCompile(gl, gl.FRAGMENT_SHADER, fsSrc);
	if (!vs || !fs) return null;
	const p = gl.createProgram();
	gl.attachShader(p, vs);
	gl.attachShader(p, fs);
	gl.linkProgram(p);
	if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
		try {
			console.error("link:", gl.getProgramInfoLog(p));
		} catch (_) {}
		return null;
	}
	const o = {
		p,
		loc: {},
		attr: {}
	};
	const nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
	for (let i = 0; i < nu; i++) {
		const u = gl.getActiveUniform(p, i);
		o.loc[u.name.replace(/\[0\]$/, "")] = gl.getUniformLocation(p, u.name);
	}
	const na = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
	for (let i = 0; i < na; i++) {
		const a = gl.getActiveAttrib(p, i);
		o.attr[a.name] = gl.getAttribLocation(p, a.name);
	}
	return o;
}
function mkFloatVAO(gl, arr) {
	const buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
	const vao = gl.createVertexArray();
	gl.bindVertexArray(vao);
	const A = progF.attr;
	gl.enableVertexAttribArray(A.a_dir);
	gl.vertexAttribPointer(A.a_dir, 3, gl.FLOAT, false, 52, 0);
	gl.enableVertexAttribArray(A.a_dist);
	gl.vertexAttribPointer(A.a_dist, 1, gl.FLOAT, false, 52, 12);
	gl.enableVertexAttribArray(A.a_mag);
	gl.vertexAttribPointer(A.a_mag, 1, gl.FLOAT, false, 52, 16);
	gl.enableVertexAttribArray(A.a_color);
	gl.vertexAttribPointer(A.a_color, 3, gl.FLOAT, false, 52, 20);
	gl.enableVertexAttribArray(A.a_pm);
	gl.vertexAttribPointer(A.a_pm, 2, gl.FLOAT, false, 52, 32);
	gl.enableVertexAttribArray(A.a_vel);
	gl.vertexAttribPointer(A.a_vel, 3, gl.FLOAT, false, 52, 40);
	gl.bindVertexArray(null);
	return {
		vao,
		n: arr.length / 13
	};
}
function initGL() {
	try {
		glcv = document.getElementById("gl");
		if (!glcv) return;
		const gl = glcv.getContext("webgl2", {
			alpha: false,
			antialias: false,
			depth: false,
			stencil: false,
			powerPreference: "high-performance"
		});
		if (!gl) return;
		GL = gl;
		if (!glcv.__loss) {
			glcv.__loss = 1;
			glcv.addEventListener("webglcontextlost", (e) => {
				e.preventDefault();
				glOK = false;
				V.dirty = true;
			});
			glcv.addEventListener("webglcontextrestored", () => {
				initGL();
				glRestoreClouds();
				V.dirty = true;
			});
		}
		progF = mkProg(gl, GL_VSF, GL_FSP);
		progU = mkProg(gl, GL_VSU, GL_FSP);
		progT = mkProg(gl, TM_VS, TM_FS);
		progS = mkProg(gl, SK_VS, SK_FS);
		skyBuf = gl.createBuffer();
		if (!progF || !progU) return;
		glMaxPt = (gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) || [1, 64])[1] || 64;
		hdrOK = false;
		if (progT && gl.getExtension("EXT_color_buffer_float")) {
			hdrTex = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, hdrTex);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, 4, 4, 0, gl.RGBA, gl.HALF_FLOAT, null);
			hdrFB = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, hdrFB);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, hdrTex, 0);
			hdrOK = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			if (progT.loc.u_tex) {
				gl.useProgram(progT.p);
				gl.uniform1i(progT.loc.u_tex, 0);
			}
		}
		const arr = new Float32Array(HYG.length * 13);
		for (let i = 0; i < HYG.length; i++) {
			const st = HYG[i], o = i * 13, v = st._v || [
				0,
				0,
				0
			];
			arr[o] = st.dx;
			arr[o + 1] = st.dy;
			arr[o + 2] = st.dz;
			arr[o + 3] = st.d;
			arr[o + 4] = st.m;
			arr[o + 5] = st.c[0] / 255;
			arr[o + 6] = st.c[1] / 255;
			arr[o + 7] = st.c[2] / 255;
			arr[o + 8] = st.pr || 0;
			arr[o + 9] = st.pd || 0;
			arr[o + 10] = v[0];
			arr[o + 11] = v[1];
			arr[o + 12] = v[2];
		}
		glBuf = mkFloatVAO(gl, arr);
		const FACIDX = {
			kepler: 0,
			tess: 1,
			k2: 2,
			rv: 3,
			micro: 4,
			imaging: 5,
			ground: 6,
			other: 7
		};
		const ha = new Float32Array(STARS.length * 13);
		for (let i = 0; i < STARS.length; i++) {
			const st2 = STARS[i], o = i * 13, v2 = st2._v || [
				0,
				0,
				0
			];
			ha[o + 10] = v2[0];
			ha[o + 11] = v2[1];
			ha[o + 12] = v2[2];
			const sr2 = st2._sr !== void 0 ? st2._sr : starRadius(st2);
			ha[o] = st2._dx;
			ha[o + 1] = st2._dy;
			ha[o + 2] = st2._dz;
			ha[o + 3] = st2._r;
			ha[o + 4] = sr2 ? Math.max(.3, Math.min(4.2, Math.pow(sr2, .7))) : 1;
			ha[o + 5] = st2._col[0] / 255;
			ha[o + 6] = st2._col[1] / 255;
			ha[o + 7] = st2._col[2] / 255;
			ha[o + 8] = FACIDX[st2.fac] !== void 0 ? FACIDX[st2.fac] : 7;
			ha[o + 9] = st2.fy || 0;
		}
		glBufH = mkFloatVAO(gl, ha);
		const mkPts = (list, mag, cFn) => {
			const a2 = new Float32Array(list.length * 13);
			for (let i = 0; i < list.length; i++) {
				const q = list[i], o = i * 13, c = cFn(q);
				a2[o] = q._dir[0];
				a2[o + 1] = q._dir[1];
				a2[o + 2] = q._dir[2];
				a2[o + 3] = q.d;
				a2[o + 4] = mag;
				a2[o + 5] = c[0] / 255;
				a2[o + 6] = c[1] / 255;
				a2[o + 7] = c[2] / 255;
				a2[o + 8] = 0;
				a2[o + 9] = 0;
			}
			return mkFloatVAO(gl, a2);
		};
		glBufP = mkPts(PULSARS, 4.6, () => [
			150,
			220,
			255
		]);
		glBufC = mkPts(CLUSTERS, 4.2, (q) => CLU_T[q.ct || 0].c);
		gl.useProgram(progF.p);
		const pal = [];
		for (const k of [
			"kepler",
			"tess",
			"k2",
			"rv",
			"micro",
			"imaging",
			"ground",
			"other"
		]) {
			const c3 = FAC[k].c;
			pal.push(c3[0] / 255, c3[1] / 255, c3[2] / 255);
		}
		gl.uniform3fv(progF.loc.u_pal, pal);
		gl.clearColor(0, 0, 0, 1);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE);
		glOK = true;
		glResize();
	} catch (e) {
		glOK = false;
	}
}
function glResize() {
	if (!glOK || !glcv) return;
	const raw = devicePixelRatio || 1, px = exactPx && raw <= 2.02 ? exactPx : null;
	glcv.width = px ? px[0] : Math.round(W * Math.min(raw, 2));
	glcv.height = px ? px[1] : Math.round(H * Math.min(raw, 2));
	glcv.style.width = W + "px";
	glcv.style.height = H + "px";
	V.GLDPR = glcv.width / W;
	GL.viewport(0, 0, glcv.width, glcv.height);
	if (hdrOK) {
		GL.bindTexture(GL.TEXTURE_2D, hdrTex);
		GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA16F, glcv.width, glcv.height, 0, GL.RGBA, GL.HALF_FLOAT, null);
	}
	V.dirty = true;
}
function glClearCanvas() {
	if (!glOK) return;
	GL.bindFramebuffer(GL.FRAMEBUFFER, null);
	GL.clear(GL.COLOR_BUFFER_BIT);
}
function glStars() {
	return glOK && S.gpu;
}
var CLOUD_DEC = {
	gaia: {
		dist: 100,
		mag: [28, -2],
		mode: 1
	},
	gaiabig: {
		dist: 150,
		mag: [28, -2],
		mode: 1
	},
	belt: {
		dist: 120 * 484814e-11,
		mag: [0, 5.6],
		mode: 2,
		pal: [
			[
				176,
				166,
				148
			],
			[
				160,
				148,
				172
			],
			[
				255,
				150,
				120
			],
			[
				140,
				172,
				224
			]
		],
		belt: 1
	},
	vars: {
		dist: 2e4,
		mag: [0, 5],
		mode: 2,
		pal: [[
			255,
			214,
			120
		], [
			200,
			160,
			255
		]]
	},
	ob: {
		dist: 4e3,
		mag: [0, 5.2],
		mode: 0,
		fix: [
			168,
			205,
			255
		]
	},
	web: {
		dist: 6e8,
		mag: [16, -5.2],
		mode: 0,
		fix: [
			190,
			200,
			228
		]
	},
	qso: {
		dist: 13e9,
		mag: [0, 5],
		mode: 0,
		fix: [
			212,
			150,
			255
		]
	}
};
function buildCloudBuf(bytes, key) {
	if (!glOK || !bytes || bytes.length < 8) return null;
	const gl = GL, n = bytes.length / 8 | 0;
	const buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, bytes, gl.STATIC_DRAW);
	const vao = gl.createVertexArray();
	gl.bindVertexArray(vao);
	const a = progU.attr.a_rec;
	gl.enableVertexAttribArray(a);
	gl.vertexAttribIPointer(a, 4, gl.UNSIGNED_SHORT, 8, 0);
	gl.bindVertexArray(null);
	V.dirty = true;
	return {
		vao,
		n,
		key
	};
}
function cloudLabel(id, txt) {
	labels.update((m) => ({
		...m,
		[id]: txt
	}));
}
function buildGaia(bytes) {
	const r = buildCloudBuf(bytes, "gaia");
	if (!r) return;
	CL.G = r;
	gaiaRaw = bytes;
	gaiaRange = 100;
	attachGaiaPm();
	cloudLabel("t-gaia", "Gaia stars (" + (r.n >= 1e3 ? (r.n / 1e3 | 0) + "k" : r.n) + " <100 pc)");
}
function attachGaiaPm() {
	if (!glOK || !CL.G || !gaiaPm || CL.G.pm) return;
	const gl = GL, a = progU.attr.a_pm;
	if (a === void 0 || a < 0) return;
	if ((gaiaPm.length / 4 | 0) !== CL.G.n) return;
	gl.bindVertexArray(CL.G.vao);
	const buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, gaiaPm, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(a);
	gl.vertexAttribIPointer(a, 2, gl.SHORT, 4, 0);
	gl.bindVertexArray(null);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	CL.G.pm = true;
	V.dirty = true;
}
function buildGaiaBig(bytes) {
	const r = buildCloudBuf(bytes, "gaiabig");
	if (!r) return;
	CL.G = r;
	gaiaRaw = bytes;
	gaiaRange = 150;
	cloudLabel("t-gaia", "Gaia stars (" + (r.n / 1e6).toFixed(1) + "M <150 pc)");
}
function buildBelt(bytes) {
	if (!bytes || bytes.length < 16) return;
	beltEpoch = new DataView(bytes.buffer, bytes.byteOffset, 8).getFloat64(0, true) || 0;
	bytes = bytes.subarray(8);
	const r = buildCloudBuf(bytes, "belt");
	if (!r) return;
	CL.B = r;
	beltRaw = bytes;
	cloudLabel("t-belt", "Asteroid field (" + (r.n / 1e3 | 0) + "k)");
}
function buildVars(bytes) {
	const r = buildCloudBuf(bytes, "vars");
	if (!r) return;
	CL.V = r;
	varRaw = bytes;
	cloudLabel("t-var", "Variable stars (" + (r.n / 1e3 | 0) + "k Cepheids·RR Lyr)");
}
function buildOB(bytes) {
	const r = buildCloudBuf(bytes, "ob");
	if (!r) return;
	CL.O = r;
	obRaw = bytes;
	cloudLabel("t-ob", "OB stars (" + (r.n / 1e3 | 0) + "k arm tracers)");
}
function buildWeb(bytes) {
	const r = buildCloudBuf(bytes, "web");
	if (!r) return;
	CL.W = r;
	webRaw = bytes;
	cloudLabel("t-web", "Cosmic web (" + (r.n / 1e3 | 0) + "k galaxies)");
}
function buildQso(bytes) {
	if (bytes && CL.Q && bytes.length / 8 <= CL.Q.n) return;
	const r = buildCloudBuf(bytes, "qso");
	if (!r) return;
	CL.Q = r;
	qsoRaw = bytes;
	cloudLabel("t-qso", "Quasars (" + (r.n / 1e3 | 0) + "k)");
}
function glRestoreClouds() {
	if (!glOK) return;
	if (gaiaRaw) {
		const r = buildCloudBuf(gaiaRaw, gaiaRange > 100 ? "gaiabig" : "gaia");
		if (r) {
			CL.G = r;
			attachGaiaPm();
		}
	}
	if (beltRaw) {
		const r = buildCloudBuf(beltRaw, "belt");
		if (r) CL.B = r;
	}
	if (webRaw) {
		const r = buildCloudBuf(webRaw, "web");
		if (r) CL.W = r;
	}
	if (qsoRaw) {
		const r = buildCloudBuf(qsoRaw, "qso");
		if (r) CL.Q = r;
	}
	if (obRaw) {
		const r = buildCloudBuf(obRaw, "ob");
		if (r) CL.O = r;
	}
	if (varRaw) {
		const r = buildCloudBuf(varRaw, "vars");
		if (r) CL.V = r;
	}
}
function loadExtragal() {
	if (!glOK) return;
	try {
		if (typeof window.__WEB_B64__ === "string" && window.__WEB_B64__.length) {
			buildWeb(b64ToBytes(window.__WEB_B64__));
			window.__WEB_B64__ = null;
		} else fetch("data/cosmicweb.bin?b=b22:18").then((r) => r.ok ? r.arrayBuffer() : null).then((a) => {
			if (a) buildWeb(new Uint8Array(a));
		}).catch(() => {});
		if (typeof window.__QSO_B64__ === "string" && window.__QSO_B64__.length) {
			buildQso(b64ToBytes(window.__QSO_B64__));
			window.__QSO_B64__ = null;
		} else fetch("data/quasars.bin?b=b22:18").then((r) => r.ok ? r.arrayBuffer() : null).then((a) => {
			if (a) buildQso(new Uint8Array(a));
		}).catch(() => {});
		fetch("data/quasarsbig.bin?b=b22:18").then((r) => r.ok ? r.arrayBuffer() : null).then((a) => {
			if (a) buildQso(new Uint8Array(a));
		}).catch(() => {});
		if (typeof window.__BELT_B64__ === "string" && window.__BELT_B64__.length) {
			buildBelt(b64ToBytes(window.__BELT_B64__));
			window.__BELT_B64__ = null;
		} else fetch("data/belt.bin?b=b22:18").then((r) => r.ok ? r.arrayBuffer() : null).then((a) => {
			if (a) buildBelt(new Uint8Array(a));
		}).catch(() => {});
		fetch("data/gaiabig.bin?b=b22:18").then((r) => r.ok ? r.arrayBuffer() : null).then((a) => {
			if (a) {
				buildGaiaBig(new Uint8Array(a));
				fetch("data/gaiabig_pm.bin?b=b22:18").then((r) => r.ok ? r.arrayBuffer() : null).then((p) => {
					if (p) {
						gaiaPm = new Uint8Array(p);
						if (CL.G) CL.G.pm = false;
						attachGaiaPm();
					}
				}).catch(() => {});
			}
		}).catch(() => {});
		if (typeof window.__OB_B64__ === "string" && window.__OB_B64__.length) {
			buildOB(b64ToBytes(window.__OB_B64__));
			window.__OB_B64__ = null;
		} else fetch("data/obstars.bin?b=b22:18").then((r) => r.ok ? r.arrayBuffer() : null).then((a) => {
			if (a) buildOB(new Uint8Array(a));
		}).catch(() => {});
		if (typeof window.__VAR_B64__ === "string" && window.__VAR_B64__.length) {
			buildVars(b64ToBytes(window.__VAR_B64__));
			window.__VAR_B64__ = null;
		} else fetch("data/variables.bin?b=b22:18").then((r) => r.ok ? r.arrayBuffer() : null).then((a) => {
			if (a) buildVars(new Uint8Array(a));
		}).catch(() => {});
	} catch (e) {}
}
function b64ToBytes(b64) {
	const bin = atob(b64), len = bin.length, u = new Uint8Array(len);
	for (let i = 0; i < len; i++) u[i] = bin.charCodeAt(i);
	return u;
}
function loadGaia() {
	if (!glOK) return;
	try {
		if (typeof window.__GAIA_B64__ === "string" && window.__GAIA_B64__.length) {
			buildGaia(b64ToBytes(window.__GAIA_B64__));
			window.__GAIA_B64__ = null;
			return;
		}
		fetch("data/gaia.bin?b=b22:18").then((r) => r.ok ? r.arrayBuffer() : null).then((a) => {
			if (a) buildGaia(new Uint8Array(a));
		}).catch(() => {});
		fetch("data/gaia_pm.bin?b=b22:18").then((r) => r.ok ? r.arrayBuffer() : null).then((a) => {
			if (a && (!gaiaPm || gaiaRange === 100)) {
				gaiaPm = new Uint8Array(a);
				attachGaiaPm();
			}
		}).catch(() => {});
	} catch (e) {}
}
function glShared(L) {
	const gl = GL, foc = Math.min(W, H) * .62;
	gl.uniform1f(L.u_yaw, S.yaw);
	gl.uniform1f(L.u_pitch, S.pitch);
	gl.uniform1f(L.u_camZ, S.camZ);
	gl.uniform1f(L.u_foc, foc * V.GLDPR);
	gl.uniform1f(L.u_dpr, V.GLDPR);
	gl.uniform1f(L.u_fovK, V.fovK);
	gl.uniform1f(L.u_roll, V.roll);
	gl.uniform1f(L.u_sky, S.skyMode ? 1 : 0);
	gl.uniform1f(L.u_LOG0, -6);
	gl.uniform1f(L.u_KDEC, 1);
	gl.uniform1f(L.u_REALK, 1);
	gl.uniform3f(L.u_ctr, ctr.x, ctr.y, ctr.z);
	gl.uniform2f(L.u_res, glcv.width, glcv.height);
	gl.uniform1i(L.u_real, S.realScale ? 1 : 0);
	gl.uniform1f(L.u_maxPt, glMaxPt);
	gl.uniform1f(L.u_alphaK, 1);
	if (lensPar && L.u_lensOn) {
		gl.uniform1f(L.u_lensOn, 1);
		gl.uniform4f(L.u_lens, lensPar.x * V.GLDPR, lensPar.y * V.GLDPR, lensPar.e * V.GLDPR, lensPar.depth);
	} else if (L.u_lensOn) gl.uniform1f(L.u_lensOn, 0);
}
function drawCloud(h, cull, minPx, alphaK, beltDt) {
	const gl = GL, L = progU.loc, d = CLOUD_DEC[h.key];
	const tune = window.__ku && window.__ku.tune && window.__ku.tune[h.key];
	if (tune) {
		if (tune.a !== void 0) alphaK = tune.a;
		if (tune.px !== void 0) minPx = tune.px;
	}
	gl.uniform1f(L.u_cull, cull);
	gl.uniform1f(L.u_minPx, minPx);
	gl.uniform1f(L.u_alphaK, alphaK || 1);
	gl.uniform1f(L.u_decDist, d.dist);
	gl.uniform2f(L.u_decMag, d.mag[0], d.mag[1]);
	gl.uniform1f(L.u_colMode, d.mode);
	if (d.fix) gl.uniform3f(L.u_colFix, d.fix[0] / 255, d.fix[1] / 255, d.fix[2] / 255);
	if (d.pal) {
		const pa = [];
		for (let i = 0; i < 4; i++) {
			const c = d.pal[i] || d.pal[0];
			pa.push(c[0] / 255, c[1] / 255, c[2] / 255);
		}
		gl.uniform3fv(L.u_decPal, pa);
	}
	gl.uniform1f(L.u_isBelt, d.belt ? 1 : 0);
	gl.uniform1f(L.u_beltDt, d.belt ? beltDt || 0 : 0);
	gl.uniform1f(L.u_hasPm, h.pm ? 1 : 0);
	gl.bindVertexArray(h.vao);
	gl.drawArrays(gl.POINTS, 0, h.n);
}
var SK_VS = `#version 300 es
precision highp float;
in vec3 a_dir; in vec2 a_uv;
uniform float u_yaw,u_pitch,u_camZ,u_foc,u_fovK,u_roll,u_R; uniform vec3 u_ctr; uniform vec2 u_res;
out vec2 v_uv;
void main(){
  vec3 p=a_dir*u_R - u_ctr;
  float c=cos(u_yaw), sy=sin(u_yaw);
  float x1=p.x*c + p.z*sy, z1=-p.x*sy + p.z*c, y1=p.y;
  float cp=cos(u_pitch), sp=sin(u_pitch);
  float y2=y1*cp - z1*sp, z2=y1*sp + z1*cp;
  float depth=max(1e-9, u_camZ - z2);
  float cr=cos(u_roll), sr=sin(u_roll);
  float x3=x1*cr - y2*sr, y3=x1*sr + y2*cr;
  float dvx=u_res.x*0.5 + u_foc*u_fovK*x3/depth, dvy=u_res.y*0.5 - u_foc*u_fovK*y3/depth;
  gl_Position=vec4(dvx/u_res.x*2.0-1.0, 1.0-dvy/u_res.y*2.0, 0.0, 1.0);
  v_uv=a_uv;
}`;
var SK_FS = `#version 300 es
precision highp float;
in vec2 v_uv; uniform sampler2D u_tex; uniform float u_alpha, u_inv; out vec4 o;
void main(){
  vec3 c=texture(u_tex, v_uv).rgb*u_alpha;
  // the HDR pass rolls values above 0.55 off; pre-invert so the image comes out as it is
  if(u_inv>0.5){ vec3 t=clamp((c-0.55)/0.45, 0.0, 0.995); c=mix(c, 0.55-0.45*log(1.0-t), step(0.55, c)); }
  o=vec4(c,1.0);
}`;
var skyBuf = null;
var SKY_N = 4;
function tileTexture(gl, t) {
	if (t.tex) return t.tex;
	const tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, t.img);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	t.tex = tex;
	t.gl = gl;
	return tex;
}
function drawSurveyTiles() {
	const sv = activeSurvey(), a = surveyAlpha();
	if (!sv || a <= .01 || !progS) return;
	const gl = GL, L = progS.loc, A = progS.attr;
	const order = chooseOrder(sv), tiles = visibleTiles(order);
	gl.useProgram(progS.p);
	gl.disable(gl.BLEND);
	gl.uniform1f(L.u_yaw, S.yaw);
	gl.uniform1f(L.u_pitch, S.pitch);
	gl.uniform1f(L.u_camZ, S.camZ);
	gl.uniform1f(L.u_foc, Math.min(W, H) * .62 * V.GLDPR);
	gl.uniform1f(L.u_fovK, V.fovK);
	gl.uniform1f(L.u_roll, V.roll);
	gl.uniform1f(L.u_R, scale(SKY_R_PC));
	gl.uniform3f(L.u_ctr, ctr.x, ctr.y, ctr.z);
	gl.uniform2f(L.u_res, glcv.width, glcv.height);
	gl.uniform1f(L.u_alpha, a);
	gl.uniform1f(L.u_inv, hdrOK ? 1 : 0);
	gl.uniform1i(L.u_tex, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, skyBuf);
	gl.enableVertexAttribArray(A.a_dir);
	gl.vertexAttribPointer(A.a_dir, 3, gl.FLOAT, false, 20, 0);
	gl.enableVertexAttribArray(A.a_uv);
	gl.vertexAttribPointer(A.a_uv, 2, gl.FLOAT, false, 20, 12);
	const N = SKY_N, verts = /* @__PURE__ */ new Float32Array(125), idx = [];
	for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
		const k = j * 5 + i;
		idx.push(k, k + 1, k + N + 1, k + 1, k + N + 2, k + N + 1);
	}
	const ib = new Uint16Array(idx);
	const ibuf = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ib, gl.STREAM_DRAW);
	let drawn = 0;
	for (const pix of tiles) {
		const best = bestTile(sv, order, pix);
		if (!best) continue;
		const dirs = tileGrid(order, pix, N);
		for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
			const k = j * 5 + i, d = dirs[k], o = k * 5;
			const uv = uvOf(best.u0 + i / N * best.size, best.v0 + j / N * best.size);
			verts[o] = d[0];
			verts[o + 1] = d[1];
			verts[o + 2] = d[2];
			verts[o + 3] = uv[0];
			verts[o + 4] = uv[1];
		}
		gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STREAM_DRAW);
		gl.bindTexture(gl.TEXTURE_2D, tileTexture(gl, best.t));
		gl.drawElements(gl.TRIANGLES, ib.length, gl.UNSIGNED_SHORT, 0);
		drawn++;
	}
	gl.deleteBuffer(ibuf);
	gl.disableVertexAttribArray(A.a_dir);
	gl.disableVertexAttribArray(A.a_uv);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.enable(gl.BLEND);
	SKYSTAT.order = order;
	SKYSTAT.tiles = tiles.length;
	SKYSTAT.drawn = drawn;
}
var SKYSTAT = {
	order: 0,
	tiles: 0,
	drawn: 0
};
function glClearColor() {
	return GL ? Array.from(GL.getParameter(GL.COLOR_CLEAR_VALUE)) : null;
}
function glRender() {
	const gl = GL;
	if (hdrOK) gl.bindFramebuffer(gl.FRAMEBUFFER, hdrFB);
	gl.clear(gl.COLOR_BUFFER_BIT);
	drawSurveyTiles();
	gl.useProgram(progU.p);
	glShared(progU.loc);
	gl.uniform1f(progU.loc.u_pmYearsU, tSince(2016));
	if (V.solarA < .5) {
		const far = camDist > 1e-9 && invScale(camDist) > 3e6;
		if (CL.W && S.web) drawCloud(CL.W, .05, far ? 1.6 : 1.1, far ? 2.4 : 1);
		if (CL.Q && S.qso) drawCloud(CL.Q, .05, 1.15, far ? 1.5 : 1);
	}
	if (CL.B && S.belt && V.solarA > .05) {
		const ringPx = S.realScale ? V.foc * (2.8 * AU_PC) / S.camZ : 60;
		const beltA = Math.max(.12, Math.min(1, (ringPx - 24) / 140));
		drawCloud(CL.B, .03, 1.05, beltA, beltEpoch ? solarJD() - beltEpoch : 0);
	}
	const gaiaFade = S.pm ? Math.max(.12, Math.min(1, 1 - (Math.abs(S.pmYears) - 1e5) / 4e5)) : 1;
	if (CL.G && S.gaia) drawCloud(CL.G, .12, 1.2, (hdrOK ? 1 : .85) * gaiaFade);
	if (V.solarA < .5 && V.sysA < .5) {
		if (CL.O && S.ob) drawCloud(CL.O, .05, 1, .8);
		if (CL.V && S.vars) drawCloud(CL.V, .05, 1);
	}
	const L = progF.loc;
	gl.useProgram(progF.p);
	glShared(L);
	gl.uniform1f(L.u_pmYears, tNow());
	gl.uniform1f(L.u_hostMode, 0);
	gl.uniform1f(L.u_glow, 0);
	if (glBufH) {
		gl.uniform1f(L.u_hostMode, 1);
		gl.uniform1f(L.u_year, S.year);
		gl.uniform1f(L.u_facColor, S.facColor ? 1 : 0);
		gl.uniform1f(L.u_sizeOn, S.size ? 1 : 0);
		gl.uniform1f(L.u_veil, S.veil ? 1 : 0);
		gl.uniform1f(L.u_bnd, BND);
		const fv = [];
		for (const k of [
			"kepler",
			"tess",
			"k2",
			"rv",
			"micro",
			"imaging",
			"ground",
			"other"
		]) fv.push(S.facHidden.has(k) ? 0 : 1);
		gl.uniform1fv(L.u_facVis, fv);
		gl.uniform1f(L.u_cull, 0);
		gl.uniform1f(L.u_minPx, 0);
		gl.bindVertexArray(glBufH.vao);
		gl.drawArrays(gl.POINTS, 0, glBufH.n);
		gl.uniform1f(L.u_hostMode, 0);
	}
	if (V.solarA < .5 && V.sysA < .5) {
		gl.uniform1f(L.u_cull, .05);
		gl.uniform1f(L.u_minPx, 1);
		if (glBufP && S.psr) {
			gl.bindVertexArray(glBufP.vao);
			gl.drawArrays(gl.POINTS, 0, glBufP.n);
		}
		if (glBufC && S.oclu) {
			gl.bindVertexArray(glBufC.vao);
			gl.drawArrays(gl.POINTS, 0, glBufC.n);
		}
	}
	gl.uniform1f(L.u_cull, .34);
	gl.uniform1f(L.u_minPx, 0);
	if (S.hyg && glBuf) {
		gl.bindVertexArray(glBuf.vao);
		gl.drawArrays(gl.POINTS, 0, glBuf.n);
		gl.uniform1f(L.u_glow, 1);
		gl.drawArrays(gl.POINTS, 0, glBuf.n);
		gl.uniform1f(L.u_glow, 0);
	}
	gl.bindVertexArray(null);
	if (hdrOK) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.disable(gl.BLEND);
		gl.useProgram(progT.p);
		gl.bindTexture(gl.TEXTURE_2D, hdrTex);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		gl.enable(gl.BLEND);
	}
}
//#endregion
//#region src/engine/view.js
var W = 0;
var H = 0;
var DPR = 1;
function camDir2(v) {
	camTrig();
	const x1 = v[0] * _cyw + v[2] * _syw, z1 = -v[0] * _syw + v[2] * _cyw, y2 = v[1] * _cp2 - z1 * _sp2;
	return [x1 * _cr - y2 * _sr, -(x1 * _sr + y2 * _cr)];
}
var _d2x = 0;
var _d2y = 0;
function camDir2i(vx, vy, vz) {
	const x1 = vx * _cyw + vz * _syw, z1 = -vx * _syw + vz * _cyw, y2 = vy * _cp2 - z1 * _sp2;
	_d2x = x1 * _cr - y2 * _sr;
	_d2y = -(x1 * _sr + y2 * _cr);
}
var AU_PC = 484814e-11;
function rlog(pc) {
	return Math.max(0, (Math.log10(pc) - -6) * 1);
}
function scale(pc) {
	return S.realScale ? pc * 1 : rlog(pc);
}
function invScale(u) {
	return S.realScale ? u / 1 : Math.pow(10, u / 1 + -6);
}
function lodA(camd, fullPc, hidePc) {
	const f = scale(fullPc), h = scale(hidePc);
	return Math.max(0, Math.min(1, (h - camd) / (h - f || 1e-12)));
}
function camSolar() {
	return scale(3e-4);
}
var ctr = {
	x: 0,
	y: 0,
	z: 0
};
var tgtCtr = {
	x: 0,
	y: 0,
	z: 0
};
var camRight = [
	1,
	0,
	0
];
var camUp = [
	0,
	1,
	0
];
var camFwd = [
	0,
	0,
	1
];
var camDist = 0;
var camPos = [
	0,
	0,
	0
];
var keys = /* @__PURE__ */ new Set();
var _cyw = 1;
var _syw = 0;
var _cp2 = 1;
var _sp2 = 0;
var _cr = 1;
var _sr = 0;
var _trigY = NaN;
var _trigP = NaN;
var _trigS = null;
function rollOf(c, s, sp) {
	return S.skyMode ? Math.atan2(s, -c * sp) : 0;
}
function camTrig() {
	if (_trigY === S.yaw && _trigP === S.pitch && _trigS === S.skyMode) return;
	_trigS = S.skyMode;
	_trigY = S.yaw;
	_trigP = S.pitch;
	_cyw = Math.cos(S.yaw);
	_syw = Math.sin(S.yaw);
	_cp2 = Math.cos(S.pitch);
	_sp2 = Math.sin(S.pitch);
	V.roll = rollOf(_cyw, _syw, _sp2);
	_cr = Math.cos(V.roll);
	_sr = Math.sin(V.roll);
}
function camBasis() {
	const c = Math.cos(S.yaw), s = Math.sin(S.yaw), cp = Math.cos(S.pitch), sp = Math.sin(S.pitch);
	_cyw = c;
	_syw = s;
	_cp2 = cp;
	_sp2 = sp;
	_trigY = S.yaw;
	_trigP = S.pitch;
	_trigS = S.skyMode;
	V.roll = rollOf(c, s, sp);
	_cr = Math.cos(V.roll);
	_sr = Math.sin(V.roll);
	const rx = c, ry = 0, rz = s, ux = s * sp, uy = cp, uz = -c * sp;
	camRight = [
		_cr * rx - _sr * ux,
		_cr * ry - _sr * uy,
		_cr * rz - _sr * uz
	];
	camUp = [
		_sr * rx + _cr * ux,
		_sr * ry + _cr * uy,
		_sr * rz + _cr * uz
	];
	camFwd = [
		s * cp,
		-sp,
		-c * cp
	];
	camPos = [
		ctr.x - camFwd[0] * S.camZ,
		ctr.y - camFwd[1] * S.camZ,
		ctr.z - camFwd[2] * S.camZ
	];
	camDist = Math.hypot(camPos[0], camPos[1], camPos[2]);
}
if (matchMedia("(prefers-reduced-motion: reduce)").matches) S.autorot = false, syncToggle("t-rot", false);
var exactPx = null;
function resize() {
	const raw = devicePixelRatio || 1;
	W = innerWidth;
	H = innerHeight;
	const px2 = exactPx && raw <= 3.02 ? exactPx : null;
	cv.width = px2 ? px2[0] : Math.round(W * Math.min(raw, 3));
	cv.height = px2 ? px2[1] : Math.round(H * Math.min(raw, 3));
	cv.style.width = W + "px";
	cv.style.height = H + "px";
	DPR = cv.width / W;
	ctx.setTransform(DPR, 0, 0, cv.height / H, 0, 0);
	glResize();
	V.dirty = true;
}
addEventListener("resize", resize);
if (window.ResizeObserver) try {
	new ResizeObserver((es) => {
		const s = es[es.length - 1].devicePixelContentBoxSize;
		if (s && s[0]) exactPx = [s[0].inlineSize, s[0].blockSize];
		resize();
	}).observe(cv, { box: "device-pixel-content-box" });
} catch (_) {}
resize();
function compress(r) {
	return scale(r);
}
function project(px, py, pz) {
	return projectInto(px, py, pz, {});
}
var _pj = {
	x: 0,
	y: 0,
	depth: 0,
	z2: 0
};
function projectInto(px, py, pz, o) {
	camTrig();
	px -= ctr.x;
	py -= ctr.y;
	pz -= ctr.z;
	const x1 = px * _cyw + pz * _syw, z1 = -px * _syw + pz * _cyw, y1 = py;
	const y2 = y1 * _cp2 - z1 * _sp2, z2 = y1 * _sp2 + z1 * _cp2;
	const depth = S.camZ - z2;
	const f = V.foc * V.fovK, x3 = x1 * _cr - y2 * _sr, y3 = x1 * _sr + y2 * _cr;
	o.x = V.cx + f * x3 / depth;
	o.y = V.cy - f * y3 / depth;
	o.depth = depth;
	o.z2 = z2;
	return o;
}
function lookAlong(d) {
	const l = Math.hypot(d[0], d[1], d[2]) || 1, x = d[0] / l, y = d[1] / l, z = d[2] / l;
	return {
		yaw: Math.atan2(x, -z),
		pitch: Math.asin(Math.max(-1, Math.min(1, -y)))
	};
}
function screenDir(mx, my) {
	camBasis();
	const f = V.foc * V.fovK, a = (mx - V.cx) / f, b = (V.cy - my) / f;
	const d = [
		camFwd[0] + camRight[0] * a + camUp[0] * b,
		camFwd[1] + camRight[1] * a + camUp[1] * b,
		camFwd[2] + camRight[2] * a + camUp[2] * b
	];
	const l = Math.hypot(d[0], d[1], d[2]) || 1;
	return [
		d[0] / l,
		d[1] / l,
		d[2] / l
	];
}
//#endregion
//#region src/engine/blackhole.js
var _bhgl = null;
var _bhFails = 0;
var _bhNextTry = 0;
function bhInit() {
	if (_bhgl !== null) {
		if (_bhgl.gl) return _bhgl;
		if (_bhFails >= 4 || performance.now() < _bhNextTry) return null;
		_bhgl = null;
	}
	const fail = (m) => {
		_bhgl = { gl: null };
		_bhFails++;
		_bhNextTry = performance.now() + 5e3;
		try {
			console.warn(m);
		} catch (e) {}
		return null;
	};
	const cv2 = document.createElement("canvas");
	const gl = cv2.getContext("webgl", {
		alpha: true,
		antialias: false
	});
	if (!gl) return fail("bh: no WebGL context");
	const mk = (t, src) => {
		const sh = gl.createShader(t);
		gl.shaderSource(sh, src);
		gl.compileShader(sh);
		if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
			try {
				console.warn("bh:", gl.getShaderInfoLog(sh));
			} catch (e) {}
			return null;
		}
		return sh;
	};
	const vsh = mk(gl.VERTEX_SHADER, `attribute vec2 aP; varying vec2 vP;
    void main(){ vP=aP; gl_Position=vec4(aP,0.0,1.0); }`);
	const fsh = mk(gl.FRAGMENT_SHADER, `precision highp float; varying vec2 vP;
    uniform highp mat3 uT; uniform sampler2D uBg; uniform float uBgOk, uMode;
    float hash(vec3 p){ p=fract(p*0.3183+vec3(0.11,0.23,0.37)); p*=17.0;
      return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
    void main(){
      const float HALF=9.6;
      vec3 pos=uT*vec3(vP*HALF,-18.0);
      vec3 dir=uT*vec3(0.0,0.0,1.0);
      vec3 hv=cross(pos,dir); float h2=dot(hv,hv);
      vec3 col=vec3(0.0); float trans=1.0; bool cap=false;
      float jit=0.85+0.3*fract(sin(dot(vP,vec2(12.9898,78.233)))*43758.5453);   // de-band the integrator
      float py=pos.y;
      for(int i=0;i<300;i++){
        float r=length(pos);
        if(r<1.02){cap=true;break;}
        if(r>20.0 && dot(pos,dir)>0.0) break;
        float dt=clamp(r*0.1,0.04,0.35)*jit;
        dir+=-1.5*h2*pos/pow(r,5.0)*dt;      // null-geodesic bending
        pos+=dir*dt;
        float ny=pos.y;
        if(uMode>0.5){                       // EHT: hot puffy torus (RIAF), integrated volumetrically
          float rc=length(pos.xz);
          float em=exp(-pow((rc-4.6)/1.5,2.0)-pow(pos.y/1.6,2.0));
          if(em>0.002){
            float th=atan(pos.z,pos.x);
            em*=0.72+0.4*sin(3.0*th+0.9);    // the three bright knots
            float v=0.35*clamp(sqrt(3.0/max(rc,2.0)),0.0,1.0);
            vec3 vel=normalize(vec3(-pos.z,0.0,pos.x))*v;
            float g=clamp(1.0/(1.0-dot(vel,normalize(dir))),0.6,1.7);
            col+=trans*vec3(1.0,0.42,0.08)*em*dt*0.6*pow(g,2.0);
            trans*=exp(-em*dt*0.16);
            if(trans<0.04) break;
          }
        }
        else if(py*ny<0.0){                  // Gargantua: crossed the thin-disk plane
          float f=py/(py-ny);
          vec3 hit=mix(pos-dir*dt,pos,f);
          float rh=length(hit.xz);
          if(rh>2.6&&rh<9.0){                // thin disk from the ISCO out
            float v=clamp(sqrt(0.5/max(rh-1.0,0.4)),0.0,0.72);
            vec3 vel=normalize(vec3(-hit.z,0.0,hit.x))*v;
            float g=clamp(1.0/(1.0-dot(vel,normalize(dir))),0.42,2.6);   // Doppler
            float grav=sqrt(clamp(1.0-1.0/rh,0.0,1.0));                  // grav. redshift
            float br=pow(3.0/rh,0.9)*pow(g,3.0)*grav
                     *smoothstep(2.6,3.3,rh)*smoothstep(9.0,7.4,rh);   // crisp band edges
            vec3 dc=mix(vec3(1.0,0.4,0.13),vec3(1.0,0.97,0.9),clamp(g*0.8-0.4,0.0,1.0));
            col+=trans*dc*br*1.7;
            trans*=0.22;
            if(trans<0.05) break;
          }
        }
        py=ny;
      }
      if(!cap&&trans>0.05){
        vec3 pc=pos*uT;                      // back to camera frame (transpose)
        vec2 buv=pc.xy/HALF*0.5+0.5;
        vec3 bg=vec3(0.0);
        if(uBgOk>0.5&&buv.x>0.0&&buv.x<1.0&&buv.y>0.0&&buv.y<1.0)
          bg=texture2D(uBg,vec2(buv.x,1.0-buv.y)).rgb;
        vec3 rd=normalize(dir)*uT;
        vec3 sp=floor(rd*240.0);             // faint procedural stars so the warp
        float st=step(0.9985,hash(sp));      // shows even over empty capture
        col+=trans*(bg+vec3(st)*0.85);
      }
      col=vec3(1.0)-exp(-col*1.25);                      // filmic-ish tone map
      float edge=1.0-smoothstep(0.74,0.98,length(vP));   // round vignette — no square seam
      gl_FragColor=vec4(col*edge,edge);
    }`);
	if (!vsh || !fsh) return fail("bh: shader compile failed");
	const pr = gl.createProgram();
	gl.attachShader(pr, vsh);
	gl.attachShader(pr, fsh);
	gl.linkProgram(pr);
	if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return fail("bh: link failed");
	const vb = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vb);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		-1,
		-1,
		1,
		-1,
		-1,
		1,
		1,
		1
	]), gl.STATIC_DRAW);
	const tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([
		0,
		0,
		0,
		255
	]));
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	_bhgl = {
		cv: cv2,
		gl,
		pr,
		vb,
		tex,
		capCv: document.createElement("canvas"),
		aP: gl.getAttribLocation(pr, "aP"),
		uT: gl.getUniformLocation(pr, "uT"),
		uBg: gl.getUniformLocation(pr, "uBg"),
		uBgOk: gl.getUniformLocation(pr, "uBgOk"),
		uMode: gl.getUniformLocation(pr, "uMode")
	};
	_bhFails = 0;
	return _bhgl;
}
function bhRender(x, y, rpx, eht) {
	const g = bhInit();
	if (!g) return null;
	const gl = g.gl, box = rpx * 7.4;
	let bgOk = 0;
	try {
		const c = g.capCv;
		c.width = c.height = 256;
		const g2 = c.getContext("2d");
		const glcv = document.getElementById("gl");
		if (glcv) g2.drawImage(glcv, (x - box / 2) * V.GLDPR, (y - box / 2) * V.GLDPR, box * V.GLDPR, box * V.GLDPR, 0, 0, 256, 256);
		g2.drawImage(cv, (x - box / 2) * DPR, (y - box / 2) * DPR, box * DPR, box * DPR, 0, 0, 256, 256);
		gl.bindTexture(gl.TEXTURE_2D, g.tex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
		bgOk = 1;
	} catch (e) {}
	const dpr = Math.min(2, window.devicePixelRatio || 1);
	const size = Math.max(160, Math.min(1024, Math.ceil(box * dpr)));
	if (g.cv.width !== size) g.cv.width = g.cv.height = size;
	gl.viewport(0, 0, size, size);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(g.pr);
	gl.bindBuffer(gl.ARRAY_BUFFER, g.vb);
	gl.enableVertexAttribArray(g.aP);
	gl.vertexAttribPointer(g.aP, 2, gl.FLOAT, false, 0, 0);
	const V = globeViewRows();
	const n = eht ? GC : NGP, u = eht ? NGP : GC;
	const B = [
		u,
		n,
		[
			n[1] * u[2] - n[2] * u[1],
			n[2] * u[0] - n[0] * u[2],
			n[0] * u[1] - n[1] * u[0]
		]
	];
	const M = new Array(9);
	for (let i2 = 0; i2 < 3; i2++) for (let j = 0; j < 3; j++) M[j * 3 + i2] = B[i2][0] * V[j][0] + B[i2][1] * V[j][1] + B[i2][2] * V[j][2];
	gl.uniformMatrix3fv(g.uT, false, M);
	gl.bindTexture(gl.TEXTURE_2D, g.tex);
	gl.uniform1i(g.uBg, 0);
	gl.uniform1f(g.uBgOk, bgOk);
	gl.uniform1f(g.uMode, eht ? 1 : 0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	return g.cv;
}
function drawEHT(x, y, r, A) {
	ctx.save();
	let bg = ctx.createRadialGradient(x, y, 0, x, y, r * 2.3);
	bg.addColorStop(0, `rgba(8,3,1,${A * .9})`);
	bg.addColorStop(.72, `rgba(8,3,1,${A * .55})`);
	bg.addColorStop(1, "rgba(8,3,1,0)");
	ctx.fillStyle = bg;
	ctx.beginPath();
	ctx.arc(x, y, r * 2.3, 0, 6.2832);
	ctx.fill();
	const ring = ctx.createRadialGradient(x, y, r * .25, x, y, r * 1.8);
	ring.addColorStop(0, "rgba(30,6,0,0)");
	ring.addColorStop(.32, `rgba(120,30,4,${A * .5})`);
	ring.addColorStop(.5, `rgba(255,118,18,${A * .9})`);
	ring.addColorStop(.62, `rgba(255,170,48,${A * .95})`);
	ring.addColorStop(.8, `rgba(150,40,6,${A * .5})`);
	ring.addColorStop(1, "rgba(60,10,0,0)");
	ctx.fillStyle = ring;
	ctx.beginPath();
	ctx.arc(x, y, r * 1.8, 0, 6.2832);
	ctx.fill();
	ctx.globalCompositeOperation = "lighter";
	for (const [ang, s, b] of [
		[
			1.9,
			1,
			1
		],
		[
			3.6,
			.85,
			.8
		],
		[
			.2,
			.8,
			.7
		]
	]) {
		const kx = x + Math.cos(ang) * r, ky = y + Math.sin(ang) * r;
		const kg = ctx.createRadialGradient(kx, ky, 0, kx, ky, r * .55 * s);
		kg.addColorStop(0, `rgba(255,225,140,${A * .7 * b})`);
		kg.addColorStop(.5, `rgba(255,150,40,${A * .38 * b})`);
		kg.addColorStop(1, "rgba(255,120,30,0)");
		ctx.fillStyle = kg;
		ctx.beginPath();
		ctx.arc(kx, ky, r * .55 * s, 0, 6.2832);
		ctx.fill();
	}
	ctx.globalCompositeOperation = "source-over";
	ctx.restore();
}
function drawBlackHole(x, y, r, A, eht) {
	const patch = bhRender(x, y, r, !!eht);
	if (patch) {
		ctx.drawImage(patch, x - r * 3.7, y - r * 3.7, r * 7.4, r * 7.4);
		return;
	}
	if (eht) drawEHT(x, y, r, A);
	else drawBlackHolePainted(x, y, r, A);
}
function drawBlackHolePainted(x, y, r, A) {
	const disk = r * 3.1, flat = .13;
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(-.14);
	let g = ctx.createRadialGradient(0, 0, r * .7, 0, 0, disk * 1.35);
	g.addColorStop(0, `rgba(255,190,120,${A * .22})`);
	g.addColorStop(.6, `rgba(255,150,70,${A * .07})`);
	g.addColorStop(1, "rgba(255,140,60,0)");
	ctx.fillStyle = g;
	ctx.beginPath();
	ctx.arc(0, 0, disk * 1.35, 0, 6.2832);
	ctx.fill();
	const diskGrad = () => {
		const dg = ctx.createRadialGradient(0, 0, r * 1.22, 0, 0, disk);
		dg.addColorStop(0, `rgba(255,252,246,${A})`);
		dg.addColorStop(.18, `rgba(255,238,205,${A * .92})`);
		dg.addColorStop(.55, `rgba(255,196,120,${A * .55})`);
		dg.addColorStop(1, "rgba(255,150,70,0)");
		return dg;
	};
	ctx.save();
	ctx.scale(1, flat);
	ctx.fillStyle = diskGrad();
	ctx.beginPath();
	ctx.arc(0, 0, disk, 0, 6.2832);
	ctx.arc(0, 0, r * 1.24, 0, 6.2832, true);
	ctx.fill();
	const dop = ctx.createLinearGradient(-disk, 0, disk, 0);
	dop.addColorStop(0, `rgba(255,255,255,${A * .3})`);
	dop.addColorStop(.5, "rgba(255,255,255,0)");
	ctx.fillStyle = dop;
	ctx.beginPath();
	ctx.arc(0, 0, disk, 0, 6.2832);
	ctx.arc(0, 0, r * 1.24, 0, 6.2832, true);
	ctx.fill();
	ctx.restore();
	const hg = ctx.createRadialGradient(0, 0, r * 1.02, 0, 0, r * 1.75);
	hg.addColorStop(0, `rgba(255,250,240,${A * .85})`);
	hg.addColorStop(.35, `rgba(255,225,175,${A * .45})`);
	hg.addColorStop(1, "rgba(255,180,110,0)");
	ctx.fillStyle = hg;
	ctx.beginPath();
	ctx.arc(0, 0, r * 1.75, 0, 6.2832);
	ctx.arc(0, 0, r * 1.02, 0, 6.2832, true);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(0, 0, r * 1.32, r * 1.28, 0, Math.PI, 6.2832);
	ctx.strokeStyle = `rgba(255,252,244,${A * .45})`;
	ctx.lineWidth = Math.max(1, r * .16);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(0, 0, r, 0, 6.2832);
	ctx.fillStyle = "#000";
	ctx.fill();
	ctx.beginPath();
	ctx.arc(0, 0, r * 1.05, 0, 6.2832);
	ctx.strokeStyle = `rgba(255,248,232,${A * .95})`;
	ctx.lineWidth = Math.max(1, r * .035);
	ctx.stroke();
	ctx.save();
	ctx.beginPath();
	ctx.rect(-disk * 1.05, r * .02, disk * 2.1, disk);
	ctx.clip();
	ctx.save();
	ctx.scale(1, flat);
	ctx.fillStyle = diskGrad();
	ctx.beginPath();
	ctx.arc(0, 0, disk * .9, 0, 6.2832);
	ctx.arc(0, 0, r * 1.24, 0, 6.2832, true);
	ctx.fill();
	ctx.restore();
	ctx.restore();
	ctx.restore();
}
//#endregion
//#region src/engine/deep.js
var dsoProj = [];
var pulsarProj = [];
var cluProj = [];
function drawDSO() {
	LBL.prio = 62;
	dsoProj.length = 0;
	if (!S.dso) return;
	const deep = Math.abs(tNow()) > 3e5;
	for (const o of DSO) {
		if (deep && o.d < 100) continue;
		const R = scale(o.d);
		o._x = o._dir[0] * R;
		o._y = o._dir[1] * R;
		o._z = o._dir[2] * R;
		const p = project(o._x, o._y, o._z);
		if (p.depth <= V.NEAR) continue;
		if (p.x < -70 || p.x > W + 70 || p.y < -70 || p.y > H + 70) continue;
		const c = (DSO_T[o.t] || DSO_T.EN).c, sz = Math.max(3, Math.min(26, V.foc * .02 / p.depth));
		const sel = o === S.hover || o === S.pinned;
		o._sx = p.x;
		o._sy = p.y;
		const bhR = o.t === "BH" ? Math.min(Math.min(W, H) * .22, V.foc * .028 / p.depth) : 0;
		if (bhR >= 9) drawBlackHole(p.x, p.y, bhR, .95);
		else {
			ctx.drawImage(blobSprite(c[0], c[1], c[2], .62, .24), p.x - sz * 1.9, p.y - sz * 1.9, sz * 3.8, sz * 3.8);
			if (o.t === "GW") {
				V.gwOnScreen = true;
				const ph = performance.now() / 2600 % 1;
				for (let k = 0; k < 3; k++) {
					const f = (ph + k / 3) % 1, rr = sz * (.9 + f * 3.6);
					ctx.beginPath();
					ctx.arc(p.x, p.y, rr, 0, 6.2832);
					ctx.strokeStyle = `rgba(130,255,220,${(1 - f) * .5})`;
					ctx.lineWidth = 1.2;
					ctx.stroke();
				}
			}
			if (o.t === "GC" || o.t === "OC") {
				const n = o.t === "GC" ? 10 : 6;
				for (let k = 0; k < n; k++) {
					const a = k * 2.399, rr = sz * (.25 + .6 * (k * 7 % 5 / 5));
					ctx.beginPath();
					ctx.arc(p.x + Math.cos(a) * rr, p.y + Math.sin(a) * rr, .9, 0, 6.2832);
					ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.9)`;
					ctx.fill();
				}
			} else {
				ctx.beginPath();
				ctx.arc(p.x, p.y, Math.max(1, sz * .32), 0, 6.2832);
				ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.8)`;
				ctx.fill();
			}
		}
		if (sel) {
			ctx.beginPath();
			ctx.arc(p.x, p.y, sz * 1.9 + 6, 0, 6.2832);
			ctx.strokeStyle = "rgba(79,214,200,.9)";
			ctx.lineWidth = 1.2;
			ctx.stroke();
		}
		dsoProj.push(o);
		ctx.font = (sel ? "10px" : "9px") + " ui-monospace,monospace";
		ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${sel ? 1 : .72})`;
		ctx.fillText(o.n, p.x + sz * 1.9 + 3, p.y + 3);
	}
}
function drawClusters() {
	LBL.prio = 62;
	cluProj.length = 0;
	if (!S.oclu) return;
	for (const c of CLUSTERS) {
		const R = scale(c.d);
		const x = c._dir[0] * R, y = c._dir[1] * R, z = c._dir[2] * R;
		const p = project(x, y, z);
		if (p.depth <= V.NEAR) continue;
		if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) continue;
		const selc = c === S.hover || c === S.pinned;
		const raw = V.foc * .012 / p.depth;
		if (raw < .1 && !selc) continue;
		const sz = Math.max(1, Math.min(3.2, raw));
		c._x = x;
		c._y = y;
		c._z = z;
		c._sx = p.x;
		c._sy = p.y;
		const cc = CLU_T[c.ct || 0].c;
		if (!(glStars() && glBufC)) {
			ctx.beginPath();
			ctx.arc(p.x, p.y, sz, 0, 6.2832);
			ctx.fillStyle = `rgba(${cc[0]},${cc[1]},${cc[2]},0.55)`;
			ctx.fill();
		}
		cluProj.push(c);
		if (selc) {
			ctx.beginPath();
			ctx.arc(p.x, p.y, sz + 5, 0, 6.2832);
			ctx.strokeStyle = "rgba(79,214,200,.9)";
			ctx.lineWidth = 1;
			ctx.stroke();
			ctx.font = "9px ui-monospace,monospace";
			ctx.fillStyle = `rgba(${cc[0]},${cc[1]},${cc[2]},0.95)`;
			ctx.fillText(c.n, p.x + sz + 4, p.y + 3);
		}
	}
}
function drawPulsars() {
	LBL.prio = 40;
	pulsarProj.length = 0;
	if (!S.psr) return;
	for (const q of PULSARS) {
		const R = scale(q.d);
		const x = q._dir[0] * R, y = q._dir[1] * R, z = q._dir[2] * R;
		const p = project(x, y, z);
		if (p.depth <= V.NEAR) continue;
		if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) continue;
		const selp = q === S.hover || q === S.pinned;
		const raw = V.foc * .02 / p.depth;
		if (raw < .13 && !selp) continue;
		const sz = Math.max(1, Math.min(3.4, raw));
		q._x = x;
		q._y = y;
		q._z = z;
		q._sx = p.x;
		q._sy = p.y;
		if (!(glStars() && glBufP)) {
			ctx.beginPath();
			ctx.arc(p.x, p.y, sz, 0, 6.2832);
			ctx.fillStyle = "rgba(150,220,255,0.72)";
			ctx.fill();
		}
		pulsarProj.push(q);
		if (selp) {
			ctx.beginPath();
			ctx.arc(p.x, p.y, sz + 5, 0, 6.2832);
			ctx.strokeStyle = "rgba(79,214,200,.9)";
			ctx.lineWidth = 1;
			ctx.stroke();
			ctx.font = "9px ui-monospace,monospace";
			ctx.fillStyle = "rgba(150,220,255,0.95)";
			ctx.fillText(q.n, p.x + sz + 4, p.y + 3);
		}
	}
}
var S2EL = {
	e: .884649,
	i: 134.567 * Math.PI / 180,
	O: 228.171 * Math.PI / 180,
	w: 66.263 * Math.PI / 180,
	Pd: 16.0455 * 365.25,
	Tp: 2458257.9
};
function s2XY(jd) {
	let M = 6.28318 * ((jd - S2EL.Tp) / S2EL.Pd % 1);
	const e = S2EL.e;
	let E = M + e * Math.sin(M) * (1 + e * Math.cos(M));
	for (let k = 0; k < 24; k++) {
		const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
		E -= dE;
		if (Math.abs(dE) < 1e-9) break;
	}
	const X = Math.cos(E) - e, Y = Math.sqrt(1 - e * e) * Math.sin(E);
	const cO = Math.cos(S2EL.O), sO = Math.sin(S2EL.O), ci = Math.cos(S2EL.i), cw = Math.cos(S2EL.w), sw = Math.sin(S2EL.w);
	const A2 = cO * cw - sO * sw * ci, B2 = sO * cw + cO * sw * ci, F2 = -cO * sw - sO * cw * ci, G2 = -sO * sw + cO * cw * ci;
	return [B2 * X + G2 * Y, A2 * X + F2 * Y];
}
function drawS2() {
	LBL.prio = 62;
	if (!S.mw || !sgraScreen) return;
	const sgW = [
		SGRA._x,
		SGRA._y,
		SGRA._z
	];
	const dS = Math.hypot(camPos[0] - sgW[0], camPos[1] - sgW[1], camPos[2] - sgW[2]);
	const a2 = S.pinned === SGRA ? 1 : lodA(dS, 3, 7);
	if (a2 < .02) return;
	const d0 = SGRA._dir, cd = Math.max(1e-6, Math.hypot(d0[0], d0[1]));
	const east = camDir2([
		-d0[1] / cd,
		d0[0] / cd,
		0
	]);
	const north = camDir2([
		-d0[2] * d0[0] / cd,
		-d0[2] * d0[1] / cd,
		cd
	]);
	const K = Math.min(W, H) * .11 * a2;
	ctx.globalAlpha = a2;
	ctx.beginPath();
	for (let k = 0; k <= 48; k++) {
		const eo = s2XY(S2EL.Tp + k / 48 * S2EL.Pd);
		const qx = sgraScreen.x + (east[0] * eo[0] + north[0] * eo[1]) * K;
		const qy = sgraScreen.y + (east[1] * eo[0] + north[1] * eo[1]) * K;
		if (k === 0) ctx.moveTo(qx, qy);
		else ctx.lineTo(qx, qy);
	}
	ctx.strokeStyle = "rgba(255,220,150,0.4)";
	ctx.lineWidth = 1;
	ctx.stroke();
	const p2 = s2XY(solarJD());
	const sx = sgraScreen.x + (east[0] * p2[0] + north[0] * p2[1]) * K;
	const sy = sgraScreen.y + (east[1] * p2[0] + north[1] * p2[1]) * K;
	ctx.beginPath();
	ctx.arc(sx, sy, 2.6, 0, 6.2832);
	ctx.fillStyle = "rgba(255,235,180,0.95)";
	ctx.fill();
	ctx.font = "9px ui-monospace,monospace";
	ctx.fillStyle = "rgba(255,225,160,0.85)";
	ctx.fillText("S2 · 16-yr orbit · pericentre 2018/2034", sx + 5, sy + 3);
	ctx.globalAlpha = 1;
}
function drawEdge() {
	LBL.prio = 14;
	const R = scale(143e8);
	for (let pl = 0; pl < 3; pl++) {
		pathBegin();
		for (let a = 0; a <= 6.2833; a += .13) {
			const ca = Math.cos(a) * R, sa = Math.sin(a) * R;
			const w = pl === 0 ? [
				ca,
				sa,
				0
			] : pl === 1 ? [
				ca,
				0,
				sa
			] : [
				0,
				ca,
				sa
			];
			pathPt(project(w[0], w[1], w[2]));
		}
		pathStroke("rgba(120,150,255,0.11)", 1);
	}
	const lp = project(R, 0, 0);
	if (lp.depth > V.NEAR) {
		ctx.font = "9px ui-monospace,monospace";
		ctx.fillStyle = "rgba(140,165,255,0.5)";
		ctx.fillText("observable universe · CMB ~46 Gly", lp.x + 5, lp.y);
	}
}
//#endregion
//#region src/engine/galaxies.js
var galProj = [];
function projectGalaxies() {
	galProj.length = 0;
	if (!S.galaxies) return;
	for (const g of GAL) {
		const R = scale(g.mpc * 1e6);
		g._x = g.dx * R;
		g._y = g.dy * R;
		g._z = g.dz * R;
		const p = projectInto(g._x, g._y, g._z, _pj);
		if (p.depth <= V.NEAR) continue;
		if (p.x < -90 || p.x > W + 90 || p.y < -90 || p.y > H + 90) continue;
		g._sx = p.x;
		g._sy = p.y;
		g._depth = p.depth;
		g._z2 = p.z2;
		galProj.push(g);
	}
	galProj.sort((a, b) => a._z2 - b._z2);
}
function drawGalaxies(list) {
	LBL.prio = 30;
	const farView = camDist <= 1e-9 || invScale(camDist) > 2e3;
	for (const g of list) {
		const s = Math.max(1.4, V.foc * .011 / g._depth * g._gs);
		const c = g.c, a = Math.max(.25, Math.min(.95, 1.7 - g._depth * .045));
		if (s > 4) {
			const ba = g.ba && g.ba > .05 ? g.ba : 1;
			const sprite = blobSprite(c[0], c[1], c[2], .85, .3);
			ctx.globalAlpha = a;
			if (ba > .985 || g.pa === void 0) ctx.drawImage(sprite, g._sx - s, g._sy - s, s * 2, s * 2);
			else {
				const dx3 = g.dx, dy3 = g.dy, dz3 = g.dz, cd3 = Math.max(1e-6, Math.hypot(dx3, dy3));
				camDir2i(-dy3 / cd3, dx3 / cd3, 0);
				const e2x = _d2x, e2y = _d2y;
				camDir2i(-dz3 * dx3 / cd3, -dz3 * dy3 / cd3, cd3);
				const n2x = _d2x, n2y = _d2y;
				const pa = g.pa * .0174533, cpa = Math.cos(pa), spa = Math.sin(pa);
				const th = Math.atan2(n2y * cpa + e2y * spa, n2x * cpa + e2x * spa);
				const ct = Math.cos(th), stt = Math.sin(th);
				ctx.setTransform(DPR * ct, DPR * stt, -DPR * stt * ba, DPR * ct * ba, DPR * g._sx, cv.height / H * g._sy);
				ctx.drawImage(sprite, -s, -s, s * 2, s * 2);
				ctx.setTransform(DPR, 0, 0, cv.height / H, 0, 0);
			}
			ctx.globalAlpha = 1;
		} else if (s < 1.8) {
			ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${Math.min(1, a * .55 + .3)})`;
			ctx.fillRect(g._sx - s, g._sy - s, s * 2, s * 2);
		} else {
			ctx.beginPath();
			ctx.arc(g._sx, g._sy, s, 0, 6.2832);
			ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a * .55})`;
			ctx.fill();
		}
		if (s >= 1.8) {
			ctx.beginPath();
			ctx.arc(g._sx, g._sy, Math.max(.8, s * .26), 0, 6.2832);
			ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${Math.min(1, a + .25)})`;
			ctx.fill();
		}
		const sel = g === S.hover || g === S.pinned;
		if (sel) {
			ctx.beginPath();
			ctx.arc(g._sx, g._sy, s + 6, 0, 6.2832);
			ctx.strokeStyle = "rgba(79,214,200,.9)";
			ctx.lineWidth = 1.2;
			ctx.stroke();
		}
		if (sel || g.f && farView) {
			ctx.font = (sel ? "11px" : "10px") + " ui-monospace,monospace";
			ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${sel ? 1 : .72})`;
			LBL.prio = sel ? 92 : 30;
			ctx.fillText(g.n, g._sx + s + 4, g._sy + 3);
			LBL.prio = 30;
		}
	}
}
var LY_PC = 1 / PC2LY;
//#endregion
//#region src/engine/grids.js
var RINGS = [
	{
		pc: 1 * AU_PC,
		l: "1 AU"
	},
	{
		pc: 30 * AU_PC,
		l: "30 AU"
	},
	{
		pc: 1 * LY_PC,
		l: "1 ly"
	},
	{
		pc: 100 * LY_PC,
		l: "100 ly"
	},
	{
		pc: 1e4 * LY_PC,
		l: "10,000 ly"
	},
	{
		pc: 1e6 * LY_PC,
		l: "1 Mly"
	},
	{
		pc: 1e7 * LY_PC,
		l: "10 Mly"
	}
];
function drawRings() {
	LBL.prio = 14;
	ctx.save();
	for (const R of RINGS) {
		const dr = scale(R.pc);
		pathBegin();
		for (let a = 0; a <= 72; a++) {
			const th = a / 72 * 6.2832;
			pathPt(project(Math.cos(th) * dr, 0, Math.sin(th) * dr));
		}
		const drew = PATH.n > 1;
		pathStroke("rgba(120,140,190,.11)", 1);
		const lp = project(dr, 0, 0);
		if (lp.depth > V.NEAR && drew) {
			ctx.font = "9px ui-monospace,monospace";
			ctx.fillStyle = "rgba(120,140,190,.42)";
			ctx.fillText(R.l, lp.x + 4, lp.y - 3);
		}
	}
	ctx.restore();
}
function drawSkyGrid() {
	LBL.prio = 14;
	const R = scale(BND * 3);
	ctx.save();
	for (const dec of [
		-60,
		-30,
		0,
		30,
		60
	]) {
		pathBegin();
		for (let k = 0; k <= 96; k++) {
			const d = dirOf(k / 96 * 360, dec);
			pathPt(project(d[0] * R, d[1] * R, d[2] * R));
		}
		pathStroke(dec === 0 ? "rgba(150,175,215,.34)" : "rgba(130,150,190,.15)", dec === 0 ? 1.2 : 1, [1, 4]);
	}
	for (let h = 0; h < 12; h++) {
		pathBegin();
		for (let k = 0; k <= 48; k++) {
			const d = dirOf(h * 30, -90 + k / 48 * 180);
			pathPt(project(d[0] * R, d[1] * R, d[2] * R));
		}
		pathStroke("rgba(130,150,190,.13)", 1, [1, 4]);
	}
	ctx.font = "9px ui-monospace,monospace";
	ctx.fillStyle = "rgba(150,175,215,.6)";
	for (let h = 0; h < 24; h += 6) {
		const d = dirOf(h * 15, 2), p = project(d[0] * R, d[1] * R, d[2] * R);
		if (p.depth > V.NEAR && !offscr(p)) ctx.fillText(h + "h", p.x + 3, p.y - 4);
	}
	const np = dirOf(0, 90), pp = project(np[0] * R, np[1] * R, np[2] * R);
	if (pp.depth > V.NEAR && !offscr(pp)) ctx.fillText("celestial N pole", pp.x + 4, pp.y);
	ctx.restore();
}
function drawGalGrid() {
	LBL.prio = 14;
	const R = scale(BND * 3.2);
	const gx = GC, gz = NGP, gy = [
		gz[1] * gx[2] - gz[2] * gx[1],
		gz[2] * gx[0] - gz[0] * gx[2],
		gz[0] * gx[1] - gz[1] * gx[0]
	];
	const dir = (l, b) => {
		const cl = Math.cos(l), sl = Math.sin(l), cb = Math.cos(b), sb = Math.sin(b);
		return [
			gx[0] * cb * cl + gy[0] * cb * sl + gz[0] * sb,
			gx[1] * cb * cl + gy[1] * cb * sl + gz[1] * sb,
			gx[2] * cb * cl + gy[2] * cb * sl + gz[2] * sb
		];
	};
	ctx.save();
	for (const b of [
		-60,
		-30,
		0,
		30,
		60
	]) {
		pathBegin();
		for (let k = 0; k <= 96; k++) {
			const d = dir(k / 96 * 6.2832, b * D2R);
			pathPt(project(d[0] * R, d[1] * R, d[2] * R));
		}
		pathStroke(b === 0 ? "rgba(235,200,150,.32)" : "rgba(215,180,135,.14)", b === 0 ? 1.2 : 1, [1, 4]);
	}
	for (let i = 0; i < 12; i++) {
		pathBegin();
		for (let k = 0; k <= 48; k++) {
			const d = dir(i / 12 * 6.2832, (-90 + k / 48 * 180) * D2R);
			pathPt(project(d[0] * R, d[1] * R, d[2] * R));
		}
		pathStroke("rgba(215,180,135,.12)", 1, [1, 4]);
	}
	ctx.font = "9px ui-monospace,monospace";
	ctx.fillStyle = "rgba(235,200,150,.6)";
	for (const l of [
		0,
		90,
		180,
		270
	]) {
		const d = dir(l * D2R, .03), p = project(d[0] * R, d[1] * R, d[2] * R);
		if (p.depth > V.NEAR && !offscr(p)) ctx.fillText("l=" + l + "°", p.x + 3, p.y - 4);
	}
	const np = dir(0, Math.PI / 2), pp = project(np[0] * R, np[1] * R, np[2] * R);
	if (pp.depth > V.NEAR && !offscr(pp)) ctx.fillText("galactic N pole", pp.x + 4, pp.y);
	ctx.restore();
}
function drawRadioSphere() {
	LBL.prio = 14;
	const lyr = 2e3 + (solarJD() - 2451545) / 365.25 - 1901;
	if (lyr < 1) return;
	const R = scale(lyr * .306601);
	ctx.save();
	for (const [ax, ay] of [
		[0, 1],
		[0, 2],
		[1, 2]
	]) {
		pathBegin();
		for (let a = 0; a <= 72; a++) {
			const th = a / 72 * 6.2832, v = [
				0,
				0,
				0
			];
			v[ax] = Math.cos(th) * R;
			v[ay] = Math.sin(th) * R;
			pathPt(project(v[0], v[1], v[2]));
		}
		pathStroke("rgba(120,225,235,.22)", 1, [2, 5]);
	}
	const lp = project(R * .71, R * .71, 0);
	if (lp.depth > V.NEAR && !offscr(lp)) {
		ctx.font = "9px ui-monospace,monospace";
		ctx.fillStyle = "rgba(130,225,235,.6)";
		ctx.fillText("our radio signals · " + Math.round(lyr) + " ly out", lp.x + 4, lp.y - 3);
	}
	ctx.restore();
}
function drawBubble() {
	LBL.prio = 14;
	ctx.save();
	for (const [e1, e2, a, b] of [
		[
			GPu,
			GPv,
			95,
			95
		],
		[
			GPu,
			NGP,
			95,
			150
		],
		[
			GPv,
			NGP,
			95,
			150
		]
	]) {
		pathBegin();
		for (let k = 0; k <= 72; k++) {
			const th = k / 72 * 6.2832, ca = Math.cos(th) * a, sb = Math.sin(th) * b;
			const v = [
				e1[0] * ca + e2[0] * sb,
				e1[1] * ca + e2[1] * sb,
				e1[2] * ca + e2[2] * sb
			];
			const len = Math.hypot(v[0], v[1], v[2]) || 1, R = scale(len);
			pathPt(project(v[0] / len * R, v[1] / len * R, v[2] / len * R));
		}
		pathStroke("rgba(150,190,255,.17)", 1, [3, 6]);
	}
	const lt = scale(150), lp = project(NGP[0] * lt, NGP[1] * lt, NGP[2] * lt);
	if (lp.depth > V.NEAR && !offscr(lp)) {
		ctx.font = "9px ui-monospace,monospace";
		ctx.fillStyle = "rgba(160,195,255,.55)";
		ctx.fillText("Local Bubble · blown clear by ~15 supernovae", lp.x + 4, lp.y - 3);
	}
	ctx.restore();
}
function drawVeilSphere() {
	LBL.prio = 14;
	const dr = compress(BND);
	const planes = [
		[0, 1],
		[0, 2],
		[1, 2]
	];
	ctx.save();
	for (const [ax, ay] of planes) {
		pathBegin();
		for (let a = 0; a <= 72; a++) {
			const th = a / 72 * 6.2832, co = Math.cos(th) * dr, si = Math.sin(th) * dr;
			const v = [
				0,
				0,
				0
			];
			v[ax] = co;
			v[ay] = si;
			pathPt(project(v[0], v[1], v[2]));
		}
		pathStroke("rgba(230,71,60,.20)", 1);
	}
	const lp = project(0, dr, 0);
	if (lp.depth > V.NEAR) {
		ctx.font = "9px ui-monospace,monospace";
		ctx.fillStyle = "rgba(230,71,60,.55)";
		ctx.fillText("charted neighbourhood · " + fmt(BND * PC2LY) + " ly", lp.x + 5, lp.y);
	}
	ctx.restore();
}
//#endregion
//#region src/engine/measure.js
var measureMode = false;
var measA = null;
var measB = null;
function measWorld(P) {
	const r = Math.hypot(P[0], P[1], P[2]);
	if (r < 1e-15) return [
		0,
		0,
		0
	];
	const R = scale(r) / r;
	return [
		P[0] * R,
		P[1] * R,
		P[2] * R
	];
}
var measName = nameOf;
function drawMeasure() {
	LBL.prio = 100;
	if (!measA || !measA.P) return;
	const wA = measWorld(measA.P), pA = project(wA[0], wA[1], wA[2]);
	ctx.beginPath();
	ctx.arc(pA.x, pA.y, 6, 0, 6.2832);
	ctx.strokeStyle = "rgba(255,207,107,.9)";
	ctx.lineWidth = 1.4;
	ctx.stroke();
	if (!measB || !measB.P) return;
	const wB = measWorld(measB.P), pB = project(wB[0], wB[1], wB[2]);
	if (pA.depth <= V.NEAR || pB.depth <= V.NEAR) return;
	ctx.beginPath();
	ctx.arc(pB.x, pB.y, 6, 0, 6.2832);
	ctx.stroke();
	pathBegin();
	pathPt(pA);
	pathPt(pB);
	pathStroke("rgba(255,207,107,.7)", 1.4, [5, 4]);
	const dpc = Math.hypot(measA.P[0] - measB.P[0], measA.P[1] - measB.P[1], measA.P[2] - measB.P[2]);
	const txt = (dpc < .001 ? (dpc / AU_PC).toFixed(2) + " AU" : fmt(dpc * PC2LY) + " ly · light needs " + fmt(dpc * PC2LY) + " yr") + " · " + angularText(measA.P, measB.P);
	ctx.font = "11px ui-monospace,monospace";
	ctx.fillStyle = "rgba(255,220,140,.95)";
	ctx.fillText(txt, (pA.x + pB.x) / 2 + 8, (pA.y + pB.y) / 2 - 6);
}
function measurePick(hit) {
	const P = physPos(hit);
	if (!P) return;
	if (!measA || measB) {
		measA = {
			o: hit,
			P
		};
		measB = null;
		msg(measName(hit) + " — pick a second object");
	} else {
		measB = {
			o: hit,
			P
		};
		const dpc = Math.hypot(measA.P[0] - P[0], measA.P[1] - P[1], measA.P[2] - P[2]);
		msg(measName(measA.o) + " ↔ " + measName(hit) + " = " + (dpc < .001 ? (dpc / AU_PC).toFixed(2) + " AU" : fmt(dpc * PC2LY) + " ly") + " · " + angularText(measA.P, P));
	}
	V.dirty = true;
}
function measureToggle() {
	measureMode = !measureMode;
	measA = measB = null;
	measure.set(measureMode);
	msg(measureMode ? "Measure: click the first object" : "");
	V.dirty = true;
}
api.measure = measureToggle;
function angularText(A, B) {
	const a = [
		A[0] - ctr.x,
		A[1] - ctr.y,
		A[2] - ctr.z
	], b = [
		B[0] - ctr.x,
		B[1] - ctr.y,
		B[2] - ctr.z
	];
	const la = Math.hypot(a[0], a[1], a[2]) || 1e-12, lb = Math.hypot(b[0], b[1], b[2]) || 1e-12;
	for (let i = 0; i < 3; i++) {
		a[i] /= la;
		b[i] /= lb;
	}
	const chord = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]), sep = 2 * Math.asin(Math.min(1, chord / 2)) * 57.29577951;
	const [ra1, de1] = radec(a[0], a[1], a[2]), [ra2, de2] = radec(b[0], b[1], b[2]), D = Math.PI / 180;
	const dA = (ra2 - ra1) * D, pa = Math.atan2(Math.sin(dA) * Math.cos(de2 * D), Math.cos(de1 * D) * Math.sin(de2 * D) - Math.sin(de1 * D) * Math.cos(de2 * D) * Math.cos(dA)) * 57.29577951;
	return `sep ${sep >= 1 ? `${Math.floor(sep)}°${String(Math.round((sep - Math.floor(sep)) * 60)).padStart(2, "0")}′` : sep * 60 >= 1 ? `${Math.floor(sep * 60)}′${String(Math.round((sep * 60 - Math.floor(sep * 60)) * 60)).padStart(2, "0")}″` : `${(sep * 3600).toFixed(1)}″`} · PA ${((pa + 360) % 360).toFixed(1)}°`;
}
//#endregion
//#region src/engine/sky.js
function skyAlpha() {
	if (S.skyMode && camDist > 1e-4) return 0;
	const d = camDist > 1e-9 ? invScale(camDist) : 0;
	return Math.max(0, Math.min(1, (80 - d) / 60));
}
function drawConstellations() {
	LBL.prio = 14;
	if (!S.con) return;
	const A = skyAlpha();
	if (A <= .02) return;
	const R = scale(30);
	for (const k of CONS) {
		for (const pl of k._L) {
			pathBegin();
			for (const d of pl) pathPt(project(d[0] * R, d[1] * R, d[2] * R));
			pathStroke(`rgba(128,150,215,${.15 * A})`, 1);
		}
		const cp = project(k.c[0] * R, k.c[1] * R, k.c[2] * R);
		if (cp.depth > V.NEAR) {
			ctx.font = "8.5px ui-monospace,monospace";
			ctx.fillStyle = `rgba(150,170,225,${.38 * A})`;
			ctx.fillText(CON_NAME[k.id] || k.id, cp.x + 3, cp.y);
		}
	}
}
function drawShowers() {
	LBL.prio = 40;
	if (skyAlpha() <= .02) return;
	const act = activeShowers(cmeSolarMs());
	if (!act.length) return;
	const R = scale(30);
	for (const s of act) {
		const d = dirOf(s.ra, s.dec), p = project(d[0] * R, d[1] * R, d[2] * R);
		if (p.depth <= V.NEAR) continue;
		ctx.strokeStyle = "rgba(190,255,200,0.55)";
		ctx.lineWidth = 1;
		for (let k = 0; k < 4; k++) {
			const a = k * .7854;
			const dx = Math.cos(a) * 6, dy = Math.sin(a) * 6;
			ctx.beginPath();
			ctx.moveTo(p.x - dx, p.y - dy);
			ctx.lineTo(p.x + dx, p.y + dy);
			ctx.stroke();
		}
		ctx.beginPath();
		ctx.arc(p.x, p.y, 2, 0, 6.2832);
		ctx.fillStyle = "rgba(210,255,215,0.9)";
		ctx.fill();
		ctx.font = "9px ui-monospace,monospace";
		ctx.fillStyle = "rgba(190,255,200,0.75)";
		ctx.fillText(`${s.n} · ZHR ${s.zhr}`, p.x + 9, p.y + 3);
	}
}
//#endregion
//#region src/engine/render.js
var visSys = 0;
var visPl = 0;
var nearD = Infinity;
var farD = 0;
var order = [];
function render() {
	V.cx = W / 2;
	V.cy = H / 2;
	V.foc = Math.min(W, H) * .62;
	V.gwOnScreen = false;
	ctx.clearRect(0, 0, W, H);
	lblReset();
	if (surfUpdate()) {
		drawSurface();
		lblFlush();
		updateHUD();
		return;
	}
	camBasis();
	V.NEAR = S.realScale ? Math.max(1e-13, S.camZ * .02) : Math.min(.05, Math.max(.001, S.camZ * .35));
	V.solarA = lodA(camDist, .001, .1);
	V.sysA = 0;
	if (V.focusSys && V.focusSysW) V.sysA = lodA(Math.hypot(camPos[0] - V.focusSysW[0], camPos[1] - V.focusSysW[1], camPos[2] - V.focusSysW[2]), 8e-6, 8e-4);
	calcLens();
	if (S.rings) P("rings", drawRings);
	if (S.veil) P("veil", drawVeilSphere);
	if (S.radio) P("radio", drawRadioSphere);
	if (S.bubble) P("bubble", drawBubble);
	if (S.grid) P("grid", drawSkyGrid);
	if (S.ggrid) P("ggrid", drawGalGrid);
	P("gal:project", projectGalaxies);
	const backG = [], frontG = [];
	for (const g of galProj) (g._z2 < 0 ? backG : frontG).push(g);
	P("gal:back", () => drawGalaxies(backG));
	order.length = 0;
	visSys = 0;
	visPl = 0;
	nearD = Infinity;
	farD = 0;
	const tMove = tNow();
	for (let i = 0; i < STARS.length; i++) {
		const s = STARS[i];
		if (s.fy > S.year && s.fy !== 0) continue;
		if (S.facHidden.has(s.fac)) continue;
		let ddx = s._dx, ddy = s._dy, ddz = s._dz, dNow = s._r;
		if (tMove) {
			const q = hostPos(s, tMove);
			dNow = Math.hypot(q[0], q[1], q[2]) || 1e-9;
			ddx = q[0] / dNow;
			ddy = q[1] / dNow;
			ddz = q[2] / dNow;
		}
		const dr = compress(dNow);
		const p = projectInto(ddx * dr, ddy * dr, ddz * dr, _pj);
		if (p.depth <= V.NEAR) continue;
		if (p.x < -90 || p.x > W + 90 || p.y < -90 || p.y > H + 90) continue;
		s._sx = p.x;
		s._sy = p.y;
		s._depth = p.depth;
		s._z2 = p.z2;
		order.push(s);
		visSys++;
		visPl += planetsBy(s, S.year);
		if (s._r < nearD) nearD = s._r;
		if (s._r > farD) farD = s._r;
	}
	P("stars:sort", () => order.sort((a, b) => a._z2 - b._z2));
	P("hyg:project", projectHyg);
	if (glStars()) {
		P("gl:render", glRender);
		if (S.skyMode) P("hyg:labels", drawHygLabels);
	} else {
		glClearCanvas();
		P("hyg:draw", drawHyg);
	}
	if (S.user) P("user", () => {
		projectUser();
		drawUser();
	});
	if (S.skyMode) P("movers", drawMovers);
	const sp = project(0, 0, 0);
	const gpuH = glStars() && glBufH;
	for (const s of order) {
		const size = Math.max(.7, V.foc * .0075 / s._depth * radiusScale(s._sr));
		const fade = Math.max(.12, Math.min(1, 1.9 - s._depth * .55));
		const isNew = s.fy === S.year && s.fy !== 0;
		const isSel = s === S.hover || s === S.pinned || s === S.focusStar;
		let col = S.facColor ? (FAC[s.fac] || FAC.other).c : s._col, a = fade;
		let veil = 0;
		if (S.veil && s._r > BND) {
			veil = Math.min(1, (s._r - BND) / (BND * 1.6));
			col = [
				col[0] + (232 - col[0]) * veil * .85,
				col[1] + (58 - col[1]) * veil * .85,
				col[2] + (50 - col[2]) * veil * .85
			];
			a *= 1 - veil * .4;
		}
		if (isNew) {
			col = [
				79,
				214,
				200
			];
			a = 1;
			veil = 0;
		}
		const cr = col[0] | 0, cg = col[1] | 0, cb = col[2] | 0;
		if (!gpuH) {
			ctx.beginPath();
			ctx.arc(s._sx, s._sy, isSel ? size + 1.6 : size, 0, 6.2832);
			ctx.fillStyle = `rgba(${cr},${cg},${cb},${a})`;
			ctx.fill();
			if (size > 1.6 || isNew || isSel || veil > .35) {
				ctx.beginPath();
				ctx.arc(s._sx, s._sy, (isSel ? size + 1.6 : size) * (veil > .35 ? 3 : 2.4), 0, 6.2832);
				ctx.fillStyle = `rgba(${cr},${cg},${cb},${a * (veil > .35 ? .16 : .1)})`;
				ctx.fill();
			}
		}
		if (isSel) {
			ctx.beginPath();
			ctx.arc(s._sx, s._sy, size + 7, 0, 6.2832);
			ctx.strokeStyle = "rgba(79,214,200,.9)";
			ctx.lineWidth = 1.2;
			ctx.stroke();
		}
	}
	const sm = 1 - V.solarA;
	if (sm > .02) {
		ctx.globalAlpha = sm;
		ctx.beginPath();
		ctx.arc(sp.x, sp.y, 4.2, 0, 6.2832);
		ctx.fillStyle = "#eafffb";
		ctx.fill();
		ctx.beginPath();
		ctx.arc(sp.x, sp.y, 9, 0, 6.2832);
		ctx.strokeStyle = "rgba(255,255,255,.5)";
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(sp.x, sp.y, 15, 0, 6.2832);
		ctx.fillStyle = "rgba(255,255,255,.05)";
		ctx.fill();
		ctx.globalAlpha = 1;
	}
	drawGalaxies(frontG);
	if (V.solarA < .5 && V.sysA < .5) {
		drawConstellations();
		if (S.met) drawShowers();
		drawDSO();
		drawPulsars();
		drawClusters();
		if (S.mw3d) drawGalaxyModel();
		drawMW();
		drawS2();
		if (S.edge) drawEdge();
	}
	if (lensPar && lensPar.e > 12) {
		ctx.beginPath();
		ctx.arc(lensPar.x, lensPar.y, lensPar.e, 0, 6.2832);
		ctx.setLineDash([2, 6]);
		ctx.strokeStyle = "rgba(255,215,150,0.35)";
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.font = "9px ui-monospace,monospace";
		ctx.fillStyle = "rgba(255,215,150,0.6)";
		ctx.fillText("Einstein ring · lensing exaggerated ×300", lensPar.x + lensPar.e * .72, lensPar.y - lensPar.e * .72);
	}
	if (S.galaxies && sp.depth > V.NEAR && V.solarA < .5) {
		ctx.globalAlpha = 1 - V.solarA * 2;
		ctx.font = "10px ui-monospace,monospace";
		ctx.fillStyle = "rgba(233,237,250,.55)";
		LBL.prio = 80;
		ctx.fillText("Milky Way · all exoplanets", sp.x + 14, sp.y - 10);
		if (V.solarA < .15) {
			ctx.fillStyle = "rgba(255,238,178,.7)";
			ctx.font = "9px ui-monospace,monospace";
			ctx.fillText("click → into the solar system", sp.x + 14, sp.y + 4);
		}
		LBL.prio = 52;
		ctx.globalAlpha = 1;
	}
	lastSun.x = sp.x;
	lastSun.y = sp.y;
	lastSun.depth = sp.depth;
	if (V.solarA > .01) P("solar", () => drawSolar(V.solarA));
	if (V.sysA > .01) P("system", () => drawSystem(V.sysA));
	else {
		sysProj.length = 0;
		clearTransits();
	}
	if (measureMode) drawMeasure();
	if (V.ROUTE) drawRoute();
	P("nav", drawNav);
	drawScaleBar();
	P("labels:flush", lblFlush);
	P("hud", updateHUD);
	PROF.frames++;
}
var lastSun = {
	x: 0,
	y: 0,
	depth: 0
};
//#endregion
//#region src/engine/labels.js
var _rawFillText = ctx.fillText.bind(ctx);
var LBL = {
	q: [],
	on: true,
	prio: 50,
	grid: /* @__PURE__ */ new Map(),
	cell: 48
};
var LBLW = /* @__PURE__ */ new Map();
var HALO_DX = [
	1,
	-1,
	0,
	0,
	1,
	1,
	-1,
	-1
];
var HALO_DY = [
	0,
	0,
	1,
	-1,
	1,
	-1,
	1,
	-1
];
function _paint(s, x, y, mw, st) {
	ctx.font = st.f;
	ctx.textAlign = st.a;
	ctx.textBaseline = st.b;
	ctx.globalAlpha = st.g;
	ctx.fillStyle = "rgba(5,7,14,0.6)";
	for (let k = 0; k < 8; k++) _rawFillText(s, x + HALO_DX[k], y + HALO_DY[k], mw);
	ctx.fillStyle = st.c;
	_rawFillText(s, x, y, mw);
}
ctx.fillText = (s, x, y, mw) => {
	if (!S.labels) return;
	const st = {
		f: ctx.font,
		c: ctx.fillStyle,
		a: ctx.textAlign,
		b: ctx.textBaseline,
		g: ctx.globalAlpha
	};
	if (!LBL.on) {
		_paint(s, x, y, mw, st);
		ctx.globalAlpha = st.g;
		return;
	}
	LBL.q.push({
		s,
		x,
		y,
		mw,
		p: LBL.prio,
		st
	});
};
function underChrome(x0, y0, x1, y1) {
	for (const r of RESERVED.values()) if (x0 < r[2] && x1 > r[0] && y0 < r[3] && y1 > r[1]) return true;
	return false;
}
function lblReset() {
	LBL.q.length = 0;
	LBL.grid.clear();
	LBL.prio = 52;
}
function lblFits(x0, y0, x1, y1, place) {
	const c = LBL.cell;
	const gx0 = Math.floor(x0 / c), gx1 = Math.floor(x1 / c), gy0 = Math.floor(y0 / c), gy1 = Math.floor(y1 / c);
	for (let gx = gx0; gx <= gx1; gx++) for (let gy = gy0; gy <= gy1; gy++) {
		const bucket = LBL.grid.get(gx * 8192 + gy);
		if (!bucket) continue;
		for (let i = 0; i < bucket.length; i++) {
			const b = bucket[i];
			if (x0 < b[2] && x1 > b[0] && y0 < b[3] && y1 > b[1]) return false;
		}
	}
	if (place) {
		const box = [
			x0,
			y0,
			x1,
			y1
		];
		for (let gx = gx0; gx <= gx1; gx++) for (let gy = gy0; gy <= gy1; gy++) {
			const k = gx * 8192 + gy;
			let bucket = LBL.grid.get(k);
			if (!bucket) LBL.grid.set(k, bucket = []);
			bucket.push(box);
		}
	}
	return true;
}
function lblFlush() {
	if (!LBL.q.length) return;
	const q = LBL.q;
	for (let i = 0; i < q.length; i++) q[i]._i = i;
	q.sort((a, b) => b.p - a.p || a._i - b._i);
	const pf = ctx.font, pc = ctx.fillStyle, pa = ctx.textAlign, pb = ctx.textBaseline, pg = ctx.globalAlpha;
	const budget = W <= 720 ? 34 : 64;
	let drawn = 0;
	for (let i = 0; i < q.length; i++) {
		const it = q[i], st = it.st;
		if (drawn >= budget && it.p < 92) continue;
		ctx.font = st.f;
		const fs = parseFloat(st.f) || 10;
		const mk = st.f + "\0" + it.s;
		let w = LBLW.get(mk);
		if (w === void 0) {
			if (LBLW.size > 4e3) LBLW.clear();
			w = ctx.measureText(it.s).width;
			LBLW.set(mk, w);
		}
		if (it.mw !== void 0 && w > it.mw) w = it.mw;
		let x0 = it.x;
		if (st.a === "center") x0 = it.x - w / 2;
		else if (st.a === "right" || st.a === "end") x0 = it.x - w;
		let y0 = it.y - fs * .8, y1 = it.y + fs * .26;
		if (st.b === "top" || st.b === "hanging") {
			y0 = it.y;
			y1 = it.y + fs * 1.06;
		} else if (st.b === "middle") {
			y0 = it.y - fs * .53;
			y1 = it.y + fs * .53;
		}
		if (x0 > W || x0 + w < 0 || y0 > H || y1 < 0) continue;
		if (it.p < 100 && (x0 + w > W - 2 || x0 < -2)) continue;
		if (it.p < 100 && underChrome(x0, y0, x0 + w, y1)) continue;
		if (it.p < 80 && lastSun.depth > 0 && Math.hypot(it.x - lastSun.x, it.y - lastSun.y) < 24) continue;
		if (!lblFits(x0 - 1, y0 - 1, x0 + w + 1, y1 + 1, true) && it.p < 100) continue;
		_paint(it.s, it.x, it.y, it.mw, st);
		drawn++;
	}
	ctx.font = pf;
	ctx.fillStyle = pc;
	ctx.textAlign = pa;
	ctx.textBaseline = pb;
	ctx.globalAlpha = pg;
}
//#endregion
//#region src/engine/earth.js
var _epicImg = null;
var _epicState = 0;
function epicImage() {
	if (_epicState === 0 && LIVE.epic) {
		_epicState = 1;
		const im = new Image();
		im.crossOrigin = "anonymous";
		im.onload = () => {
			_epicImg = im;
			V.dirty = true;
		};
		im.onerror = () => {
			_epicState = 2;
		};
		im.src = LIVE.epic.url;
	}
	return _epicImg;
}
var _goesImg = null;
var _goesLoading = false;
var _goesTs = 0;
var _goesHi = false;
var _goesFail = 0;
function loadGoes(res) {
	if (_goesLoading) return;
	_goesLoading = true;
	const im = new Image();
	im.crossOrigin = "anonymous";
	im.onload = () => {
		_goesImg = im;
		_goesTs = Date.now();
		_goesHi = res > 2e3;
		_goesLoading = false;
		V.dirty = true;
	};
	im.onerror = () => {
		_goesLoading = false;
		_goesFail++;
	};
	im.src = `https://cdn.star.nesdis.noaa.gov/GOES19/ABI/FD/GEOCOLOR/${res}x${res}.jpg?t=` + Math.floor(Date.now() / 6e5);
}
function earthImage(px) {
	if (_goesFail > 1) return {
		im: epicImage(),
		live: false
	};
	const wantHi = px > 420;
	if (!_goesImg || Date.now() - _goesTs > 600 * 1e3 || wantHi && !_goesHi) loadGoes(wantHi ? 5424 : 1808);
	return _goesImg ? {
		im: _goesImg,
		live: true
	} : {
		im: epicImage(),
		live: false
	};
}
var _gbl = null;
function gmstRad(jd) {
	let g = (280.46061837 + 360.98564736629 * (jd - 2451545)) % 360;
	if (g < 0) g += 360;
	return g * D2R;
}
function globeViewRows() {
	const cy = Math.cos(S.yaw), sy = Math.sin(S.yaw), cp = Math.cos(S.pitch), sp = Math.sin(S.pitch);
	return [
		[
			cy,
			0,
			sy
		],
		[
			sy * sp,
			cp,
			-cy * sp
		],
		[
			-sy * cp,
			sp,
			cy * cp
		]
	];
}
function globeModelRows(t) {
	const ct = Math.cos(t), st = Math.sin(t);
	return [
		[
			ct,
			-st,
			0
		],
		[
			st,
			ct,
			0
		],
		[
			0,
			0,
			1
		]
	];
}
var rows2col = (r) => [
	r[0][0],
	r[1][0],
	r[2][0],
	r[0][1],
	r[1][1],
	r[2][1],
	r[0][2],
	r[1][2],
	r[2][2]
];
var _gblFails = 0;
var _gblNextTry = 0;
function globeInit() {
	if (_gbl !== null) {
		if (_gbl.gl) return _gbl;
		if (_gblFails >= 5 || performance.now() < _gblNextTry) return null;
		_gbl = null;
	}
	const fail = (msg) => {
		_gbl = { gl: null };
		_gblFails++;
		_gblNextTry = performance.now() + 4e3;
		try {
			console.warn(msg);
		} catch (e) {}
		return null;
	};
	const cv2 = document.createElement("canvas");
	const gl = cv2.getContext("webgl", {
		alpha: true,
		antialias: true
	});
	if (!gl) return fail("globe: no WebGL context");
	const mk = (t, src) => {
		const sh = gl.createShader(t);
		gl.shaderSource(sh, src);
		gl.compileShader(sh);
		if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
			console.warn(gl.getShaderInfoLog(sh));
			return null;
		}
		return sh;
	};
	const vsh = mk(gl.VERTEX_SHADER, `attribute vec3 aP; uniform mat3 uV,uM; varying vec3 vS;
    void main(){ vS=aP; vec3 q=uV*(uM*aP); gl_Position=vec4(q.x,q.y,-q.z*0.5,1.0); }`);
	const fsh = mk(gl.FRAGMENT_SHADER, `precision mediump float; varying vec3 vS;
    uniform highp mat3 uV,uM; uniform vec3 uSun; uniform sampler2D uT;
    void main(){
      vec3 n=normalize(vS);
      vec2 uv=vec2(0.5+atan(n.y,n.x)/6.2831853, 0.5-asin(clamp(n.z,-1.0,1.0))/3.14159265);
      vec3 tex=texture2D(uT,uv).rgb;
      vec3 wn=normalize(uM*n);
      float d=dot(wn,uSun);
      float day=smoothstep(-0.08,0.12,d);
      vec3 lit=tex*(0.16+0.92*max(d,0.0));
      vec3 night=tex*0.05+vec3(0.008,0.012,0.028);
      vec3 col=mix(night,lit,day);
      vec3 vn=uV*wn;                                        // subtle atmosphere at the limb
      col+=vec3(0.10,0.22,0.45)*pow(1.0-clamp(vn.z,0.0,1.0),3.0)*(0.25+0.75*day)*0.35;
      gl_FragColor=vec4(col,1.0);
    }`);
	if (!vsh || !fsh) return fail("globe: shader compile failed");
	const pr = gl.createProgram();
	gl.attachShader(pr, vsh);
	gl.attachShader(pr, fsh);
	gl.linkProgram(pr);
	if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return fail("globe: link failed");
	_gblFails = 0;
	const ST = 48, SL = 96, pos = [], idx = [];
	for (let i = 0; i <= ST; i++) {
		const ph = Math.PI * (i / ST - .5), cp2 = Math.cos(ph);
		for (let j = 0; j <= SL; j++) {
			const la = 2 * Math.PI * j / SL;
			pos.push(cp2 * Math.cos(la), cp2 * Math.sin(la), Math.sin(ph));
		}
	}
	for (let i = 0; i < ST; i++) for (let j = 0; j < SL; j++) {
		const a = i * 97 + j, b = a + SL + 1;
		idx.push(a, b, a + 1, a + 1, b, b + 1);
	}
	const vb = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vb);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
	const ib = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
	const tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([
		30,
		50,
		90,
		255
	]));
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.enable(gl.DEPTH_TEST);
	const aP = gl.getAttribLocation(pr, "aP");
	_gbl = {
		cv: cv2,
		gl,
		pr,
		vb,
		ib,
		nIdx: idx.length,
		tex,
		aP,
		uV: gl.getUniformLocation(pr, "uV"),
		uM: gl.getUniformLocation(pr, "uM"),
		uSun: gl.getUniformLocation(pr, "uSun"),
		uT: gl.getUniformLocation(pr, "uT"),
		texReady: false,
		loading: false,
		texDate: ""
	};
	return _gbl;
}
function mosaicGaps(cnv) {
	const c = document.createElement("canvas");
	c.width = 128;
	c.height = 64;
	const g2 = c.getContext("2d");
	g2.drawImage(cnv, 0, 0, 128, 64);
	const d = g2.getImageData(0, 12, 128, 40).data;
	let black = 0, n = 0;
	for (let i = 0; i < d.length; i += 4) {
		n++;
		if (d[i] + d[i + 1] + d[i + 2] < 24) black++;
	}
	return black / n;
}
function globeTexture() {
	const g = _gbl;
	if (!g || g.loading || g.texReady) return;
	if (g.nextTexTry && performance.now() < g.nextTexTry) return;
	g.loading = true;
	const finish = () => {
		const b = g.best;
		if (!b) {
			g.loading = false;
			g.nextTexTry = performance.now() + 3e4;
			try {
				console.warn("globe: mosaic unavailable, retrying in 30 s");
			} catch (e) {}
			return;
		}
		const sc = document.createElement("canvas");
		sc.width = 4096;
		sc.height = 2048;
		sc.getContext("2d").drawImage(b.cnv, 0, 0, 4096, 2048);
		const gl = g.gl;
		gl.bindTexture(gl.TEXTURE_2D, g.tex);
		try {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sc);
			g.texReady = true;
			g.texDate = b.date;
			SURF.dayOff = Math.max(SURF.dayOff, b.off);
			try {
				console.log("globe: mosaic ready ·", b.date, "·", (b.frac * 100).toFixed(1) + "% gaps");
			} catch (e) {}
		} catch (e) {
			try {
				console.warn("globe: texture upload failed", e);
			} catch (e2) {}
		}
		g.best = null;
		g.loading = false;
		V.dirty = true;
	};
	const tryDay = (off) => {
		if (off > 5) {
			finish();
			return;
		}
		const date = (/* @__PURE__ */ new Date(Date.now() - off * 864e5)).toISOString().slice(0, 10);
		const cnv = document.createElement("canvas");
		cnv.width = 5120;
		cnv.height = 2560;
		const c2 = cnv.getContext("2d");
		let n = 0, failed = false;
		for (let r = 0; r < 5; r++) for (let c = 0; c < 10; c++) {
			const im = new Image();
			im.crossOrigin = "anonymous";
			im.onload = () => {
				if (failed) return;
				c2.drawImage(im, c * 512, r * 512);
				if (++n === 50) {
					let frac = 0;
					try {
						frac = mosaicGaps(cnv);
					} catch (e) {}
					if (!g.best || frac < g.best.frac) g.best = {
						cnv,
						frac,
						date,
						off
					};
					if (frac > .06) {
						try {
							console.log("globe: mosaic", date, "is", (frac * 100).toFixed(0) + "% black — trying an earlier day");
						} catch (e) {}
						tryDay(off + 1);
						return;
					}
					finish();
				}
			};
			im.onerror = () => {
				if (!failed) {
					failed = true;
					tryDay(off + 1);
				}
			};
			im.src = `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${date}/250m/3/${r}/${c}.jpg`;
		}
	};
	tryDay(SURF.dayOff || 1);
}
function renderGlobe(px, tex, Mrows, body) {
	const g = globeInit();
	if (!g) return null;
	const dpr = Math.min(2, window.devicePixelRatio || 1);
	const size = Math.max(64, Math.min(2048, Math.ceil(px * 2 * dpr)));
	if (g.cv.width !== size) g.cv.width = g.cv.height = size;
	const gl = g.gl;
	gl.viewport(0, 0, size, size);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(g.pr);
	gl.bindBuffer(gl.ARRAY_BUFFER, g.vb);
	gl.enableVertexAttribArray(g.aP);
	gl.vertexAttribPointer(g.aP, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.ib);
	gl.uniformMatrix3fv(g.uV, false, rows2col(globeViewRows()));
	gl.uniformMatrix3fv(g.uM, false, rows2col(Mrows));
	let sun = [
		0,
		0,
		1
	];
	if (body && body._e) {
		const w = eclDir(-body._e[0], -body._e[1], -body._e[2]);
		const l = Math.hypot(w[0], w[1], w[2]) || 1;
		sun = [
			w[0] / l,
			w[1] / l,
			w[2] / l
		];
	}
	gl.uniform3fv(g.uSun, sun);
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.uniform1i(g.uT, 0);
	gl.drawElements(gl.TRIANGLES, g.nIdx, gl.UNSIGNED_SHORT, 0);
	return g.cv;
}
function earthGlobe(px, jd) {
	const g = globeInit();
	if (!g) return null;
	if (!g.texReady) {
		globeTexture();
		return null;
	}
	const earth = PLANETS.find((p) => p.n === "Earth");
	return renderGlobe(px, g.tex, globeModelRows(gmstRad(jd)), earth);
}
var PTEX = {
	Moon: [
		"moon",
		27.322,
		.116
	],
	Mercury: [
		"mercury",
		58.646,
		.001
	],
	Venus: [
		"venus",
		-243.02,
		3.096
	],
	Mars: [
		"mars",
		1.02596,
		.4396
	],
	Jupiter: [
		"jupiter",
		.41354,
		.0546
	],
	Saturn: [
		"saturn",
		.44401,
		.4665
	],
	Uranus: [
		"uranus",
		-.71833,
		1.706
	],
	Neptune: [
		"neptune",
		.67125,
		.4943
	]
};
function bodyGlobe(b, px, jd) {
	const cfg = PTEX[b.n];
	if (!cfg) return null;
	const g = globeInit();
	if (!g) return null;
	if (!g.pt) g.pt = {};
	let t = g.pt[cfg[0]];
	if (!t) {
		t = g.pt[cfg[0]] = {
			tex: null,
			ready: false
		};
		const im = new Image();
		im.onload = () => {
			try {
				const gl = g.gl, tx = gl.createTexture();
				gl.bindTexture(gl.TEXTURE_2D, tx);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				t.tex = tx;
				t.ready = true;
				V.dirty = true;
			} catch (e) {}
		};
		im.src = "data/tex/" + cfg[0] + ".jpg";
	}
	if (!t.ready) return null;
	const rot = jd / cfg[1] % 1 * 6.283185307;
	return renderGlobe(px, t.tex, globeModelRows(rot, cfg[2]), b);
}
function globeInverse(u, v) {
	const rho = Math.hypot(u, v);
	if (rho >= 1) return null;
	const nv = [
		u,
		-v,
		Math.sqrt(1 - rho * rho)
	];
	const V = globeViewRows(), M = globeModelRows(gmstRad(solarJD()));
	const wrl = [
		V[0][0] * nv[0] + V[1][0] * nv[1] + V[2][0] * nv[2],
		V[0][1] * nv[0] + V[1][1] * nv[1] + V[2][1] * nv[2],
		V[0][2] * nv[0] + V[1][2] * nv[1] + V[2][2] * nv[2]
	];
	const geo = [
		M[0][0] * wrl[0] + M[1][0] * wrl[1] + M[2][0] * wrl[2],
		M[0][1] * wrl[0] + M[1][1] * wrl[1] + M[2][1] * wrl[2],
		M[0][2] * wrl[0] + M[1][2] * wrl[1] + M[2][2] * wrl[2]
	];
	return [Math.asin(Math.max(-1, Math.min(1, geo[2]))) / D2R, Math.atan2(geo[1], geo[0]) / D2R];
}
var SURF = {
	on: false,
	lat: 20,
	lon: -75,
	cache: /* @__PURE__ */ new Map(),
	order: [],
	dayOff: 2
};
var SURF_ENTER = .003;
var SURF_EXIT = .0033;
var GOES_LON = -75.2;
var RE_PC = 20646e-14;
function surfEnterZ() {
	return S.realScale ? 2 * V.foc * RE_PC / (Math.min(W, H) * 1.2) : SURF_ENTER;
}
function surfDate() {
	return (/* @__PURE__ */ new Date(Date.now() - SURF.dayOff * 864e5)).toISOString().slice(0, 10);
}
function surfMpp() {
	if (S.realScale) return 12742e3 * S.camZ / (2 * V.foc * RE_PC);
	return 12742e3 / (8 * Math.min(W, H)) * (S.camZ / SURF_ENTER);
}
function surfUpdate() {
	const enterZ = surfEnterZ();
	if (!SURF.on) {
		if (S.camZ < enterZ && V._earthScr) {
			const u = (V.cx - V._earthScr.x) / V._earthScr.r, v = (V.cy - V._earthScr.y) / V._earthScr.r;
			const rho = Math.hypot(u, v);
			if (rho < .985) {
				const gi = V._globeOn ? globeInverse(u, v) : null;
				if (gi) {
					SURF.lat = gi[0];
					SURF.lon = gi[1];
				} else {
					const c = Math.asin(Math.min(1, rho));
					SURF.lat = rho < 1e-6 ? 0 : Math.asin(-v * Math.sin(c) / rho) / D2R;
					SURF.lon = GOES_LON + (rho < 1e-6 ? 0 : Math.atan2(u * Math.sin(c), rho * Math.cos(c)) / D2R);
				}
				SURF.on = true;
			} else S.camZ = V.tgtCamZ = enterZ;
		}
	} else if (S.camZ > (S.realScale ? enterZ * 1.1 : SURF_EXIT)) SURF.on = false;
	return SURF.on;
}
function surfTile(z, x, y) {
	const n = 1 << z;
	x = (x % n + n) % n;
	if (y < 0 || y >= n) return null;
	const url = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${surfDate()}/GoogleMapsCompatible_Level9/${z}/${y}/${x}.jpg`;
	let t = SURF.cache.get(url);
	if (!t) {
		t = {
			im: new Image(),
			ok: false
		};
		t.im.crossOrigin = "anonymous";
		t.im.onload = () => {
			t.ok = true;
			V.dirty = true;
		};
		const day = SURF.dayOff;
		t.im.onerror = () => {
			if (day === SURF.dayOff && SURF.dayOff < 4) {
				SURF.dayOff++;
				SURF.cache.clear();
				SURF.order.length = 0;
				V.dirty = true;
			}
		};
		t.im.src = url;
		SURF.cache.set(url, t);
		SURF.order.push(url);
		if (SURF.order.length > 260) SURF.cache.delete(SURF.order.shift());
	}
	return t.ok ? t.im : null;
}
function drawSurface() {
	LBL.prio = 100;
	const mpp = surfMpp(), latR = SURF.lat * D2R;
	const zf = Math.log2(156543.034 * Math.cos(latR) / mpp);
	const zt = Math.max(2, Math.min(9, Math.round(zf)));
	const ts = 256 * Math.pow(2, zf - zt);
	const n = 1 << zt;
	const wx = (SURF.lon + 180) / 360 * n;
	const sy = Math.sin(latR);
	const wy = (.5 - Math.log((1 + sy) / (1 - sy)) / (4 * Math.PI)) * n;
	ctx.fillStyle = "#04070f";
	ctx.fillRect(0, 0, W, H);
	const x0 = Math.floor(wx - V.cx / ts), x1 = Math.ceil(wx + (W - V.cx) / ts);
	const y0 = Math.floor(wy - V.cy / ts), y1 = Math.ceil(wy + (H - V.cy) / ts);
	for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
		const im = surfTile(zt, tx, ty);
		if (!im) continue;
		ctx.drawImage(im, V.cx + (tx - wx) * ts, V.cy + (ty - wy) * ts, ts + .6, ts + .6);
	}
	ctx.font = "10px ui-monospace,monospace";
	ctx.fillStyle = "rgba(200,214,240,0.85)";
	ctx.fillText(`Earth surface · ${SURF.lat.toFixed(2)}°, ${SURF.lon.toFixed(2)}° · ${mpp < 1e3 ? Math.round(mpp) + " m" : (mpp / 1e3).toFixed(1) + " km"}/px`, 16, H - 46);
	ctx.fillStyle = "rgba(150,165,195,0.6)";
	ctx.fillText(`NASA GIBS · VIIRS true color · ${surfDate()} — drag to pan · scroll out to leave`, 16, H - 32);
	V.dirty = SURF.cache.size < 4 ? true : V.dirty;
}
function surfPan(dx, dy) {
	const mpp = surfMpp(), latR = SURF.lat * D2R;
	SURF.lon -= dx * mpp / (111320 * Math.cos(latR));
	SURF.lat += dy * mpp / 110540;
	SURF.lat = Math.max(-84, Math.min(84, SURF.lat));
	SURF.lon = (SURF.lon + 540) % 360 - 180;
	V.dirty = true;
}
//#endregion
//#region src/engine/pick.js
function pick(mx, my) {
	if (SURF.on) return null;
	if (V.ROUTE && V.ROUTE._sx !== void 0) {
		const dx = V.ROUTE._sx - mx, dy = V.ROUTE._sy - my;
		if (dx * dx + dy * dy < 196) return V.ROUTE._o;
	}
	if (V.sysA > .5) {
		let best = null, bd = 1e9;
		for (const it of sysProj) {
			const dx = it.x - mx, dy = it.y - my, d = dx * dx + dy * dy;
			const rr = Math.max(12, it.px + 8);
			if (d < rr * rr && d < bd) {
				bd = d;
				best = it.o;
			}
		}
		if (best) return best;
	}
	if (V.solarA > .5) {
		let best = null, bd = 1e9;
		for (const it of solarProj) {
			const dx = it.x - mx, dy = it.y - my, d = dx * dx + dy * dy;
			const rr = Math.max(13, it.px + 8);
			if (d < rr * rr && d < bd) {
				bd = d;
				best = it.o;
			}
		}
		if (best) return best;
	}
	let best = null, bd = 324;
	if (S.user) for (const o of userProj) {
		const dx = o._sx - mx, dy = o._sy - my, d = dx * dx + dy * dy;
		if (d < 144 && d < bd) {
			bd = d;
			best = o;
		}
	}
	for (const s of order) {
		const dx = s._sx - mx, dy = s._sy - my, d = dx * dx + dy * dy;
		if (d < bd) {
			bd = d;
			best = s;
		}
	}
	if (S.galaxies) for (const g of galProj) {
		const dx = g._sx - mx, dy = g._sy - my, d = dx * dx + dy * dy;
		if (d < bd) {
			bd = d;
			best = g;
		}
	}
	if (S.dso) for (const o of dsoProj) {
		const dx = o._sx - mx, dy = o._sy - my, d = dx * dx + dy * dy;
		if (d < 289 && d < bd) {
			bd = d;
			best = o;
		}
	}
	if (S.psr) for (const o of pulsarProj) {
		const dx = o._sx - mx, dy = o._sy - my, d = dx * dx + dy * dy;
		if (d < 169 && d < bd) {
			bd = d;
			best = o;
		}
	}
	if (S.oclu) for (const o of cluProj) {
		const dx = o._sx - mx, dy = o._sy - my, d = dx * dx + dy * dy;
		if (d < 169 && d < bd) {
			bd = d;
			best = o;
		}
	}
	if (S.hyg) {
		let hb = 169;
		for (const g of hygProj) {
			const dx = g._sx - mx, dy = g._sy - my, d = dx * dx + dy * dy;
			if (d < hb && d < bd) {
				bd = d;
				best = g;
			}
		}
	}
	if (S.mw && sgraScreen) {
		const dx = sgraScreen.x - mx, dy = sgraScreen.y - my, d = dx * dx + dy * dy;
		if (d < 225 && d < bd) {
			bd = d;
			best = SGRA;
		}
	}
	if (V.solarA < .3 && lastSun.depth > V.NEAR) {
		const dx = lastSun.x - mx, dy = lastSun.y - my;
		if (dx * dx + dy * dy < 256) return SUNHIT;
	}
	return best;
}
function gpuPick(mx, my) {
	if (SURF.on || !glOK || !S.gpu) return null;
	const layers = [];
	if (gaiaRaw && S.gaia) layers.push(["gaia", gaiaRaw]);
	if (V.solarA < .5) {
		if (webRaw && S.web) layers.push(["web", webRaw]);
		if (qsoRaw && S.qso) layers.push(["qso", qsoRaw]);
	}
	if (V.solarA > .05 && beltRaw && S.belt) layers.push(["belt", beltRaw]);
	const D2R = Math.PI / 180;
	let best = null, bd = 81;
	for (const [type, bytes] of layers) {
		const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), n = bytes.length / 8 | 0;
		for (let i = 0; i < n; i++) {
			const b = i * 8;
			const u = dv.getUint16(b + 4, true) / 65535;
			const dist = type === "gaia" ? u * gaiaRange : type === "web" ? u * 6e8 : type === "qso" ? u * 13e9 : u * 120 * 484814e-11;
			const rr = dv.getUint16(b, true) * (360 / 65535) * D2R, dr = (dv.getUint16(b + 2, true) * (180 / 65535) - 90) * D2R;
			const cd = Math.cos(dr), R = scale(dist);
			const p = project(cd * Math.cos(rr) * R, cd * Math.sin(rr) * R, Math.sin(dr) * R);
			if (p.depth <= V.NEAR) continue;
			const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
			if (d2 < bd) {
				bd = d2;
				best = {
					type,
					b,
					rr,
					dr,
					dist,
					bytes
				};
			}
		}
	}
	if (!best) return null;
	const dv = new DataView(best.bytes.buffer, best.bytes.byteOffset, best.bytes.byteLength);
	const b6 = dv.getUint8(best.b + 6), b7 = dv.getUint8(best.b + 7), cd = Math.cos(best.dr);
	const o = {
		gpick: best.type,
		_dir: [
			cd * Math.cos(best.rr),
			cd * Math.sin(best.rr),
			Math.sin(best.dr)
		],
		d: best.dist
	};
	if (best.type === "gaia") {
		o.n = "Gaia DR3 star";
		o.mag = b6 / 255 * 28 - 2;
		o.bprp = b7 / 255 * 6 - 1;
		if (gaiaPm && (gaiaPm.length / 4 | 0) === (best.bytes.length / 8 | 0)) {
			const pv = new DataView(gaiaPm.buffer, gaiaPm.byteOffset, gaiaPm.byteLength), i = best.b / 8;
			o.pr = pv.getInt16(i * 4, true);
			o.pd = pv.getInt16(i * 4 + 2, true);
		}
	} else if (best.type === "web") {
		o.n = "2MRS galaxy";
		o.kmag = b6 / 255 * 16;
	} else if (best.type === "qso") {
		o.n = "Quasar";
		o.z = b6 / 20;
	} else {
		o.n = [
			"Main-belt asteroid",
			"Jupiter trojan",
			"Near-Earth object",
			"Trans-Neptunian object"
		][b7] || "Asteroid";
		o.H = b6 / 10;
		o.rAU = best.dist / 484814e-11;
	}
	return o;
}
//#endregion
//#region src/engine/interact.js
var dragging = false;
var panning = false;
var lx = 0;
var ly = 0;
var moved = 0;
cv.addEventListener("contextmenu", (e) => e.preventDefault());
var ptrs = /* @__PURE__ */ new Map();
var pinching = false;
var pinchD = 0;
cv.addEventListener("pointerdown", (e) => {
	ptrs.set(e.pointerId, [e.clientX, e.clientY]);
	if (ptrs.size === 2) {
		pinching = true;
		dragging = false;
		const p2 = [...ptrs.values()];
		pinchD = Math.hypot(p2[0][0] - p2[1][0], p2[0][1] - p2[1][1]);
		return;
	}
	dragging = true;
	moved = 0;
	lx = e.clientX;
	ly = e.clientY;
	panning = e.button === 2 || e.button === 1 || e.shiftKey;
	cv.setPointerCapture(e.pointerId);
	cv.classList.add("drag");
	if (!panning) {
		S.autorot = false;
		syncToggle("t-rot", false);
	}
});
cv.addEventListener("pointermove", (e) => {
	if (pinching) {
		if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, [e.clientX, e.clientY]);
		if (ptrs.size === 2) {
			const p2 = [...ptrs.values()];
			const d = Math.hypot(p2[0][0] - p2[1][0], p2[0][1] - p2[1][1]);
			if (pinchD > 4 && d > 4) {
				let ax = (p2[0][0] + p2[1][0]) / 2, ay = (p2[0][1] + p2[1][1]) / 2;
				if (S.pinned) {
					const w = objWorld(S.pinned);
					if (w) {
						const pp = project(w[0], w[1], w[2]);
						if (pp.depth > V.NEAR && pp.x > 0 && pp.x < W && pp.y > 0 && pp.y < H) {
							ax = pp.x;
							ay = pp.y;
						}
					}
				}
				zoomFactorAt(ax, ay, pinchD / d);
			}
			pinchD = d;
		}
		return;
	}
	if (dragging) {
		const dx = e.clientX - lx, dy = e.clientY - ly;
		moved += Math.abs(dx) + Math.abs(dy);
		if (SURF.on) {
			surfPan(dx, dy);
			lx = e.clientX;
			ly = e.clientY;
			return;
		}
		if (e.ctrlKey || e.metaKey) {
			zoomFactorAt(e.clientX, e.clientY, Math.exp(dy * (S.realScale ? .008 : .003)));
			lx = e.clientX;
			ly = e.clientY;
			return;
		}
		if (panning) {
			V.FOLLOW = null;
			const sc = Math.max(S.camZ, camDist) / V.foc;
			tgtCtr.x += (-camRight[0] * dx + camUp[0] * dy) * sc;
			tgtCtr.y += (-camRight[1] * dx + camUp[1] * dy) * sc;
			tgtCtr.z += (-camRight[2] * dx + camUp[2] * dy) * sc;
			S.pinned = null;
		} else if (S.freelook) {
			camBasis();
			const px = camPos[0], py = camPos[1], pz = camPos[2];
			S.yaw = V.tgtYaw = V.tgtYaw + dx * .005;
			S.pitch = V.tgtPitch = Math.max(-1.45, Math.min(1.45, V.tgtPitch + dy * .005));
			const c = Math.cos(S.yaw), sn = Math.sin(S.yaw), cp = Math.cos(S.pitch), sp = Math.sin(S.pitch);
			tgtCtr.x = ctr.x = px + sn * S.camZ;
			tgtCtr.y = ctr.y = py + -sp * c * S.camZ;
			tgtCtr.z = ctr.z = pz + cp * c * S.camZ;
			S.focusStar = null;
		} else if (S.skyMode) {
			camBasis();
			const k = 1 / (V.foc * V.fovK);
			const yp = lookAlong([
				camFwd[0] - (camRight[0] * dx - camUp[0] * dy) * k,
				camFwd[1] - (camRight[1] * dx - camUp[1] * dy) * k,
				camFwd[2] - (camRight[2] * dx - camUp[2] * dy) * k
			]);
			S.yaw = V.tgtYaw = yp.yaw;
			S.pitch = V.tgtPitch = yp.pitch;
			S.focusStar = null;
		} else {
			V.tgtYaw += dx * .005;
			V.tgtPitch += dy * .005;
			V.tgtPitch = Math.max(-1.45, Math.min(1.45, V.tgtPitch));
			S.focusStar = null;
		}
		lx = e.clientX;
		ly = e.clientY;
	} else {
		const h = pick(e.clientX, e.clientY);
		S.hover = h === SUNHIT ? null : h;
		cv.style.cursor = h ? "pointer" : "grab";
		if (S.skyMode) {
			const d = screenDir(e.clientX, e.clientY), [ra, dec] = radec(d[0], d[1], d[2]), [l, b] = galactic(d[0], d[1], d[2]);
			skyCursor.set({
				ra,
				dec,
				l,
				b
			});
		}
	}
});
var lastTap = {
	t: 0,
	x: 0,
	y: 0
};
var lastTapFocusT = 0;
cv.addEventListener("pointerup", (e) => {
	ptrs.delete(e.pointerId);
	if (ptrs.size < 2) {
		pinching = false;
		pinchD = 0;
	}
	dragging = false;
	panning = false;
	cv.classList.remove("drag");
	if (moved < 5) {
		if (e.pointerType === "touch" && !measureMode && !SURF.on) {
			const now = performance.now();
			if (now - lastTap.t < 350 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 40) {
				lastTap.t = 0;
				lastTapFocusT = now;
				focusAt(e.clientX, e.clientY);
				return;
			}
			lastTap = {
				t: now,
				x: e.clientX,
				y: e.clientY
			};
		}
		const hit = pick(e.clientX, e.clientY) || gpuPick(e.clientX, e.clientY);
		if (measureMode) {
			if (hit && hit !== SUNHIT) measurePick(hit);
			return;
		}
		if (hit === SUNHIT) {
			V.focusSys = null;
			enterSolar();
			return;
		}
		S.pinned = hit || null;
		if (hit) {
			if (hit.p && hit._dx !== void 0) {
				V.focusSys = hit;
				V.focusSysW = objWorld(hit);
				flyTo(hit);
			} else if (hit.sgra || hit.dso || hit.psr || hit.oclu || hit.gpick || hit.mpc !== void 0 || hit.m !== void 0 && hit.dx !== void 0) {
				V.focusSys = null;
				flyTo(hit);
			}
		}
	}
});
function frameSelection() {
	const b = S.pinned || S.hover;
	if (!b) return;
	if (b === SUN) {
		enterSolar();
		return;
	}
	const w = navWorld(b);
	if (!w) return;
	const isSolar = b._e !== void 0 || b.rk !== void 0;
	aim(w[0], w[1], w[2], isSolar ? Math.min(V.tgtCamZ, scale(3e-6)) : Math.max(scale(3e-6), V.tgtCamZ * .5));
	if (b._e !== void 0 || b === SUN) {
		V.FOLLOW = b;
		V.lastInfo = void 0;
	}
	V.dirty = true;
}
addEventListener("keydown", (e) => {
	const ae = document.activeElement;
	if (ae && ae.tagName === "INPUT") return;
	const k = e.key.toLowerCase();
	if ("wasdrf".includes(k) || e.key.startsWith("Arrow")) {
		keys.add(k === "arrowup" ? "w" : k === "arrowdown" ? "s" : k === "arrowleft" ? "a" : k === "arrowright" ? "d" : k);
		e.preventDefault();
	} else if (e.key === ".") {
		frameSelection();
		e.preventDefault();
	} else if (e.key === "Home") {
		resetView();
		e.preventDefault();
	} else if (e.key === "Escape") {
		S.pinned = null;
		S.hover = null;
		V.FOLLOW = null;
		V.lastInfo = void 0;
		V.dirty = true;
	}
});
addEventListener("keyup", (e) => {
	const k = e.key.toLowerCase();
	keys.delete(k);
	keys.delete(k === "arrowup" ? "w" : k === "arrowdown" ? "s" : k === "arrowleft" ? "a" : k === "arrowright" ? "d" : k);
});
function zoomAt(mx, my, delta, deltaMode) {
	let d = delta === true ? -100 : delta === false ? 100 : delta * (deltaMode === 1 ? 33 : deltaMode === 2 ? 400 : 1);
	d = Math.max(-200, Math.min(200, d));
	const k = S.realScale ? .0026 : V.tgtCamZ < .45 ? .0019 : 88e-5;
	zoomFactorAt(mx, my, Math.exp(k * d));
}
function zoomRange() {
	return S.realScale ? [1e-12, 2e10] : [1e-4, 16];
}
function zoomFactorAt(mx, my, f) {
	if (S.skyMode) {
		V.fovK = Math.max(1, Math.min(6e3, V.fovK / f));
		V.dirty = true;
		return;
	}
	let [zmin, zmax] = zoomRange();
	if (V.tgtCamZ * f < zmin && f < 1 && !S.realScale) {
		clickToggle("t-real");
		S.camZ = V.tgtCamZ;
		[zmin, zmax] = zoomRange();
	}
	const before = V.tgtCamZ;
	V.tgtCamZ *= f;
	V.tgtCamZ = Math.max(zmin, Math.min(zmax, V.tgtCamZ));
	if (SURF.on) {
		const eff = V.tgtCamZ / before;
		surfPan(-(mx - V.cx) * (1 - eff), -(my - V.cy) * (1 - eff));
		return;
	}
	if (V.tgtCamZ < before && !V.FOLLOW) {
		const k = V.tgtCamZ / before;
		const x1 = (mx - V.cx) * before / V.foc, y2 = (V.cy - my) * before / V.foc;
		const cyw = Math.cos(S.yaw), syw = Math.sin(S.yaw), cpp = Math.cos(S.pitch), spp = Math.sin(S.pitch);
		const Px = tgtCtr.x + cyw * x1 + spp * syw * y2;
		const Py = tgtCtr.y + cpp * y2;
		const Pz = tgtCtr.z + syw * x1 - spp * cyw * y2;
		tgtCtr.x += (Px - tgtCtr.x) * (1 - k);
		tgtCtr.y += (Py - tgtCtr.y) * (1 - k);
		tgtCtr.z += (Pz - tgtCtr.z) * (1 - k);
	}
}
function focusAt(x, y) {
	if (SURF.on) return;
	const hit = pick(x, y) || gpuPick(x, y);
	if (!hit) return;
	if (hit === SUNHIT || hit === SUN) {
		V.focusSys = null;
		enterSolar();
		return;
	}
	if (!hit.gpick) S.pinned = hit;
	if (hit.p && hit._dx !== void 0) {
		V.focusSys = hit;
		V.focusSysW = objWorld(hit);
		flyTo(hit);
		return;
	}
	if (objWorld(hit)) {
		flyTo(hit);
		return;
	}
	const w = navWorld(hit);
	if (w) {
		aim(w[0], w[1], w[2], Math.min(V.tgtCamZ, scale(3e-6)));
		if (hit._e !== void 0) {
			V.FOLLOW = hit;
			V.lastInfo = void 0;
		}
	}
	V.dirty = true;
}
cv.addEventListener("dblclick", (e) => {
	if (performance.now() - lastTapFocusT < 500) return;
	focusAt(e.clientX, e.clientY);
});
cv.addEventListener("pointercancel", (e) => {
	ptrs.delete(e.pointerId);
	if (ptrs.size < 2) {
		pinching = false;
		pinchD = 0;
	}
	dragging = false;
});
cv.addEventListener("wheel", (e) => {
	e.preventDefault();
	zoomAt(e.clientX, e.clientY, e.deltaY, e.deltaMode);
}, { passive: false });
[
	"pointerdown",
	"pointermove",
	"pointerup",
	"wheel",
	"keydown",
	"keyup",
	"click",
	"input"
].forEach((ev) => addEventListener(ev, () => {
	V.dirty = true;
}, {
	capture: true,
	passive: true
}));
//#endregion
//#region src/engine/controls.js
function syncToggle(id, on) {
	toggleState.update((m) => ({
		...m,
		[id]: on
	}));
}
var TOGGLE_REG = {};
var TOGGLE_ACT = {};
function bindToggle(id, key, fn) {
	TOGGLE_REG[key] = id;
	TOGGLE_ACT[id] = {
		key,
		fn
	};
}
function clickToggle(id) {
	const t = TOGGLE_ACT[id];
	if (!t) return;
	S[t.key] = !S[t.key];
	syncToggle(id, S[t.key]);
	if (t.fn) t.fn();
	V.dirty = true;
}
function setToggle(id, on) {
	const t = TOGGLE_ACT[id];
	if (!t) return;
	if (!!S[t.key] === !!on) return;
	clickToggle(id);
}
api.setToggle = setToggle;
api.toggleIds = () => Object.keys(TOGGLE_ACT);
api.readToggles = () => {
	const o = {};
	for (const id in TOGGLE_ACT) o[id] = !!S[TOGGLE_ACT[id].key];
	return o;
};
bindToggle("t-rot", "autorot");
bindToggle("t-freelook", "freelook");
bindToggle("t-hyg", "hyg");
bindToggle("t-user", "user");
bindToggle("t-gpu", "gpu");
bindToggle("t-gaia", "gaia");
bindToggle("t-web", "web");
bindToggle("t-ob", "ob");
bindToggle("t-var", "vars");
bindToggle("t-qso", "qso");
bindToggle("t-edge", "edge");
bindToggle("t-size", "size");
bindToggle("t-veil", "veil");
bindToggle("t-rings", "rings");
bindToggle("t-gal", "galaxies");
bindToggle("t-dso", "dso");
bindToggle("t-mw3d", "mw3d");
bindToggle("t-psr", "psr");
bindToggle("t-oclu", "oclu");
bindToggle("t-real", "realScale", () => {
	const wasReal = !S.realScale;
	const inv = (v) => wasReal ? v / 1 : Math.pow(10, v / 1 + -6);
	const physCam = inv(S.camZ), physTgt = inv(V.tgtCamZ);
	const cm = Math.hypot(ctr.x, ctr.y, ctr.z), physCtr = cm > 0 ? inv(cm) : 0;
	const zr = zoomRange(), cl = (v) => Math.max(zr[0], Math.min(zr[1], v));
	S.camZ = cl(scale(physCam));
	V.tgtCamZ = cl(scale(physTgt));
	if (cm > 0) {
		const nm = scale(physCtr) / cm;
		ctr.x *= nm;
		ctr.y *= nm;
		ctr.z *= nm;
		tgtCtr.x = ctr.x;
		tgtCtr.y = ctr.y;
		tgtCtr.z = ctr.z;
	}
	if (V.focusSys) V.focusSysW = objWorld(V.focusSys);
});
bindToggle("t-con", "con");
bindToggle("t-hz", "hz");
bindToggle("t-moons", "moons");
bindToggle("t-ast", "ast");
bindToggle("t-tno", "tno");
bindToggle("t-probes", "probes");
bindToggle("t-helio", "helio");
bindToggle("t-belt", "belt");
bindToggle("t-lag", "lag");
bindToggle("t-lens", "lens");
bindToggle("t-iso", "iso");
bindToggle("t-eht", "eht");
bindToggle("t-labels", "labels");
bindToggle("t-radio", "radio");
bindToggle("t-bubble", "bubble");
bindToggle("t-grid", "grid");
bindToggle("t-ggrid", "ggrid");
bindToggle("t-cme", "cme");
bindToggle("t-neo", "neo");
bindToggle("t-sat", "sat");
bindToggle("t-sun", "sunAR");
bindToggle("t-met", "met");
bindToggle("t-pm", "pm", () => {
	if (!S.pm) S.pmYears = 0;
});
bindToggle("t-mw", "mw");
//#endregion
//#region src/engine/fieldquery.js
var ASU = "https://vizier.cds.unistra.fr/viz-bin/asu-tsv";
var SIM = "https://simbad.cds.unistra.fr/simbad/sim-tap/sync";
var SOURCES = {
	gaia: {
		n: "Gaia DR3",
		epoch: 2016,
		limit: 4e3,
		prefix: "Gaia DR3 "
	},
	simbad: {
		n: "SIMBAD",
		epoch: 2e3,
		limit: 2e3,
		prefix: ""
	}
};
function fieldCentre() {
	let ra = Math.atan2(camFwd[1], camFwd[0]) * 57.29578;
	if (ra < 0) ra += 360;
	return [ra, Math.asin(Math.max(-1, Math.min(1, camFwd[2]))) * 57.29578];
}
function fieldRadiusDeg() {
	return Math.min(2.5, Math.max(.02, fovDeg() * .55));
}
var hms = (ra) => {
	const h = ra / 15, hh = Math.floor(h), m = (h - hh) * 60;
	return `${String(hh).padStart(2, "0")}h${String(Math.floor(m)).padStart(2, "0")}m`;
};
var dms = (d) => {
	const s = d < 0 ? "−" : "+", a = Math.abs(d);
	return `${s}${String(Math.floor(a)).padStart(2, "0")}°${String(Math.floor((a - Math.floor(a)) * 60)).padStart(2, "0")}′`;
};
async function tap(url, adql) {
	const body = new URLSearchParams({
		REQUEST: "doQuery",
		LANG: "ADQL",
		FORMAT: "csv",
		QUERY: adql
	});
	const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 45e3);
	try {
		const r = await fetch(url, {
			method: "POST",
			body,
			signal: ctl.signal
		});
		if (!r.ok) throw new Error("HTTP " + r.status);
		return await r.text();
	} finally {
		clearTimeout(t);
	}
}
function adql(src, ra, dec, r) {
	const c = `CIRCLE('ICRS', ${ra.toFixed(5)}, ${dec.toFixed(5)}, ${r.toFixed(4)})`;
	return `SELECT TOP ${SOURCES.simbad.limit} main_id, ra, dec, plx_value, pmra, pmdec, otype, sp_type FROM basic WHERE 1=CONTAINS(POINT('ICRS', ra, dec), ${c}) AND ra IS NOT NULL`;
}
async function asuGaia(ra, dec, r) {
	const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 12e4);
	try {
		const u = `${ASU}?-source=I/355/gaiadr3&-c=${encodeURIComponent(ra.toFixed(5) + " " + (dec >= 0 ? "+" : "") + dec.toFixed(5))}&-c.rd=${r.toFixed(4)}&-out=Source,RA_ICRS,DE_ICRS,Plx,pmRA,pmDE,Gmag,BP-RP&-out.max=${SOURCES.gaia.limit}&-sort=Gmag`;
		const res = await fetch(u, { signal: ctl.signal });
		if (!res.ok) throw new Error("HTTP " + res.status);
		const lines = (await res.text()).split(/\r?\n/).filter((l) => l && !l.startsWith("#"));
		const i = lines.findIndex((l) => /^-+(\t-+)*\t?$/.test(l.trim()));
		if (i >= 2) lines.splice(1, i);
		return lines.join("\n");
	} finally {
		clearTimeout(t);
	}
}
var _busy = null;
async function queryField(src) {
	const S_ = SOURCES[src];
	if (!S_ || _busy) return 0;
	const [ra, dec] = fieldCentre(), r = fieldRadiusDeg();
	const field = `${hms(ra)} ${dms(dec)} · r ${r >= 1 ? r.toFixed(1) + "°" : (r * 60).toFixed(0) + "′"}`;
	_busy = src;
	fieldQuery.set({
		busy: src,
		msg: `asking ${S_.n} for ${field}…`
	});
	try {
		if (src === "gaia") fieldQuery.set({
			busy: src,
			msg: `asking VizieR for Gaia DR3 in ${field}… (can take a minute when the server is busy)`
		});
		const n = importUser(src === "gaia" ? await asuGaia(ra, dec, r) : await tap(SIM, adql(src, ra, dec, r)), `${S_.n} · ${field}`, {
			src,
			epoch: S_.epoch,
			prefix: S_.prefix
		});
		fieldQuery.set({
			busy: null,
			msg: n ? `${n} rows from ${S_.n}${n >= S_.limit ? " (the brightest; the cone holds more)" : ""}` : `${S_.n}: nothing in this field`
		});
		return n;
	} catch (e) {
		fieldQuery.set({
			busy: null,
			msg: `${S_.n} query failed: ${e.name === "AbortError" ? "timeout" : e.message}`
		});
		return 0;
	} finally {
		_busy = null;
	}
}
//#endregion
//#region src/engine/timeline.js
var _v = 0;
var _timer = null;
var SPAN = 2e6;
var yearsOf = (v) => Math.sign(v) * Math.pow(Math.abs(v) / 1e3, 3) * SPAN;
var sliderOf = (t) => Math.sign(t) * 1e3 * Math.cbrt(Math.min(1, Math.abs(t) / SPAN));
function label(v, t) {
	if (v === 0) return "today";
	const sg = t > 0 ? "+" : "−", a = Math.abs(t);
	if (a < 200) return new Date(Date.now() + t * 315576e5).toISOString().slice(0, 10);
	if (a >= 1e6) return sg + (a / 1e6).toFixed(2) + " Myr";
	if (a >= 1e4) return sg + (a / 1e3).toFixed(0) + ",000 yr";
	const yr = (/* @__PURE__ */ new Date()).getFullYear() + t;
	return sg + Math.round(a).toLocaleString("en-US") + " yr (" + Math.round(yr) + ")";
}
function publish() {
	const t = yearsOf(_v);
	timeline.set({
		v: _v,
		label: label(_v, t),
		playing: !!_timer
	});
}
function setTime(v) {
	_v = Math.max(-1e3, Math.min(1e3, +v || 0));
	const t = yearsOf(_v);
	S.pmYears = Math.round(t);
	S.pm = _v !== 0;
	S.tOffsetDays = Math.max(-36525, Math.min(36525, t * 365.25));
	publish();
	V.dirty = true;
}
function play() {
	if (_timer) {
		clearInterval(_timer);
		_timer = null;
		publish();
		return;
	}
	_timer = setInterval(() => {
		let v = _v + 2;
		if (v > 1e3) v = -1e3;
		setTime(v);
	}, 120);
	publish();
}
function now() {
	if (_timer) {
		clearInterval(_timer);
		_timer = null;
	}
	setTime(0);
}
api.timeline = {
	set: setTime,
	play,
	now
};
//#endregion
//#region src/engine/actions.js
var _lastMsg = "";
function msg(t) {
	_lastMsg = t || "";
	searchMsg.set(_lastMsg);
}
var msgText = () => _lastMsg;
var current = () => S.pinned || S.hover;
function deselect() {
	S.pinned = null;
	S.hover = null;
	V.FOLLOW = null;
	V.lastInfo = void 0;
	V.dirty = true;
}
function lockToggle() {
	const b = current();
	if (!b) return;
	if (V.FOLLOW === b) V.FOLLOW = null;
	else {
		const w = worldPos(b);
		if (w) {
			tgtCtr.x = w[0];
			tgtCtr.y = w[1];
			tgtCtr.z = w[2];
			V.FOLLOW = b;
			S.autorot = false;
			syncToggle("t-rot", false);
		}
	}
	V.lastInfo = void 0;
	V.dirty = true;
}
function setCourse() {
	const b = current();
	if (!b || !physPos(b)) return;
	V.navTarget = b;
	V.lastInfo = void 0;
	V.dirty = true;
}
function clearCourse() {
	V.navTarget = null;
	V.lastInfo = void 0;
	V.dirty = true;
}
function engageCourse() {
	const t = V.navTarget;
	if (!t) return;
	if (t.p && t._dx !== void 0) {
		V.focusSys = t;
		V.focusSysW = objWorld(t);
	}
	if (objWorld(t)) flyTo(t);
	else {
		const w = worldPos(t);
		if (w) aim(w[0], w[1], w[2], scale(3e-6));
	}
}
function routeToggle() {
	const b = current();
	if (!b) return;
	if (V.ROUTE && V.ROUTE.o === b) {
		V.ROUTE = null;
		V.lastInfo = void 0;
		V.dirty = true;
	} else computeRoute(b);
}
function transferToggle() {
	const b = current();
	if (!b) return;
	if (V.TRANSFER && V.TRANSFER.to === b) {
		V.TRANSFER = null;
		V.lastInfo = void 0;
		V.dirty = true;
	} else computeTransfer(b);
}
function enterSolar() {
	S.pinned = null;
	S.hover = null;
	V.tgtCamZ = camSolar();
	V.tgtPitch = -.5;
	tgtCtr.x = tgtCtr.y = tgtCtr.z = 0;
}
function toggleSolar() {
	if (V.solarA > .5) {
		V.FOLLOW = null;
		V.focusSys = null;
		V.tgtPitch = -.35;
		tgtCtr.x = tgtCtr.y = tgtCtr.z = 0;
		V.tgtCamZ = scale(6);
	} else enterSolar();
	S.pinned = null;
	V.dirty = true;
}
function resetView() {
	V.tgtYaw = .5;
	V.tgtPitch = -.5;
	S.focusStar = null;
	S.pinned = null;
	S.hover = null;
	V.focusSys = null;
	V.FOLLOW = null;
	V.navTarget = null;
	V.ROUTE = null;
	V.TRANSFER = null;
	tgtCtr.x = tgtCtr.y = tgtCtr.z = 0;
	if (!S.realScale) clickToggle("t-real");
	V.tgtCamZ = camSolar();
	S.autorot = false;
	syncToggle("t-rot", false);
	V.lastInfo = void 0;
	V.dirty = true;
}
function flyToScale(pc) {
	if (!(pc > 0)) return;
	const zr = zoomRange();
	V.FOLLOW = null;
	V.tgtCamZ = Math.max(zr[0], Math.min(zr[1], scale(pc)));
	V.dirty = true;
}
function facColorToggle() {
	S.facColor = !S.facColor;
	facColor.set(S.facColor);
	V.dirty = true;
	return S.facColor;
}
var facCount = {};
for (const s of STARS) facCount[s.fac] = (facCount[s.fac] || 0) + 1;
var facList = Object.keys(FAC).filter((k) => facCount[k]).sort((a, b) => facCount[b] - facCount[a]).map((k) => ({
	k,
	l: FAC[k].l,
	c: FAC[k].c,
	n: facCount[k]
}));
function toggleFac(k) {
	if (S.facHidden.has(k)) S.facHidden.delete(k);
	else S.facHidden.add(k);
	V.dirty = true;
	return S.facHidden.has(k);
}
function doSearch(q) {
	q = q.trim().toLowerCase();
	if (!q) {
		msg("");
		return;
	}
	const eq = (s) => s && s.toLowerCase() === q, has = (s) => s && s.toLowerCase().includes(q);
	const cands = [];
	const push = (t, o) => {
		if (o) cands.push([t, o]);
	};
	if (/^(sgr ?a\*?|sagittarius a\*?|galactic cent(er|re))$/.test(q)) {
		msg("→ Sgr A* · galactic centre");
		if (!S.mw) {
			S.mw = true;
			syncToggle("t-mw", true);
		}
		V.focusSys = null;
		S.pinned = SGRA;
		flyTo(SGRA);
		return;
	}
	push("user", USER.rows.find((o) => eq(o.n)));
	push("iso", ISO.find((o) => eq(o.n)));
	push("small", SMALL.find((o) => eq(o.n)));
	push("dso", DSO.find((o) => eq(o.n)));
	push("hyg", HYG.find((s) => eq(s.n)));
	push("gal", GAL.find((g) => eq(g.n) || eq(g.id)));
	push("star", STARS.find((s) => eq(s.h)));
	push("body", SOLAR_BODIES.find((b) => eq(b.n)) || (eq("sun") ? SUN : null));
	push("probe", PROBES.find((p) => eq(p.n)));
	push("tno2", TNOS.find((t2) => eq(t2.n)));
	push("psr", PULSARS.find((o) => eq(o.n)));
	push("clu", CLUSTERS.find((c) => eq(c.n)));
	push("iso", ISO.find((o) => has(o.n)));
	push("user", USER.rows.find((o) => has(o.n)));
	push("small", SMALL.find((o) => has(o.n)));
	push("dso", DSO.find((o) => has(o.n)));
	push("hyg", HYG.find((s) => has(s.n)));
	push("gal", GAL.find((g) => has(g.n) || has(g.id)));
	push("star", STARS.find((s) => s._search.includes(q)));
	push("body", SOLAR_BODIES.find((b) => has(b.n)));
	push("probe", PROBES.find((p) => has(p.n)));
	push("tno2", TNOS.find((t2) => has(t2.n)));
	push("psr", PULSARS.find((o) => has(o.n)));
	push("clu", CLUSTERS.find((c) => has(c.n)));
	if (!cands.length) {
		msg("nothing found");
		return;
	}
	const [t, o] = cands[0];
	if (t === "user") {
		msg("→ " + (o.n || "row") + " · your data" + (o.noDist ? " (no distance)" : " · " + fmt(o.d * PC2LY) + " ly"));
		if (!S.user) {
			S.user = true;
			syncToggle("t-user", true);
		}
		V.focusSys = null;
		S.pinned = o;
		flyTo(o);
		return;
	}
	if (t === "iso") {
		msg("→ " + o.n + " (interstellar)");
		if (!S.iso) {
			S.iso = true;
			syncToggle("t-iso", true);
		}
		V.focusSys = null;
		enterSolar();
		S.pinned = o;
		return;
	}
	if (t === "small") {
		msg("→ " + o.n + " (" + o.kind + ")");
		if (!S.ast) {
			S.ast = true;
			syncToggle("t-ast", true);
		}
		V.focusSys = null;
		enterSolar();
		S.pinned = o;
		return;
	}
	if (t === "body") {
		msg("→ " + o.n + " (" + (o.kind || "") + ")");
		V.focusSys = null;
		enterSolar();
		S.pinned = o;
		return;
	}
	if (t === "probe" || t === "tno2") {
		msg("→ " + o.n + " (" + (o.kind || "") + ")");
		if (t === "probe" && !S.probes) {
			S.probes = true;
			syncToggle("t-probes", true);
		}
		if (t === "tno2" && !S.tno) {
			S.tno = true;
			syncToggle("t-tno", true);
		}
		V.focusSys = null;
		enterSolar();
		S.pinned = o;
		return;
	}
	if (t === "psr" || t === "clu") {
		msg("→ " + o.n + " · " + fmt(o.d * PC2LY) + " ly");
		if (t === "psr" && !S.psr) {
			S.psr = true;
			syncToggle("t-psr", true);
		}
		if (t === "clu" && !S.oclu) {
			S.oclu = true;
			syncToggle("t-oclu", true);
		}
		V.focusSys = null;
		S.pinned = o;
		const R = scale(o.d);
		aim(o._dir[0] * R, o._dir[1] * R, o._dir[2] * R, scale(o.d * .25));
		return;
	}
	if (t === "dso") {
		msg("→ " + o.n + " · " + fmt(o.d * PC2LY) + " ly");
		V.focusSys = null;
		S.pinned = o;
		if (!S.dso) {
			S.dso = true;
			syncToggle("t-dso", true);
		}
		const R = scale(o.d);
		aim(o._dir[0] * R, o._dir[1] * R, o._dir[2] * R, scale(o.d * .25));
	} else if (t === "gal") {
		msg("→ " + o.n + " · " + fmt(o.mpc * 3.2616) + " Mly");
		focusOnGalaxy(o);
	} else if (t === "hyg") {
		msg("→ " + (o.n || "star") + " · " + fmt(o.d * PC2LY) + " ly");
		focusOnHyg(o);
	} else {
		msg("→ " + o.h + " · " + fmt(o.d * PC2LY) + " ly");
		focusOn(o);
	}
}
function aim(x, y, z, margin) {
	if (!isFinite(x + y + z + margin)) return;
	V.FOLLOW = null;
	tgtCtr.x = x;
	tgtCtr.y = y;
	tgtCtr.z = z;
	V.tgtCamZ = Math.max(scale(3e-6), margin);
	S.autorot = false;
	syncToggle("t-rot", false);
}
function objWorld(o) {
	if (o.usr) {
		const R = scale(o.d);
		return [
			o.dx * R,
			o.dy * R,
			o.dz * R
		];
	}
	if ((o.psr || o.oclu || o.gpick || o.sgra || o.dso) && o._dir && o.d !== void 0) {
		const R = scale(o.d);
		return [
			o._dir[0] * R,
			o._dir[1] * R,
			o._dir[2] * R
		];
	}
	if (o.sgra || o.dso) return [
		o._x,
		o._y,
		o._z
	];
	if (o.mpc !== void 0) return [
		o._x,
		o._y,
		o._z
	];
	const t = tNow();
	if (o.p && o._dx !== void 0) {
		if (t) {
			const q = hostPos(o, t), L = Math.hypot(q[0], q[1], q[2]) || 1e-9, d = compress(L) / L;
			return [
				q[0] * d,
				q[1] * d,
				q[2] * d
			];
		}
		const d = compress(o._r);
		return [
			o._dx * d,
			o._dy * d,
			o._dz * d
		];
	}
	if (o.m !== void 0 && o.dx !== void 0) {
		if (t) {
			const q = hygPos(o, t), L = Math.hypot(q[0], q[1], q[2]) || 1e-9, d = compress(L) / L;
			return [
				q[0] * d,
				q[1] * d,
				q[2] * d
			];
		}
		const d = compress(o.d);
		return [
			o.dx * d,
			o.dy * d,
			o.dz * d
		];
	}
	return null;
}
function flyTo(o) {
	const w = objWorld(o);
	if (!w) return;
	if (S.skyMode || o.usr && o.noDist) {
		if (!S.skyMode) skyView(true);
		turnTo([
			w[0] - ctr.x,
			w[1] - ctr.y,
			w[2] - ctr.z
		]);
		return;
	}
	const physPc = invScale(Math.hypot(w[0], w[1], w[2])) || 1;
	let m;
	if (o.p) m = S.realScale ? scale(physPc * .12) : scale(3e-5);
	else if (o.m !== void 0 && o.dx !== void 0) m = scale(physPc * .2);
	else m = scale(physPc * .25);
	aim(w[0], w[1], w[2], m);
}
function focusOn(s) {
	if (S.skyMode) {
		S.pinned = s;
		flyTo(s);
		return;
	}
	S.pinned = s;
	S.focusStar = s;
	V.focusSys = s;
	V.focusSysW = objWorld(s);
	aim(V.focusSysW[0], V.focusSysW[1], V.focusSysW[2], S.realScale ? scale(s._r * .12) : scale(3e-5));
}
function focusOnGalaxy(g) {
	if (!S.galaxies) {
		S.galaxies = true;
		syncToggle("t-gal", true);
	}
	S.pinned = g;
	S.focusStar = null;
	V.focusSys = null;
	if (S.skyMode) {
		flyTo(g);
		return;
	}
	const R = scale(g.mpc * 1e6);
	aim(g.dx * R, g.dy * R, g.dz * R, scale(g.mpc * 1e6 * .25));
}
function focusOnHyg(s) {
	if (!S.hyg) {
		S.hyg = true;
		syncToggle("t-hyg", true);
	}
	S.pinned = s;
	S.focusStar = null;
	V.focusSys = null;
	if (S.skyMode) {
		flyTo(s);
		return;
	}
	const dr = compress(s.d);
	aim(s.dx * dr, s.dy * dr, s.dz * dr, scale(s.d * .2));
}
var _skySaved = null;
function skyView(on, from) {
	if (on === void 0) on = !S.skyMode;
	let at = null, atName = null;
	if (on && from) {
		const b = from === "selection" ? current() : from;
		const p = b && physPos(b);
		if (p && Math.hypot(p[0], p[1], p[2]) > 1e-4) {
			at = p;
			atName = nameOf(b);
		}
	}
	if (on && !S.skyMode) {
		_skySaved = {
			camZ: S.camZ,
			tgt: V.tgtCamZ,
			ctr: [
				tgtCtr.x,
				tgtCtr.y,
				tgtCtr.z
			],
			real: S.realScale,
			follow: V.FOLLOW
		};
		if (!S.realScale) clickToggle("t-real");
		V.FOLLOW = null;
		S.pinned = null;
		S.camZ = V.tgtCamZ = scale(1e-7);
		S.skyMode = true;
		V.fovK = 1;
		if (!ST.on && !at) setSurvey("dss");
	}
	if (on && S.skyMode) {
		const c = at || [
			0,
			0,
			0
		];
		tgtCtr.x = ctr.x = c[0];
		tgtCtr.y = ctr.y = c[1];
		tgtCtr.z = ctr.z = c[2];
		S.camZ = V.tgtCamZ = scale(1e-7);
		V.FOLLOW = null;
		V.skyFrom = atName;
		S.pinned = null;
		if (at) V.fovK = 1;
	}
	if (!on && S.skyMode) {
		S.skyMode = false;
		V.fovK = 1;
		V.skyFrom = null;
		if (_skySaved) {
			V.tgtCamZ = _skySaved.tgt;
			S.camZ = _skySaved.camZ;
			tgtCtr.x = _skySaved.ctr[0];
			tgtCtr.y = _skySaved.ctr[1];
			tgtCtr.z = _skySaved.ctr[2];
		} else V.tgtCamZ = camSolar();
	}
	V.lastInfo = void 0;
	V.dirty = true;
}
function turnTo(dir) {
	const yp = lookAlong(dir);
	let dy = yp.yaw - S.yaw;
	dy = ((dy + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
	V.tgtYaw = S.yaw + dy;
	V.tgtPitch = yp.pitch;
	V.dirty = true;
}
function lookAt(ra, dec) {
	const r = ra * Math.PI / 180, d = dec * Math.PI / 180;
	turnTo([
		Math.cos(d) * Math.cos(r),
		Math.cos(d) * Math.sin(r),
		Math.sin(d)
	]);
}
function lookAtSelection() {
	const b = current();
	if (!b) return;
	const p = physPos(b);
	if (!p) return;
	if (!S.skyMode) skyView(true);
	turnTo([
		p[0] - ctr.x,
		p[1] - ctr.y,
		p[2] - ctr.z
	]);
}
function setFov(deg) {
	const f = Math.min(W, H) * .62;
	V.fovK = Math.max(1, Math.min(6e3, Math.max(W, H) / 2 / Math.tan(deg / 2 * Math.PI / 180) / f));
	V.dirty = true;
}
function gotoEncounter(i) {
	const e = ENCOUNTERS[i];
	if (!e) return;
	timeBar.set(true);
	setTime(sliderOf(e.t));
	if (!S.hyg) {
		S.hyg = true;
		syncToggle("t-hyg", true);
	}
	S.pinned = e.s;
	S.focusStar = null;
	V.focusSys = null;
	V.FOLLOW = null;
	const q = hygPos(e.s, e.t), L = Math.hypot(q[0], q[1], q[2]) || 1e-9, d = compress(L) / L;
	aim(q[0] * d, q[1] * d, q[2] * d, scale(Math.max(L * .35, 3e-5)));
}
Object.assign(api, {
	importUser,
	clearUser,
	removeSet,
	queryField,
	skyView,
	lookAt,
	lookAtSelection,
	setFov,
	setSurvey,
	setBlink,
	gotoEncounter,
	lock: lockToggle,
	setCourse,
	clearCourse,
	engage: engageCourse,
	route: routeToggle,
	transfer: transferToggle,
	deselect,
	reset: resetView,
	toggleSolar,
	enterSolar,
	flyToScale,
	doSearch,
	toggleFac,
	facColorToggle,
	facList: () => facList,
	msgText
});
//#endregion
//#region src/engine/loop.js
var last = 0;
var lastGw = 0;
function frame(t) {
	const dt = Math.min(.05, (t - last) / 1e3 || 0);
	last = t;
	if (V.FOLLOW) {
		const w = V.FOLLOW === SUN ? [
			0,
			0,
			0
		] : navWorld(V.FOLLOW);
		if (w) {
			tgtCtr.x = w[0];
			tgtCtr.y = w[1];
			tgtCtr.z = w[2];
		} else V.FOLLOW = null;
	}
	if (S.autorot && !dragging) V.tgtYaw += dt * .1;
	if (keys.size) {
		if (S.realScale) V.flySpeed = Math.min(V.flySpeed * 1.06 + .06, 150);
		else V.flySpeed = 1;
		const step = (S.realScale ? S.camZ * V.flySpeed : Math.max(S.camZ, camDist)) * .06;
		let mx = 0, my = 0, mz = 0;
		if (keys.has("w")) {
			mx += camFwd[0];
			my += camFwd[1];
			mz += camFwd[2];
		}
		if (keys.has("s")) {
			mx -= camFwd[0];
			my -= camFwd[1];
			mz -= camFwd[2];
		}
		if (keys.has("d")) {
			mx += camRight[0];
			my += camRight[1];
			mz += camRight[2];
		}
		if (keys.has("a")) {
			mx -= camRight[0];
			my -= camRight[1];
			mz -= camRight[2];
		}
		if (keys.has("r")) {
			mx += camUp[0];
			my += camUp[1];
			mz += camUp[2];
		}
		if (keys.has("f")) {
			mx -= camUp[0];
			my -= camUp[1];
			mz -= camUp[2];
		}
		tgtCtr.x += mx * step;
		tgtCtr.y += my * step;
		tgtCtr.z += mz * step;
		S.autorot = false;
		S.pinned = null;
		V.FOLLOW = null;
	} else V.flySpeed = 1;
	if (V.gwOnScreen && t - lastGw > 70) {
		lastGw = t;
		V.dirty = true;
	}
	const cs = Math.abs(ctr.x) + Math.abs(ctr.y) + Math.abs(ctr.z) + 1;
	const anim = S.autorot && !dragging || dragging || keys.size > 0 || Math.abs(V.tgtYaw - S.yaw) > 1e-4 || Math.abs(V.tgtPitch - S.pitch) > 1e-4 || Math.abs(V.tgtCamZ - S.camZ) > S.camZ * 2e-4 + 1e-12 || Math.abs(tgtCtr.x - ctr.x) + Math.abs(tgtCtr.y - ctr.y) + Math.abs(tgtCtr.z - ctr.z) > cs * 1e-5;
	if (V.dirty || anim) {
		ctr.x += (tgtCtr.x - ctr.x) * .18;
		ctr.y += (tgtCtr.y - ctr.y) * .18;
		ctr.z += (tgtCtr.z - ctr.z) * .18;
		S.yaw += (V.tgtYaw - S.yaw) * .12;
		S.pitch += (V.tgtPitch - S.pitch) * .12;
		S.camZ = S.camZ > 0 && V.tgtCamZ > 0 ? S.camZ * Math.pow(V.tgtCamZ / S.camZ, .12) : S.camZ + (V.tgtCamZ - S.camZ) * .12;
		try {
			render();
		} catch (err) {
			if (!window.__rerr) {
				window.__rerr = 1;
				console.error("render error:", err);
			}
		}
		V.dirty = false;
	}
	requestAnimationFrame(frame);
}
//#endregion
//#region src/engine/search.js
var _sugIdx = null;
function sugIndex() {
	if (_sugIdx) return _sugIdx;
	const ix = [];
	const add = (n, k) => {
		if (n) ix.push([
			n,
			n.toLowerCase(),
			k
		]);
	};
	SOLAR_BODIES.forEach((b) => {
		add(b.n, b.kind);
		(b.moons || []).forEach((m) => add(m.n, "Moon"));
	});
	add("Sun", "Star");
	PROBES.forEach((p) => add(p.n, "Spacecraft"));
	SMALL.forEach((o) => add(o.n, o.kind));
	DSO.forEach((o) => add(o.n, (DSO_T[o.t] || {}).l || "Deep sky"));
	HYG.forEach((h) => add(h.n, "Star"));
	GAL.forEach((g) => add(g.n, "Galaxy"));
	STARS.forEach((st) => add(st.h, "Exoplanet host"));
	CLUSTERS.forEach((c) => add(c.n, (CLU_T[c.ct || 0] || {}).l || "Cluster"));
	PULSARS.forEach((p) => add(p.n, "Pulsar"));
	return _sugIdx = ix;
}
function suggestList(q) {
	q = (q || "").trim().toLowerCase();
	if (!q || q.length < 2) return [];
	const ix = sugIndex(), out = [];
	for (const e of ix) if (e[1].startsWith(q)) {
		out.push(e);
		if (out.length >= 6) break;
	}
	if (out.length < 6) {
		for (const e of ix) if (!e[1].startsWith(q) && e[1].includes(q)) {
			out.push(e);
			if (out.length >= 6) break;
		}
	}
	return out;
}
//#endregion
//#region src/engine/share.js
var HASH_KEYS = [
	"ast",
	"autorot",
	"belt",
	"con",
	"dso",
	"edge",
	"freelook",
	"gaia",
	"galaxies",
	"gpu",
	"helio",
	"hyg",
	"hz",
	"moons",
	"mw",
	"mw3d",
	"ob",
	"oclu",
	"probes",
	"psr",
	"qso",
	"rings",
	"size",
	"tno",
	"vars",
	"veil",
	"web",
	"lag",
	"lens",
	"iso",
	"eht",
	"radio",
	"bubble",
	"grid",
	"ggrid"
];
function viewHash() {
	let m = 0n;
	HASH_KEYS.forEach((k, i) => {
		if (S[k]) m |= 1n << BigInt(i);
	});
	const parts = [
		S.yaw.toFixed(4),
		S.pitch.toFixed(4),
		S.camZ.toExponential(4),
		ctr.x.toExponential(4),
		ctr.y.toExponential(4),
		ctr.z.toExponential(4),
		S.realScale ? 1 : 0,
		Math.round(S.tOffsetDays),
		m.toString(36)
	];
	if (S.skyMode) parts.push("s" + V.fovK.toPrecision(4) + "-" + (ST.on ? ST.id : "0") + "-" + (ST.blink ? ST.blinkWith : "0"));
	return "v1_" + parts.join("_");
}
function parse36(s) {
	let m = 0n;
	for (const ch of s) {
		const d = parseInt(ch, 36);
		if (isNaN(d)) return 0n;
		m = m * 36n + BigInt(d);
	}
	return m;
}
function applyHash() {
	try {
		const h = (typeof location !== "undefined" && location.hash || "").replace(/^#/, "");
		if (!h.startsWith("v1_")) return;
		const p = h.split("_");
		if (p.length < 10) return;
		S.yaw = V.tgtYaw = +p[1];
		S.pitch = V.tgtPitch = +p[2];
		S.camZ = V.tgtCamZ = +p[3];
		ctr.x = tgtCtr.x = +p[4];
		ctr.y = tgtCtr.y = +p[5];
		ctr.z = tgtCtr.z = +p[6];
		S.realScale = p[7] === "1";
		syncToggle("t-real", S.realScale);
		S.tOffsetDays = +p[8] || 0;
		const m = parse36(p[9]);
		HASH_KEYS.forEach((k, i) => {
			if (!TOGGLE_REG[k]) return;
			const v = !!(m & 1n << BigInt(i));
			S[k] = v;
			syncToggle(TOGGLE_REG[k], v);
		});
		if (p[10] && p[10][0] === "s") {
			const q = p[10].slice(1).split("-");
			S.skyMode = true;
			V.fovK = Math.max(1, Math.min(6e3, +q[0] || 1));
			setSurvey(q[1] && q[1] !== "0" ? q[1] : null);
			if (q[2] && q[2] !== "0") setBlink(true, q[2]);
		}
		V.dirty = true;
	} catch (e) {}
}
var lastHash = "";
if (typeof history !== "undefined" && history.replaceState) setInterval(() => {
	const h = viewHash();
	if (h !== lastHash) {
		lastHash = h;
		try {
			history.replaceState(null, "", "#" + h);
		} catch (e) {}
	}
}, 2e3);
function share() {
	const h = viewHash();
	try {
		history.replaceState(null, "", "#" + h);
	} catch (e) {}
	const u = typeof location !== "undefined" ? location.href : h;
	if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(() => msg("View link copied"), () => msg(u));
	else msg(u);
	return u;
}
api.share = share;
//#endregion
//#region src/engine/tour.js
var TOUR = [
	{
		t: "1 · Earth — home",
		d: "Every planet, dwarf planet and moon here sits at its real position for today’s date (JPL ephemerides). The moons orbit in their true planes — run the time slider and watch them move.",
		go: () => {
			const e = PLANETS.find((p) => p.n === "Earth");
			enterSolar();
			S.pinned = e;
		}
	},
	{
		t: "2 · Voyager 1 — the farthest human object",
		d: "Launched 1977, now ~171 AU out — a radio signal takes almost a day for the round trip. The blue dashed line is its real outbound trajectory (JPL Horizons). Beyond it: the heliopause, where the Sun’s wind yields to interstellar space.",
		go: () => {
			if (!S.probes) {
				S.probes = true;
				syncToggle("t-probes", true);
			}
			const v = PROBES.find((p) => p.n === "Voyager 1");
			enterSolar();
			S.pinned = v;
		}
	},
	{
		t: "3 · Proxima Centauri — the nearest star",
		d: "4.25 light-years away. The gap between our solar system and this red dwarf is the real emptiness of interstellar space — switch “Compact view” off later to feel it. Proxima hosts at least one Earth-sized planet in its habitable zone.",
		go: () => {
			const h = HYG.find((x) => x.n === "Proxima Centauri");
			if (h) {
				S.pinned = h;
				focusOnHyg(h);
			}
		}
	},
	{
		t: "4 · TRAPPIST-1 — seven rocky worlds",
		d: "A cool red dwarf 40 ly away with seven Earth-sized planets — several inside the green habitable zone. Their positions on the orbits are the REAL phases for today, computed from the measured transit ephemerides.",
		go: () => {
			const st = STARS.find((x) => x.h === "TRAPPIST-1");
			if (st) focusOn(st);
		}
	},
	{
		t: "5 · Orion Nebula — a stellar nursery",
		d: "1,300 ly away: the nearest massive star-forming region, visible to the naked eye as the middle “star” of Orion’s sword. The blue dots all around are 131,000 real Gaia OB stars — hot young stars tracing the spiral arms.",
		go: () => {
			const o = DSO.find((x) => x.n.indexOf("Orion Nebula") >= 0);
			if (o) {
				S.pinned = o;
				flyTo(o);
			}
		}
	},
	{
		t: "6 · Sagittarius A* — our black hole",
		d: "The 4.3-million-solar-mass black hole at the centre of the Milky Way, 27,000 ly away. The star S2 whips around it every 16 years — its real measured orbit is drawn here; the 2018 pericentre passage confirmed general relativity.",
		go: () => {
			S.pinned = SGRA;
			flyTo(SGRA);
		}
	},
	{
		t: "7 · Andromeda — the next galaxy",
		d: "M31, 2.54 million ly away — the light you see left it before humans existed. It approaches us at ~110 km/s and will merge with the Milky Way in ~4.5 billion years.",
		go: () => {
			const g = GAL.find((x) => x.n && x.n.indexOf("Andromeda") >= 0);
			if (g) focusOnGalaxy(g);
		}
	},
	{
		t: "8 · Laniakea — our supercluster",
		d: "100,000 galaxies, 520 million ly across, all drifting toward the Great Attractor. The faint dots everywhere are 43,000 real galaxies of the 2MRS survey — the cosmic web.",
		go: () => {
			const o = DSO.find((x) => x.n.indexOf("Laniakea") >= 0);
			if (o) {
				S.pinned = o;
				flyTo(o);
			}
		}
	},
	{
		t: "9 · The edge of the observable universe",
		d: "The blue shell marks the cosmic microwave background, ~46 billion ly in every direction — the oldest light there is. Beyond it, the universe continues, but its light hasn’t reached us yet. The purple dots: a million real quasars.",
		go: () => {
			if (!S.edge) {
				S.edge = true;
				syncToggle("t-edge", true);
			}
			S.pinned = null;
			tgtCtr.x = tgtCtr.y = tgtCtr.z = 0;
			V.tgtCamZ = 16;
			V.tgtPitch = -.35;
		}
	}
];
var tourIdx = -1;
function tourShow(i) {
	tourIdx = Math.max(0, Math.min(TOUR.length - 1, i));
	const st = TOUR[tourIdx];
	st.go();
	tour.set({
		idx: tourIdx,
		total: TOUR.length,
		title: st.t,
		text: st.d
	});
	V.dirty = true;
}
function tourEnd() {
	tourIdx = -1;
	tour.set(null);
	S.pinned = null;
	V.dirty = true;
}
api.tour = {
	start() {
		if (S.realScale) clickToggle("t-real");
		tourShow(0);
	},
	next() {
		if (tourIdx >= TOUR.length - 1) tourEnd();
		else tourShow(tourIdx + 1);
	},
	prev() {
		tourShow(tourIdx - 1);
	},
	end: tourEnd
};
//#endregion
//#region src/engine/index.js
api.clickToggle = clickToggle;
api.suggest = suggestList;
api.getS = () => S;
api.getCam = () => ({
	camZ: S.camZ,
	tgt: V.tgtCamZ,
	real: S.realScale
});
api.searchInput = (q) => {
	if (q && q.trim().length > 2) api.doSearch(q);
};
api.zoomBy = (f) => {
	let ax = W / 2, ay = H / 2;
	if (S.pinned) {
		const w = objWorld(S.pinned);
		if (w) {
			const p = project(w[0], w[1], w[2]);
			if (p.depth > V.NEAR && p.x > 0 && p.x < W && p.y > 0 && p.y < H) {
				ax = p.x;
				ay = p.y;
			}
		}
	}
	zoomFactorAt(ax, ay, f);
	V.dirty = true;
};
api.liveStats = () => {
	const y = (/* @__PURE__ */ new Date()).getFullYear();
	let n = 0;
	for (const st of STARS) if (st.fy === y) n++;
	return {
		exoY: n,
		year: y
	};
};
LIVE.onUpdate = () => {
	V.dirty = true;
};
restoreUser();
window.__ku = {
	api,
	live: LIVE,
	redraw: () => {
		V.dirty = true;
	},
	survey: {
		ST,
		SKYSTAT,
		cacheSize
	},
	user: USER,
	userProj,
	hyg: HYG,
	projDir: (x, y, z) => {
		const R = scale(SKY_R_PC), o = {};
		projectInto(x * R, y * R, z * R, o);
		return o;
	},
	get gaiaPm() {
		return gaiaPm;
	},
	get gaiaRange() {
		return gaiaRange;
	},
	sunScreen: () => {
		const o = {};
		projectInto(0, 0, 0, o);
		return o;
	},
	clearColor: () => glClearColor()
};
window.__kuapi = api;
facList$1.set(facList);
startLive();
if (!(location.hash || "").includes("v1_")) clickToggle("t-real");
applyHash();
initGL();
loadGaia();
loadExtragal();
requestAnimationFrame(frame);
//#endregion
