module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[project]/lib/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiError",
    ()=>ApiError,
    "applyLoan",
    ()=>applyLoan,
    "askCoach",
    ()=>askCoach,
    "assessCredit",
    ()=>assessCredit,
    "assessLoan",
    ()=>assessLoan,
    "checkHealth",
    ()=>checkHealth,
    "createBusiness",
    ()=>createBusiness,
    "explainFraudAlert",
    ()=>explainFraudAlert,
    "getAnalyticsCashflow",
    ()=>getAnalyticsCashflow,
    "getAnalyticsExpenses",
    ()=>getAnalyticsExpenses,
    "getAnalyticsRevenueTrend",
    ()=>getAnalyticsRevenueTrend,
    "getAnalyticsSummary",
    ()=>getAnalyticsSummary,
    "getBusiness",
    ()=>getBusiness,
    "getCoachContext",
    ()=>getCoachContext,
    "getCreditProfile",
    ()=>getCreditProfile,
    "getEducationalCards",
    ()=>getEducationalCards,
    "getFraudAlerts",
    ()=>getFraudAlerts,
    "getFraudSummary",
    ()=>getFraudSummary,
    "getLoanApplication",
    ()=>getLoanApplication,
    "getLoanApplications",
    ()=>getLoanApplications,
    "getMe",
    ()=>getMe,
    "getSchemeMatches",
    ()=>getSchemeMatches,
    "getSchemes",
    ()=>getSchemes,
    "getTransactions",
    ()=>getTransactions,
    "loginUser",
    ()=>loginUser,
    "registerUser",
    ()=>registerUser,
    "runFraudAnalysis",
    ()=>runFraudAnalysis,
    "seedDemoData",
    ()=>seedDemoData,
    "simulateLoan",
    ()=>simulateLoan,
    "updateBusiness",
    ()=>updateBusiness,
    "uploadTransactionsCsv",
    ()=>uploadTransactionsCsv
]);
/**
 * FINBRIDGE — Typed API Client (Part 03)
 * Extends Part 02 with transaction upload and analytics endpoints.
 */ const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
