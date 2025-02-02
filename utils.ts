import * as path from "@std/path";

export async function sh(cmd: string, ...args: string[]) {
    const {stdout, stderr, code} = await (new Deno.Command(cmd, {args})).output();
    return {
        stdout: new TextDecoder().decode(stdout),
        stderr: new TextDecoder().decode(stderr),
        code
    }
}


export function stampedLog(stamp: string, debug: boolean) {
    const f = function(...args: unknown[]) {
        log(stamp, ...args);
    }
    f.debug = debug ? _log.bind(null, console.debug, stamp + " 🐛") : () => {};
    f.error = _log.bind(null, console.error, stamp + " ❌");
    return f;
}

export function log(stamp: string, ...args: unknown[]) {
    _log(console.log, stamp, ...args);
}

function _log(f: (...data: unknown[]) => void, stamp: string, ...args: unknown[]) {
    f(`[${new Date().toISOString().substring(0,19)} ${stamp}]`, ...args);
}

interface Paths {
    blueutil: string
    stateFile: string
}
let paths: Paths | undefined = undefined;
export function getPaths() {
    if (!paths) {
        const hbp = Deno.env.get("HOMEBREW_PREFIX");
        const bu = Deno.env.get("BLUEUTIL");
        const sf = Deno.env.get("BLUTILX_STATE_FILE");
        const home = Deno.env.get("HOME");
        let blueutil;

        if (bu) {
            blueutil = bu;
        } else if (hbp) {
            blueutil = path.join(hbp, "bin/blueutil");
        } else {
            blueutil = "blueutil";
        }
        const stateFile = sf ?? path.join(home ?? "", ".blutilx.state.json")
        paths = {
            stateFile,
            blueutil
        };
    }
    return paths;
}

export function writeJson(file: string, json: unknown) {
    return Deno.writeTextFile(file, JSON.stringify(json, null, 2));
}

export async function readJson(file: string) {
    return JSON.parse(await Deno.readTextFile(file));
}