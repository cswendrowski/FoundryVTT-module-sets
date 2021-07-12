Hooks.once('init', async function() {
    _registerSettings();
});

Hooks.once('ready', async function() {
    if (!game.user.isGM) return;

    await _swapToCurrentMode();
    _insertSwitchToggle(currentMode);
});

const MODES = {
    NotReady: 0,
    Setup: 1,
    LiveGame: 2
}
const moduleName = "module-sets";
let currentMode = MODES.NotReady;

function _registerSettings() {
    game.settings.register(moduleName, "moduleConfiguration1", {
        name: "Setup Module Configuration Settings",
        scope: "world",
        config: false,
        default: {},
        type: Object
    });

    game.settings.register(moduleName, "moduleConfiguration2", {
        name: "Live Game Module Configuration Settings",
        scope: "world",
        config: false,
        default: {},
        type: Object
    });

    game.settings.register(moduleName, "currentMode", {
        scope: "world",
        config: false,
        default: MODES.NotReady,
        type: Number
    });
}

function _insertSwitchToggle(mode) {
    let floppedMode = mode === MODES.Setup ? MODES.LiveGame : MODES.Setup;
    let switchHtml =
        '<div class="switch-container">\n' +
        '    <h2>' + game.i18n.localize("MS.Setup") + '</h2>    \n' +
        '<label class="switch"><input type="checkbox" ' + (mode === MODES.LiveGame ? 'checked' : '') + '>\n' +
        '  <span class="slider"></span>\n' +
        '</label>\n' +
        '    <h2>' + game.i18n.localize("MS.Livegame") + '</h2>\n' +
        '</div>'

    $("#game-details").append(switchHtml);
    let executing = false;
    $(".switch").click(async () => {
        if (!executing) {
            executing = true;
            await swapMode(floppedMode);
        }
    });
}

async function _swapToCurrentMode() {
    let _currentMode = game.settings.get(moduleName, "currentMode");

    if (_currentMode == MODES.NotReady) {
        await _initializeModuleSets();
        currentMode = MODES.Setup;
        return;
    }

    currentMode = _currentMode;
}

async function swapMode(mode) {
    // Store current state before swapping
    let currentModules = _getCurrentActiveModules(MODES.NotReady);
    await game.settings.set(moduleName, "moduleConfiguration" + currentMode, currentModules);

    // Swap current mode
    currentMode = mode;
    await game.settings.set(moduleName, "currentMode", mode);

    // Swap active modules
    let updatedModuleConfig = _getCurrentActiveModules(mode);
    await game.settings.set("core", "moduleConfiguration", updatedModuleConfig);
    window.location.reload();
}

async function _initializeModuleSets() {
    let currentModules = _getCurrentActiveModules(MODES.NotReady);
    await game.settings.set(moduleName, "moduleConfiguration1", currentModules);
    await game.settings.set(moduleName, "moduleConfiguration2", currentModules);
}

function _getCurrentActiveModules(mode) {
    if (mode === MODES.NotReady) return game.settings.get("core", "moduleConfiguration");
    return game.settings.get("module-sets", "moduleConfiguration" + mode);
}