// ─────────────────────────────────────────────
// Base request helper
// ─────────────────────────────────────────────
async function request(path, options = {}, idToken) {
    const url = `${API_BASE}${path}`;
    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };
    if (idToken) {
        headers["Authorization"] = `Bearer ${idToken}`;
    }
    const response = await fetch(url, {
        ...options,
        headers
    });
    if (!response.ok) {
        const body = await response.json().catch(()=>({}));
        throw new ApiError(body.detail ?? body.message ?? `HTTP ${response.status}`, response.status);
    }
    return response.json();
}
class ApiError extends Error {
    statusCode;
    constructor(message, statusCode){
        super(message), this.statusCode = statusCode;
        this.name = "ApiError";
    }
}
async function checkHealth() {
    return request("/health");
}
async function registerUser(idToken, name, email) {
    return request("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({
            firebase_id_token: idToken,
            name,
            email
        })
    });
}
async function loginUser(idToken) {
    return request("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({
            firebase_id_token: idToken
        })
    });
}
async function getMe(idToken) {
    return request("/api/v1/auth/me", {}, idToken);
}
async function createBusiness(idToken, data) {
    return request("/api/v1/business/profile", {
        method: "POST",
        body: JSON.stringify(data)
    }, idToken);
}
async function getBusiness(idToken) {
    return request("/api/v1/business/profile", {}, idToken);
}
async function updateBusiness(idToken, data) {
    return request("/api/v1/business/profile", {
        method: "PUT",
        body: JSON.stringify(data)
    }, idToken);
}
async function seedDemoData(idToken) {
    return request("/api/v1/demo/seed", {
        method: "POST"
    }, idToken);
}
async function uploadTransactionsCsv(idToken, file) {
    const url = `${API_BASE}/api/v1/transactions/upload`;
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${idToken}`
        },
        body: formData
    });
    if (!response.ok) {
        const body = await response.json().catch(()=>({}));
        throw new ApiError(body.detail ?? body.message ?? `HTTP ${response.status}`, response.status);
    }
    return response.json();
}
async function getTransactions(idToken, limit = 100, offset = 0) {
    return request(`/api/v1/transactions/?limit=${limit}&offset=${offset}`, {}, idToken);
}
async function getAnalyticsSummary(idToken) {
    return request("/api/v1/analytics/summary", {}, idToken);
}
async function getAnalyticsCashflow(idToken) {
    return request("/api/v1/analytics/cashflow", {}, idToken);
}
async function getAnalyticsExpenses(idToken) {
    return request("/api/v1/analytics/expenses", {}, idToken);
}
async function getAnalyticsRevenueTrend(idToken) {
    return request("/api/v1/analytics/revenue-trend", {}, idToken);
}
async function runFraudAnalysis(idToken) {
    return request("/api/v1/fraud/analyze", {
        method: "POST"
    }, idToken);
}
async function getFraudAlerts(idToken, riskLevel, limit = 50, offset = 0) {
    let url = `/api/v1/fraud/alerts?limit=${limit}&offset=${offset}`;
    if (riskLevel) {
        url += `&risk_level=${riskLevel}`;
    }
    return request(url, {}, idToken);
}
async function getFraudSummary(idToken) {
    return request("/api/v1/fraud/summary", {}, idToken);
}
async function assessCredit(idToken, recalculateFraud = false) {
    return request("/api/v1/credit/assess", {
        method: "POST",
        body: JSON.stringify({
            recalculate_fraud: recalculateFraud
        })
    }, idToken);
}
async function getCreditProfile(idToken) {
    return request("/api/v1/credit/profile", {
        method: "GET"
    }, idToken);
}
async function applyLoan(payload, idToken) {
    return request("/api/v1/loans/apply", {
        method: "POST",
        body: JSON.stringify(payload)
    }, idToken);
}
async function assessLoan(payload, idToken) {
    return request("/api/v1/loans/assess", {
        method: "POST",
        body: JSON.stringify(payload)
    }, idToken);
}
async function simulateLoan(payload, idToken) {
    return request("/api/v1/loans/simulate", {
        method: "POST",
        body: JSON.stringify(payload)
    }, idToken);
}
async function getLoanApplications(idToken) {
    return request("/api/v1/loans/applications", {
        method: "GET"
    }, idToken);
}
async function getLoanApplication(applicationId, idToken) {
    return request(`/api/v1/loans/${applicationId}`, {
        method: "GET"
    }, idToken);
}
async function getSchemes(idToken) {
    return request("/api/v1/schemes", {}, idToken);
}
async function getSchemeMatches(idToken) {
    return request("/api/v1/schemes/matches", {}, idToken);
}
async function askCoach(payload, idToken) {
    return request("/api/v1/coach/ask", {
        method: "POST",
        body: JSON.stringify(payload)
    }, idToken);
}
async function getCoachContext(idToken) {
    return request("/api/v1/coach/context", {}, idToken);
}
async function getEducationalCards() {
    return request("/api/v1/coach/education", {});
}
async function explainFraudAlert(body, idToken) {
    return request("/api/v1/coach/explain-fraud", {
        method: "POST",
        body: JSON.stringify(body)
    }, idToken);
}
}),
"[project]/lib/auth-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * FINBRIDGE — Auth Context (Part 02)
 * Wraps Firebase Auth state + FINBRIDGE user DB record.
 * Provides: currentUser, dbUser, loading, signOut, idToken helper.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$totp$2d$BU9AvxK8$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$5f$__as__onAuthStateChanged$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/node-esm/totp-BU9AvxK8.js [app-ssr] (ecmascript) <export _ as onAuthStateChanged>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$totp$2d$BU9AvxK8$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__ak__as__signOut$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/node-esm/totp-BU9AvxK8.js [app-ssr] (ecmascript) <export ak as signOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/firebase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    const [firebaseUser, setFirebaseUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [dbUser, setDbUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const getIdToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (!firebaseUser) return null;
        try {
            return await firebaseUser.getIdToken(/* forceRefresh */ false);
        } catch  {
            return null;
        }
    }, [
        firebaseUser
    ]);
    // Subscribe to Firebase auth state
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$totp$2d$BU9AvxK8$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$5f$__as__onAuthStateChanged$3e$__["onAuthStateChanged"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["auth"], async (fbUser)=>{
            setFirebaseUser(fbUser);
            if (fbUser) {
                try {
                    const token = await fbUser.getIdToken();
                    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMe"])(token);
                    setDbUser(user);
                } catch (err) {
                    // User exists in Firebase but not in our DB (hasn't completed registration)
                    if (err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiError"] && err.statusCode === 401) {
                        setDbUser(null);
                    }
                }
            } else {
                setDbUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);
    const signOut = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$totp$2d$BU9AvxK8$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__ak__as__signOut$3e$__["signOut"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["auth"]);
        setFirebaseUser(null);
        setDbUser(null);
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            firebaseUser,
            dbUser,
            loading,
            signOut,
            getIdToken
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/auth-context.tsx",
        lineNumber: 95,
        columnNumber: 5
    }, this);
}
function useAuth() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within <AuthProvider>");
    }
    return ctx;
}
}),
"[project]/lib/firebase.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "auth",
    ()=>auth,
    "default",
    ()=>__TURBOPACK__default__export__
]);
/**
 * FINBRIDGE — Firebase Client Configuration
 * Uses environment variables — all NEXT_PUBLIC_ prefixed for browser access.
 * Fallbacks provided for build/demo environments without hard-crashing.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$app$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/app/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$totp$2d$BU9AvxK8$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__D__as__getAuth$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/node-esm/totp-BU9AvxK8.js [app-ssr] (ecmascript) <export D as getAuth>");
;
;
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy-api-key-for-development",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "finbridge-dev.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "finbridge-dev",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "finbridge-dev.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
// Singleton pattern — prevent re-initialization during hot reload
const firebaseApp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getApps"])().length === 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["initializeApp"])(firebaseConfig) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getApp"])();
const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$totp$2d$BU9AvxK8$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__D__as__getAuth$3e$__["getAuth"])(firebaseApp);
const __TURBOPACK__default__export__ = firebaseApp;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0sakbza._.js.map