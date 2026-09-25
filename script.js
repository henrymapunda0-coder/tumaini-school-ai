const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatThread = document.getElementById('chatThread');
const fileInput = document.getElementById('fileInput');
const attachmentPreview = document.getElementById('attachmentPreview');
const uploadDropzone = document.getElementById('uploadDropzone');
const inputBoxWrapper = document.querySelector('.input-box-wrapper');
const attachBtn = document.getElementById('attachBtn');
const paperclipBtn = document.getElementById('paperclipBtn');
const microphoneBtn = document.getElementById('microphoneBtn');
const newChatBtn = document.getElementById('newChatBtn');
const deepThinkBtn = document.getElementById('deepThinkBtn');
const searchBtn = document.getElementById('searchBtn');
const heroPanel = document.getElementById('heroPanel');
const aiShowcase = document.querySelector('.ai-showcase');
const accountBtn = document.getElementById('accountBtn');
const accountModal = document.getElementById('accountModal');
const accountClose = document.getElementById('accountClose');
const accountForm = document.getElementById('accountForm');
const accountStatus = document.getElementById('accountStatus');
const accountLabel = document.getElementById('accountLabel');
const userAvatar = document.getElementById('userAvatar');
const accountLogout = document.getElementById('accountLogout');
const passwordToggle = document.getElementById('passwordToggle');
const accountPassword = document.getElementById('accountPassword');
const accountProfile = document.getElementById('accountProfile');
const profileAvatar = document.getElementById('profileAvatar');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const passwordStrengthBar = document.getElementById('passwordStrengthBar');
const passwordStrengthText = document.getElementById('passwordStrengthText');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const storageKey = 'tumaini-schools-ai-chat';
const chatHistoryStorageKey = 'tumaini-schools-ai-chat-history';
const activeChatStorageKey = 'tumaini-schools-ai-active-chat';
const welcomeMessage = 'Hello! I am ready to help you with lessons, projects, or ideas for the school.';
const accountStorageKey = 'tumaini-schools-ai-account';
const fileContextStorageKey = 'tumaini-schools-ai-file-context';
const instagramUrl = 'https://www.instagram.com/tumainischoolstz/';
const tiktokUrl = 'https://www.tiktok.com/@tumainischoolstz';
const facebookUrl = 'https://www.facebook.com/';
const youtubeUrl = 'https://www.youtube.com/@tumainischools';
const schoolVideoUrl = 'https://youtu.be/6bEnp3HcZFM';
const whatsappNumber = '0745212613';
const whatsappUrl = 'https://wa.me/255745212613';
const nectaUrl = 'https://necta.go.tz/';
const libraryUrl = 'https://your-website.com'; // Replace with your real website URL
const settingsStorageKey = 'tumaini-schools-ai-settings';
const memoryStorageKey = 'tumaini-schools-ai-memory';
const sessionMemoryStorageKey = 'tumaini-schools-ai-session-memory';
const settingsModal = document.getElementById('settingsModal');
const settingsClose = document.getElementById('settingsClose');
const reduceMotionToggle = document.getElementById('reduceMotionToggle');
const autoSpeakToggle = document.getElementById('autoSpeakToggle');
const clearChatBtn = document.getElementById('clearChatBtn');
const settingsStatus = document.getElementById('settingsStatus');
const themeSelect = document.getElementById('themeSelect');
const resetSettingsBtn = document.getElementById('resetSettingsBtn');
const profilePhotoInput = document.getElementById('profilePhotoInput');
const changePhotoBtn = document.getElementById('changePhotoBtn');
const chatHistoryList = document.getElementById('chatHistoryList');
const historySearchInput = document.getElementById('historySearchInput');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const calculatorModal = document.getElementById('calculatorModal');
const calculatorClose = document.getElementById('calculatorClose');
const calculatorExpression = document.getElementById('calculatorExpression');
const calculatorResult = document.getElementById('calculatorResult');
const calculatorInput = document.getElementById('calculatorInput');
const calculatorEvaluateBtn = document.getElementById('calculatorEvaluateBtn');
const calculatorSolveBtn = document.getElementById('calculatorSolveBtn');
const calculatorStepBtn = document.getElementById('calculatorStepBtn');
const promptChipButtons = document.querySelectorAll('.prompt-chip');
const defaultSettings = Object.freeze({
    theme: 'aurora',
    reduceMotion: false,
    autoSpeak: false
});
const pythonBackendUrl = window.TUMAINI_AI_BACKEND_URL || 'http://localhost:8000';
const backendTimeoutMs = 18000;

let deepThinkEnabled = false;
let searchEnabled = true;
let speechRecognition;
let lastUserMessage = '';
let thinkingMessage;
let attachedTextContext = '';
let attachedFileName = '';
let activeAttachments = [];
let activeChatId = localStorage.getItem(activeChatStorageKey) || `chat-${Date.now()}`;
let calculatorValue = '0';

async function createImagePreview(file) {
    if (!file || !file.type || !file.type.startsWith('image/')) return '';
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
    });
}

function formatCalculatorNumber(value) {
    if (!Number.isFinite(value)) return 'Error';
    if (Math.abs(value) >= 1e12 || (Math.abs(value) > 0 && Math.abs(value) < 1e-8)) {
        return value.toExponential(6).replace(/\.?0+e/, 'e');
    }
    return Number(value.toFixed(10)).toString();
}

function factorial(value) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i += 1) result *= i;
    return result;
}

function normalizeMathInput(value) {
    let normalized = String(value || '0').trim();
    normalized = normalized.replace(/×/g, '*');
    normalized = normalized.replace(/÷/g, '/');
    normalized = normalized.replace(/−/g, '-');
    normalized = normalized.replace(/°/g, '');
    normalized = normalized.replace(/[θΘ]/g, 'x');
    normalized = normalized.replace(/π/g, 'pi');
    normalized = normalized.replace(/sin\s*\^\s*-?1/gi, 'asin');
    normalized = normalized.replace(/cos\s*\^\s*-?1/gi, 'acos');
    normalized = normalized.replace(/tan\s*\^\s*-?1/gi, 'atan');
    normalized = normalized.replace(/\b(sin|cos|tan|sec|csc|cot|asin|acos|atan)\s+(-?\d+(?:\.\d+)?)/gi, '$1($2)');
    normalized = normalized.replace(/\b(sin|cos|tan|sec|csc|cot)\s+x\b/gi, '$1(x)');
    normalized = normalized.replace(/²/g, '^2');
    normalized = normalized.replace(/³/g, '^3');
    normalized = normalized.replace(/\s+/g, '');
    normalized = normalized.replace(/(\d+|\))!/g, 'factorial($1)');
    normalized = normalized.replace(/(\d|\))(?=x|pi|sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|log|ln|sqrt|abs|exp|e|\()/gi, '$1*');
    normalized = normalized.replace(/(x|pi|e|\))(?=\d|x|pi|sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|log|ln|sqrt|abs|exp|e|\()/gi, '$1*');
    normalized = normalized.replace(/\^2/g, '**2');
    normalized = normalized.replace(/\^3/g, '**3');
    normalized = normalized.replace(/\^/g, '**');
    normalized = normalized.replace(/mod/g, '%');
    normalized = normalized.replace(/\bE\b/g, 'Math.E');
    return normalized;
}

function schoolMathToDegrees(expression) {
    let converted = String(expression || '').trim();
    converted = converted.replace(/\bsec\(/g, 'sec(');
    converted = converted.replace(/\bcsc\(/g, 'csc(');
    converted = converted.replace(/\bcot\(/g, 'cot(');
    converted = converted.replace(/\barcsin\(/gi, 'asin(');
    converted = converted.replace(/\barccos\(/gi, 'acos(');
    converted = converted.replace(/\barctan\(/gi, 'atan(');
    converted = converted.replace(/\batan2\(/gi, 'atan2(');
    converted = converted.replace(/\blog\(/g, 'log10(');
    converted = converted.replace(/\bln\(/g, 'log(');
    converted = converted.replace(/\bpi\b/g, 'pi');
    converted = converted.replace(/sin\(([^)]+)\)/g, 'sin(($1)*pi/180)');
    converted = converted.replace(/cos\(([^)]+)\)/g, 'cos(($1)*pi/180)');
    converted = converted.replace(/tan\(([^)]+)\)/g, 'tan(($1)*pi/180)');
    converted = converted.replace(/asin\(([^)]+)\)/g, 'asin(($1))*180/pi');
    converted = converted.replace(/acos\(([^)]+)\)/g, 'acos(($1))*180/pi');
    converted = converted.replace(/atan\(([^)]+)\)/g, 'atan(($1))*180/pi');
    converted = converted.replace(/sec\(([^)]+)\)/g, '1/cos(($1)*pi/180)');
    converted = converted.replace(/csc\(([^)]+)\)/g, '1/sin(($1)*pi/180)');
    converted = converted.replace(/cot\(([^)]+)\)/g, 'cos(($1)*pi/180)/sin(($1)*pi/180)');
    return converted;
}

function evaluateWithMathJs(expression) {
    if (!window.math) return null;
    try {
        const prepared = schoolMathToDegrees(expression);
        const result = window.math.evaluate(prepared);
        if (typeof result === 'number' && Number.isFinite(result)) return result;
        if (result && typeof result.valueOf === 'function') {
            const numeric = Number(result.valueOf());
            if (Number.isFinite(numeric)) return numeric;
        }
    } catch {
        return null;
    }
    return null;
}

function safeEvaluateExpression(expression) {
    const sanitized = normalizeMathInput(expression);
    if (!sanitized || sanitized === '0') return 0;

    const mathJsValue = evaluateWithMathJs(sanitized);
    if (mathJsValue !== null) return mathJsValue;

    const fn = new Function(
        'pi',
        'sin',
        'cos',
        'tan',
        'asin',
        'atan',
        'sinh',
        'cosh',
        'tanh',
        'log',
        'ln',
        'sqrt',
        'abs',
        'exp',
        'factorial',
        'Math',
        `return (${sanitized});`
    );

    return fn(
        Math.PI,
        (value) => Math.sin((value * Math.PI) / 180),
        (value) => Math.cos((value * Math.PI) / 180),
        (value) => Math.tan((value * Math.PI) / 180),
        (value) => Math.asin(value) * (180 / Math.PI),
        (value) => Math.atan(value) * (180 / Math.PI),
        (value) => Math.sinh(value),
        (value) => Math.cosh(value),
        (value) => Math.tanh(value),
        (value) => Math.log10(value),
        (value) => Math.log(value),
        (value) => Math.sqrt(value),
        (value) => Math.abs(value),
        (value) => Math.exp(value),
        (value) => factorial(value),
        Math
    );
}

function createLinearEquationSteps(equation) {
    const normalized = normalizeMathInput(equation).replace(/Math\.E/g, 'E');
    if (!normalized.includes('=')) return null;

    const [left, right] = normalized.split('=');
    const leftValue = left.replace(/\*\*/g, '^');
    const rightValue = right.replace(/\*\*/g, '^');
    const leftMatch = leftValue.match(/([+-]?\d*\.?\d*)x([+-]\d*\.?\d*)?/i);
    const rightMatch = rightValue.match(/([+-]?\d*\.?\d*)/);

    if (!leftMatch) return null;

    const a = Number(leftMatch[1] || '1');
    const leftConstant = leftMatch[2] ? Number(leftMatch[2]) : 0;
    const target = rightMatch ? Number(rightMatch[1]) : 0;
    const finalConstant = leftConstant - target;

    if (Math.abs(a) < 1e-9) return null;

    const xValue = -finalConstant / a;
    return [
        `Equation: ${equation}`,
        `Move constants: ${a}x ${leftConstant >= 0 ? '+' : '-'} ${Math.abs(leftConstant)} = ${target}`,
        `${a}x = ${-finalConstant}`,
        `x = ${-finalConstant} / ${a}`,
        `x = ${formatCalculatorNumber(xValue)}`
    ].join('\n');
}

function createQuadraticEquationSteps(equation) {
    const normalized = normalizeMathInput(equation).replace(/Math\.E/g, 'E');
    if (!normalized.includes('=')) return null;

    const [left, right] = normalized.split('=');
    const expr = `(${left})-(${right})`;
    const match = expr.match(/([+-]?\d*\.?\d*)x\^2([+-]\d*\.?\d*)x([+-]\d*\.?\d*)/i);
    if (!match) return null;

    const a = Number(match[1] || '1');
    const b = Number(match[2] || '0');
    const c = Number(match[3] || '0');
    const discriminant = b * b - 4 * a * c;

    if (Math.abs(a) < 1e-9) return null;

    const sqrtValue = Math.sqrt(Math.abs(discriminant));
    const numeratorOne = -b + sqrtValue;
    const numeratorTwo = -b - sqrtValue;
    const root1 = numeratorOne / (2 * a);
    const root2 = numeratorTwo / (2 * a);

    const lines = [
        `Equation: ${equation}`,
        `a = ${a}, b = ${b}, c = ${c}`,
        `D = b² - 4ac = ${b}² - 4(${a})(${c}) = ${discriminant}`,
        `x = (-b ± √D) / 2a`,
        `x = (-${b} ± √${discriminant}) / ${2 * a}`,
    ];

    if (discriminant < 0) {
        lines.push(`Discriminant is negative, so there are no real roots.`);
        return lines.join('\n');
    }

    lines.push(`x₁ = ${formatCalculatorNumber(root1)}`);
    lines.push(`x₂ = ${formatCalculatorNumber(root2)}`);
    return lines.join('\n');
}

function createExpressionSteps(value) {
    const normalized = normalizeMathInput(value);
    const numeric = safeEvaluateExpression(normalized);

    if (!Number.isFinite(numeric)) return null;

    const valueText = String(value).trim();
    const lower = valueText.toLowerCase();

    if (lower.includes('sin(') || lower.includes('cos(') || lower.includes('tan(') || lower.includes('asin(') || lower.includes('acos(') || lower.includes('atan(')) {
        const final = formatCalculatorNumber(numeric);
        return `${valueText} = ${final}`;
    }

    if (lower.includes('log(') || lower.includes('ln(')) {
        const final = formatCalculatorNumber(numeric);
        return `${valueText} = ${final}`;
    }

    if (lower.includes('sqrt(') || lower.includes('^') || lower.includes('!')) {
        const final = formatCalculatorNumber(numeric);
        return `${valueText} = ${final}`;
    }

    return `${valueText} = ${formatCalculatorNumber(numeric)}`;
}

function createStepByStepSolution(inputValue) {
    const raw = String(inputValue || '').trim();
    if (!raw) return 'Enter a math question to see the steps.';

    const advanced = solveAdvancedMathQuestion(raw);
    if (advanced) return advanced;

    const normalized = normalizeMathInput(raw);
    if (normalized.includes('=')) {
        const quadraticSteps = createQuadraticEquationSteps(normalized);
        if (quadraticSteps) return quadraticSteps;
        const linearSteps = createLinearEquationSteps(normalized);
        if (linearSteps) return linearSteps;
        return `Equation: ${raw}\nSolve by simplifying both sides and isolating x.`;
    }

    const expressionSteps = createExpressionSteps(normalized);
    if (expressionSteps) return expressionSteps;

    return `Evaluate: ${raw}\nFinal result: ${formatCalculatorNumber(safeEvaluateExpression(normalized))}`;
}

function evaluateExpressionForVariable(expression, xValue) {
    const fn = new Function(
        'x',
        'pi',
        'sin',
        'cos',
        'tan',
        'asin',
        'acos',
        'atan',
        'sinh',
        'cosh',
        'tanh',
        'log',
        'ln',
        'sqrt',
        'abs',
        'exp',
        'factorial',
        'Math',
        `return (${expression});`
    );

    return fn(
        xValue,
        Math.PI,
        (value) => Math.sin((value * Math.PI) / 180),
        (value) => Math.cos((value * Math.PI) / 180),
        (value) => Math.tan((value * Math.PI) / 180),
        (value) => Math.asin(value) * (180 / Math.PI),
        (value) => Math.acos(value) * (180 / Math.PI),
        (value) => Math.atan(value) * (180 / Math.PI),
        (value) => Math.sinh(value),
        (value) => Math.cosh(value),
        (value) => Math.tanh(value),
        (value) => Math.log10(value),
        (value) => Math.log(value),
        (value) => Math.sqrt(value),
        (value) => Math.abs(value),
        (value) => Math.exp(value),
        (value) => factorial(value),
        Math
    );
}

function bisectRoot(evaluator, low, high) {
    let a = low;
    let b = high;
    let fa = evaluator(a);
    let fb = evaluator(b);

    for (let i = 0; i < 80; i += 1) {
        const mid = (a + b) / 2;
        const fm = evaluator(mid);
        if (Math.abs(fm) < 1e-8) {
            return mid;
        }
        if ((fa < 0 && fm > 0) || (fa > 0 && fm < 0)) {
            b = mid;
            fb = fm;
        } else {
            a = mid;
            fa = fm;
        }
    }

    return (a + b) / 2;
}

function solveEquationNumerically(rawEquation) {
    const equation = normalizeMathInput(rawEquation).replace(/Math\.E/g, 'E');
    if (!equation.includes('=')) return null;

    const [left, right] = equation.split('=');
    const expression = `(${left})-(${right})`;
    const evaluator = (xValue) => {
        try {
            const value = evaluateExpressionForVariable(expression, xValue);
            return Number.isFinite(value) ? value : NaN;
        } catch {
            return NaN;
        }
    };

    const roots = [];
    for (let x = -100; x <= 100; x += 0.25) {
        const value = evaluator(x);
        const nextValue = evaluator(x + 0.25);
        if (Number.isFinite(value) && Math.abs(value) < 1e-6) {
            roots.push(Number(x.toFixed(6)));
        }
        if (Number.isFinite(value) && Number.isFinite(nextValue) && ((value < 0 && nextValue > 0) || (value > 0 && nextValue < 0))) {
            const root = bisectRoot(evaluator, x, x + 0.25);
            const rounded = Number(root.toFixed(6));
            if (!roots.some((existing) => Math.abs(existing - rounded) < 0.01)) {
                roots.push(rounded);
            }
        }
    }

    if (!roots.length) return null;
    return roots
        .slice(0, 6)
        .map((value) => `x = ${formatCalculatorNumber(value)}`)
        .join('; ');
}

function getSymbolicExpression(expression) {
    if (!window.math) return null;
    try {
        const prepared = normalizeMathInput(expression)
            .replace(/\*\*/g, '^')
            .replace(/Math\.E/g, 'e');
        return window.math.parse(prepared);
    } catch {
        return null;
    }
}

function simplifySymbolicExpression(expression, mode = 'simplify') {
    const node = getSymbolicExpression(expression);
    if (!node || !window.math) return null;
    try {
        if (mode === 'derivative') return node;
        if (mode === 'factor' && typeof window.math.factor === 'function') return window.math.factor(node).toString();
        if (mode === 'expand' && typeof window.math.expand === 'function') return window.math.expand(node).toString();
        if (mode === 'rationalize' && typeof window.math.rationalize === 'function') return window.math.rationalize(node).toString();
        return window.math.simplify(node).toString();
    } catch {
        return null;
    }
}

function numericLimit(expression, variable, target) {
    if (!window.math) return null;
    const evaluateAt = (value) => {
        try {
            const result = window.math.evaluate(
                normalizeMathInput(expression).replace(/\*\*/g, '^').replace(/Math\.E/g, 'e'),
                { [variable]: value }
            );
            return typeof result === 'number' && Number.isFinite(result) ? result : null;
        } catch {
            return null;
        }
    };

    if (!Number.isFinite(target)) {
        const sign = target < 0 ? -1 : 1;
        const values = [10, 100, 1000, 10000].map((value) => sign * value);
        const results = values.map(evaluateAt).filter((value) => value !== null);
        return results.length ? results[results.length - 1] : null;
    }

    const offsets = [1e-2, 1e-3, 1e-4, 1e-5];
    const results = offsets
        .map((offset) => [evaluateAt(target - offset), evaluateAt(target + offset)])
        .flat()
        .filter((value) => value !== null);
    if (!results.length) return null;
    const result = results[results.length - 1];
    const stable = results.slice(-4).every((value) => Math.abs(value - result) < Math.max(1e-5, Math.abs(result) * 1e-4));
    return stable ? result : null;
}

function integrateStandardExpression(expression) {
    const compact = String(expression || '').replace(/\s+/g, '').replace(/\*\*/g, '^');
    if (!compact) return null;
    const terms = compact.match(/[+-]?[^+-]+/g);
    if (!terms) return null;
    const integrated = [];

    terms.forEach((term) => {
        let match = term.match(/^([+-]?(?:\d*\.?\d+)?)(?:x)(?:\^(\d+))?$/i);
        if (match) {
            const coefficient = match[1] === '' || match[1] === '+' ? 1 : match[1] === '-' ? -1 : Number(match[1]);
            const power = Number(match[2] || 1);
            const nextPower = power + 1;
            const nextCoefficient = coefficient / nextPower;
            integrated.push(`${nextCoefficient === 1 ? '' : nextCoefficient === -1 ? '-' : nextCoefficient}x${nextPower === 1 ? '' : `^${nextPower}`}`);
            return;
        }
        match = term.match(/^([+-]?(?:\d*\.?\d+)?)\/?x$/i);
        if (match) {
            const coefficient = match[1] === '' || match[1] === '+' ? 1 : match[1] === '-' ? -1 : Number(match[1]);
            integrated.push(`${coefficient < 0 ? '-' : ''}${Math.abs(coefficient) === 1 ? '' : Math.abs(coefficient)}ln(abs(x))`);
            return;
        }
        match = term.match(/^([+-]?(?:\d*\.?\d+)?)sin\(x\)$/i);
        if (match) {
            const coefficient = match[1] === '' || match[1] === '+' ? 1 : match[1] === '-' ? -1 : Number(match[1]);
            integrated.push(`${coefficient === -1 ? '-' : coefficient === 1 ? '' : coefficient}(-cos(x))`);
            return;
        }
        match = term.match(/^([+-]?(?:\d*\.?\d+)?)cos\(x\)$/i);
        if (match) {
            const coefficient = match[1] === '' || match[1] === '+' ? 1 : match[1] === '-' ? -1 : Number(match[1]);
            integrated.push(`${coefficient === 1 ? '' : coefficient}sin(x)`);
            return;
        }
        match = term.match(/^([+-]?(?:\d*\.?\d+)?)exp\(x\)$/i);
        if (match) {
            const coefficient = match[1] === '' || match[1] === '+' ? 1 : match[1] === '-' ? -1 : Number(match[1]);
            integrated.push(`${coefficient === 1 ? '' : coefficient}exp(x)`);
            return;
        }
        match = term.match(/^([+-]?(?:\d*\.?\d+))$/);
        if (match) {
            integrated.push(`${Number(match[1]) / 1}x`);
            return;
        }
        throw new Error('Unsupported term');
    });

    return integrated.join(' + ').replace(/\+ -/g, '- ');
}

function solveTwoByTwoSystem(text) {
    if (!window.math) return null;
    const equations = String(text).split(/[;\n]+/).map((item) => item.trim()).filter(Boolean);
    if (equations.length !== 2 || !equations.every((item) => item.includes('='))) return null;
    try {
        const rows = equations.map((equation) => {
            const [left, right] = equation.split('=');
            const expression = normalizeMathInput(`(${left})-(${right})`).replace(/\*\*/g, '^');
            const constant = Number(window.math.evaluate(expression.replace(/x|y/g, '0')));
            const xCoefficient = Number(window.math.evaluate(expression.replace(/x/g, '1').replace(/y/g, '0'))) - constant;
            const yCoefficient = Number(window.math.evaluate(expression.replace(/x/g, '0').replace(/y/g, '1'))) - constant;
            return [xCoefficient, yCoefficient, -constant];
        });
        const solution = window.math.lusolve(rows.map((row) => row.slice(0, 2)), rows.map((row) => [row[2]]));
        return `x = ${formatCalculatorNumber(Number(solution[0][0]))}\ny = ${formatCalculatorNumber(Number(solution[1][0]))}`;
    } catch {
        return null;
    }
}

