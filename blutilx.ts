import { Command } from "@cliffy/command";
import { stampedLog, sh, getPaths, writeJson, readJson } from "./utils.ts";

const paths = await getPaths();
type State = {devices?: string[][], power?: boolean};

await new Command()
    .name("blutilx")
    .version("0.1.0")
    .description("some eXtensions for blueutil")
    .globalOption("-d --debug", "Enable debug output", {default: false})
    .globalOption("-f --state-file <file>", "Set the file to save and restore state from", {
        default: paths.stateFile
    })
    .globalAction(({debug, stateFile}) => {
        const log = stampedLog("blutilx", debug);
        log.debug("using statefile:", stateFile);
        log.debug("path to blueutil:", paths.blueutil);
    })
    .command("save-state")
        .description("Save the current state of bluetooth")
        .option("-p --power", "Whether bluetooth is on", {default: false})
        .option("-c --connected-devices", "Save which devices are connected", {default: false})
        .action(saveState)
    .command("restore-state")
        .description("Restore last saved state (and remove the save file, unless `-k`)")
        .option("-p --power", "Resore power state", {default: false})
        .option("-c --connected-devices", "Restore which devices are connected", {default: false})
        .option("-k --keep-state-file", "Don't remove the state file after restoring state", {default: false})
        .action(restoreState)
    .command("show-state")
        .description("Show the state saved in the state file")
        .action(async ({debug, stateFile}) => {
            const log = stampedLog("show-state", !!debug);
            const state = await readJson(stateFile) as State;
            if (Object.hasOwn(state, "power")) {
                log(`Power: ${state.power ? "on" : "off"}`);
            } else {
                log("Power not set");
            }
            if (Object.hasOwn(state, "devices")) {
                log("Connected devices:");
                state.devices?.forEach(([id, name]) => {
                    log(`  -> ${name}${debug?` (${id})`:""}`);
                })
            } else {
                log("Devices not saved");
            }

        })
    .parse(Deno.args);



type StateOptsCommon = {
    power: boolean,
    connectedDevices: boolean,
    debug: boolean,
    stateFile: string,
};

type SaveStateOpts = StateOptsCommon;
type RestoreStateOpts = StateOptsCommon & {
    keepStateFile: boolean,
};

async function saveState({power, connectedDevices, debug, stateFile}: SaveStateOpts) {
    const log = stampedLog("blutilx-save-state", debug);

    const state: State = {};

    if (power) {
        const bt_power_str = (await sh(paths.blueutil, "--power")).stdout;
        const powerSetting = bt_power_str.trim() === "1";
        log("Saving power state: ", powerSetting)
        state.power = powerSetting;
    }
    if (connectedDevices) {
        const bt_devices_str = (await sh(paths.blueutil, "--connected")).stdout;
        const devices = [
            ...bt_devices_str.matchAll(/address: ([a-f0-9]{2}(?:-[a-f0-9]{2}){5}).*?name: "([^"]+)"/g)
        ].map(([, id, name]) => [id, name]);
        if (devices.length > 0 ) {
            log("Saving connected devices:");
            devices.forEach(([, name]) => log(`    ${name}`));
        } else {
            log("No devices connected");
        }
        state.devices = devices;
    }
    await writeJson(stateFile, state);
}
async function restoreState({power, connectedDevices, debug, keepStateFile, stateFile}: RestoreStateOpts) {
    const log = stampedLog("blutilx-restore-state", debug);

    let state: State;
    try {
        state = await readJson(stateFile) as State;
    } catch {
        log.error(`Restoring state, but ${stateFile} does not exist. Did you forget to save state?`);
        return;
    }

    if (power) {
        if (Object.hasOwn(state, "power")) {
            log("Restoring power state: ", state.power)
            await sh(paths.blueutil, "--power", state.power ? "on" : "off");
        } else {
            log("No power state saved, not restoring.");
        }
    }
    device_restoration:
    if (connectedDevices) {
        if (!power || !Object.hasOwn(state, "power")) {
            if((await sh(paths.blueutil, "--power")).stdout.trim() === "0") {
                log.error("Restoring devices without restoring power (did you forget `-p`?), and power is off. Can't do it.");
                break device_restoration;
            }
        }
        if (Object.hasOwn(state, "devices") && state.devices!.length > 0) {
            log("Connecting devices:")
            for (const [id, name] of state.devices!) {
                log(`  -> ${name}`);
                await sh(paths.blueutil, "--connect", id);
            }
        } else {
            log("No devices saved, not restoring")
        }
    }

    if (!keepStateFile) {
        log("Removing state file", stateFile);
        await Deno.remove(stateFile);
    }
}
