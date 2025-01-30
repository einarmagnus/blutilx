When you close the lid of my macbook, it keeps connected to all bluetooth devices.
I find this annoying for devices that can only be connected to one host at a time, especially my speakers at home which I then can't connect to with my phone, and neither can my girlfriend.

This is some simple ruby code to elaborate on https://superuser.com/a/1819754 and make my laptop automatically attempt to reconnect to the devices it was connected to when I wake it up. So if you want to use this, you need `brew`, and then also `sleepwatcher` and `blueutil`.

my `~/.sleep` looks like this:

```bash
#!/usr/bin/env bash
# Sleepwatcher (Homebrew package) script that runs on sleep.
# See also: ~/.sleep, ~/.wakeup, ~/.sleepwatcher.log

RUBY=/Users/einar/.rbenv/shims/ruby
cd ~/src/bluetooth-fix
$RUBY sleep.rb >> ~/.sleepwatcher.log
```

and my `.wakeup` looks like this:

```bash
#!/usr/bin/env bash
# Sleepwatcher (Homebrew package) script that runs on wakeup.
# See also: ~/.sleep, ~/.wakeup, ~/.sleepwatcher.log

RUBY=/Users/einar/.rbenv/shims/ruby
cd ~/src/bluetooth-fix
$RUBY wakeup.rb >> ~/.sleepwatcher.log
```

You'll need to copy that into the right files and update the paths to conform to your system.