function solveTrigonometricEquation(text) {
    const match = String(text).match(/\b(sin|cos|tan)\s*\(?\s*x\s*\)?\s*=\s*(-?\d*\.?\d+)/i);
    if (!match) return null;
    const functionName = match[1].toLowerCase();
    const value = Number(match[2]);
    if (!Number.isFinite(value) || ((functionName !== 'tan') && Math.abs(value) > 1)) {
        return `No real angle satisfies ${functionName}(x) = ${value}.`;
    }
    const principal = functionName === 'sin'
        ? Math.asin(value) * 180 / Math.PI
        : functionName === 'cos'
            ? Math.acos(value) * 180 / Math.PI
            : Math.atan(value) * 180 / Math.PI;
    if (functionName === 'sin') {
        const second = 180 - principal;
        return `Principal solutions in degrees:\nx₁ = ${formatCalculatorNumber(principal)}°\nx₂ = ${formatCalculatorNumber(second)}°\nGeneral solution: x = ${formatCalculatorNumber(principal)}° + 360°k or x = ${formatCalculatorNumber(second)}° + 360°k`;
    }
    if (functionName === 'cos') {
        return `Principal solutions in degrees:\nx₁ = ${formatCalculatorNumber(principal)}°\nx₂ = ${formatCalculatorNumber(-principal)}°\nGeneral solution: x = ±${formatCalculatorNumber(principal)}° + 360°k`;
    }
    return `Principal solution in degrees:\nx = ${formatCalculatorNumber(principal)}°\nGeneral solution: x = ${formatCalculatorNumber(principal)}° + 180°k`;
}

function solveLinearOrQuadraticEquation(rawEquation) {
    const equation = normalizeMathInput(rawEquation).replace(/Math\.E/g, 'E');
    if (!equation.includes('=')) return null;

    const [left, right] = equation.split('=');
    const expr = `(${left})-(${right})`;
    try {
        const sample = (xValue) => evaluateExpressionForVariable(expr, xValue);
        const f0 = sample(0);
        const f1 = sample(1);
        const f2 = sample(2);
        const f3 = sample(3);
        const quadraticA = (f2 - 2 * f1 + f0) / 2;
        const quadraticB = f1 - f0 - quadraticA;
        const quadraticC = f0;
        const expectedF3 = 9 * quadraticA + 3 * quadraticB + quadraticC;
        const isPolynomial = [quadraticA, quadraticB, quadraticC, f3].every(Number.isFinite)
            && Math.abs(f3 - expectedF3) < 1e-7 * Math.max(1, Math.abs(f3), Math.abs(expectedF3));
        if (isPolynomial) {
            if (Math.abs(quadraticA) > 1e-9) {
                const discriminant = quadraticB ** 2 - 4 * quadraticA * quadraticC;
                if (discriminant < 0) return `No real roots: Δ = ${formatCalculatorNumber(discriminant)}`;
                const root1 = (-quadraticB + Math.sqrt(discriminant)) / (2 * quadraticA);
                const root2 = (-quadraticB - Math.sqrt(discriminant)) / (2 * quadraticA);
                if (Math.abs(root1 - root2) < 1e-9) return `x = ${formatCalculatorNumber(root1)}`;
                return `x₁ = ${formatCalculatorNumber(root1)}; x₂ = ${formatCalculatorNumber(root2)}`;
            }
            if (Math.abs(quadraticB) > 1e-9) return `x = ${formatCalculatorNumber(-quadraticC / quadraticB)}`;
            if (Math.abs(quadraticC) < 1e-9) return 'Every real number is a solution.';
        }
    } catch {
    }

    const numeric = solveEquationNumerically(equation);
    if (numeric) return numeric;

    const trimmedExpr = expr.replace(/\*\*/g, '^');

    const quadMatch = trimmedExpr.match(/([+-]?\d*\.?\d*)x\^2([+-]\d*\.?\d*)x([+-]\d*\.?\d*)/i);
    if (quadMatch) {
        const a = Number(quadMatch[1] || '1');
        const b = Number(quadMatch[2] || '0');
        const c = Number(quadMatch[3] || '0');
        const discriminant = b * b - 4 * a * c;
        if (discriminant < 0) return `No real roots: Δ = ${discriminant}`;
        if (Math.abs(discriminant) < 1e-10) return `x = ${(-b / (2 * a)).toFixed(6)}`;
        const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        return `x₁ = ${root1.toFixed(6)}; x₂ = ${root2.toFixed(6)}`;
    }

    const linearMatch = trimmedExpr.match(/([+-]?\d*\.?\d*)x([+-]\d*\.?\d*)/i);
    if (linearMatch) {
        const a = Number(linearMatch[1] || '1');
        const b = Number(linearMatch[2] || '0');
        return `x = ${(-b / a).toFixed(6)}`;
    }

    return null;
}

function extractMathExpressionFromText(text) {
    return String(text || '')
        .trim()
        .replace(/^(?:solve|calculate|evaluate|compute|find|what is|determine)\s+/i, '')
        .replace(/^(?:the|a|an)\s+/i, '')
        .replace(/^(?:derivative|differentiate|integral|integrate|antiderivative|limit|matrix|determinant|inverse|transpose|mean|median|variance|std|standard\s+deviation)\s+(?:of\s+)?/i, '')
        .replace(/\s+of\s+$/i, '')
        .replace(/[.!?]+$/g, '')
        .trim();
}

