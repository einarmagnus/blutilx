When I close the lid of my macBook, it keeps connected to all bluetooth devices.
I find this annoying for devices that can only be connected to one host at a time, especially my speakers at home which I then can't connect to with my phone, and neither can my girlfriend.

This is some simple scripts to elaborate on https://superuser.com/a/1819754 and make my laptop automatically attempt to reconnect to the devices it was connected to when I wake it up.

If you want to use this, follow the instructions in the superuser answer and in addition to that, install [`deno`](//deno.com/).

You need to take some care with setting up your `.sleep` and `.wakeup`, they are run without much of an environment so you need to use explicit paths for everything.

my `~/.sleep` looks like this:

```bash
#!/usr/bin/env bash
# Sleepwatcher (Homebrew package) script that runs on sleep.
# See also: ~/.sleep, ~/.wakeup, ~/.sleepwatcher.log

BLUEUTIL="/usr/local/bin/blueutil"
DENO="/usr/local/bin/deno"
DENO_PERMISSIONS="--allow-run --allow-env --allow-write --allow-read"
#if you clone the repo you can use a local path here:
BLUTILX="https://raw.githubusercontent.com/einarmagnus/blutilx/refs/heads/master/blutilx.ts"

BLUEUTIL=$BLUEUTIL $DENO run $DENO_PERMISSIONS $BLUTILX save-state --power --connected-devices >> ~/.sleepwatcher.log 2>&1
$BLUEUTIL --power off

```

and my `.wakeup` looks like this:

```bash
#!/usr/bin/env bash
# Sleepwatcher (Homebrew package) script that runs on wakeup.
# See also: ~/.sleep, ~/.wakeup, ~/.sleepwatcher.log

BLUEUTIL="/usr/local/bin/blueutil"
DENO="/usr/local/bin/deno"
DENO_PERMISSIONS="--allow-run --allow-env --allow-write --allow-read"
#if you clone the repo, you can use a local path here
BLUTILX="https://raw.githubusercontent.com/einarmagnus/blutilx/refs/heads/master/blutilx.ts"

BLUEUTIL=$BLUEUTIL $DENO run $DENO_PERMISSIONS $BLUTILX restore-state --power --connected-devices >> ~/.sleepwatcher.log 2>&1

```

You'll need to copy that into the right files and update the paths to conform to your system.