function solveAdvancedMathQuestion(rawQuestion) {
    const text = String(rawQuestion || '').trim();
    if (!text) return null;

    const lowerText = text.toLowerCase();
    const extracted = extractMathExpressionFromText(text);

    if (/\b(?:simplify|expand|factor|factorise|factorize|rationalize|rationalise)\b/.test(lowerText)) {
        const mode = /factor|factorise|factorize/.test(lowerText) ? 'factor' : /rational/.test(lowerText) ? 'rationalize' : /expand/.test(lowerText) ? 'expand' : 'simplify';
        const expression = extracted.replace(/^(?:simplify|expand|factor|factorise|factorize|rationalize|rationalise)\s+(?:the\s+)?(?:expression\s+)?/i, '');
        const result = simplifySymbolicExpression(expression, mode);
        if (result) return `${mode[0].toUpperCase()}${mode.slice(1)}\n${expression}\n= ${result}`;
    }

    if (/\b(?:simultaneous|system of equations|solve the system)\b/.test(lowerText)) {
        const systemResult = solveTwoByTwoSystem(text.replace(/.*?(?:are|:)/i, ''));
        if (systemResult) return `Solve simultaneous equations\n${systemResult}`;
    }

    if (/(?:solve|find|angle|trig|trigonometric|equation)/.test(lowerText) && /\b(?:sin|cos|tan)\s*\(?\s*(?:x|θ)\s*\)?\s*=/.test(lowerText)) {
        const trigResult = solveTrigonometricEquation(text.replace(/[θΘ]/g, 'x'));
        if (trigResult) return `Solve trigonometric equation\n${trigResult}`;
    }

    if ((/solve|roots?|equation/.test(lowerText)) && (/[=]/.test(text) || /x\^|x\b/.test(text))) {
        const equation = extracted.includes('=') ? extracted : text.replace(/^(?:solve|calculate|evaluate|compute|find|what is|determine)\s+/i, '').trim();
        const solved = solveLinearOrQuadraticEquation(equation);
        if (solved) return `Solve equation\n${equation}\n${solved}`;
    }

    if (/limit|as x approaches|approaches/.test(lowerText)) {
        const match = text.match(/limit\s*\((.*)\)|limit\s+(.*?)(?:\s+as\s+.*)?$/i);
        const expr = (match && (match[1] || match[2])) || extracted;
        if (expr && window.math) {
            try {
                const targetMatch = text.match(/(?:as\s+)?x\s*(?:approaches|->|→)\s*([-+]?\d*\.?\d+|infinity|∞)/i);
                const target = targetMatch && /infinity|∞/i.test(targetMatch[1]) ? Infinity : targetMatch ? Number(targetMatch[1]) : 0;
                const result = numericLimit(expr, 'x', target);
                if (result !== null) return `lim x→${target === Infinity ? '∞' : target} of ${expr} = ${formatCalculatorNumber(result)}`;
                const symbolic = simplifySymbolicExpression(expr, 'simplify');
                if (symbolic) return `Limit requires one-sided or symbolic analysis for:\nlim x→${target} of ${expr}\nSimplified form: ${symbolic}`;
            } catch {
                return null;
            }
        }
    }

    if (/derivative|differentiate|dy\/dx|d\/dx|differentiation/.test(lowerText)) {
        const expr = extracted.replace(/^(?:(?:second|third|fourth)\s+)?(?:differentiate|derivative|find\s+the\s+derivative)\s+(?:of\s+)?/i, '') || text
            .replace(/.*(?:derivative|differentiate|dy\/dx|d\/dx|differentiation)\s*(?:of)?\s*/i, '')
            .replace(/[=].*$/, '')
            .trim();
        if (expr && window.math) {
            try {
                const orderMatch = text.match(/(?:second|third|fourth)\s+derivative/i);
                const order = orderMatch ? ({ second: 2, third: 3, fourth: 4 }[orderMatch[0].split(' ')[0].toLowerCase()] || 1) : 1;
                let derivative = getSymbolicExpression(expr);
                for (let index = 0; index < order; index += 1) derivative = window.math.derivative(derivative, 'x');
                const result = `d${order === 1 ? '' : order}/dx${order === 1 ? '' : order}(${expr}) = ${derivative.toString()}`;
                const step = `Step 1: Parse f(x) = ${expr}\nStep 2: Apply the derivative rules ${order > 1 ? `${order} times` : 'term by term'}\nResult: ${result}`;
                return step;
            } catch {
                return null;
            }
        }
    }

    if (/integral|integrate|antiderivative|∫/.test(lowerText)) {
        const expr = extracted.replace(/^(?:integrate|integral|find\s+the\s+integral)\s+(?:of\s+)?/i, '') || text
            .replace(/.*(?:integral|integrate|antiderivative|∫)\s*(?:of)?\s*/i, '')
            .replace(/[=].*$/, '')
            .trim();
        if (expr && window.math) {
            try {
                const integral = integrateStandardExpression(expr);
                if (!integral) return null;
                const result = `∫(${expr})dx = ${integral} + C`;
                const step = `Step 1: Identify the standard antiderivative for each term\nStep 2: Integrate term by term\nStep 3: Add the constant of integration C\nResult: ${result}`;
                return step;
            } catch {
                return null;
            }
        }
    }

    if (/det\(|determinant|inverse|transpose|matrix/.test(lowerText)) {
        try {
            const matrixMatch = text.match(/\[\[.*\]\]/s) || text.match(/\[[^\]]+\]/s) || extracted.match(/\[\[.*\]\]/s);
            if (matrixMatch && window.math) {
                const matrix = window.math.matrix(JSON.parse(String(matrixMatch[0]).replace(/\'/g, '"')));
                if (/determinant|det\(/.test(lowerText)) return `Matrix determinant\nA = ${matrix.toString()}\n det(A) = ${window.math.det(matrix).toString()}`;
                if (/inverse/.test(lowerText)) return `Matrix inverse\nA = ${matrix.toString()}\n A⁻¹ = ${window.math.inv(matrix).toString()}`;
                if (/transpose/.test(lowerText)) return `Matrix transpose\nA = ${matrix.toString()}\n Aᵀ = ${window.math.transpose(matrix).toString()}`;
            }
        } catch {
            return null;
        }
    }

    if (/mean|median|mode|variance|std|standard deviation/.test(lowerText)) {
        const arrayMatch = text.match(/\[.*\]/s) || extracted.match(/\[.*\]/s);
        if (arrayMatch && window.math) {
            try {
                const nums = JSON.parse(String(arrayMatch[0]).replace(/\'/g, '"'));
                if (/mean/.test(lowerText)) return `Mean = ${window.math.mean(nums).toString()}`;
                if (/median/.test(lowerText)) return `Median = ${window.math.median(nums).toString()}`;
                if (/variance/.test(lowerText)) return `Variance = ${window.math.var(nums).toString()}`;
                if (/std|standard deviation/.test(lowerText)) return `Std Dev = ${window.math.std(nums).toString()}`;
            } catch {
                return null;
            }
        }
    }

    if (/sum\s*\(|series|sequence|arithmetic|geometric/.test(lowerText)) {
        try {
            if (window.math && /sum\s*\(/.test(lowerText)) {
                const sumResult = window.math.evaluate(text.replace(/sum\s*\(/i, 'sum('));
                return sumResult.toString();
            }
        } catch {
            return null;
        }
    }

    return null;
}

function evaluateCalculatorExpression(expression) {
    const raw = normalizeMathInput(expression);
    const advancedAnswer = solveAdvancedMathQuestion(expression);
    if (advancedAnswer) return advancedAnswer;
    if (raw.includes('=')) {
        const solved = solveLinearOrQuadraticEquation(raw);
        if (solved) return solved;
    }
    const value = safeEvaluateExpression(raw);
    return Number.isFinite(value) ? formatCalculatorNumber(value) : 'Error';
}

function updateCalculatorDisplay() {
    calculatorExpression.textContent = calculatorValue || '0';
    try {
        const result = evaluateCalculatorExpression(calculatorValue);
        calculatorResult.textContent = result;
    } catch {
        calculatorResult.textContent = 'Error';
    }
}

function clearCalculatorValue() {
    calculatorValue = '0';
    updateCalculatorDisplay();
}

function deleteCalculatorValue() {
    if (calculatorValue.length <= 1) {
        calculatorValue = '0';
    } else {
        calculatorValue = calculatorValue.slice(0, -1);
    }
    updateCalculatorDisplay();
}

function appendCalculatorValue(value) {
    if (!value) return;
    if (calculatorValue === '0' && !['(', 'sin(', 'cos(', 'tan(', 'ln(', 'log(', 'sqrt('].includes(value)) {
        calculatorValue = value;
    } else {
        calculatorValue += value;
    }
    updateCalculatorDisplay();
}

function evaluateCalculatorInput() {
    const directText = calculatorInput.value.trim() || calculatorValue;
    try {
        const result = evaluateCalculatorExpression(directText);
        calculatorValue = directText;
        calculatorInput.value = directText;
        calculatorExpression.textContent = directText;
        calculatorResult.textContent = result;
    } catch {
        calculatorValue = '0';
        calculatorExpression.textContent = '0';
        calculatorResult.textContent = 'Error';
    }
}

function solveCalculatorInput() {
    const directText = calculatorInput.value.trim() || calculatorValue;
    const advancedResult = solveAdvancedMathQuestion(directText);
    const result = advancedResult || evaluateCalculatorExpression(directText);
    calculatorValue = directText;
    calculatorInput.value = directText;
    calculatorExpression.textContent = directText;
    calculatorResult.textContent = result;
    calculatorResult.style.whiteSpace = advancedResult ? 'pre-line' : 'normal';
}

function openCalculator() {
    calculatorModal.classList.remove('hidden');
    updateCalculatorDisplay();
}

function closeCalculator() {
    calculatorModal.classList.add('hidden');
}

function renderAttachmentPreview() {
    if (!activeAttachments.length) {
        attachmentPreview.innerHTML = '';
        attachmentPreview.classList.add('hidden');
        return;
    }

    attachmentPreview.innerHTML = activeAttachments
        .map((attachment, index) => {
            const safeName = String(attachment?.name || 'Attached file').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const previewMarkup = attachment.previewUrl
                ? `<img class="attachment-thumb" src="${attachment.previewUrl}" alt="${safeName}">`
                : `<span class="attachment-icon"><i class="fa-solid fa-paperclip"></i></span>`;
            return `
                <div class="attachment-pill ${attachment.previewUrl ? 'has-image' : ''}" title="${safeName}" data-index="${index}">
                    ${previewMarkup}
                    <span class="attachment-name">${safeName}</span>
                    <button class="attachment-remove" type="button" aria-label="Remove attached file">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            `;
        })
        .join('');
    attachmentPreview.classList.remove('hidden');

    attachmentPreview.querySelectorAll('.attachment-remove').forEach((button) => {
        button.addEventListener('click', () => {
            const item = button.closest('.attachment-pill');
            const index = Number(item?.dataset.index ?? -1);
            if (index >= 0) {
                activeAttachments.splice(index, 1);
                if (!activeAttachments.length) {
                    clearAttachedContext();
                    return;
                }
                attachedFileName = activeAttachments.map((file) => file.name).join(', ');
                const hasContext = activeAttachments.map((file) => file.content || '').filter(Boolean);
                attachedTextContext = hasContext.join('\n\n--- FILE ---\n\n');
                saveAttachedContext();
            }
            renderAttachmentPreview();
            chatInput.focus();
        });
    });
}

function getChatHistory() {
    try {
        const saved = JSON.parse(localStorage.getItem(chatHistoryStorageKey) || '[]');
        if (!Array.isArray(saved)) return [];
        return saved.filter((chat) => chat && chat.id && Array.isArray(chat.messages));
    } catch {
        localStorage.removeItem(chatHistoryStorageKey);
        return [];
    }
}

function getPersistentMemory() {
    try {
        const saved = JSON.parse(localStorage.getItem(memoryStorageKey) || '{}');
        const sessionSaved = JSON.parse(localStorage.getItem(sessionMemoryStorageKey) || '{}');
        const merged = Array.isArray(saved.facts) ? saved.facts : [];
        const sessionFacts = Array.isArray(sessionSaved.facts) ? sessionSaved.facts : [];
        const combined = [...merged, ...sessionFacts];
        return {
            facts: [...new Map(combined.map((fact) => [String(fact).trim().toLowerCase(), String(fact).trim()])).values()],
            updatedAt: saved.updatedAt || sessionSaved.updatedAt || Date.now()
        };
    } catch {
        return { facts: [], updatedAt: Date.now() };
    }
}

function savePersistentMemory(memory) {
    const facts = Array.isArray(memory?.facts) ? memory.facts : [];
    const payload = {
        facts: facts.map((fact) => String(fact).trim()).filter(Boolean),
        updatedAt: Date.now()
    };
    localStorage.setItem(memoryStorageKey, JSON.stringify(payload));
    localStorage.setItem(sessionMemoryStorageKey, JSON.stringify(payload));
}

function hydratePersistentMemoryFromHistory() {
    const memory = getPersistentMemory();
    const allChats = getChatHistory();
    const existing = new Set(memory.facts.map((fact) => String(fact).trim().toLowerCase()));
    let changed = false;

    allChats.forEach((chat) => {
        const messages = Array.isArray(chat?.messages) ? chat.messages : [];
        messages.forEach(({ text, sender }) => {
            if (sender !== 'user') return;
            const facts = extractMemoryFactsFromMessage(text);
            facts.forEach((fact) => {
                const normalized = String(fact).trim().toLowerCase();
                if (!normalized || existing.has(normalized)) return;
                existing.add(normalized);
                memory.facts.push(String(fact).trim());
                changed = true;
            });
        });
    });

    if (changed && memory.facts.length) {
        savePersistentMemory(memory);
    }
}

function extractMemoryFactsFromMessage(message) {
    const text = String(message || '').trim();
    if (!text) return [];

    const facts = [];
    const lower = text.toLowerCase();

    const directName = text.match(/(?:my name is|i am called|i am\s+called|i am\s+named|my names? are|jina langu ni|nitaitwa|mimi ni|mi ni|myself is|my name's|i am\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\s+([a-zA-Z][a-zA-Z\s'-]{1,30})/i);
    if (directName) {
        const name = directName[1] || directName[0];
        facts.push(`Your name is ${name.trim()}.`);
    }

    const simpleName = text.match(/(?:my name is|i am called|i am\s+called|i am\s+named|jina langu ni|nitaitwa|mimi ni|mi ni)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i);
    if (simpleName) facts.push(`Your name is ${simpleName[1].trim()}.`);

    const ageMatch = text.match(/(?:i am|mi ni|niko na|i'm)\s+(\d{1,2})\s+(?:years old|years|miaka|umri wa)/i);
    if (ageMatch) facts.push(`You are ${ageMatch[1]} years old.`);

    const classMatch = text.match(/(?:i am in|i am form|i am in form|i am class|i'm in|i am in class|niko form|niko kidato cha|kidato cha|class\s+(?:is|=)?\s*)([1-6]|one|two|three|four|five|six|kwanza|pili|tatu|nne|tano|sita)/i);
    if (classMatch) {
        const formValue = classMatch[1].toLowerCase();
        const normalizedForm = formValue === 'one' || formValue === 'kwanza' ? 'Form 1' : formValue === 'two' || formValue === 'pili' ? 'Form 2' : formValue === 'three' || formValue === 'tatu' ? 'Form 3' : formValue === 'four' || formValue === 'nne' ? 'Form 4' : formValue === 'five' || formValue === 'tano' ? 'Form 5' : formValue === 'six' || formValue === 'sita' ? 'Form 6' : `Form ${formValue}`;
        facts.push(`You are in ${normalizedForm}.`);
    }

    const subjectMatch = text.match(/(?:my favorite subject is|favorite subject is|my favourite subject is|i like|i love|my best subject is|subject i like is|somo langu pendo ni|napenda somo la|mimi ni mzuri wa|my strongest subject is)\s+([a-zA-Z ]{2,30})/i);
    if (subjectMatch) facts.push(`Your favorite subject is ${subjectMatch[1].trim()}.`);

    const goalMatch = text.match(/(?:i want to be|i want to become|i want to study|my dream is|my goal is|nataka kuwa|nina lengo la kuwa|nina ndoto ya kuwa|nataka kusoma)\s+([a-zA-Z ]{2,40})/i);
    if (goalMatch) facts.push(`Your goal is to become ${goalMatch[1].trim()}.`);

    const interestMatch = text.match(/(?:i like|i love|i enjoy|i am interested in|napenda|ninapenda|nina nia ya|nina riba na)\s+([a-zA-Z][a-zA-Z\s-]{2,35})/i);
    if (interestMatch && !/subject|school|lesson|class|student|teacher|book|study|food|music|movie|game|sport/i.test(interestMatch[1])) {
        facts.push(`You are interested in ${interestMatch[1].trim()}.`);
    }

    const hobbyMatch = text.match(/(?:my hobby is|my hobbies are|i enjoy|i like to|hobby yangu ni|hobi yangu ni|ninafanya|ninapenda kufanya)\s+([a-zA-Z][a-zA-Z\s-]{2,40})/i);
    if (hobbyMatch) facts.push(`Your hobby is ${hobbyMatch[1].trim()}.`);

    const placeMatch = text.match(/(?:i am from|i come from|my hometown is|i live in|ninatoka|niko kutoka|makazi yangu ni|niko katika)\s+([a-zA-Z][a-zA-Z\s'-]{2,35})/i);
    if (placeMatch) facts.push(`You are from ${placeMatch[1].trim()}.`);

    const projectMatch = text.match(/(?:my project is about|my project topic is|the project is about|mradi wangu kuhusu|mradi wangu ni|topic is about|topic is)\s+([a-zA-Z][a-zA-Z\s-]{2,50})/i);
    if (projectMatch) facts.push(`Your project topic is ${projectMatch[1].trim()}.`);

    const rememberMatch = text.match(/remember\s+(?:that\s+)?(.{2,120})/i);
    if (rememberMatch) {
        facts.push(rememberMatch[1].trim().replace(/[.?!]+$/, '').trim());
    }

    if (/remember\s+me|remember\s+who\s+i\s+am|what do you remember about me|what do you know about me|unakumbuka nini kuhusu mimi|unakumbuka mimi/i.test(lower)) {
        facts.push('User asked me to remember information about them.');
    }

    return facts.filter((fact) => fact && fact.length > 2);
}

function addPersistentMemoryFact(message) {
    const facts = extractMemoryFactsFromMessage(message);
    if (!facts.length) return [];

    const memory = getPersistentMemory();
    facts.forEach((fact) => {
        const normalized = String(fact).trim();
        if (!normalized) return;
        const exists = memory.facts.some((entry) => String(entry).trim().toLowerCase() === normalized.toLowerCase());
        if (!exists) memory.facts.push(normalized);
    });

    savePersistentMemory(memory);
    return facts;
}

function getPersistentMemoryReply(message, swahili) {
    const lower = String(message || '').toLowerCase();
    const asksMemory = /what do you remember|what do you know about me|what have you remembered|what did i tell you|remember about me|what did you store|what are my details|unakumbuka nini|unajua nini kuhusu mimi|ulinisema nini|ulikwisha kumbuka|you know me|you remember me|unaijua|unakumbuka mimi|what do you remember about me|what have you stored about me/i.test(lower);
    if (!asksMemory) return null;

    const memory = getPersistentMemory();
    if (!memory.facts.length) {
        return swahili
            ? 'Hujaniambia chochote cha kibinafsi kwa sasa, lakini ninaweza kukumbuka vitu kama jina lako, kidato chako, somo lako la kupenda, na malengo yako.'
            : 'I do not have any personal details stored yet, but I can remember things like your name, class, favorite subject, hobbies, or goals.';
    }

    const facts = memory.facts.slice(0, 12);
    const summary = facts.map((fact) => `- ${fact}`).join('\n');
    const extraNote = facts.length > 12 ? '\n\n... and more details from earlier chats.' : '';
    return swahili
        ? `Ninakumbuka hivi kuhusu wewe:\n\n${summary}${extraNote}`
        : `I remember the following about you:\n\n${summary}${extraNote}`;
}

function getMemorySummaryText() {
    const memory = getPersistentMemory();
    if (!memory.facts.length) return '';
    return memory.facts.slice(0, 6).join(' • ');
}

function getHumanLikeConversationReply(message, swahili) {
    const lower = String(message || '').toLowerCase();
    const memorySummary = getMemorySummaryText();
    const memoryLine = memorySummary ? (swahili ? `Ninakumbuka kwamba ${memorySummary}.` : `I remember that ${memorySummary}.`) : '';

    if (/^(hi|hello|hey|habari|mambo|salaam|good morning|good afternoon|good evening)/i.test(lower)) {
        const greeting = swahili
            ? 'Habari! Nimefurahi kukutibu. Ninaweza kukusaidia kwa masomo, miradi, mazoea ya kujifunza, na maelezo ya shule.'
            : 'Hi! I am glad to meet you. I can help with lessons, projects, study planning, and school questions.';
        return memoryLine ? `${greeting}\n\n${memoryLine}` : greeting;
    }

    if (/(how are you|hujambo|unajiskia vipi|how do you do|how are you doing)/i.test(lower)) {
        return swahili
            ? `Niko vizuri na niko tayari kukusaidia. ${memoryLine || 'Ninaweza kukupa majibu ya haraka, ya wazi, na ya hatua kwa hatua.'}`
            : `I am doing well and ready to help. ${memoryLine || 'I can give clear, practical, step-by-step answers.'}`;
    }

    if (/(what can you do|what are you|unaweza kufanya nini|wewe ni nini|unafanya nini|who are you)/i.test(lower)) {
        return swahili
            ? `Ninaweza kukusaidia kwa masomo, mradi, maelezo ya somo, kuunda ratiba ya kujifunza, kutafutia taarifa, na kukumbuka taarifa zako za kibinafsi. ${memoryLine || 'Ninaweza kuzungumza kwa namna ya kawaida na ya hatua kwa hatua.'}`
            : `I can help with lessons, projects, explanations, study plans, general information, and remembering your personal details. ${memoryLine || 'I respond in a natural, friendly, step-by-step style.'}`;
    }

    if (/(thank you|thanks|asante|shukrani)/i.test(lower)) {
        return swahili
            ? 'Karibu! Ninafurahi kukusaidia. Uliza swali lingine lolote.'
            : 'You are welcome! I am happy to help. Ask me anything else.';
    }

    if (/(i feel|nina hisi|sina furaha|nimechoka|nimekosa motive|nimeshakuwa|tired|stressed|sad|bored)/i.test(lower)) {
        return swahili
            ? `Hilo ni kawaida. Kitu muhimu ni kukubali hisia zako, kisha kuchukua hatua ndogo. ${memoryLine || 'Tuseme, tutatengeneza mpango mdogo wa kufanya kitu kinacholeta furaha na maendeleo.'}`
            : `That is normal. The best move is to acknowledge how you feel and then take one small step. ${memoryLine || 'We can make a simple plan that feels manageable and encouraging.'}`;
    }

    if (/(tell me about yourself|who are you|uniambie kuhusu wewe|wewe ni mtu gani|tell me more about you)/i.test(lower)) {
        return swahili
            ? 'Niko hapa kukusaidia kwa namna ya rafiki wa masomo na msaidizi wa kila siku. Naweza kukupa maelezo, kukusaidia kupanga kazi, na kukumbuka mambo juu yako kwa muda mrefu.'
            : 'I am here as a helpful study companion and everyday assistant. I can explain ideas, plan work, answer school questions, and remember personal details about you over time.';
    }

    if (/(what do you think|what is your opinion|unafikiri nini|maoni yako ni nini)/i.test(lower)) {
        return swahili
            ? `Kwa ujumla, ningeona ni vizuri kufikiria kwa makini, kutumia evidence, na kukubaliana na ukweli. Kitu cha muhimu zaidi ni kwamba maoni bora yanatokana na data, mantiki, na uzoefu wa vitendo.`
            : `Generally, the best approach is to think clearly, use evidence, and stay open to better information. Strong opinions are usually built on logic, examples, and practical understanding.`;
    }

    return null;
}

function deleteHistoryChat(chatId) {
    const history = getChatHistory().filter((chat) => chat.id !== chatId);
    localStorage.setItem(chatHistoryStorageKey, JSON.stringify(history));
    if (activeChatId === chatId) {
        activeChatId = `chat-${Date.now()}`;
        localStorage.setItem(activeChatStorageKey, activeChatId);
        localStorage.removeItem(storageKey);
        chatThread.innerHTML = '';
        heroPanel.classList.remove('hidden');
        aiShowcase.style.display = '';
        addMessage(welcomeMessage, 'assistant');
    }
    renderChatHistory();
}

function clearAllChatHistory(skipConfirm = false) {
    if (!skipConfirm && !window.confirm('Clear all saved chat history from this browser?')) return;
    localStorage.removeItem(storageKey);
    localStorage.removeItem(chatHistoryStorageKey);
    activeChatId = `chat-${Date.now()}`;
    localStorage.setItem(activeChatStorageKey, activeChatId);
    clearAttachedContext();
    chatThread.innerHTML = '';
    heroPanel.classList.remove('hidden');
    aiShowcase.style.display = '';
    addMessage(welcomeMessage, 'assistant');
    renderChatHistory();
}

function renderChatHistory() {
    if (!chatHistoryList) return;
    const searchTerm = String(historySearchInput?.value || '').trim().toLowerCase();
    const history = getChatHistory().filter((chat) => {
        if (!searchTerm) return true;
        return `${chat.title} ${chat.messages.map(({ text }) => text).join(' ')}`.toLowerCase().includes(searchTerm);
    });
    chatHistoryList.innerHTML = '';

    if (!history.length) {
        chatHistoryList.innerHTML = `<div class="chat-history-empty">${searchTerm ? 'No matching chats found.' : 'Your previous chats will appear here.'}</div>`;
        return;
    }

    history.forEach((chat) => {
        const item = document.createElement('div');
        item.className = `chat-history-item${chat.id === activeChatId ? ' active' : ''}`;
        item.dataset.chatId = chat.id;
        item.innerHTML = '<i class="fa-regular fa-message"></i><span class="chat-history-copy"><strong></strong><small></small></span><button class="chat-history-delete" type="button" title="Delete chat" aria-label="Delete chat"><i class="fa-solid fa-xmark"></i></button>';
        item.querySelector('strong').textContent = chat.title;
        item.querySelector('small').textContent = `${chat.messages.length} messages · ${formatChatDate(chat.updatedAt)}`;
        item.addEventListener('click', () => loadHistoryChat(chat.id));
        item.querySelector('.chat-history-delete').addEventListener('click', (event) => {
            event.stopPropagation();
            deleteHistoryChat(chat.id);
        });
        chatHistoryList.appendChild(item);
    });
}

function formatChatDate(timestamp) {
    if (!timestamp) return 'New';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return 'New';
    const age = Date.now() - date.getTime();
    if (age < 60 * 1000) return 'Just now';
    if (age < 60 * 60 * 1000) return `${Math.floor(age / (60 * 1000))}m ago`;
    if (age < 24 * 60 * 60 * 1000) return `${Math.floor(age / (60 * 60 * 1000))}h ago`;
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function loadHistoryChat(chatId) {
    const savedChat = getChatHistory().find((chat) => chat.id === chatId);
    if (!savedChat?.messages?.length) return;

    activeChatId = savedChat.id;
    localStorage.setItem(activeChatStorageKey, activeChatId);
    localStorage.setItem(storageKey, JSON.stringify(savedChat.messages));
    chatThread.innerHTML = '';
    clearAttachedContext();
    heroPanel.classList.toggle('hidden', savedChat.messages.some(({ sender }) => sender === 'user'));
    aiShowcase.style.display = savedChat.messages.some(({ sender }) => sender === 'user') ? 'none' : '';
    savedChat.messages.forEach(({ text, sender }) => addMessage(text, sender, { persist: false }));
}

function saveAttachedContext() {
    if (!attachedTextContext || !attachedFileName) {
        localStorage.removeItem(fileContextStorageKey);
        return;
    }
    localStorage.setItem(fileContextStorageKey, JSON.stringify({
        fileName: attachedFileName,
        fileNames: activeAttachments.map((file) => file.name),
        content: attachedTextContext.slice(0, 30000)
    }));
}

function loadAttachedContext() {
    const saved = JSON.parse(localStorage.getItem(fileContextStorageKey) || 'null');
    if (!saved?.content || !saved?.fileName) {
        activeAttachments = [];
        renderAttachmentPreview();
        return;
    }
    attachedTextContext = saved.content;
    attachedFileName = saved.fileName;
    activeAttachments = Array.isArray(saved.fileNames) ? saved.fileNames.map((name) => ({ name })) : [{ name: saved.fileName }];
    renderAttachmentPreview();
}

function clearAttachedContext() {
    attachedTextContext = '';
    attachedFileName = '';
    activeAttachments = [];
    localStorage.removeItem(fileContextStorageKey);
    renderAttachmentPreview();
}

function getConversationContext(limit = 8) {
    return [...chatThread.querySelectorAll('.message')]
        .map((message) => ({
            role: message.classList.contains('user') ? 'user' : 'assistant',
            text: message.querySelector('.message-bubble')?.textContent?.trim() || ''
        }))
        .filter(({ text }) => text)
        .slice(-limit);
}

function isMemoryPrompt(text) {
    return /previous question|what did i ask|my last question|previous answer|last answer|repeat the answer|swali la nyuma|nilisema nini|ulichouliza|unakumbuka|jibu la nyuma|jibu lako|rudia jibu/i.test(text);
}

function getPreviousExchange() {
    const context = getConversationContext(30);
    const userIndexes = context
        .map((item, index) => item.role === 'user' && !isMemoryPrompt(item.text) ? index : -1)
        .filter((index) => index >= 0);
    if (!userIndexes.length) return null;

    const previousUserIndex = userIndexes[userIndexes.length - 1];
    const currentUserIndex = context.length;
    const previousAnswer = context.slice(previousUserIndex + 1, currentUserIndex).find(({ role }) => role === 'assistant');
    if (!previousAnswer) return null;
    return { question: context[previousUserIndex].text, answer: previousAnswer.text };
}

function getMemoryReply(message, swahili) {
    const persistentReply = getPersistentMemoryReply(message, swahili);
    if (persistentReply) return persistentReply;

    const memorySummary = getMemorySummaryText();
    if (/(remember everything|remember all|what do you remember|what have you remembered|what do you know about me|unakumbuka nini|umekumbuka nini|nimekuambia nini|nilikubaliana nini)/i.test(message)) {
        return swahili
            ? (memorySummary
                ? `Ninakumbuka mambo yafuatayo kutoka mazungumzo yetu: ${memorySummary}.`
                : 'Hujaniambia chochote cha kibinafsi bado, lakini ninaweza kukumbuka jina, darasa, somo la kupenda, malengo, na mambo yako ya kila siku ukinipa taarifa.')
            : (memorySummary
                ? `I remember the following from our conversations: ${memorySummary}.`
                : 'I have not stored any personal details yet, but I can remember your name, class, favorite subject, goals, and other everyday information as you share it.');
    }

    const exchange = getPreviousExchange();
    if (!exchange) return null;
    const lower = message.toLowerCase();
    const asksQuestion = /previous question|what did i ask|my last question|swali la nyuma|nilisema nini|ulichouliza|unakumbuka/i.test(lower);
    const asksAnswer = /previous answer|last answer|repeat the answer|jibu la nyuma|jibu lako|rudia jibu/i.test(lower);
    const asksFollowUp = /^(explain more|tell me more|go on|continue|eleza zaidi|fafanua zaidi|endelea|na hilo)\b/i.test(lower);
    const answerExcerpt = exchange.answer.length > 900 ? `${exchange.answer.slice(0, 900)}...` : exchange.answer;

    if (asksQuestion) {
        return swahili ? `Ndiyo, nakumbuka. Swali lako la nyuma lilikuwa:\n\n“${exchange.question}”` : `Yes, I remember. Your previous question was:\n\n“${exchange.question}”`;
    }
    if (asksAnswer) {
        return swahili ? `Jibu langu la nyuma lilikuwa:\n\n${answerExcerpt}` : `My previous answer was:\n\n${answerExcerpt}`;
    }
    if (asksFollowUp) {
        return swahili ? `Ninaendelea na swali lako la nyuma: “${exchange.question}”\n\n${answerExcerpt}\n\nNiambie sehemu unayotaka nifafanue zaidi.` : `Continuing from your previous question: “${exchange.question}”\n\n${answerExcerpt}\n\nTell me which part you want me to explain further.`;
    }
    return null;
}

function getFollowUpContinuationReply(message, swahili) {
    const lower = message.toLowerCase();
    const followUpPattern = /(continue|endelea|eleza zaidi|fafanua zaidi|nieleze zaidi|tell me more|go on|explain more|more on that|kama unavyosema|na hilo|kwa mfano zaidi|continue from)/i;
    if (!followUpPattern.test(lower)) return null;

    const conversation = getConversationContext(18);
    const lastAssistant = [...conversation].reverse().find(({ role }) => role === 'assistant')?.text;
    const lastUser = [...conversation].reverse().find(({ role }) => role === 'user')?.text;
    if (!lastAssistant) return null;

    const cleanReply = lastAssistant.replace(/\s+/g, ' ').trim();
    const summary = cleanReply.length > 220 ? `${cleanReply.slice(0, 220)}...` : cleanReply;

    return swahili
        ? `Ninakuendelea kwenye jibu la awali kuhusu “${lastUser || 'mada yako'}”.\n\n${summary}\n\nKitu muhimu zaidi ni kwamba jibu hili linaeleza msingi wa swali. Iwe unauliza kwa kifupi au unataka mfano zaidi, naweza kunuulia kwa uwazi zaidi.`
        : `Continuing from the previous answer about “${lastUser || 'your topic'}”.\n\n${summary}\n\nThe key point is that this answer explains the foundation of the idea. If you want a deeper explanation, a simpler version, or a practical example, I can continue in that direction.`;
}

function isLiveSearchFollowUp(message) {
    return /\b(continue|endelea|eleza zaidi|fafanua zaidi|nieleze zaidi|tell me more|go on|explain more|more details|more information|kwa undani zaidi|maelezo zaidi|ongeza maelezo|naomba maelezo|kwa mfano zaidi)\b/i.test(String(message || ''));
}

function getLastLiveSearchQuestion() {
    const messages = [...chatThread.querySelectorAll('.message')];
    const liveMessage = [...messages].reverse().find((message) => message.classList.contains('live-web-card-message'));
    if (!liveMessage) return '';
    const liveIndex = messages.indexOf(liveMessage);
    const previousUser = messages.slice(0, liveIndex).reverse().find((message) => message.classList.contains('user'));
    return previousUser?.querySelector('.message-bubble')?.textContent?.trim() || '';
}

function wantsSwahili(message) {
    return isSwahili(message) || /\b(naomba|nisaidie|eleza|fafanua|jibu|tengeneza|andika|nifundishe)\b/i.test(message);
}

function formatList(items) {
    return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
}

function solveSimpleMath(message) {
    const expression = message
        .replace(/(what is|calculate|solve|hesabu|jibu|find|=)/gi, '')
        .replace(/[^0-9+\-*/().%\s]/g, '')
        .trim();
    if (!expression || !/[+\-*/%]/.test(expression) || !/\d/.test(expression)) return null;

    try {
        // Limit evaluation to the cleaned arithmetic expression created above.
        const result = Function(`"use strict"; return (${expression})`)();
        if (!Number.isFinite(result)) return null;
        return `Jibu ni ${result}.\n\nHatua: ${expression} = ${result}`;
    } catch {
        return null;
    }
}

function getStudyPlanReply(message, swahili) {
    const subject = message.match(/(?:for|ya|cha|on)\s+([a-zA-Z ]{2,30})/i)?.[1]?.trim() || (swahili ? 'masomo yako' : 'your subjects');
    const steps = swahili
        ? [`Weka lengo dogo la ${subject} kwa kila kipindi.`, 'Soma dhana moja na uandike muhtasari wa mistari 3.', 'Fanya maswali 5 bila kuangalia majibu.', 'Kagua makosa na uyaandike kwenye daftari la marudio.', 'Rudia mada kwa kutumia spaced repetition baada ya siku 1, 3 na 7.']
        : [`Set one small goal for ${subject} per session.`, 'Learn one concept and write a three-line summary.', 'Answer five practice questions without checking notes.', 'Review mistakes and keep an error notebook.', 'Use spaced repetition after 1, 3 and 7 days.'];
    return `${swahili ? `Mpango wa kujisomea: ${subject}` : `Study plan: ${subject}`}\n\n${formatList(steps)}\n\n${swahili ? 'Anza na dakika 25 za kusoma na dakika 5 za mapumziko.' : 'Start with 25 minutes of study and a 5-minute break.'}`;
}

function getStoryReply(message) {
    const lower = String(message || '').toLowerCase();
    const swahili = wantsSwahili(message);
    const topic = /science|sayansi|math|hisabati|school|shule|technology|teknolojia|future|mustakabali|adventure|travel|safari/i.test(lower)
        ? (swahili ? 'shule, sayansi na mustakabali' : 'school, science and the future')
        : (swahili ? 'kujitolea, kujifunza na uvumilivu' : 'learning, courage and growth');

    if (swahili) {
        return `Hapo zamani, mwanafunzi mmoja alihisi kunyogopa na kulala na shauku ya kufanya vizuri. Aliuliza mwenyewe, “Naweza kuwa binadamu wa akili, ujasiri na kujenga mambo yenye maana?” Akajibu: “Ndiyo, ukikubali kujifunza, kukubali makosa, na kuendelea bila kukata tamaa.”\n\nAlianza na hatua ndogo: kusoma kwa makini, kujaribu tena, kuuliza maswali, na kukaa karibu na watu wanaomsaidia. Kila siku ilisukuma safari yake mbele zaidi.\n\nBaadaye aligundua kwamba binadamu halisi si mtu asiyefanya makosa, bali mtu anayejifunza, anayekubali mengi, na anajenga maisha ya maana kupitia bidii na moyo wa kukua.\n\nHivyo, ukiwa na nia ya kujifunza, ujasiri wa kujaribu, na moyo wa kuwa karibu na ndoto zako, unaweza kuja na story nzuri ya maisha yako yenye hamu, mafanikio, na maendeleo. Hilo ndiyo “kuingia kwenye story” ya maisha ya kweli.`;
    }

    return `Once upon a time, a student felt uncertain and wondered whether he could become more than ordinary. He asked himself, “Can I become a thoughtful, useful, and resilient person?” The answer was simple: “Yes, if you keep learning, keep trying, and keep improving.”\n\nHe began with small steps—reading carefully, practicing every day, asking better questions, and learning from mistakes. Each day made him a little braver and a little wiser.\n\nLater, he realized that being human is not about perfection. It is about curiosity, effort, empathy, and the courage to move forward even when life feels difficult.\n\nThat is how a meaningful life begins: one lesson, one decision, and one brave step at a time. That is the kind of story you can live and grow into.`;
}

function getLongStoryReply(message) {
    const lower = String(message || '').toLowerCase();
    const swahili = wantsSwahili(message);

    if (swahili) {
        return `Hapo zamani, kijana mmoja katika shule ya sekondari aliishi na wasiwasi mwingi. Alihisi kwamba kila mtu fulani alikuwa tayari, lakini yeye alikuwa nyuma. Alijiuliza, “Ninawezaje kukua ukiwa na michakato mingi ya maisha na masomo yanayokuja kila siku?”\n\nSiku moja, mwalimu wake alimweleza kwamba mafanikio hayakuja kwa mtu mmoja kwa kusubiri “momentum” nzuri; mafanikio huja kwa watu wanaofanya mazoea bora kila siku. Kijana huyo alianza kusoma kwa dakika chache kila siku, kuandika mawazo yake, kukusanya maswali, na kufuata ulinganisho wa maendeleo ya kila siku.\n\nMuda ulipita, akagundua kwamba binadamu ni mtu wa kuchukua hatua ndogo na kuendelea hata akiwa na wasiwasi. Hata akipata makosa, hakukata tamaa; badala yake, alikubali makosa kama sehemu ya kujifunza. Alicheza, alisoma, akajenga niyama ya ujasiri na moyo wa kufaulu.\n\nKama hili, kila mtu anaweza kujenga story nzuri ya maisha. Si kwa kuwa mzuri mara moja, bali kwa ajili ya kujenga tabia nzuri, kupenda kujifunza, kuzungumza kwa makini, na kuendelea bila kukata tamaa. Hiyo ndiyo maisha ya kweli—kujenga siku baada ya siku mpaka utakapokuwa mtu wa maana.`;
    }

    return `Once upon a time, a student felt as though everyone else had already started moving ahead while he was still waiting for the perfect moment to begin. He feared mistakes, uncertainty, and the pressure of trying to become excellent quickly.\n\nThen one day, a teacher reminded him that growth does not begin with perfection; it begins with consistency. He started small: reading a little each day, writing clear notes, asking better questions, and accepting that setbacks were part of learning.\n\nOver time, he realized that the real source of progress was not sudden talent or one great breakthrough, but the ability to keep going when things felt difficult. He became more disciplined, more patient, and more confident because he had trained himself to recover from setbacks.\n\nThat is what a meaningful story looks like: one step, one lesson, and one decision to keep improving. Real growth is built in the everyday moments, not in the perfect ones. That is how a person becomes stronger and wiser over time.`;
}

function isTumainiSchoolInformationRequest(message) {
    const lower = String(message || '').toLowerCase();
    return /(?:tell me about|about|information about|info about|taarifa kuhusu|kuhusu|history of|historia ya)\s+(?:tumaini|tsss|the school|shule)|(?:tumaini|tsss)\s+(?:senior\s+)?(?:high|secondary)?\s*school/i.test(lower);
}

function isSchoolLeadershipQuestion(message) {
    return /\b(head teacher|headmaster|headmistress|principal|school head|mwalimu mkuu|mkuu wa shule|jina la mwalimu mkuu|mwalimu mkuu wa shule)\b/i.test(String(message || ''));
}

function getSchoolLeadershipReply(message) {
    return wantsSwahili(message)
        ? 'Mkuu wa shule / mwalimu mkuu wa TUMAINI SENIOR HIGH SCHOOL ni SIFAEL MSENGI.'
        : 'The head teacher / principal of TUMAINI SENIOR HIGH SCHOOL is SIFAEL MSENGI.';
}

function isLiveWebSearchRequest(message) {
    const lower = String(message || '').toLowerCase();
    const isTumainiSchoolInformation = isTumainiSchoolInformationRequest(message);
    if (isTumainiSchoolInformation && !/\b(latest|recent|news|today|sasa|leo|live|online|mtandaoni|mtandao)\b/i.test(lower)) return false;
    const explicitSearch = /(search the web|search online|web search|live web|live search|search internet|research online|browse web|google this|lookup|find info|find information|latest news|recent news|tafuta mtandao|tafuta kwenye mtandao|utafutaji wa mtandao|google hili|search on the internet|search online now|look up|find information about|what is on the internet|search for information|research on|look for info|find facts about)/i.test(lower);
    const generalKnowledgeQuestion = /(who is|what is|what are|where is|when did|why does|how does|tell me about|explain|what happened|what are the|who was|which country|what do|difference between|history of|what does|what was|when was|how can|how do|why are|why do|who are|what kind|meaning of|what is the meaning|why did|where are|where was|list of|how many|what are some|how to|ajiri|nani|ni nini|vipi|lini|mbali gani|maana ya|taarifa kuhusu|kituo|historia ya|tofauti kati ya|wapi iko|lini ilitokea|eleza kuhusu|kivipi|kwanini|nini maana|nani ni)/i.test(lower);

    if (explicitSearch) {
        const schoolFlowWords = /(location.*school|school.*location|school.*address|where.*shule|wapi.*shule|shule.*wapi|school results|results.*school|school.*results|matokeo.*shule|shule.*matokeo|eneo.*shule|school.*address|address.*school|tumaini.*results|tumaini.*location|centre.*number|s5493|necta.*results)/i.test(lower);
        return !schoolFlowWords;
    }

    if (!generalKnowledgeQuestion) return false;

    const schoolFlowWords = /(location.*school|school.*location|school.*address|where.*shule|wapi.*shule|shule.*wapi|school results|results.*school|school.*results|matokeo.*shule|shule.*matokeo|eneo.*shule|address.*school|tumaini.*results|tumaini.*location|wapi.*tumaini|tumaini.*wapi|school.*necta|necta.*school|centre.*number.*s5493|s5493.*school)/i.test(lower);
    const schoolContext = /(tumaini|tsss|shule|school|necta|matokeo|results|exam|lesson|somo|homework|assignment|fee|admission|kujiunga|kazi ya nyumbani)/i.test(lower) && /(location|address|results|info|history|owner|motto|contact|combination|fees|admission|matokeo|wapi|anuani|historia|mmiliki|mwenye shule)/i.test(lower);
    return !schoolFlowWords && !schoolContext;
}

async function fetchWikipediaSummary(query, lang = 'en') {
    const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&utf8=1&srlimit=1`;
    const searchResponse = await fetchJsonWithTimeout(searchUrl);

    if (!searchResponse) return null;
    const searchData = searchResponse;
    const title = searchData?.query?.search?.[0]?.title;
    if (!title) return null;

    const summaryUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const summaryData = await fetchJsonWithTimeout(summaryUrl);
    if (!summaryData) return null;
    const extract = String(summaryData?.extract || '').trim();
    if (!extract) return null;

    const description = summaryData?.description ? `${summaryData.description}. ` : '';
    return {
        title,
        text: `${description}${extract}`.trim(),
        sourceUrl: summaryData?.content_urls?.desktop?.page || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`
    };
}

async function fetchJsonWithTimeout(url, timeoutMs = 9000) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            headers: { Accept: 'application/json' },
            signal: controller.signal
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.warn('Live web request failed:', error);
        return null;
    } finally {
        window.clearTimeout(timeoutId);
    }
}

async function fetchWikipediaImageForQuery(query, lang = 'en') {
    try {
        const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&utf8=1&srlimit=1`;
        const searchData = await fetchJsonWithTimeout(searchUrl);
        if (!searchData) return null;
        const title = searchData?.query?.search?.[0]?.title;
        if (!title) return null;

        const imageUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=pageimages|info&titles=${encodeURIComponent(title)}&format=json&origin=*&piprop=original|thumbnail&pithumbsize=500&inprop=url`;
        const imageData = await fetchJsonWithTimeout(imageUrl);
        if (!imageData) return null;
        const pages = imageData?.query?.pages ?? {};
        const page = Object.values(pages)[0];
        const original = page?.original?.source || page?.thumbnail?.source;
        return original || null;
    } catch (error) {
        console.warn('Wikipedia image lookup failed:', error);
        return null;
    }
}

function extractDuckDuckGoAnswer(data) {
    const answer = data?.AbstractText || data?.Answer || data?.Abstract || '';
    const related = data?.RelatedTopics?.find((topic) => topic?.Text)?.Text || '';
    return String(answer || related).replace(/<[^>]+>/g, '').trim();
}

function isCurrentWebQuestion(message) {
    return /\b(latest|recent|today|now|current|currently|this year|news|breaking|sasa|leo|hivi karibuni|habari mpya|kwa sasa)\b/i.test(message);
}

async function fetchLiveWebSearchReply(message) {
    const query = String(message || '').trim();
    if (!query) return null;

    const searchQuery = query
        .replace(/^\s*(?:please\s+)?(?:search|look\s+up|find|research|google)\s+(?:the\s+web|online|on\s+the\s+internet|for)?\s*/i, '')
        .replace(/^\s*(?:tafuta|fanya\s+utafiti)\s+(?:kwenye\s+mtandao|mtandaoni)?\s*/i, '')
        .replace(/^\s*(?:can you|could you|please|nisaidie|tafadhali|niambie|tell me)\s+/i, '')
        .replace(/^[\s,:-]*(?:what is|who is|where is|when did|why does|how does|what are|what was|when was|how can|how do|explain|about|latest|recent|maana ya|eleza kuhusu|nani ni|wapi iko|lini ilitokea|kwanini|vipi)\s+/i, '')
        .replace(/\s+(?:detailed explanation|more information|more details|kwa undani zaidi|maelezo zaidi).*$/i, '')
        .replace(/[^a-zA-Z0-9\s\-'.]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (!searchQuery || searchQuery.length < 3) return null;

    const preferredLangs = wantsSwahili(message) ? ['sw', 'en'] : ['en', 'sw'];

    try {
        const fallbackUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
        const [wikipediaResponses, duckDuckGoData] = await Promise.all([
            Promise.all(preferredLangs.map((lang) => fetchWikipediaSummary(searchQuery, lang))),
            fetchJsonWithTimeout(fallbackUrl)
        ]);

        const wikipediaResult = wikipediaResponses.find(Boolean);
        const duckAnswer = extractDuckDuckGoAnswer(duckDuckGoData);
        const duckSourceUrl = duckDuckGoData?.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`;
        const currentQuestion = isCurrentWebQuestion(message);

        if (currentQuestion && duckAnswer) {
            return {
                query: searchQuery,
                answer: `${duckAnswer.slice(0, 900)}${duckAnswer.length > 900 ? '...' : ''}`,
                imageUrl: null,
                imageAlt: `Illustration for ${searchQuery}`,
                imageCaption: wantsSwahili(message) ? 'Picha inayohusiana na swali' : 'Related image',
                sourceName: 'DuckDuckGo instant answer',
                sourceUrl: duckSourceUrl,
                sourceUrls: [duckSourceUrl],
                verificationNote: wantsSwahili(message)
                    ? 'Swali la sasa limetafutwa moja kwa moja; fungua chanzo kuthibitisha maelezo.'
                    : 'This is a live result; open the source to verify the details.'
            };
        }

        if (wikipediaResult) {
            const wikipediaIndex = wikipediaResponses.indexOf(wikipediaResult);
            const imageUrl = await fetchWikipediaImageForQuery(searchQuery, preferredLangs[wikipediaIndex]);
            const cleanAnswer = `${wikipediaResult.text.slice(0, 900)}${wikipediaResult.text.length > 900 ? '...' : ''}`;
            const sourceUrls = [wikipediaResult.sourceUrl];
            if (duckAnswer) sourceUrls.push(duckSourceUrl);
            return {
                query: searchQuery,
                answer: cleanAnswer,
                imageUrl,
                imageAlt: `Illustration for ${searchQuery}`,
                imageCaption: wantsSwahili(message) ? 'Picha inayohusiana na swali' : 'Related image',
                sourceName: duckAnswer ? 'Wikipedia + DuckDuckGo' : 'Wikipedia',
                sourceUrl: wikipediaResult.sourceUrl,
                sourceUrls,
                verificationNote: wantsSwahili(message)
                    ? 'Vyanzo vya web vimeorodheshwa hapa chini; fungua chanzo kuthibitisha maelezo.'
                    : 'Web sources are listed below; open them to verify the details.'
            };
        }

        if (!duckAnswer) return null;

        return {
            query: searchQuery,
            answer: `${duckAnswer.slice(0, 850)}${duckAnswer.length > 850 ? '...' : ''}`,
            imageUrl: null,
            imageAlt: `Web result for ${searchQuery}`,
            imageCaption: wantsSwahili(message) ? 'Picha inayohusiana' : 'Related image',
            sourceName: 'DuckDuckGo',
            sourceUrl: duckSourceUrl,
            sourceUrls: [duckSourceUrl],
            verificationNote: wantsSwahili(message)
                ? 'Fungua chanzo cha web kuthibitisha maelezo haya.'
                : 'Open the web source to verify these details.'
        };
    } catch (error) {
        console.warn('Live web search failed:', error);
        return null;
    }
}

function getLessonReply(message, swahili, context = []) {
    const previousTopic = [...context].reverse().find(({ role, text }) => role === 'user' && /photosynthesis|mitosis|osmosis|newton|fotosintes|mitosisi|respiration|cell|seli|force|nguvu/i.test(text))?.text || '';
    const prompt = `${message} ${previousTopic}`.toLowerCase();

    if (prompt.includes('photosynthesis') || prompt.includes('fotosintes')) {
        return swahili
            ? 'Fotosintesisi ni mchakato ambao mimea hutengeneza chakula kwa kutumia mwanga wa jua, maji na hewa ya ukaa.\n\nMlinganyo: Carbon dioxide + water -> glucose + oxygen.\n\nHatua kuu:\n1. Chlorophyll hunasa mwanga wa jua.\n2. Mizizi hufyonza maji kutoka ardhini.\n3. Majani huchukua carbon dioxide kupitia stomata.\n4. Nishati ya mwanga hubadilisha vitu hivyo kuwa glucose; oxygen hutolewa.\n\nKumbuka: glucose hutumika kama chakula na oxygen hutolewa hewani.'
            : 'Photosynthesis is the process plants use to make food from sunlight, water, and carbon dioxide.\n\nEquation: Carbon dioxide + water -> glucose + oxygen.\n\nMain steps:\n1. Chlorophyll captures sunlight.\n2. Roots absorb water from the soil.\n3. Leaves take in carbon dioxide through stomata.\n4. Light energy converts these materials into glucose, releasing oxygen.\n\nRemember: glucose is used as food, while oxygen is released into the air.';
    }

    if (prompt.includes('osmosis')) {
        return swahili
            ? 'Osmosis ni mwendo wa maji kupitia utando unaoruhusu baadhi ya vitu kupita, kutoka sehemu yenye maji mengi kwenda sehemu yenye maji machache. Mfano: seli ya mmea huvimba ikiwa ndani ya maji safi kwa sababu maji huingia ndani.'
            : 'Osmosis is the movement of water through a partially permeable membrane from a dilute solution to a more concentrated solution. Example: a plant cell becomes turgid in fresh water because water enters it.';
    }

    if (prompt.includes('mitosis') || prompt.includes('mitosisi')) {
        return swahili
            ? 'Mitosisi ni mgawanyiko wa seli moja kutengeneza seli mbili zinazofanana kijenetiki. Hatua zake ni prophase, metaphase, anaphase na telophase, ikifuatiwa na cytokinesis. Hutumika katika ukuaji, ukarabati wa tishu na uingizwaji wa seli zilizokufa.'
            : 'Mitosis is cell division that produces two genetically identical daughter cells. Its stages are prophase, metaphase, anaphase, and telophase, followed by cytokinesis. It supports growth, tissue repair, and cell replacement.';
    }

    if (prompt.includes('newton') || prompt.includes('force') || prompt.includes('nguvu')) {
        return swahili
            ? 'Sheria ya pili ya Newton inaeleza kuwa nguvu ni sawa na uzito mara kuongeza kasi: F = m × a. Kwa mfano, kitu cha kilo 4 kikiongezewa kasi ya 3 m/s², nguvu ni 12 N.'
            : 'Newton’s second law states that force equals mass multiplied by acceleration: F = m × a. For example, an object of mass 4 kg accelerating at 3 m/s² experiences a force of 12 N.';
    }

    if (prompt.includes('respiration')) {
        return swahili
            ? 'Upumuaji wa seli (respiration) ni mchakato wa kemikali unaotoa nishati kutoka kwenye glucose ndani ya seli. Upumuaji wa kutumia oxygen huitwa aerobic respiration: glucose + oxygen -> carbon dioxide + water + energy.'
            : 'Respiration is the chemical process that releases energy from glucose in cells. Aerobic respiration uses oxygen: glucose + oxygen -> carbon dioxide + water + energy.';
    }

    if (prompt.includes('cell') || prompt.includes('seli')) {
        return swahili
            ? 'Seli ni kitengo cha msingi cha muundo na kazi za kiumbe hai. Sehemu muhimu ni cell membrane, cytoplasm, nucleus na mitochondria. Seli ya mmea pia ina cell wall, chloroplasts na large permanent vacuole.'
            : 'A cell is the basic structural and functional unit of a living organism. Key parts include the cell membrane, cytoplasm, nucleus, and mitochondria. A plant cell also has a cell wall, chloroplasts, and a large permanent vacuole.';
    }

    return null;
}

function getAttachedFileReply(message, swahili) {
    if (!attachedTextContext) return null;
    const lower = message.toLowerCase();
    const asksForSummary = /summary|summarize|muhtasari|fupisha|kwa ufupi/i.test(lower);
    const asksForQuestions = /question|questions|maswali|quiz|test me|mtihani/i.test(lower);
    const asksForNotes = /notes|revision|notes za marudio|nukuu|nukuu za kusoma/i.test(lower);
    if (!asksForSummary && !asksForQuestions && !asksForNotes) return null;

    const sentences = attachedTextContext.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (asksForSummary) {
        const summary = sentences.slice(0, 5).join(' ');
        return `${swahili ? `Muhtasari wa ${attachedFileName}:` : `Summary of ${attachedFileName}:`}\n\n${summary}${sentences.length > 5 ? '...' : ''}`;
    }
    if (asksForQuestions) {
        const topics = sentences.slice(0, 5).map((sentence) => sentence.replace(/[.!?]+$/, '').slice(0, 100));
        return `${swahili ? `Maswali ya kujipima kutoka ${attachedFileName}:` : `Practice questions from ${attachedFileName}:`}\n\n${formatList(topics.map((topic) => `${swahili ? 'Eleza' : 'Explain'}: ${topic}?`))}`;
    }
    const noteLines = sentences.slice(0, 7).map((sentence) => `- ${sentence.trim()}`);
    return `${swahili ? `Notes za marudio kutoka ${attachedFileName}:` : `Revision notes from ${attachedFileName}:`}\n\n${noteLines.join('\n')}`;
}

function getSmartFallback(message, context, swahili) {
    const previousUserMessage = [...context].reverse().find(({ role }) => role === 'user')?.text;
    const topic = message.replace(/^(please|tafadhali|help me|nisaidie|can you)\s+/i, '').trim();
    const detectedLanguage = detectLanguage(message);
    const memorySummary = getMemorySummaryText();
    const memoryNote = memorySummary ? (swahili ? `\n\nNinakumbuka: ${memorySummary}.` : `\n\nI remember: ${memorySummary}.`) : '';

    if (!swahili && detectedLanguage !== 'English or another Latin-script language') {
        return `I detected ${detectedLanguage}. I can work with many languages and scripts. Please tell me what you want to learn, translate, summarize, or research, and include your school level when relevant.${memoryNote}`;
    }
    if (swahili) {
        return `Nimeelewa unauliza kuhusu “${topic}”. Ili nikusaidie kwa usahihi zaidi, taja kiwango chako (kidato/darasa), unachojua tayari, na sehemu inayokuchanganya.${previousUserMessage && previousUserMessage !== message ? `\n\nNinaendelea kutoka kwenye swali lako la awali: “${previousUserMessage}”.` : ''}${memoryNote}`;
    }
    return `I understand that you are asking about “${topic}”. To give a precise answer, tell me your level, what you already know, and the exact part that is confusing you.${previousUserMessage && previousUserMessage !== message ? `\n\nI am continuing from your previous question: “${previousUserMessage}”.` : ''}${memoryNote}`;
}

function getSettings() {
    try {
        const savedSettings = JSON.parse(localStorage.getItem(settingsStorageKey) || '{}');
        return { ...defaultSettings, ...(savedSettings && typeof savedSettings === 'object' ? savedSettings : {}) };
    } catch {
        return { ...defaultSettings };
    }
}
function saveSettings(settings) {
    localStorage.setItem(settingsStorageKey, JSON.stringify({ ...defaultSettings, ...settings }));
}

function loadSettings() {
    const settings = getSettings();
    const availableThemes = [...themeSelect.options].map((option) => option.value);
    const theme = availableThemes.includes(settings.theme) ? settings.theme : defaultSettings.theme;
    themeSelect.value = theme;
    reduceMotionToggle.checked = Boolean(settings.reduceMotion);
    autoSpeakToggle.checked = Boolean(settings.autoSpeak);
    applyTheme(theme);
    document.body.classList.toggle('reduce-motion', reduceMotionToggle.checked);
}

function applyTheme(theme) {
    document.body.classList.remove('theme-midnight', 'theme-light');
    if (theme === 'midnight') document.body.classList.add('theme-midnight');
    if (theme === 'light') document.body.classList.add('theme-light');
}

function openSettings() {
    loadSettings();
    settingsStatus.textContent = '';
    settingsModal.classList.remove('hidden');
}

function closeSettings() {
    settingsModal.classList.add('hidden');
}

function updateAccountView() {
    const account = JSON.parse(localStorage.getItem(accountStorageKey) || 'null');
    const loggedIn = Boolean(account);
    accountLabel.textContent = loggedIn ? account.name : 'Log in';
    userAvatar.textContent = loggedIn ? account.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() : 'TS';
    accountForm.classList.toggle('hidden', loggedIn);
    accountProfile.classList.toggle('hidden', !loggedIn);
    changePhotoBtn.classList.toggle('hidden', !loggedIn);
    accountLogout.classList.toggle('hidden', !loggedIn);
    document.getElementById('accountTitle').textContent = loggedIn ? `Welcome, ${account.name}` : 'Log in to your account';
    if (loggedIn) {
        const initials = account.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
        userAvatar.innerHTML = account.photo ? `<img src="${account.photo}" alt="${account.name} profile picture">` : initials;
        profileAvatar.innerHTML = account.photo ? `<img src="${account.photo}" alt="${account.name} profile picture">` : initials;
        profileName.textContent = account.name;
        profileEmail.textContent = account.email;
    } else {
        userAvatar.textContent = 'TS';
        profileAvatar.textContent = 'TS';
    }
}

function openAccount() {
    updateAccountView();
    accountModal.classList.remove('hidden');
    if (!accountForm.classList.contains('hidden')) document.getElementById('accountName').focus();
}

function closeAccount() {
    accountModal.classList.add('hidden');
    accountStatus.textContent = '';
}

function returnToChatHome() {
    const homeItem = document.querySelector('[data-view="Search chats"]');
    if (homeItem) activateNavigation(homeItem);
    chatInput.focus();
}

function renderMessageText(bubble, text) {
    const normalized = String(text || '').replace(/\r\n/g, '\n').trim();
    if (!normalized) return;

    const blocks = normalized.split(/\n\s*\n/);

    blocks.forEach((block, blockIndex) => {
        const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
        if (!lines.length) return;

        const isListBlock = lines.some((line) => /^([-*•]|\d+[.)])\s+/.test(line));
        const isHeadingBlock = lines.length === 1 && /^(?:\*\*.*\*\*|##?\s+|[✨🔥💡✅📌💬❓🧠📚🚀🌟🎯]\s*.+)/.test(lines[0]);
        const isFaqBlock = lines.every((line) => /^(?:Q|A|FAQ)\s*[:\-]/i.test(line));

        if (isHeadingBlock) {
            const heading = document.createElement('div');
            heading.className = 'message-section-heading';
            const headingText = lines[0].replace(/^#{1,6}\s+/, '').replace(/^\*\*(.*?)\*\*$/, '$1').trim();
            const emoji = headingText.match(/^[✨🔥💡✅📌💬❓🧠📚🚀🌟🎯]/u)?.[0] || '✨';
            const cleanText = headingText.replace(new RegExp(`^${emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'u'), '').trim();
            const emojiNode = document.createElement('span');
            emojiNode.className = 'section-emoji';
            emojiNode.textContent = emoji;
            heading.appendChild(emojiNode);
            appendRichText(heading, cleanText || headingText);
            bubble.appendChild(heading);
            return;
        }

        if (isFaqBlock) {
            const faq = document.createElement('div');
            faq.className = 'message-faq';
            lines.forEach((line) => {
                const label = /^Q\s*[:\-]/i.test(line) ? 'question' : /^A\s*[:\-]/i.test(line) ? 'answer' : 'note';
                const item = document.createElement('div');
                item.className = label === 'question' ? 'message-faq-question' : 'message-faq-answer';
                const content = line.replace(/^(?:Q|A|FAQ)\s*[:\-]\s*/i, '').trim();
                const prefix = label === 'question' ? 'Q:' : label === 'answer' ? 'A:' : '';
                const prefixNode = document.createElement('span');
                prefixNode.className = 'faq-label';
                prefixNode.textContent = prefix;
                if (prefix) item.appendChild(prefixNode);
                appendRichText(item, content);
                faq.appendChild(item);
            });
            bubble.appendChild(faq);
            return;
        }

        const container = document.createElement(isListBlock ? 'ul' : 'div');
        container.className = isListBlock ? 'message-list' : 'message-paragraphs';

        lines.forEach((line) => {
            if (isListBlock) {
                const item = document.createElement('li');
                item.className = 'message-list-item';
                appendRichText(item, line.replace(/^([-*•]|\d+[.)])\s+/, ''));
                container.appendChild(item);
                return;
            }

            const lineElement = document.createElement('div');
            lineElement.className = 'message-paragraph';
            appendRichText(lineElement, line);
            container.appendChild(lineElement);
        });

        if (blockIndex > 0 && bubble.lastElementChild) {
            bubble.appendChild(document.createTextNode(' '));
        }
        bubble.appendChild(container);
    });

    function appendRichText(parent, content) {
        const raw = String(content || '').trim();
        if (!raw) return;

        const pattern = /(\*\*.*?\*\*|__.*?__|https?:\/\/[^\s]+)/g;
        let lastIndex = 0;
        let match;

        while ((match = pattern.exec(raw)) !== null) {
            const before = raw.slice(lastIndex, match.index);
            if (before) {
                parent.appendChild(document.createTextNode(before));
            }

            const token = match[0];
            if (token.startsWith('http')) {
                const trailingPunctuation = token.match(/[),.!?]+$/)?.[0] || '';
                const url = trailingPunctuation ? token.slice(0, -trailingPunctuation.length) : token;
                const link = document.createElement('a');
                link.href = url;
                link.textContent = url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.className = 'chat-link';
                parent.appendChild(link);
                if (trailingPunctuation) parent.appendChild(document.createTextNode(trailingPunctuation));
            } else {
                const strong = document.createElement('strong');
                const boldText = token.startsWith('**') || token.startsWith('__') ? token.slice(2, -2) : token;
                strong.textContent = boldText;
                parent.appendChild(strong);
            }

            lastIndex = match.index + token.length;
        }

        const rest = raw.slice(lastIndex);
        if (rest) {
            parent.appendChild(document.createTextNode(rest));
        }
    }
}

function copyText(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalLabel = button.innerHTML;
        button.innerHTML = '<i class="fa-solid fa-check"></i>';
        window.setTimeout(() => { button.innerHTML = originalLabel; }, 1200);
    });
}

function speakText(text, button) {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    button?.classList.add('active');
    utterance.addEventListener('end', () => button?.classList.remove('active'));
    window.speechSynthesis.speak(utterance);
}

function showThinking() {
    thinkingMessage = document.createElement('div');
    thinkingMessage.className = 'message assistant thinking-message';
    thinkingMessage.innerHTML = `
        <div class="message-bubble thinking-bubble gemini-thinking-bubble">
            <div class="gemini-orb-wrap">
                <div class="gemini-orb-core"></div>
            </div>
            <div class="gemini-thinking-copy">
                <span class="gemini-thinking-label">Tumaini AI</span>
                <span class="gemini-thinking-status">Generating answer</span>
            </div>
            <div class="gemini-bars" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    chatThread.appendChild(thinkingMessage);
    chatThread.scrollTop = chatThread.scrollHeight;
}

function hideThinking() {
    thinkingMessage?.remove();
    thinkingMessage = null;
}

function addMessage(text, sender, options = {}) {
    const { renderHtml = false, persist = true } = options;

    if (sender === 'user') {
        heroPanel.classList.add('hidden');
        aiShowcase.style.display = 'none';
    }

    const message = document.createElement('div');
    message.className = `message ${sender}`;
    message.style.opacity = '0';
    message.style.transform = 'translateY(12px) scale(0.98)';
    message.style.willChange = 'transform, opacity';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    if (renderHtml) {
        bubble.innerHTML = text;
    } else {
        renderMessageText(bubble, text);
    }

    message.appendChild(bubble);

    if (sender === 'assistant') {
        const actions = document.createElement('div');
        actions.className = 'message-actions';
        actions.innerHTML = '<button class="message-action" type="button" title="Copy response"><i class="fa-regular fa-copy"></i></button><button class="message-action" type="button" title="Read response aloud"><i class="fa-solid fa-volume-high"></i></button><button class="message-action" type="button" title="Regenerate response"><i class="fa-solid fa-rotate"></i></button>';
        actions.children[0].addEventListener('click', (event) => copyText(text, event.currentTarget));
        actions.children[1].addEventListener('click', (event) => speakText(text, event.currentTarget));
        actions.children[2].addEventListener('click', () => regenerateMessage(message));
        message.appendChild(actions);
    }

    chatThread.appendChild(message);

    requestAnimationFrame(() => {
        message.style.opacity = '1';
        message.style.transform = 'translateY(0) scale(1)';
    });

    chatThread.scrollTop = chatThread.scrollHeight;
    if (persist) saveChat();
}

function regenerateMessage(message) {
    const messages = [...chatThread.querySelectorAll('.message')];
    const messageIndex = messages.indexOf(message);
    const previousUserMessage = messages.slice(0, messageIndex).reverse().find((item) => item.classList.contains('user'));
    const prompt = previousUserMessage?.querySelector('.message-bubble')?.textContent || lastUserMessage;
    if (!prompt || thinkingMessage) return;

    message.remove();
    showThinking();
    window.setTimeout(() => {
        hideThinking();
        addMessage(getBotReply(prompt), 'assistant');
    }, 650);
}

function saveChat() {
    const messages = [...chatThread.querySelectorAll('.message')].map((message) => ({
        sender: message.classList.contains('user') ? 'user' : 'assistant',
        text: message.querySelector('.message-bubble')?.textContent?.trim() || ''
    }));

    localStorage.setItem(storageKey, JSON.stringify(messages));

    const firstUserMessage = messages.find(({ sender }) => sender === 'user');
    if (!firstUserMessage) return;

    const history = getChatHistory();
    const existingChat = history.find((chat) => chat.id === activeChatId);
    const chatTitle = firstUserMessage.text.replace(/\s+/g, ' ').trim().slice(0, 42) || 'New chat';
    const chatRecord = {
        id: activeChatId,
        title: chatTitle,
        messages,
        updatedAt: Date.now()
    };

    if (existingChat) {
        Object.assign(existingChat, chatRecord);
    } else {
        history.unshift(chatRecord);
    }

    history.sort((first, second) => second.updatedAt - first.updatedAt);
    localStorage.setItem(chatHistoryStorageKey, JSON.stringify(history.slice(0, 25)));
    localStorage.setItem(activeChatStorageKey, activeChatId);
    renderChatHistory();
}

function loadChat() {
    hydratePersistentMemoryFromHistory();
    const savedMessages = JSON.parse(localStorage.getItem(storageKey) || 'null');
    renderChatHistory();
    if (!savedMessages?.length) return;

    chatThread.innerHTML = '';
    if (savedMessages.some(({ sender }) => sender === 'user')) {
        heroPanel.classList.add('hidden');
        aiShowcase.style.display = 'none';
    }
    savedMessages.forEach(({ text, sender }) => addMessage(text, sender, { persist: false }));
}

function resetChat() {
    saveChat();
    hideThinking();
    clearAttachedContext();
    activeChatId = `chat-${Date.now()}`;
    localStorage.setItem(activeChatStorageKey, activeChatId);
    localStorage.removeItem(storageKey);
    chatThread.innerHTML = '';
    heroPanel.classList.remove('hidden');
    aiShowcase.style.display = '';
    addMessage(welcomeMessage, 'assistant');
    chatInput.value = '';
    chatInput.focus();
}

function getRequestedExamType(message) {
    const lower = message.toLowerCase();
    if (/\b(acsee|advanced certificate|advanced certificate of secondary education|a-level|a level|advanced level)\b/.test(lower)) return 'ACSEE';
    if (/\b(ftna|form two national assessment|form two|fomu mbili|kidato cha pili|form ii|ftna-?202?\d)\b/.test(lower)) return 'FTNA';
    if (/\b(form four|form iv|fomu nne|fomu ya nne|csee|certificate of secondary education|o-level|o level|ordinary level|kidato cha nne)\b/.test(lower)) return 'CSEE';
    if (/\b(matokeo|results?|exam results?)\b/.test(lower) && /\b(202[0-9])\b/.test(lower) && !/\b(ftna|acsee|csee)\b/.test(lower)) {
        return 'FTNA';
    }
    return 'CSEE';
}

function extractRequestedYear(message) {
    const match = message.match(/\b(20\d{2})\b/);
    return match ? match[1] : null;
}

function getResultIntent(message) {
    const lower = message.toLowerCase();
    const examType = getRequestedExamType(message);
    const requestedYear = extractRequestedYear(message);
    const asksForAllYears = /(miaka yote|all years|kila mwaka|every year|list all years|orodha ya miaka|yote mwaka)/i.test(lower);
    const asksForResults = /(matokeo|results?|exam results?|gpa|division|divisions|score|pass|exam)/i.test(lower);
    const asksAboutSchool = /(tumaini|tsss|s5493|school|shule)/i.test(lower);

    return {
        examType,
        requestedYear,
        asksForAllYears,
        asksForResults,
        asksAboutSchool
    };
}

function getExamTypeFolder(examType) {
    const normalized = String(examType || 'CSEE').toUpperCase();
    if (normalized === 'ACSEE') return 'ACSEE';
    if (normalized === 'FTNA') return 'FTNA';
    return 'CSEE';
}

function getAvailableResultYears(examType) {
    const folder = getExamTypeFolder(examType);
    const yearsByFolder = {
        CSEE: [2025, 2024, 2023, 2022],
        FTNA: [2025, 2024, 2023],
        ACSEE: [2026, 2025, 2024, 2023]
    };
    return [...(yearsByFolder[folder] || yearsByFolder.CSEE)].sort((a, b) => b - a);
}

function getTumainiResultsUrl(year, examType = 'CSEE') {
    const folder = getExamTypeFolder(examType);
    const yearFile = `${year}.htm`;

    if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
        const basePath = encodeURI('file:///d:/TUMAINI SCHOOLS AI/SCHOOL RESULTS');
        return `${basePath}/${encodeURIComponent(folder)}/${encodeURIComponent(yearFile)}`;
    }

    return `https://onlinesys.necta.go.tz/results/${year}/${folder.toLowerCase()}/results/s5493.htm`;
}

function getKnownResultSnapshot(examType, year) {
    const normalizedType = getExamTypeFolder(examType || 'CSEE');
    const normalizedYear = String(year || '2025');

    const snapshots = {
        CSEE: {
            '2025': {
                exam: 'CSEE',
                year: 2025,
                total: 69,
                divisionI: 53,
                divisionII: 14,
                divisionIII: 2,
                divisionIV: 0,
                divisionZero: 0,
                gpa: '1.7182',
                grade: 'B (Very Good)',
                subjectHighlights: 'English Language, Chemistry, History, Geography, Kiswahili, Physics and Computer Studies were among the strongest subjects, with English Language, Chemistry and Information & Computer Studies showing excellent results.',
                note: 'The school recorded a very strong overall performance in 2025 with 69 candidates, 53 in Division I, 14 in Division II, 2 in Division III, and a centre GPA of 1.7182 (Grade B, Very Good).'
            },
            '2024': {
                exam: 'CSEE',
                year: 2024,
                total: 43,
                divisionI: 30,
                divisionII: 12,
                divisionIII: 1,
                divisionIV: 0,
                divisionZero: 0,
                gpa: '1.8712',
                grade: 'B (Very Good)',
                subjectHighlights: 'English Language, Geography, Chemistry, Biology, Information and Computer Studies, and Basic Mathematics were among the strongest subject areas, while English Language and Chemistry showed standout performance at the centre.',
                note: 'The school recorded a strong 2024 CSEE performance with 43 candidates sitting the exam, 30 in Division I, 12 in Division II, 1 in Division III, and a centre GPA of 1.8712 (Grade B, Very Good).'
            },
            '2023': {
                exam: 'CSEE',
                year: 2023,
                total: 45,
                divisionI: 43,
                divisionII: 2,
                divisionIII: 0,
                divisionIV: 0,
                divisionZero: 0,
                gpa: '1.4618',
                grade: 'A (Excellent)',
                subjectHighlights: 'Kiswahili, English Language, Chemistry, Biology, Civics and Basic Mathematics were among the strongest subjects, with Kiswahili, English Language and Chemistry showing Grade A (Excellent).',
                note: 'The school recorded an excellent 2023 CSEE performance with 45 candidates, a centre GPA of 1.4618, and an outstanding majority in Division I.'
            },
            '2022': {
                exam: 'CSEE',
                year: 2022,
                total: 78,
                divisionI: 64,
                divisionII: 13,
                divisionIII: 1,
                divisionIV: 0,
                divisionZero: 0,
                gpa: '1.7479',
                grade: 'B (Very Good)',
                subjectHighlights: 'Kiswahili, English Language, Chemistry, Biology and Civics were strong subject areas, with Kiswahili and English Language both showing Grade A (Excellent).',
                note: 'The school posted an excellent 2022 CSEE performance, with 78 candidates passing and a very strong majority in Division I and II.'
            }
        },
        FTNA: {
            '2025': {
                exam: 'FTNA',
                year: 2025,
                total: 109,
                divisionI: 105,
                divisionII: 3,
                divisionIII: 1,
                divisionIV: 0,
                divisionZero: 0,
                gpa: '1.4482',
                grade: 'A (Excellent)',
                subjectHighlights: 'History, Geography, Kiswahili, English Language, Physics, Chemistry, Biology, Information & Computer Studies and Basic Mathematics were all very strong, with History, Geography, Kiswahili and English Language standing out as top-performing subjects.',
                note: 'The school posted an outstanding FTNA 2025 performance, with 109 candidates passing, 105 in Division I, 3 in Division II, 1 in Division III, and a centre GPA of 1.4482 (Grade A, Excellent).'
            },
            '2024': {
                exam: 'FTNA',
                year: 2024,
                total: 44,
                divisionI: 39,
                divisionII: 3,
                divisionIII: 2,
                divisionIV: 0,
                divisionZero: 0,
                gpa: '1.6761',
                grade: 'B (Very Good)',
                subjectHighlights: 'History, Geography, English Language, Biology and Information & Computer Studies were among the strongest subject areas, with Geography and English Language showing excellent results.',
                note: 'The school recorded a very strong FTNA 2024 performance with 44 candidates passing, 39 in Division I, 3 in Division II, and 2 in Division III.'
            },
            '2023': {
                exam: 'FTNA',
                year: 2023,
                total: 73,
                divisionI: 55,
                divisionII: 13,
                divisionIII: 5,
                divisionIV: 0,
                divisionZero: 0,
                gpa: '1.8315',
                grade: 'B (Very Good)',
                subjectHighlights: 'History, Geography, Kiswahili, English Language, Biology, Information & Computer Studies, and Basic Mathematics were among the strongest subject areas, with Biology and Geography showing very good performance.',
                note: 'The school recorded a strong FTNA 2023 performance with 73 candidates passing, 55 in Division I, 13 in Division II, 5 in Division III, and a centre GPA of 1.8315 (Grade B, Very Good).'
            }
        },
        ACSEE: {
            '2026': {
                exam: 'ACSEE',
                year: 2026,
                total: 74,
                divisionI: 24,
                divisionII: 35,
                divisionIII: 15,
                divisionIV: 0,
                divisionZero: 0,
                gpa: '2.6959',
                grade: 'C (Good)',
                subjectHighlights: 'Geography, History, Physics, Chemistry, Biology, Advanced Mathematics and Economics were the major performance areas, with Geography and Biology showing consistently strong outcomes.',
                note: 'The school recorded a solid ACSEE 2026 performance with 74 candidates, a centre GPA of 2.6959, and a strong majority in Division I and II.'
            },
            '2023': {
                exam: 'ACSEE',
                year: 2023,
                total: 42,
                divisionI: 16,
                divisionII: 24,
                divisionIII: 2,
                divisionIV: 0,
                divisionZero: 0,
                gpa: '2.4722',
                grade: 'C (Good)',
                subjectHighlights: 'Geography, Kiswahili, English Language, Physics, Chemistry and Economics were the major performance areas, with Economics showing Grade B (Very Good).',
                note: 'The school recorded a solid ACSEE performance, with 42 students passing and a centre GPA of 2.4722.'
            },
            '2024': {
                exam: 'ACSEE',
                year: 2024,
                total: 45,
                divisionI: 17,
                divisionII: 25,
                divisionIII: 3,
                divisionIV: 0,
                divisionZero: 0,
                gpa: '2.4300',
                grade: 'C (Good)',
                subjectHighlights: 'Economics, Geography, Physics, Chemistry and English remained the strongest subject groups.',
                note: 'The centre continued to perform well in advanced-level studies with a good pass profile.'
            },
            '2025': {
                exam: 'ACSEE',
                year: 2025,
                total: 46,
                divisionI: 18,
                divisionII: 24,
                divisionIII: 4,
                divisionIV: 0,
                divisionZero: 0,
                gpa: '2.3900',
                grade: 'C (Good)',
                subjectHighlights: 'Economics, Geography, Chemistry and English stood out as stronger performance areas.',
                note: 'The school maintained a healthy advanced-level result pattern with many students in Division I and II.'
            }
        }
    };

    return snapshots[normalizedType]?.[normalizedYear] || null;
}

function getTumainiResultsReply(message) {
    const swahili = wantsSwahili(message);
    const examType = getRequestedExamType(message);
    const availableYears = getAvailableResultYears(examType);
    const requestedYear = message.match(/\b(20\d{2})\b/)?.[1] || String(availableYears[0] || 2025);
    const resultsUrl = getTumainiResultsUrl(requestedYear, examType);
    const examLabel = examType === 'FTNA' ? 'FTNA' : examType === 'ACSEE' ? 'ACSEE' : 'CSEE';
    const snapshot = getKnownResultSnapshot(examType, requestedYear);

    if (swahili) {
        return snapshot
            ? `Matokeo ya ${snapshot.exam} ${snapshot.year} kwa TUMAINI SENIOR HIGH SCHOOL (S5493):\n\nWanafunzi wote: ${snapshot.total}\nDivision I: ${snapshot.divisionI}\nDivision II: ${snapshot.divisionII}\nDivision III: ${snapshot.divisionIII}\nDivision IV: ${snapshot.divisionIV}\nDivision 0: ${snapshot.divisionZero}\nGPA ya kituo: ${snapshot.gpa} (${snapshot.grade})\n\nMada zenye matokeo mazuri: ${snapshot.subjectHighlights}\n\nTafsiri ya jumla: ${snapshot.note}`
            : `Matokeo ya ${examLabel} ${requestedYear} kwa TUMAINI SENIOR HIGH SCHOOL (S5493) yametajwa kwenye faili ya nje ya matokeo.\n\nKama unataka, ninaweza kukupatia orodha ya miaka inayopatikana kwa ${examLabel}.`;
    }

    return snapshot
        ? `Results for ${snapshot.exam} ${snapshot.year} at TUMAINI SENIOR HIGH SCHOOL (S5493):\n\nTotal candidates: ${snapshot.total}\nDivision I: ${snapshot.divisionI}\nDivision II: ${snapshot.divisionII}\nDivision III: ${snapshot.divisionIII}\nDivision IV: ${snapshot.divisionIV}\nDivision 0: ${snapshot.divisionZero}\nCentre GPA: ${snapshot.gpa} (${snapshot.grade})\n\nStrong subject areas: ${snapshot.subjectHighlights}\n\nOverall summary: ${snapshot.note}`
        : `The ${examLabel} ${requestedYear} results for TUMAINI SENIOR HIGH SCHOOL (S5493) are listed in the official result file.\n\nIf you want, I can also provide the available years for ${examLabel}.`;
}

function getTumainiYearLinksReply(message) {
    const swahili = wantsSwahili(message);
    const examType = getRequestedExamType(message);
    const folder = getExamTypeFolder(examType);
    const years = getAvailableResultYears(examType);
    const links = years.map((year) => `${year}: ${getTumainiResultsUrl(year, examType)}`).join('\n');

    if (swahili) {
        return `Miaka ya matokeo ya ${examType} kwa TUMAINI SENIOR HIGH SCHOOL:\n\n${links}\n\nChagua mwaka unaotaka. Faili za ${folder} zimetenganishwa kwa mwaka.`;
    }

    return `Available ${examType} result years for TUMAINI SENIOR HIGH SCHOOL:\n\n${links}\n\nChoose the year you want. The ${folder} files are separated by year.`;
}

function isSchoolResultsQuestion(message) {
    const lower = message.toLowerCase();
    const hasExamType = /(ftna|csee|acsee|matokeo|results|necta|exam)/i.test(lower);
    return hasExamType &&
        (lower.includes('tumaini') || lower.includes('s5493') || lower.includes('school') || /\b20\d{2}\b/.test(lower));
}

function isImageQuestion(message) {
    return /\b(photo|photos|picture|pictures|image|images|picha|onyesha|show)\b/i.test(message) &&
        /\b(school|shule|tumaini|classroom|classrooms|darasa|gate|geti|laboratory|lab|library|maktaba|hostel|dormitory|field|uwanja|office|ofisi|building|jengo)\b/i.test(message);
}

function getImageSearchQuery(message) {
    const cleaned = message.replace(/\b(show|photos?|pictures?|images?|picha|za|ya|the|of|school|shule|tumaini)\b/gi, ' ').trim();
    return `Tumaini Senior High School ${cleaned || 'school'}`.replace(/\s+/g, ' ');
}

function getRequestedSocialProfile(message) {
    const lower = message.toLowerCase();

    if (lower.includes('video') || lower.includes('watch') || lower.includes('clip')) {
        return { name: 'School video', url: schoolVideoUrl };
    }
    if (lower.includes('youtube') || lower.includes('you tube')) {
        return { name: 'YouTube', url: youtubeUrl };
    }
    if (lower.includes('whatsapp') || lower.includes('whatapp') || lower.includes('watsapp')) {
        return { name: 'WhatsApp', url: whatsappUrl };
    }
    if (lower.includes('facebook') || lower.includes('fb')) {
        return { name: 'Facebook', url: facebookUrl };
    }
    if (lower.includes('instagram')) {
        return { name: 'Instagram', url: instagramUrl };
    }
    if (lower.includes('tiktok')) {
        return { name: 'TikTok', url: tiktokUrl };
    }

    return null;
}

function isSocialQuestion(message) {
    return /\b(youtube|you tube|tiktok|instagram|facebook|whatsapp|whatapp|watsapp|social media|socials|mitandao|video|fb)\b/i.test(message);
}

function addImageMessage(source, alt, caption) {
    const message = document.createElement('div');
    message.className = 'message assistant image-message';
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble image-bubble';
    const image = document.createElement('img');
    image.src = source;
    image.alt = alt;
    image.loading = 'lazy';
    image.addEventListener('error', () => message.remove());
    const label = document.createElement('span');
    label.className = 'image-caption';
    label.textContent = caption;
    bubble.append(image, label);
    message.appendChild(bubble);
    chatThread.appendChild(message);
    chatThread.scrollTop = chatThread.scrollHeight;
}

function addLiveWebSearchCard(searchResult) {
    const message = document.createElement('div');
    message.className = 'message assistant live-web-card-message';
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble live-web-card';

    const body = document.createElement('div');
    body.className = 'live-web-card__body';

    const text = document.createElement('p');
    text.textContent = searchResult?.answer || '';
    text.className = 'live-web-card__text';

    body.appendChild(text);

    const sourceName = searchResult?.sourceName || 'Web search';

    if (searchResult?.imageUrl) {
        const imageWrap = document.createElement('div');
        imageWrap.className = 'live-web-card__image-wrap';
        const image = document.createElement('img');
        image.src = searchResult.imageUrl;
        image.alt = searchResult.imageAlt || 'Live search visual';
        image.loading = 'lazy';
        image.className = 'live-web-card__image';
        imageWrap.appendChild(image);
        body.appendChild(imageWrap);
    }

    const sourceUrls = [...new Set(searchResult?.sourceUrls || (searchResult?.sourceUrl ? [searchResult.sourceUrl] : []))];
    if (sourceUrls.length) {
        const sourceLink = document.createElement('a');
        sourceLink.href = sourceUrls[0];
        sourceLink.target = '_blank';
        sourceLink.rel = 'noopener noreferrer';
        sourceLink.className = 'live-web-card__source-logo';
        sourceLink.title = `Open ${sourceName} source`;
        sourceLink.setAttribute('aria-label', `Open ${sourceName} source`);

        const logo = document.createElement('img');
        logo.src = 'logo/TUMAINI SCHOOLS AI LOGO.png';
        logo.alt = 'Tumaini Schools AI';
        logo.loading = 'lazy';
        sourceLink.appendChild(logo);
        body.appendChild(sourceLink);
    }

    bubble.append(body);
    message.appendChild(bubble);
    chatThread.appendChild(message);
    chatThread.scrollTop = chatThread.scrollHeight;
    saveChat();
}

function addImageSearchResults(query) {
    const message = document.createElement('div');
    message.className = 'message assistant image-results-message';
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble image-results-bubble';
    const title = document.createElement('strong');
    title.textContent = `Image results for: ${query}`;
    const description = document.createElement('p');
    description.textContent = 'Verified local image assets appear here immediately. Use the links for more school photos from public sources.';
    addImageMessage('logo/TUMAINI SCHOOLS AI LOGO.png', 'Official Tumaini Schools AI logo', 'Tumaini Schools AI official logo');
    const links = document.createElement('div');
    links.className = 'image-result-links';
    const googleLink = document.createElement('a');
    googleLink.href = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
    googleLink.target = '_blank';
    googleLink.rel = 'noopener noreferrer';
    googleLink.innerHTML = '<i class="fa-brands fa-google"></i> Search images';
    const instagramLink = document.createElement('a');
    instagramLink.href = instagramUrl;
    instagramLink.target = '_blank';
    instagramLink.rel = 'noopener noreferrer';
    instagramLink.innerHTML = '<i class="fa-brands fa-instagram"></i> Official Instagram';
    const tiktokLink = document.createElement('a');
    tiktokLink.href = tiktokUrl;
    tiktokLink.target = '_blank';
    tiktokLink.rel = 'noopener noreferrer';
    tiktokLink.innerHTML = '<i class="fa-brands fa-tiktok"></i> Official TikTok';
    const facebookLink = document.createElement('a');
    facebookLink.href = facebookUrl;
    facebookLink.target = '_blank';
    facebookLink.rel = 'noopener noreferrer';
    facebookLink.innerHTML = '<i class="fa-brands fa-facebook-f"></i> Facebook';
    const whatsappLink = document.createElement('a');
    whatsappLink.href = whatsappUrl;
    whatsappLink.target = '_blank';
    whatsappLink.rel = 'noopener noreferrer';
    whatsappLink.innerHTML = `<i class="fa-brands fa-whatsapp"></i> WhatsApp (${whatsappNumber})`;
    const youtubeLink = document.createElement('a');
    youtubeLink.href = youtubeUrl;
    youtubeLink.target = '_blank';
    youtubeLink.rel = 'noopener noreferrer';
    youtubeLink.innerHTML = '<i class="fa-brands fa-youtube"></i> YouTube';
    links.append(googleLink, instagramLink, tiktokLink, facebookLink, whatsappLink, youtubeLink);
    bubble.append(title, description, links);
    message.appendChild(bubble);
    chatThread.appendChild(message);
    chatThread.scrollTop = chatThread.scrollHeight;
}

function addSocialLinksMessage(swahili, requestedPlatform = null) {
    const message = document.createElement('div');
    message.className = 'message assistant image-results-message';
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble image-results-bubble';
    const title = document.createElement('strong');
    const socialLinks = requestedPlatform
        ? [{ name: requestedPlatform, url: requestedPlatform === 'Instagram' ? instagramUrl : requestedPlatform === 'TikTok' ? tiktokUrl : requestedPlatform === 'Facebook' ? facebookUrl : requestedPlatform === 'WhatsApp' ? whatsappUrl : requestedPlatform === 'YouTube' ? youtubeUrl : schoolVideoUrl }]
        : [
            { name: 'Instagram', url: instagramUrl },
            { name: 'TikTok', url: tiktokUrl },
            { name: 'Facebook', url: facebookUrl },
            { name: 'WhatsApp', url: whatsappUrl },
            { name: 'YouTube', url: youtubeUrl },
            { name: 'School video', url: schoolVideoUrl }
        ];
    title.textContent = swahili
        ? (requestedPlatform ? `Tumaini Schools kwenye ${requestedPlatform}` : 'Tumaini Schools kwenye mitandao')
        : (requestedPlatform ? `Tumaini Schools on ${requestedPlatform}` : 'Tumaini Schools social profiles');
    const description = document.createElement('p');
    description.textContent = swahili
        ? (requestedPlatform ? `Fungua akaunti ya ${requestedPlatform} ya shule hiyo kuona picha, video na taarifa mpya.` : 'Fungua akaunti rasmi kuona picha, video na taarifa mpya za shule.')
        : (requestedPlatform ? `Open the official ${requestedPlatform} profile for school photos, videos, and updates.` : 'Open the official profiles for school photos, videos, and updates.');
    const links = document.createElement('div');
    links.className = 'image-result-links';
    socialLinks.forEach(({ name, url }) => {
        const label = name === 'Instagram'
            ? '<i class="fa-brands fa-instagram"></i> Instagram'
            : name === 'TikTok'
                ? '<i class="fa-brands fa-tiktok"></i> TikTok'
                : name === 'Facebook'
                    ? '<i class="fa-brands fa-facebook-f"></i> Facebook'
                    : name === 'WhatsApp'
                        ? `<i class="fa-brands fa-whatsapp"></i> WhatsApp (${whatsappNumber})`
                        : name === 'YouTube'
                            ? '<i class="fa-brands fa-youtube"></i> YouTube'
                            : '<i class="fa-solid fa-play"></i> Watch video';
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.innerHTML = label;
        links.appendChild(link);
    });
    bubble.append(title, description, links);
    message.appendChild(bubble);
    chatThread.appendChild(message);
    chatThread.scrollTop = chatThread.scrollHeight;
}

async function fetchLiveResultsReply(message) {
    const year = message.match(/\b(20\d{2})\b/)?.[1] || '2025';
    const examType = getRequestedExamType(message);
    const response = await fetch(`api.php?year=${year}&type=${encodeURIComponent(examType.toLowerCase())}`);
    if (!response.ok) throw new Error('Live NECTA results are unavailable.');

    const data = await response.json();
    if (!data.ok) throw new Error(data.error || 'Live NECTA results are unavailable.');

    const summary = data.summary || data.content || 'Results not available.';
    const shortSummary = summary.length > 2200 ? `${summary.slice(0, 2200)}...` : summary;

    if (wantsSwahili(message)) {
        return `Matokeo ya ${data.examType || examType} ${data.year || year} kwa ${data.school || 'Tumaini Senior High School'} (${data.centre || 'S5493'}):\n\n${shortSummary}\n\nChanzo: ${data.source || 'SCHOOL RESULTS folder'}`;
    }

    return `Live NECTA ${data.examType || examType} ${data.year || year} results for ${data.school || 'Tumaini Senior High School'} (${data.centre || 'S5493'}):\n\n${shortSummary}\n\nSource: ${data.source || 'SCHOOL RESULTS folder'}`;
}

async function getResultReplyForMessage(message) {
    try {
        return await fetchLiveResultsReply(message);
    } catch (error) {
        console.warn('Local results API failed, falling back to static summary:', error);
        return getTumainiResultsReply(message);
    }
}

function isSwahili(message) {
    return /\b(na|ya|za|kwa|hii|hiyo|matokeo|mwaka|shule|mzazi|tafadhali|habari|nina|unasaidia|kufanya|iwe|wapi|jina|mahali|maana|anuani|ipo)\b/i.test(message);
}

function detectLanguage(message) {
    if (/[\u0600-\u06ff]/.test(message)) return 'Arabic or another Arabic-script language';
    if (/[\u4e00-\u9fff]/.test(message)) return 'Chinese';
    if (/[\u3040-\u30ff]/.test(message)) return 'Japanese';
    if (/[\uac00-\ud7af]/.test(message)) return 'Korean';
    if (/[\u0400-\u04ff]/.test(message)) return 'Russian, Ukrainian, or another Cyrillic-script language';
    if (/[\u0900-\u097f]/.test(message)) return 'Hindi or another Devanagari-script language';
    if (/[\u0e00-\u0e7f]/.test(message)) return 'Thai';
    if (/[\u0370-\u03ff]/.test(message)) return 'Greek';
    if (/[\u0590-\u05ff]/.test(message)) return 'Hebrew';
    if (isSwahili(message)) return 'Swahili';

    const lower = message.toLowerCase();
    const patterns = [
        ['Spanish', /\b(hola|gracias|por favor|como estas|necesito|ayuda|escuela)\b/i],
        ['French', /\b(bonjour|merci|s il vous plait|comment allez|ecole|aide)\b/i],
        ['Portuguese', /\b(ola|obrigado|por favor|como voce|escola|ajuda)\b/i],
        ['German', /\b(hallo|danke|bitte|wie geht|schule|hilfe)\b/i],
        ['Italian', /\b(ciao|grazie|per favore|come stai|scuola|aiuto)\b/i],
        ['Turkish', /\b(merhaba|tesekkur|lutfen|nasilsin|okul|yardim)\b/i],
        ['Indonesian or Malay', /\b(halo|terima kasih|tolong|apa khabar|sekolah|bantuan)\b/i],
        ['Vietnamese', /\b(xin chao|cam on|lam on|truong hoc|giup)\b/i]
    ];
    return patterns.find(([, pattern]) => pattern.test(lower))?.[0] || 'English or another Latin-script language';
}

function getMultilingualReply(message) {
    const lower = message.toLowerCase();
    if (/\b(hola|buenos dias)\b/i.test(lower)) return '¡Hola! Puedo ayudarte con lessons, school research, projects, and study plans.';
    if (/\b(bonjour|salut)\b/i.test(lower)) return 'Bonjour! I can help with lessons, school research, projects, and study plans.';
    if (/\b(olá|ola)\b/i.test(lower)) return 'Olá! I can help with lessons, school research, projects, and study plans.';
    if (/\b(hallo|guten tag)\b/i.test(lower)) return 'Hallo! I can help with lessons, school research, projects, and study plans.';
    if (/\b(ciao|buongiorno)\b/i.test(lower)) return 'Ciao! I can help with lessons, school research, projects, and study plans.';
    if (/\b(merhaba)\b/i.test(lower)) return 'Merhaba! I can help with lessons, school research, projects, and study plans.';
    if (/[\u0600-\u06ff]/.test(message) && /(مرحبا|السلام عليكم)/.test(message)) return 'مرحباً! يمكنني مساعدتك في الدروس والبحث والمشاريع والخطط الدراسية.';
    if (/[\u4e00-\u9fff]/.test(message) && /(你好|您好)/.test(message)) return '你好！我可以帮助你学习、研究学校课题、完成项目和制定学习计划。';
    if (/[\u3040-\u30ff]/.test(message) && /(こんにちは|こんばんは)/.test(message)) return 'こんにちは！授業、学校の研究、プロジェクト、学習計画をお手伝いできます。';
    if (/[\uac00-\ud7af]/.test(message) && /안녕/.test(message)) return '안녕하세요! 수업, 학교 연구, 프로젝트와 학습 계획을 도와드릴 수 있습니다.';
    if (/[\u0900-\u097f]/.test(message) && /नमस्ते/.test(message)) return 'नमस्ते! मैं पाठ, शोध, परियोजनाओं और अध्ययन योजनाओं में सहायता कर सकता हूँ।';
    if (/[\u0400-\u04ff]/.test(message) && /(привет|здравствуйте)/i.test(message)) return 'Здравствуйте! Я могу помочь с уроками, исследованиями, проектами и планом обучения.';
    return null;
}

function getRandomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function getScienceLabCountReply(message, swahili) {
    const lower = message.toLowerCase();
    const asksPhysicsLabs = /(kuna\s+lab\s+ngapi\s+za\s+physics|kuna\s+lab\s+za\s+physics|physics.*lab.*ngapi|how many.*physics.*lab|number of physics labs|physics lab.*how many|how many physics laboratories|physics laboratories.*how many)/i.test(lower);
    const asksBiologyChemistryLabs = /(kuna\s+lab\s+za\s+(biology|biolojia)\s+na\s+(chemistry|kemia)|kuna\s+lab\s+za\s+(chemistry|kemia)\s+na\s+(biology|biolojia)|biology.*chemistry.*lab|biolojia.*kemia.*lab|chemistry.*biology.*lab|biology.*chemistry.*laboratories|biology and chemistry laboratories)/i.test(lower);
    const asksLabDistribution = /(lab\s+za\s+sayansi\s+zimegawanyika\s+vipi|sayansi.*lab.*zimegawanyika.*vipi|science.*labs.*divided|how.*science.*labs.*grouped|how are the science labs divided|how are the labs distributed|how are the science laboratories divided)/i.test(lower);
    const asksScienceLabCount = /(idadi.*(sayansi|science).*lab|number.*(science|sayansi).*lab|how many.*(science|sayansi).*lab|how many.*(lab|laborator|laboratorie)|how many.*laboratories|science lab.*how many|sayansi.*lab.*ngapi|laborator(?:y|ies|i).*ngapi|kuna.*jumla.*lab|kuna.*(lab|laboratory|laboratories).*ngapi|kuna.*(lab|laboratory|laboratories).*\d|lab.*\d|laboratory.*\d|laboratories.*\d)/i.test(lower);

    if (asksPhysicsLabs) {
        return swahili
            ? 'Kuna laboratori moja ya Physics.'
            : 'There is 1 Physics laboratory.';
    }

    if (asksBiologyChemistryLabs) {
        return swahili
            ? 'Kuna laboratori moja ya Biology na laboratori moja ya Chemistry.'
            : 'There is 1 Biology laboratory and 1 Chemistry laboratory.';
    }

    if (asksLabDistribution) {
        return swahili
            ? 'Laboratori za sayansi zimegawanyika kama hizi: Physics 1, Biology 1, Chemistry 1, na STEM/Computer laboratories 2. Jumla ni laboratori 5.'
            : 'The science laboratories are divided as follows: 1 Physics laboratory, 1 Biology laboratory, 1 Chemistry laboratory, and 2 STEM/Computer laboratories. Total: 5 laboratories.';
    }

    if (!asksScienceLabCount) return null;

    return swahili
        ? 'Shule ina jumla ya laboratori za sayansi 5: Physics laboratory 1, Biology laboratory 1, Chemistry laboratory 1, STEM/Computer laboratories 2.'
        : 'The school has a total of 5 science laboratories: 1 Physics laboratory, 1 Biology laboratory, 1 Chemistry laboratory, and 2 STEM/Computer laboratories.';
}

function getSwahiliReply(message) {
    const lower = message.toLowerCase();
    const oLevelSubjectsReply = getOLevelSubjectsReply(message);
    const memoryReply = getMemoryReply(message, true);
    const followUpReply = getFollowUpContinuationReply(message, true);
    const attachedReply = getAttachedFileReply(message, true);
    const lessonReply = getLessonReply(message, true, getConversationContext());

    if (memoryReply) return memoryReply;
    if (oLevelSubjectsReply) return oLevelSubjectsReply;
    if (followUpReply) return followUpReply;
    if (attachedReply) return attachedReply;
    if (lessonReply) return lessonReply;

    const schoolCombinationReply = getSchoolCombinationReply(message);
    if (schoolCombinationReply) return schoolCombinationReply;

    const scienceLabCountReply = getScienceLabCountReply(message, true);
    if (scienceLabCountReply) return scienceLabCountReply;

    const mathReply = solveSimpleMath(message);
    if (mathReply) return mathReply.replace('Jibu ni', 'Jibu ni');

    const schoolReply = getTumainiSchoolReply(message, true);
    if (schoolReply) return schoolReply;

    if (lower.includes('ratiba') || lower.includes('study plan') || lower.includes('mpango wa kusoma') || lower.includes('kujifunza')) {
        return getStudyPlanReply(message, true);
    }

    if (lower.includes('tsss') || lower.includes('maana yake')) {
        return 'TSSS inamaanisha Tumaini Senior Secondary School. Kwa sasa jina rasmi linalotumika ni TUMAINI SENIOR HIGH SCHOOL.';
    }

    if (lower.includes('ipo wapi') || lower.includes('mahali') || lower.includes('anuani') || lower.includes('address') || lower.includes('mkoa') || lower.includes('wilaya') || lower.includes('kijiji') || lower.includes('slp')) {
        return 'Tumaini Senior High School inapatikana Mkoa wa Arusha, Wilaya ya Monduli, Kijiji cha Makuyuni. S.L.P 312.';
    }

    if (lower.includes('jina la shule') || lower.includes('jina')) {
        return 'Jina rasmi la shule ni TUMAINI SENIOR HIGH SCHOOL.';
    }

    if (lower.includes('jina la shule') || lower.includes('school name')) {
        return 'Jina rasmi la shule ni TUMAINI SENIOR HIGH SCHOOL.';
    }

    const requestedSocialProfile = getRequestedSocialProfile(message);
    if (requestedSocialProfile) {
        return `Unaweza kufuatilia Tumaini Schools TZ kwenye ${requestedSocialProfile.name}:\n\n${requestedSocialProfile.url}`;
    }

    if (lower.includes('instagram') || lower.includes('tiktok') || lower.includes('facebook') || lower.includes('social') || lower.includes('video')) {
        return `Unaweza kufuatilia Tumaini Schools TZ kwenye mitandao hii:\n\nInstagram: ${instagramUrl}\nTikTok: ${tiktokUrl}\nFacebook: ${facebookUrl}\nWhatsApp: ${whatsappNumber} (${whatsappUrl})\nYouTube: ${youtubeUrl}\nVideo ya shule: ${schoolVideoUrl}`;
    }

    if (lower.includes('matokeo') || lower.includes('necta') || lower.includes('mwaka') || lower.includes('results') || /\b(div|division|gpa|pass|score|exam|exam results)\b/.test(lower)) {
        const resultIntent = getResultIntent(message);
        if (resultIntent.asksForAllYears) return getTumainiYearLinksReply(message);
        if (resultIntent.asksForResults && (resultIntent.asksAboutSchool || resultIntent.requestedYear || lower.includes('tumaini') || lower.includes('s5493') || lower.includes('school'))) {
            return getTumainiResultsReply(message).replace('View the official detailed results here:', 'Angalia matokeo rasmi kwa undani hapa:');
        }
        return `Naweza kukusaidia kuangalia matokeo ya NECTA. Tafadhali taja mwaka, aina ya mtihani kama FTNA/CSEE/ACSEE, na namba ya kituo. Tovuti rasmi ni: ${nectaUrl}`;
    }

    if (lower.includes('habari') || lower.includes('hello') || lower.includes('hi')) {
        const greetings = [
            'Habari! Ninaweza kukusaidia kuhusu masomo, miradi, AI na matokeo ya shule.',
            'Mambo! Niko tayari kukusaidia kwa maswali ya darasa, mradi, au utafiti wa shule.',
            'Salam! Nikusaidie kwa elimu, masomo, au kupanga mpango wa kujifunza.'
        ];
        return getRandomItem(greetings);
    }
    if (lower.includes('hisabati') || lower.includes('math') || lower.includes('algebra')) {
        return 'Ninaweza kukusaidia Hisabati hatua kwa hatua. Tuma swali lako.';
    }
    if (lower.includes('sayansi') || lower.includes('science') || lower.includes('biology')) {
        return 'Ninaweza kukusaidia kuelewa Sayansi, Biology na majaribio ya kisayansi.';
    }
    if (lower.includes('mradi') || lower.includes('project') || lower.includes('assignment')) {
        return 'Anza kwa kutaja lengo la mradi, hatua zinazohitajika na matokeo unayotarajia.';
    }
    if (lower.includes('ai') || lower.includes('artificial')) {
        return 'AI ni teknolojia inayosaidia kompyuta kujifunza mifumo na kufanya kazi kwa kutumia data.';
    }
    return getSmartFallback(message, getConversationContext(), true);
}

function getOLevelSubjectsReply(message) {
    const lower = message.toLowerCase();
    const asksAboutSubjects = isOLevelSubjectsQuestion(message) || /\bo[- ]?leval\b/i.test(lower);
    if (!asksAboutSubjects) return null;

    if (wantsSwahili(message)) {
        return `Masomo ya O-Level (Ordinary Level) yamegawanyika katika makundi mawili:\n\nMasomo ya Lazima (Compulsory Subjects)\nKila mwanafunzi wa O-Level anasoma masomo haya sita kutoka Kidato cha Kwanza hadi Kidato cha Nne:\n\n- Basic Mathematics (Hisabati)\n- English Language (Kiingereza)\n- Kiswahili\n- History of Tanzania and Ethics / Civics (Historia ya Tanzania na Maadili / Uraia)\n- History (Historia ya Dunia)\n- Geography (Jiografia)\n\nMasomo ya Kuchagua (Elective Subjects)\nWanafunzi huchagua masomo kulingana na mchepuo wanaoupenda au malengo yao ya baadaye.\n\nMchepuo wa Sayansi (Science):\n- Physics (Fizikia)\n- Chemistry (Kemia)\n- Biology (Biolojia)\n- Information and Computer Studies (ICS) (Somo la Kompyuta)`;
    }

    return `O-Level (Ordinary Level) subjects are divided into two groups:\n\nCompulsory Subjects\nEvery O-Level student studies these six subjects from Form One to Form Four:\n\n- Basic Mathematics\n- English Language\n- Kiswahili\n- History of Tanzania and Ethics / Civics\n- History\n- Geography\n\nElective Subjects\nStudents choose electives according to their preferred pathway and future goals.\n\nScience pathway:\n- Physics\n- Chemistry\n- Biology\n- Information and Computer Studies (ICS)`;
}

function isOLevelSubjectsQuestion(message) {
    return /\b(o[- ]?lev(?:el|al)|ordinary level|olevel|masomo ya o[- ]?lev(?:el|al)|subjects? ya o[- ]?lev(?:el|al)|o[- ]?lev(?:el|al) subjects|ordinary level subjects|masomo ya kidato cha kwanza hadi cha nne|masomo ya sekondari)\b/i.test(String(message || ''));
}

function isOLevelAcademicQuestion(message) {
    const lower = String(message || '').toLowerCase();
    const mentionsLevel = /\b(o[- ]?lev(?:el|al)|ordinary level|olevel|kidato cha (kwanza|pili|tatu|nne)|form\s*[1-4])\b/i.test(lower);
    const asksForLearning = /\b(explain|eleza|fafanua|teach|fundisha|solve|calculate|question|swali|maswali|exercise|zoezi|notes|nukuu|revision|marudio|lesson|somo|meaning|maana|how|vipi|why|kwanini)\b/i.test(lower);
    return mentionsLevel && asksForLearning;
}

function buildAdvancedCombinationList(swahili) {
    if (swahili) {
        return `TUMAINI SENIOR HIGH SCHOOL ina combinations za Advanced Level zifuatazo:\n\nScience & STEM:\n- PCM (Physics, Chemistry, Mathematics)\n- PMCs (Physics, Mathematics, Computer Science)\n- PGM (Physics, Geology/Geography, Mathematics)\n- PCB (Physics, Chemistry, Biology)\n- EGM (Economics, Geography, and Mathematics)\n- EMCs (Economics, Advanced Mathematics, and Computer Science)\n\nArts & Humanities:\n- HGL (History, Geography, Language/Literature)\n- HGK (History, Geography, Kiswahili)\n- HGE (History, Geography, Economics)\n- HKL (History, Kiswahili, English Literature)`;
    }

    return `TUMAINI SENIOR HIGH SCHOOL offers the following Advanced Level combinations:\n\nScience & STEM:\n- PCM (Physics, Chemistry, Mathematics)\n- PMCs (Physics, Mathematics, Computer Science)\n- PGM (Physics, Geology/Geography, Mathematics)\n- PCB (Physics, Chemistry, Biology)\n- EGM (Economics, Geography, and Mathematics)\n- EMCs (Economics, Advanced Mathematics, and Computer Science)\n\nArts & Humanities:\n- HGL (History, Geography, Language/Literature)\n- HGK (History, Geography, Kiswahili)\n- HGE (History, Geography, Economics)\n- HKL (History, Kiswahili, English Literature)`;
}

function getAdvancedCombinationsReply(message) {
    const lower = message.toLowerCase();
    const asksAboutCombinations = /(available advanced combinations|advanced combinations|combination|combinations|science.*stem|arts.*humanities|pcm|pgm|pcb|hgl|hgk|hge|hkl|mchanganyiko|mchanganyo)/i.test(lower);
    if (!asksAboutCombinations) return null;
    return buildAdvancedCombinationList(wantsSwahili(message));
}

function getSchoolCombinationReply(message) {
    const lower = message.toLowerCase();
    const asksAboutCombination = /(combination|combinations|mchanganyiko|mchanganyo|advanced level combination|advanced combinations|which combinations|zipatikana|zinazopatikana|zilizopo|combination.*shule|shule.*combination|combination.*available|available.*combination)/i.test(lower);
    if (!asksAboutCombination) return null;
    return buildAdvancedCombinationList(wantsSwahili(message));
}

function getTumainiSchoolInfoReply(message) {
    if (isSwahili(message)) {
        return `Tumaini Senior Secondary School (TSSS) ilianzishwa mwaka 2016 ikiwa na wanafunzi 48 tu. Kwa sasa shule ina zaidi ya wanafunzi 300 na zaidi ya wahitimu 160. Mwaka 2020, TSSS ilizaa Tumaini Senior High School yenye combinations 9.\n\nTumaini Senior High School ina taarifa rasmi za NECTA chini ya centre number S5493.\n\nMahali: Mkoa wa Arusha, Wilaya ya Monduli, Kijiji cha Makuyuni.\nS.L.P 312.\n\nKauli mbiu: Together We Excel.\n\nMatokeo rasmi ya shule: ${getTumainiResultsUrl(2025)}`;
    }

    return `Tumaini Senior Secondary School (TSSS) started in 2016 with only 48 students. Today, the school has over 300 students and more than 160 graduates. In 2020, TSSS gave birth to Tumaini Senior High School with 9 combinations.\n\nTumaini Senior High School is listed by NECTA under centre number S5493.\n\nLocation: Arusha Region, Monduli District, Makuyuni Village.\nP.O. Box 312.\n\nMotto: Together We Excel.\n\nOfficial school results: ${getTumainiResultsUrl(2025)}`;
}

function getTumainiSchoolReply(message, swahili) {
    const lower = message.toLowerCase();
    const isSchoolIdentityQuestion = /(jina\s+(kamili\s+)?la\s+mmiliki|mmiliki\s+wa\s+shule|mwenye\s+shule|owner\s+of\s+the\s+school|owner|proprietor|head\s+teacher|headmaster|headmistress|principal|school\s+head|mwalimu\s+mkuu|mkuu\s+wa\s+shule|motto|kauli\s+mbiu|address|location|contact|mawasiliano|whatsapp|instagram|facebook|tiktok|youtube|video|school\s+name|name\s+of\s+the\s+school)/i.test(lower);
    const mentionsSchool = /\b(tumaini|tsss|s5493|senior high|senior secondary|shule)\b/i.test(message);
    if (!mentionsSchool && !isSchoolIdentityQuestion) return null;

    const oLevelSubjectsReply = getOLevelSubjectsReply(message);
    if (oLevelSubjectsReply) return oLevelSubjectsReply;

    const advancedCombinationsReply = getAdvancedCombinationsReply(message);
    if (advancedCombinationsReply) return advancedCombinationsReply;

    if (isSchoolLeadershipQuestion(message)) return getSchoolLeadershipReply(message);

    if (/jina\s+(kamili\s+)?la\s+mmiliki|mmiliki\s+wa\s+shule|mwenye\s+shule|owner\s+of\s+the\s+school|owner|proprietor|mmiliki|mwenye shule/i.test(lower)) {
        return swahili
            ? 'Mmiliki wa TUMAINI SENIOR HIGH SCHOOL ni MODEST BAYO.'
            : 'The owner of TUMAINI SENIOR HIGH SCHOOL is MODEST BAYO.';
    }

    if (/(type of school|aina ya shule|kind of school|school type|ordinary level|advanced level|o[- ]level|a[- ]level|ole|a level)/i.test(lower)) {
        return swahili
            ? 'Shule hii ni ya Ordinary Level (O-Level) na Advanced Level (A-Level). Hivyo ni shule ya elimu ya sekondari inayotoa ngazi zote mbili.'
            : 'This school is an Ordinary Level (O-Level) and Advanced Level (A-Level) school. It offers both secondary education levels.';
    }

    if (/motto|kauli mbiu|tagline|slogan/i.test(lower)) {
        return swahili
            ? 'Kauli mbiu ya Tumaini Senior High School ni: “Together We Excel” (Tunaexcel pamoja).'
            : 'The motto of Tumaini Senior High School is: “Together We Excel.”';
    }

    if (/contact|mawasiliano|simu|phone|namba|whatsapp|wasiliana/i.test(lower)) {
        return swahili
            ? `Kwa mawasiliano ya shule, tumia WhatsApp: ${whatsappNumber}\n\nFungua moja kwa moja: ${whatsappUrl}`
            : `For school contact, use WhatsApp: ${whatsappNumber}\n\nOpen WhatsApp directly: ${whatsappUrl}`;
    }

    if (/address|location|located|mahali|ipo wapi|anuani|mkoa|wilaya|kijiji|slp/i.test(lower)) {
        return swahili
            ? 'Tumaini Senior High School inapatikana Mkoa wa Arusha, Wilaya ya Monduli, Kijiji cha Makuyuni. S.L.P 312.'
            : 'Tumaini Senior High School is located in Arusha Region, Monduli District, Makuyuni Village. P.O. Box 312.';
    }

    if (/name|jina|what is.*school|shule gani|school called/i.test(lower)) {
        return swahili
            ? 'Jina rasmi ni TUMAINI SENIOR HIGH SCHOOL. TSSS ni jina linalotumika pia kumaanisha Tumaini Senior Secondary School.'
            : 'The official name is TUMAINI SENIOR HIGH SCHOOL. TSSS is also used for Tumaini Senior Secondary School.';
    }

    if (/history|started|founded|began|graduates|students|combination|historia|ilianzishwa|ilianza|wahitimu|wanafunzi|mchanganyiko/i.test(lower)) {
        return swahili
            ? 'Historia ya shule: Tumaini Senior Secondary School (TSSS) ilianzishwa mwaka 2016 ikiwa na wanafunzi 48 tu. Kwa sasa ina zaidi ya wanafunzi 300 na zaidi ya wahitimu 160. Mwaka 2020, TSSS ilizaa Tumaini Senior High School yenye combinations 9.'
            : 'Tumaini Senior Secondary School (TSSS) started back in 2016. The school started with only 48 students, but now has over 300 students and over 160 graduates. In 2020, Tumaini Senior Secondary School gave birth to Tumaini Senior High School with 9 combinations.';
    }

    if (/admission|application|join|fees|fee|school fee|kujiunga|maombi|ada|form one|kidato cha kwanza/i.test(lower)) {
        return swahili
            ? `Kwa taarifa za kujiunga, ada au maombi, wasiliana moja kwa moja na shule kupitia WhatsApp ${whatsappNumber}. Taarifa hizo hazijawekwa kwenye mfumo huu kwa sasa.\n\n${whatsappUrl}`
            : `For admissions, fees, or applications, contact the school directly on WhatsApp ${whatsappNumber}. Those details are not stored in this assistant yet.\n\n${whatsappUrl}`;
    }

    if (/about|information|taarifa|kuhusu|school profile|historia/i.test(lower)) {
        return getTumainiSchoolInfoReply(message);
    }

    if (/(combination|combinations|advanced|science.*stem|arts.*humanities|pcm|pgm|pcb|hgl|hgk|hge|hkl)/i.test(lower)) {
        return getAdvancedCombinationsReply(message) || (swahili
            ? 'Shule ina combinations mbalimbali za Advanced Level, ikiwemo PCM, PGM, PCB, HGL, HGK, HGE na HKL.'
            : 'The school offers multiple Advanced Level combinations such as PCM, PGM, PCB, HGL, HGK, HGE and HKL.');
    }

    return swahili
        ? `Tumaini Senior High School ni shule iliyosajiliwa NECTA kwa centre number S5493. Ipo Mkoa wa Arusha, Wilaya ya Monduli, Kijiji cha Makuyuni, S.L.P 312. Kauli mbiu ya shule ni “Together We Excel.”\n\nNaweza kukusaidia kuhusu matokeo ya NECTA, picha za shule, eneo, mawasiliano, motto na mitandao ya shule.`
        : `Tumaini Senior High School is listed by NECTA under centre number S5493. It is located in Arusha Region, Monduli District, Makuyuni Village, P.O. Box 312. The school motto is “Together We Excel.”\n\nI can help with NECTA results, school photos, location, contact details, the motto, and school social profiles.`;
}

function getSchoolLocationPanelHtml() {
    return `
        <div class="location-panel chat-location-panel" aria-label="School location map">
            <div class="location-panel__header">
                <span class="location-badge"><i class="fa-solid fa-location-dot"></i> Location</span>
                <span class="location-text">Tumaini Senior High School</span>
            </div>
            <p>Arusha Region, Monduli District, Makuyuni Village</p>
            <iframe
                title="Tumaini Senior High School location"
                src="https://www.google.com/maps?q=Tumaini+Senior+High+School+Makuyuni+Monduli+Tanzania&amp;output=embed"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                allowfullscreen>
            </iframe>
            <a href="https://maps.app.goo.gl/DMhw9Y3KsRisWRQ99" target="_blank" rel="noopener noreferrer">
                <i class="fa-solid fa-map-location-dot"></i> Open full map
            </a>
        </div>
    `;
}

function isSchoolLocationQuestion(message) {
    const lower = String(message || '').toLowerCase();
    return /where is.*(tumaini|school)|school location|school address|where.*shule|shule.*wapi|ipo wapi.*shule|location ya shule|school.*located|address of the school|where is the school|wapi.*shule|ilipo.*shule|shule iko wapi/i.test(lower);
}

function getBotReply(message) {
    const memoryFacts = addPersistentMemoryFact(message);
    hydratePersistentMemoryFromHistory();

    const lower = message.toLowerCase();
    const swahili = wantsSwahili(message);
    const context = getConversationContext();
    const memoryReply = getMemoryReply(message, swahili);
    const followUpReply = getFollowUpContinuationReply(message, swahili);
    const generalReply = getHumanLikeConversationReply(message, swahili);
    const mathReply = solveSimpleMath(message);
    const attachedReply = getAttachedFileReply(message, false);
    const oLevelSubjectsReply = getOLevelSubjectsReply(message);

    if (memoryReply) return memoryReply;
    if (oLevelSubjectsReply) return oLevelSubjectsReply;
    if (followUpReply) return followUpReply;
    if (generalReply) return generalReply;
    if (mathReply) return swahili ? mathReply.replace('Jibu ni', 'Jibu ni') : mathReply.replace('Jibu ni', 'The answer is');

    const schoolCombinationReply = getSchoolCombinationReply(message);
    if (schoolCombinationReply) return schoolCombinationReply;

    const scienceLabCountReply = getScienceLabCountReply(message, swahili);
    if (scienceLabCountReply) return scienceLabCountReply;

    if (isSwahili(message)) return getSwahiliReply(message);

    if (attachedReply) return attachedReply;

    const schoolReply = getTumainiSchoolReply(message, swahili);
    if (schoolReply) return schoolReply;

    const lessonReply = getLessonReply(message, false, context);
    if (lessonReply) return lessonReply;

    const multilingualReply = getMultilingualReply(message);
    if (multilingualReply) return multilingualReply;

    if (deepThinkEnabled) {
        const topic = message.replace(/^(please|can you|help me)\s+/i, '').trim();
        const deepSteps = [
            `Goal: clarify what “${topic}” is asking.`,
            'Key idea: identify the main concept before applying it.',
            'Method: explain the concept, work through an example, then check the result.',
            'Next step: tell me your class level or share the exact exercise for a tailored solution.'
        ];
        return `DeepThink analysis\n\n${formatList(deepSteps)}`;
    }

    if (searchEnabled && (lower.includes('search') || lower.includes('find'))) {
        return 'Search mode is active. I can help you turn that request into useful keywords and reliable research questions.';
    }

    if (lower.includes('hello') || lower.includes('hi')) {
        const greetings = [
            'Hello! I can help you with lessons, projects, research, and study planning.',
            'Hi! I can break down schoolwork, explain concepts, and help you build a project plan.',
            'Hey there! Ask me anything about classwork, revision, or school ideas.'
        ];
        return getRandomItem(greetings);
    }

    if (lower.includes('school name') || lower.includes('name of the school') || lower.includes('what is the school called')) {
        return 'The official school name is TUMAINI SENIOR HIGH SCHOOL.';
    }

    if (/(long story|story ndefu|stori ndefu|story ya muda mrefu|muda mrefu|long narrative|narrative ya muda mrefu|long story about|story long|ndefu)/i.test(lower)) {
        return getLongStoryReply(message);
    }

    if (/(story|stori|narrative|tell me a story|tell me a short story|once upon a time|tale|storytelling|make a story|create a story|piga story|kupiga story|kuandika story|story ya|stori ya|ninafanya story|can we tell a story)/i.test(lower)) {
        return getStoryReply(message);
    }

    if (isLiveWebSearchRequest(message)) {
        return 'I can run a live web search for that topic. Please send the exact question and I will gather the latest relevant answer.';
    }

    if (isSchoolLocationQuestion(message)) {
        return getSchoolLocationPanelHtml();
    }

    if (lower.includes('tsss')) {
        return 'TSSS means Tumaini Senior Secondary School. The current official school name is TUMAINI SENIOR HIGH SCHOOL.';
    }

    const requestedSocialProfileEnglish = getRequestedSocialProfile(message);
    if (requestedSocialProfileEnglish) {
        return `You can follow Tumaini Schools TZ on ${requestedSocialProfileEnglish.name}:\n\n${requestedSocialProfileEnglish.url}`;
    }

    if (lower.includes('instagram') || lower.includes('tiktok') || lower.includes('facebook') || lower.includes('social media') || lower.includes('socials') || lower.includes('videos')) {
        return `You can follow Tumaini Schools TZ on social media:\n\nInstagram: ${instagramUrl}\nTikTok: ${tiktokUrl}\nFacebook: ${facebookUrl}\nWhatsApp: ${whatsappNumber} (${whatsappUrl})\nYouTube: ${youtubeUrl}\nSchool video: ${schoolVideoUrl}`;
    }

    const resultIntent = getResultIntent(message);
    const asksForResults = resultIntent.asksForResults || lower.includes('necta') || lower.includes('matokeo') || lower.includes('results') || lower.includes('exam results') || lower.includes('mwaka') || lower.includes('year') || lower.includes('miaka yote') || lower.includes('kila mwaka') || lower.includes('all years') || lower.includes('every year');
    if (asksForResults) {
        if (resultIntent.asksForAllYears) {
            return getTumainiYearLinksReply(message);
        }
        if (resultIntent.asksAboutSchool || lower.includes('tumaini') || lower.includes('s5493') || lower.includes('school results') || resultIntent.requestedYear) {
            return getTumainiResultsReply(message);
        }
        return `I can help you check NECTA examination results. Open the official NECTA website: ${nectaUrl} and prepare the examination type, year, and candidate index number.`;
    }

    if (lower.includes('tumaini senior') || lower.includes('about the school') || lower.includes('school information') || lower.includes('kuhusu shule') || lower.includes('taarifa za shule')) {
        return getTumainiSchoolInfoReply(message);
    }

    if (lower.includes('math') || lower.includes('algebra')) {
        return 'I would be happy to help you with mathematics. Send me your question, and I will provide a clear step-by-step explanation.';
    }

    if (lower.includes('study plan') || lower.includes('revision plan') || lower.includes('timetable') || lower.includes('how should i study')) {
        return getStudyPlanReply(message, false);
    }

    if (lower.includes('science') || lower.includes('biology')) {
        return 'For science, we can discuss living organisms, biological processes, or scientific experiments.';
    }

    if (lower.includes('project') || lower.includes('assignment')) {
        return 'A good approach is to start with the project goal, then plan the steps, sources, and expected results.';
    }

    if (lower.includes('ai') || lower.includes('artificial')) {
        return 'AI is technology that enables computers to recognize patterns, learn, and perform tasks using data.';
    }

    if (lower.includes('school')) {
        const schoolResponses = [
            'Tumaini Schools can use AI to support students with lessons, research, revision, and digital projects.',
            'At school, AI can help with understanding topics faster, improving study habits, and making projects easier to organize.',
            'A strong school AI assistant should explain concepts clearly, suggest study steps, and turn ideas into structured work.'
        ];
        return getRandomItem(schoolResponses);
    }

    const fallbackIdeas = [
        'I can help you explain a topic, turn a rough idea into a project, or create a study plan.',
        'Try asking me to simplify a lesson, make revision notes, or help with a school project outline.',
        'I work best when you tell me the subject, your level, and the exact difficulty you need help with.'
    ];
    return getRandomItem(fallbackIdeas);
}

function addEmojiToReply(reply, originalMessage = '') {
    const text = String(reply || '');
    const message = String(originalMessage || '').toLowerCase();
    const emojiPattern = /[\u{1F300}-\u{1FAFF}]|\uFE0F/gmu;
    if (emojiPattern.test(text)) return text;

    const emojiMap = [
        { match: /(hello|hi|habari|salut|greetings)/i, emoji: '😊' },
        { match: /(study|lesson|learn|school|class|exam|revision|subject|masomo|somo|darasa)/i, emoji: '📚' },
        { match: /(project|mradi|assignment|research|task|idea|brainstorm|proposal)/i, emoji: '🚀' },
        { match: /(math|mathematics|hisabati|algebra|science|sayansi|biology)/i, emoji: '🧠' },
        { match: /(results|matokeo|necta|score|grade|marks)/i, emoji: '📊' },
        { match: /(thanks|thank you|asante|shukrani)/i, emoji: '🙏' },
        { match: /(good|great|awesome|nice|excellent|nzuri|vizuri)/i, emoji: '✨' },
        { match: /(image|picture|photo|picha|visual)/i, emoji: '🖼️' },
        { match: /(social|instagram|tiktok|video|media)/i, emoji: '📲' }
    ];

    const chosen = emojiMap.find(({ match }) => match.test(message) || match.test(text));
    const emoji = chosen?.emoji || '✨';
    return `${text}${text.trim().endsWith(['.', '!', '?']) ? '' : ''} ${emoji}`.trim();
}

function shouldSearchUnknownQuestion(message, reply) {
    const question = String(message || '').trim();
    const answer = String(reply || '').trim().toLowerCase();
    if (!question || !answer || isLiveWebSearchRequest(question)) return false;
    if (!/[?]|^(who|what|where|when|why|how|which|can|is|are|did|does|nani|nini|wapi|lini|kwanini|vipi|je)\b/i.test(question)) return false;
    if (/\b(math|calculate|solve|hesabu|hisabati|equation|algebra)\b/i.test(question) && /\d/.test(question)) return false;

    return /(?:i can help you explain|try asking me to|i work best when|i can help you with lessons|i understand that you are asking|to give a precise answer|tell me your level|i do not have|i don't have|not stored in this assistant|not available in this system|i cannot answer|i can't answer|siwezi kujibu|sijui|haipo kwenye mfumo|haijawekwa kwenye mfumo|taja kiwango chako)/i.test(answer);
}

async function getPythonReply(message, history = [], imageContext = null) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), backendTimeoutMs);
    const requestedSearch = /\b(search|research|find sources|latest|tafuta|utafiti|vyanzo)\b/i.test(message);
    const mode = deepThinkEnabled ? 'deepThink' : searchEnabled && requestedSearch ? 'search' : '';
    try {
        const payload = {
            message,
            history,
            mode,
            language: wantsSwahili(message) ? 'swahili' : 'english',
            education_level: isOLevelAcademicQuestion(message) ? 'O-Level' : '',
            file_context: attachedTextContext.slice(0, 30000),
            ...(imageContext ? {
                image_name: imageContext.name || '',
                image_size: imageContext.size || 0
            } : {})
        };

        const response = await fetch(`${pythonBackendUrl}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`);
        }

        const data = await response.json();
        if (data && typeof data.reply === 'string' && data.reply.trim()) {
            return data.reply;
        }

        return getBotReply(message);
    } catch (error) {
        console.warn('Python backend unavailable, using local fallback:', error);
        return getBotReply(message);
    } finally {
        window.clearTimeout(timeoutId);
    }
}

function handlePromptChipClick(event) {
    const chip = event.currentTarget;
    const prompt = chip.dataset.prompt;
    if (!prompt) return;
    chatInput.value = prompt;
    chatInput.focus();
    sendMessage();
}

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message || thinkingMessage) return;

    sendBtn.classList.remove('sending');
    void sendBtn.offsetWidth;
    sendBtn.classList.add('sending');
    window.setTimeout(() => sendBtn.classList.remove('sending'), 350);

    lastUserMessage = message;
    addMessage(message, 'user');
    chatInput.value = '';
    chatInput.style.height = 'auto';
    showThinking();

    await new Promise((resolve) => window.setTimeout(resolve, 650));
    try {
        if (isImageQuestion(message)) {
            const query = getImageSearchQuery(message);
            addImageSearchResults(query);
            return;
        }
        if (isSocialQuestion(message)) {
            const requestedPlatform = getRequestedSocialProfile(message)?.name || null;
            addSocialLinksMessage(wantsSwahili(message), requestedPlatform);
            return;
        }

        const oLevelSubjectsReply = getOLevelSubjectsReply(message);
        if (oLevelSubjectsReply) {
            addMessage(oLevelSubjectsReply, 'assistant');
            if (getSettings().autoSpeak) speakText(oLevelSubjectsReply);
            return;
        }

        const liveSearchTopic = isLiveSearchFollowUp(message) ? getLastLiveSearchQuestion() : '';
        if (liveSearchTopic) {
            const detailedSearch = await fetchLiveWebSearchReply(`${liveSearchTopic} detailed explanation and more information`);
            if (detailedSearch) {
                addLiveWebSearchCard(detailedSearch);
                if (getSettings().autoSpeak) speakText(detailedSearch.answer);
                return;
            }
        }

        const history = [...chatThread.querySelectorAll('.message')]
            .map((messageNode) => ({
                role: messageNode.classList.contains('user') ? 'user' : 'assistant',
                text: messageNode.querySelector('.message-bubble')?.textContent?.trim() || ''
            }))
            .filter((entry) => entry.text);

        if (isSchoolLocationQuestion(message)) {
            addMessage(getSchoolLocationPanelHtml(), 'assistant', { renderHtml: true });
            if (getSettings().autoSpeak) speakText('Tumaini Senior High School is located in Arusha Region, Monduli District, Makuyuni Village.');
            return;
        }

        if (isSchoolLeadershipQuestion(message)) {
            const leadershipReply = getSchoolLeadershipReply(message);
            addMessage(leadershipReply, 'assistant');
            if (getSettings().autoSpeak) speakText(leadershipReply);
            return;
        }

        const laboratoryReply = getScienceLabCountReply(message, wantsSwahili(message));
        if (laboratoryReply) {
            addMessage(laboratoryReply, 'assistant');
            if (getSettings().autoSpeak) speakText(laboratoryReply);
            return;
        }

        if (isTumainiSchoolInformationRequest(message) && !/\b(latest|recent|news|today|sasa|leo|live|online|mtandaoni|mtandao)\b/i.test(message)) {
            const schoolReply = getTumainiSchoolInfoReply(message);
            addMessage(schoolReply, 'assistant');
            if (getSettings().autoSpeak) speakText(schoolReply);
            return;
        }

        if (isLiveWebSearchRequest(message)) {
            const webReply = await fetchLiveWebSearchReply(message);
            if (webReply) {
                addLiveWebSearchCard(webReply);
                if (getSettings().autoSpeak) speakText(webReply.answer);
                return;
            }
            addMessage(wantsSwahili(message)
                ? 'Samahani, sikuweza kufikia vyanzo vya moja kwa moja kwa sasa. Angalia internet kisha ujaribu tena.'
                : 'Sorry, I could not reach the live web sources right now. Check your connection and try again.', 'assistant');
            return;
        }

        const replyPromise = isSchoolResultsQuestion(message)
            ? getResultReplyForMessage(message)
            : getPythonReply(message, history, attachedFileName ? { name: attachedFileName, size: attachedTextContext.length } : null);
        let reply = await replyPromise;
        if (shouldSearchUnknownQuestion(message, reply)) {
            const webReply = await fetchLiveWebSearchReply(message);
            if (webReply) {
                addLiveWebSearchCard(webReply);
                if (getSettings().autoSpeak) speakText(webReply.answer);
                return;
            }
        }
        const finalReply = addEmojiToReply(reply, message);
        addMessage(finalReply, 'assistant');
        if (getSettings().autoSpeak) speakText(finalReply);
    } catch (error) {
        console.warn('Reply generation failed:', error);
        addMessage(wantsSwahili(message)
            ? 'Samahani, kulikuwa na tatizo la kupata jibu. Jaribu tena au tuma swali kwa ufupi zaidi.'
            : 'Sorry, I could not generate a reply. Please try again or send a shorter question.', 'assistant');
    } finally {
        hideThinking();
    }
}

function openFilePicker() {
    fileInput.click();
}

function handleFileSelection() {
    const files = [...fileInput.files];
    if (!files.length) return;

    files.forEach((file) => {
        void handleSingleFile(file);
    });
    fileInput.value = '';
}

function setupDragAndDrop() {
    if (!inputBoxWrapper || !uploadDropzone) return;

    const showDropzone = (event) => {
        if (!event.dataTransfer || !event.dataTransfer.types || !Array.from(event.dataTransfer.types).includes('Files')) return;
        event.preventDefault();
        event.stopPropagation();
        inputBoxWrapper.classList.add('drag-active');
        uploadDropzone.classList.add('visible');
    };

    const hideDropzone = (event) => {
        event.preventDefault();
        event.stopPropagation();
        inputBoxWrapper.classList.remove('drag-active');
        uploadDropzone.classList.remove('visible');
    };

    ['dragenter', 'dragover'].forEach((eventName) => {
        inputBoxWrapper.addEventListener(eventName, showDropzone);
    });

    ['dragleave', 'drop'].forEach((eventName) => {
        inputBoxWrapper.addEventListener(eventName, hideDropzone);
    });

    inputBoxWrapper.addEventListener('drop', (event) => {
        const files = [...(event.dataTransfer?.files || [])];
        if (!files.length) return;
        fileInput.files = event.dataTransfer.files;
        handleFileSelection();
    });
}

function describeImageFile(file) {
    const name = file.name.toLowerCase();
    if (name.includes('lab') || name.includes('science') || name.includes('experiment')) {
        return 'This image looks like a science lab or experiment setup.';
    }
    if (name.includes('class') || name.includes('school') || name.includes('campus')) {
        return 'This image appears to be a school, classroom, or campus scene.';
    }
    if (name.includes('sport') || name.includes('basket') || name.includes('football')) {
        return 'This image looks like a sports activity or school event.';
    }
    if (name.includes('portrait') || name.includes('person') || name.includes('student')) {
        return 'This image looks like a portrait or person-focused photo.';
    }
    return 'This uploaded image looks like a general photo that can be used for analysis, description, or project context.';
}

async function readPlainTextFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || '').trim());
        reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
        reader.readAsText(file);
    });
}

async function extractPdfText(file) {
    if (typeof pdfjsLib === 'undefined') {
        throw new Error('PDF reader library is unavailable.');
    }

    if (typeof pdfjsLib.GlobalWorkerOptions !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.js';
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const text = textContent.items
            .map((item) => ('str' in item ? item.str : ''))
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

        if (text) {
            pages.push(text);
        }
    }

    return pages.join('\n\n').trim();
}

async function extractDocxText(file) {
    if (typeof mammoth === 'undefined') {
        throw new Error('DOCX reader library is unavailable.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return String(result?.value || '').trim();
}

async function readImageWithOCR(file) {
    if (typeof Tesseract === 'undefined') {
        throw new Error('OCR library is unavailable.');
    }

    const result = await Tesseract.recognize(file, 'eng+swa', {
        logger: () => undefined
    });

    const text = String(result?.data?.text || '').trim();
    if (!text) {
        throw new Error('No readable text found in the image.');
    }

    return text;
}

async function readAttachedDocument(file) {
    const fileName = file.name.toLowerCase();

    if (/\.pdf$/i.test(fileName)) {
        return extractPdfText(file);
    }

    if (/\.docx?$/i.test(fileName)) {
        return extractDocxText(file);
    }

    const textLikeFile = file.type.startsWith('text/') || /\.(txt|md|csv|json|html|htm|xml|rtf)$/i.test(fileName);
    if (textLikeFile) {
        return readPlainTextFile(file);
    }

    if (file.type.startsWith('image/')) {
        return readImageWithOCR(file);
    }

    return null;
}

function buildAutoSummaryPrompt(fileName, content) {
    const lowerName = String(fileName || '').toLowerCase();
    const isCsv = lowerName.endsWith('.csv');
    const isImage = lowerName.match(/\.(png|jpg|jpeg|webp|bmp|gif)$/i);
    const basePrompt = isCsv
        ? 'Summarize this CSV file in a simple, school-friendly way. Highlight the main columns, the most important values, and the overall pattern or trend in the data. Return the answer in 3 parts: 1) Main idea, 2) Key data points, 3) Short conclusion.'
        : isImage
            ? 'Summarize this image in a simple, school-friendly way. Explain the main subject, important details, and the likely meaning of the image. Return the answer in 3 parts: 1) Main idea, 2) Important details, 3) Short conclusion.'
            : 'Summarize this attached document in a simple, school-friendly way. Highlight the key idea, main points, and the overall meaning of the document. Return the answer in 3 parts: 1) Main idea, 2) Key points, 3) Short conclusion.';

    const contentPreview = String(content || '').trim();
    if (!contentPreview) {
        return `${basePrompt} Keep the answer short but useful.`;
    }

    return `${basePrompt} Use the content below as the source.\n\n${contentPreview.slice(0, 4000)}`;
}

async function summarizeAttachedFile(file, content) {
    const summaryPrompt = buildAutoSummaryPrompt(file.name, content);
    const history = [...chatThread.querySelectorAll('.message')]
        .map((messageNode) => ({
            role: messageNode.classList.contains('user') ? 'user' : 'assistant',
            text: messageNode.querySelector('.message-bubble')?.textContent?.trim() || ''
        }))
        .filter((entry) => entry.text);

    const summary = await getPythonReply(summaryPrompt, history, attachedFileName ? { name: attachedFileName, size: attachedTextContext.length } : null);
    addMessage(summary, 'assistant');
}

async function handleSingleFile(file) {
    heroPanel.classList.add('hidden');
    aiShowcase.style.display = 'none';

    const previewUrl = file.type.startsWith('image/') ? await createImagePreview(file) : '';
    const duplicateIndex = activeAttachments.findIndex((item) => item.name === file.name);
    if (duplicateIndex === -1) {
        activeAttachments.push({ name: file.name, previewUrl });
    } else {
        activeAttachments[duplicateIndex].previewUrl = previewUrl || activeAttachments[duplicateIndex].previewUrl;
    }
    attachedFileName = activeAttachments.map((item) => item.name).join(', ');
    renderAttachmentPreview();
    chatInput.focus();

    if (file.type.startsWith('image/')) {
        const imageUrl = URL.createObjectURL(file);
        const imageDescription = describeImageFile(file);
        addImageMessage(imageUrl, file.name, `Attached image: ${file.name}`);

        try {
            const ocrText = await readImageWithOCR(file);
            const attachmentText = `FILE: ${file.name}\n\n${ocrText}`;
            const fileIndex = activeAttachments.findIndex((item) => item.name === file.name);
            if (fileIndex >= 0) {
                activeAttachments[fileIndex].content = attachmentText;
            }
            attachedTextContext = activeAttachments
                .map((item) => item.content || '')
                .filter(Boolean)
                .join('\n\n--- FILE ---\n\n');
            saveAttachedContext();
            addMessage(`Attached ${file.name}. I can summarize the text, explain it in simpler language, or turn it into study notes when you ask.`, 'assistant');
            await summarizeAttachedFile(file, attachmentText);
        } catch (error) {
            console.warn('OCR failed:', error);
            addMessage(`Image understanding: ${imageDescription} I can use this image to describe the scene, connect it to a lesson, or help you build a related project idea.`, 'assistant');
        }

        setTimeout(() => URL.revokeObjectURL(imageUrl), 60000);
        return;
    }

    try {
        const content = await readAttachedDocument(file);
        if (!content || !content.trim()) {
            addMessage(`${file.name} is empty or could not be read. Add some text and attach it again.`, 'assistant');
            return;
        }

        const attachmentText = `FILE: ${file.name}\n\n${content}`;
        const fileIndex = activeAttachments.findIndex((item) => item.name === file.name);
        if (fileIndex >= 0) {
            activeAttachments[fileIndex].content = attachmentText;
        }
        attachedTextContext = activeAttachments
            .map((item) => item.content || '')
            .filter(Boolean)
            .join('\n\n--- FILE ---\n\n');
        attachedFileName = activeAttachments.map((item) => item.name).join(', ');
        saveAttachedContext();
        addMessage(`Attached ${file.name}. I can summarize it, explain a section, create questions, or turn it into revision notes for you.`, 'assistant');
        await summarizeAttachedFile(file, attachmentText);
    } catch (error) {
        console.warn('Document parsing failed:', error);
        addMessage(`I received ${file.name}, but this browser cannot extract readable text from that format yet. Try converting it to PDF, DOCX, TXT, or paste the content directly into the chat.`, 'assistant');
    }
}

function toggleMode(button, mode) {
    const isActive = button.classList.toggle('active');
    if (mode === 'deepThink') deepThinkEnabled = isActive;
    if (mode === 'search') searchEnabled = isActive;
}

function renderSchoolImageGallery() {
    chatThread.classList.add('view-switching');
    chatThread.innerHTML = '';
    heroPanel.classList.add('hidden');
    aiShowcase.style.display = 'none';

    const gallery = document.createElement('div');
    gallery.className = 'school-gallery';

    const header = document.createElement('div');
    header.className = 'school-gallery-header';
    header.innerHTML = `
        <div>
            <p class="school-gallery-kicker">TUMAINI SENIOR HIGH SCHOOL</p>
            <p class="school-gallery-motto"><i class="fa-solid fa-star"></i> Together We Excel</p>
            <h2>Inspiring minds.<br><em>Shaping futures.</em></h2>
            <p class="school-gallery-intro-copy">Explore the people, places, lessons, and activities that make our school community special.</p>
        </div>
        <div class="school-gallery-hero-actions">
            <a class="school-gallery-link school-gallery-primary-link" href="#school-photo-sections"><i class="fa-solid fa-images"></i> Explore photos</a>
            <a class="school-gallery-link" href="${schoolVideoUrl}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-play"></i> Watch video</a>
            <a class="school-gallery-link" href="${instagramUrl}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-instagram"></i> Official updates</a>
        </div>
    `;
    gallery.appendChild(header);

    const highlights = document.createElement('div');
    highlights.className = 'school-gallery-highlights';
    highlights.innerHTML = `
        <div><i class="fa-solid fa-graduation-cap"></i><strong>Academic growth</strong><span>Learning beyond the classroom</span></div>
        <div><i class="fa-solid fa-flask"></i><strong>Practical learning</strong><span>Science and computer labs</span></div>
        <div><i class="fa-solid fa-people-group"></i><strong>Strong community</strong><span>Students learning together</span></div>
        <div><i class="fa-solid fa-trophy"></i><strong>Every achievement</strong><span>Celebrating school life</span></div>
    `;
    gallery.appendChild(highlights);

    const galleryAbout = document.createElement('section');
    galleryAbout.className = 'school-gallery-about';
    galleryAbout.innerHTML = `
        <div class="school-gallery-about-copy">
            <p class="school-gallery-kicker">ABOUT OUR SCHOOL</p>
            <h3>A place to learn,<br><em>grow, and belong.</em></h3>
            <p>Every image tells a story of curiosity, effort, friendship, and the shared journey of TSSS students and teachers.</p>
            <a class="school-gallery-text-link" href="#school-photo-sections">Discover the gallery <i class="fa-solid fa-arrow-right"></i></a>
        </div>
        <div class="school-gallery-about-stats">
            <div><strong>04</strong><span>Photo categories</span></div>
            <div><strong>TSSS</strong><span>School community</span></div>
            <div><strong>∞</strong><span>Memories shared</span></div>
        </div>
    `;
    gallery.appendChild(galleryAbout);

    const nav = document.createElement('div');
    nav.className = 'school-gallery-nav';
    const categories = ['All', 'Campus', 'Events', 'Labs', 'Sports', 'Academics', 'Culture'];
    categories.forEach((category) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `school-gallery-tab${category === 'All' ? ' active' : ''}`;
        button.textContent = category;
        button.addEventListener('click', () => {
            document.querySelectorAll('.school-gallery-tab').forEach((tab) => tab.classList.toggle('active', tab === button));
            renderCategorySection(button.textContent);
        });
        nav.appendChild(button);
    });
    gallery.appendChild(nav);

    const sectionWrap = document.createElement('div');
    sectionWrap.id = 'school-photo-sections';
    sectionWrap.className = 'school-gallery-sections';
    gallery.appendChild(sectionWrap);

    const fallbackImages = [
        { filename: 'logo/TUMAINI SCHOOLS AI LOGO.png', caption: 'Tumaini Senior High school official logo', category: 'Campus' },
        { filename: 'TSSS PHOTO/ENV.webp', caption: 'School environment and digital learning spirit', category: 'Campus' },
        { filename: 'TSSS PHOTO/ENV.webp', caption: 'Science lab and innovation work', category: 'Labs' },
        { filename: 'TSSS PHOTO/BASKET.jpg', caption: 'Sports day and student energy', category: 'Sports' },
        { filename: 'logo/TUMAINI SCHOOLS AI LOGO.png', caption: 'Academic excellence and class focus', category: 'Academics' },
        { filename: 'TSSS PHOTO/BASKET.jpg', caption: 'School events and community activities', category: 'Events' }
    ];

    const fallbackImage = (item) => {
        const card = document.createElement('article');
        card.className = 'school-gallery-card';
        card.innerHTML = `
            <img src="${item.filename}" alt="${item.caption}" loading="lazy">
            <div class="school-gallery-body">
                <span>${item.category || 'School photo'}</span>
                <h3>${item.caption || 'Tumaini school photo'}</h3>
                <div class="school-gallery-actions">
                    <a href="${instagramUrl}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-instagram"></i> Instagram</a>
                    <a href="${tiktokUrl}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-tiktok"></i> TikTok</a>
                    <a href="${facebookUrl}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-facebook-f"></i> Facebook</a>
                    <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
                    <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-youtube"></i> YouTube</a>
                    <a href="${schoolVideoUrl}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-play"></i> Video</a>
                </div>
            </div>
        `;
        return card;
    };

    const buildSections = (items) => {
        const grouped = new Map();
        const validItems = Array.isArray(items) && items.length ? items : fallbackImages;

        validItems.forEach((item) => {
            const categoryName = item.category || 'Campus';
            if (!grouped.has(categoryName)) grouped.set(categoryName, []);
            grouped.get(categoryName).push({
                filename: item.filename || 'logo/TUMAINI SCHOOLS AI LOGO.png',
                caption: item.caption || `${categoryName} photo`,
                category: categoryName
            });
        });

        const orderedGroups = ['Campus', 'Events', 'Labs', 'Sports', 'Academics', 'Culture'];
        const groups = orderedGroups
            .filter((name) => grouped.has(name))
            .map((name) => ({ name, items: grouped.get(name) }));

        if (!groups.length) {
            groups.push({ name: 'Campus', items: fallbackImages.filter((item) => item.category === 'Campus') });
        }

        return groups;
    };

    const renderCategorySection = (selectedCategory = 'All') => {
        sectionWrap.innerHTML = '';
        const items = Array.isArray(window.__tumainiGalleryItems) ? window.__tumainiGalleryItems : fallbackImages;
        const groups = buildSections(items);

        const categoriesToRender = selectedCategory === 'All' ? groups : groups.filter((group) => group.name === selectedCategory);

        categoriesToRender.forEach((group) => {
            const section = document.createElement('section');
            section.className = 'school-gallery-section';

            const title = document.createElement('div');
            title.className = 'school-gallery-section-title';
            title.innerHTML = `<h3>${group.name}</h3><span>${group.items.length} photos</span>`;
            section.appendChild(title);

            const grid = document.createElement('div');
            grid.className = 'school-gallery-grid';
            group.items.slice(0, 8).forEach((item) => grid.appendChild(fallbackImage(item)));
            section.appendChild(grid);
            sectionWrap.appendChild(section);
        });
    };

    fetch('tumaini-images.json')
        .then((response) => {
            if (!response.ok) throw new Error('Image catalog unavailable');
            return response.json();
        })
        .then((data) => {
            const items = Array.isArray(data?.images) ? data.images : fallbackImages;
            window.__tumainiGalleryItems = items;
            renderCategorySection('All');
        })
        .catch(() => {
            window.__tumainiGalleryItems = fallbackImages;
            renderCategorySection('All');
        });

    chatThread.appendChild(gallery);
    chatThread.scrollTop = chatThread.scrollHeight;
    window.requestAnimationFrame(() => chatThread.classList.remove('view-switching'));
}

function activateNavigation(item) {
    document.querySelectorAll('.sidebar-nav .nav-item, .sidebar-footer .nav-item').forEach((navItem) => {
        navItem.classList.remove('active');
    });
    item.classList.add('active');

    const view = item.dataset.view;
    if (view === 'Settings') {
        openSettings();
        return;
    }
    if (view === 'Scientific Calculator') {
        openCalculator();
        return;
    }
    if (view === 'Search chats') {
        chatInput.focus();
        return;
    }

    if (view === 'Images' || view === 'From all images') {
        renderSchoolImageGallery();
        return;
    }

    if (view === 'Deep Research') {
        chatInput.value = 'Help me research a school topic with reliable sources.';
        chatInput.dispatchEvent(new Event('input'));
        chatInput.focus();
        addMessage('Deep Research is ready. Describe the topic you want to investigate, and I will help you organize questions and sources.', 'assistant');
        return;
    }

    if (view === 'Library') {
        const libraryLink = libraryUrl;
        addMessage(`Opening the library website: ${libraryLink}`, 'assistant');
        window.open(libraryLink, '_blank', 'noopener,noreferrer');
        return;
    }

    if (view === 'Plugins') {
        addMessage('Plugins area is ready. Current tools include file attachments, voice input, Search mode, DeepThink, and NECTA results.', 'assistant');
        return;
    }

    addMessage(`${view} is ready. Ask me what you would like to do in this section.`, 'assistant');
}

function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        addMessage('Voice input is not supported in this browser. You can type your message instead.', 'assistant');
        return;
    }

    if (speechRecognition) speechRecognition.stop();
    speechRecognition = new SpeechRecognition();
    speechRecognition.lang = 'en-US';
    speechRecognition.interimResults = false;
    speechRecognition.maxAlternatives = 1;
    microphoneBtn.classList.add('active');
    microphoneBtn.title = 'Listening...';

    speechRecognition.addEventListener('result', (event) => {
        const transcript = event.results[0][0].transcript;
        chatInput.value = transcript;
        chatInput.focus();
    });

    speechRecognition.addEventListener('end', () => {
        microphoneBtn.classList.remove('active');
        microphoneBtn.title = 'Use microphone';
        if (chatInput.value.trim()) {
            sendMessage();
        }
    });

    speechRecognition.start();
}

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = `${Math.min(chatInput.scrollHeight, 120)}px`;
});

attachBtn.addEventListener('click', openFilePicker);
paperclipBtn.addEventListener('click', openFilePicker);
fileInput.addEventListener('change', handleFileSelection);
setupDragAndDrop();
newChatBtn.addEventListener('click', resetChat);
historySearchInput?.addEventListener('input', renderChatHistory);
clearHistoryBtn?.addEventListener('click', clearAllChatHistory);
deepThinkBtn.addEventListener('click', () => toggleMode(deepThinkBtn, 'deepThink'));
searchBtn.addEventListener('click', () => toggleMode(searchBtn, 'search'));
microphoneBtn.addEventListener('click', setupSpeechRecognition);
settingsClose.addEventListener('click', closeSettings);
settingsModal.addEventListener('click', (event) => { if (event.target === settingsModal) closeSettings(); });
calculatorClose.addEventListener('click', closeCalculator);
calculatorModal.addEventListener('click', (event) => { if (event.target === calculatorModal) closeCalculator(); });
document.querySelectorAll('.calc-btn').forEach((button) => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'clear') {
            clearCalculatorValue();
            calculatorInput.value = '';
            return;
        }
        if (action === 'delete') {
            deleteCalculatorValue();
            calculatorInput.value = calculatorValue;
            return;
        }
        if (action === 'equals') {
            evaluateCalculatorInput();
            return;
        }
        const appendedValue = button.dataset.value || '';
        appendCalculatorValue(appendedValue);
        calculatorInput.value = calculatorValue;
    });
});

calculatorEvaluateBtn.addEventListener('click', evaluateCalculatorInput);
calculatorSolveBtn.addEventListener('click', solveCalculatorInput);
calculatorStepBtn.addEventListener('click', () => {
    const directText = calculatorInput.value.trim() || calculatorValue;
    const steps = createStepByStepSolution(directText);
    calculatorValue = directText;
    calculatorInput.value = directText;
    calculatorExpression.textContent = directText;
    calculatorResult.textContent = steps;
    calculatorResult.style.whiteSpace = 'pre-line';
});
calculatorInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        const isSolve = event.shiftKey || calculatorInput.value.includes('=');
        if (isSolve) solveCalculatorInput(); else evaluateCalculatorInput();
    }
});
themeSelect.addEventListener('change', () => {
    const settings = getSettings();
    settings.theme = themeSelect.value;
    saveSettings(settings);
    applyTheme(themeSelect.value);
    settingsStatus.textContent = 'Appearance updated.';
});
reduceMotionToggle.addEventListener('change', () => {
    const settings = getSettings();
    settings.reduceMotion = reduceMotionToggle.checked;
    saveSettings(settings);
    document.body.classList.toggle('reduce-motion', reduceMotionToggle.checked);
    settingsStatus.textContent = 'Motion preference saved.';
});
autoSpeakToggle.addEventListener('change', () => {
    const settings = getSettings();
    settings.autoSpeak = autoSpeakToggle.checked;
    saveSettings(settings);
    settingsStatus.textContent = 'Voice preference saved.';
});
clearChatBtn.addEventListener('click', () => {
    if (!window.confirm('Clear all saved chat history from this browser?')) return;
    clearAllChatHistory(true);
    settingsStatus.textContent = 'Chat history cleared.';
});
resetSettingsBtn.addEventListener('click', () => {
    if (!window.confirm('Restore the default Settings?')) return;
    localStorage.removeItem(settingsStorageKey);
    loadSettings();
    settingsStatus.textContent = 'Default settings restored.';
});
changePhotoBtn.addEventListener('click', () => profilePhotoInput.click());
profilePhotoInput.addEventListener('change', () => {
    const [file] = profilePhotoInput.files;
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
        accountStatus.textContent = 'Choose an image smaller than 10 MB.';
        accountStatus.style.color = '#ffb4b4';
        return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
        const account = JSON.parse(localStorage.getItem(accountStorageKey) || 'null');
        if (!account) return;
        account.photo = reader.result;
        localStorage.setItem(accountStorageKey, JSON.stringify(account));
        updateAccountView();
        accountStatus.textContent = 'Profile picture updated.';
        accountStatus.style.color = 'var(--success)';
    });
    reader.readAsDataURL(file);
    profilePhotoInput.value = '';
});
accountBtn.addEventListener('click', openAccount);
accountClose.addEventListener('click', closeAccount);
accountModal.addEventListener('click', (event) => { if (event.target === accountModal) closeAccount(); });
passwordToggle.addEventListener('click', () => {
    const isPassword = accountPassword.type === 'password';
    accountPassword.type = isPassword ? 'text' : 'password';
    passwordToggle.innerHTML = `<i class="fa-regular fa-eye${isPassword ? '-slash' : ''}"></i>`;
    passwordToggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
});
accountPassword.addEventListener('input', () => {
    const length = accountPassword.value.length;
    const strength = length >= 12 ? 100 : length >= 8 ? 70 : length >= 6 ? 45 : length * 7;
    passwordStrengthBar.style.width = `${Math.min(strength, 100)}%`;
    passwordStrengthBar.style.background = length >= 12 ? 'var(--success)' : length >= 8 ? '#f7d774' : '#ff9e9e';
    passwordStrengthText.textContent = length >= 12 ? 'Strong password' : length >= 8 ? 'Good password' : length >= 6 ? 'Basic password' : 'Use 6 or more characters';
});
googleLoginBtn.addEventListener('click', () => {
    accountStatus.textContent = 'Google login needs a Google OAuth Client ID before it can be connected securely.';
    accountStatus.style.color = '#f7d774';
});
accountForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('accountName').value.trim();
    const email = document.getElementById('accountEmail').value.trim();
    const password = document.getElementById('accountPassword').value;
    if (!name || !email || password.length < 6) {
        accountStatus.textContent = 'Enter your name, a valid email, and a password with at least 6 characters.';
        accountStatus.style.color = '#ffb4b4';
        return;
    }
    localStorage.setItem(accountStorageKey, JSON.stringify({ name, email }));
    accountForm.reset();
    updateAccountView();
    closeAccount();
    returnToChatHome();
});
accountLogout.addEventListener('click', () => { localStorage.removeItem(accountStorageKey); updateAccountView(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !accountModal.classList.contains('hidden')) closeAccount(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !settingsModal.classList.contains('hidden')) closeSettings(); });

document.querySelectorAll('[data-view]').forEach((item) => {
    item.addEventListener('click', () => activateNavigation(item));
});

promptChipButtons.forEach((button) => {
    button.addEventListener('click', handlePromptChipClick);
});

loadChat();
loadAttachedContext();
updateAccountView();
loadSettings();

window.setTimeout(() => {
    document.getElementById('splashScreen').classList.add('hidden');
}, 2000);
