require 'json'
require "time"
require_relative "shared.rb"

log "Sleeping, will turn off BT "
bt_devices_str = `#{BLUEUTIL} --connected`.force_encoding(Encoding::UTF_8)
bt_power_str = `#{BLUEUTIL} --power`.force_encoding(Encoding::UTF_8)

devices = bt_devices_str.scan(/address: ([a-f0-9]{2}(?:-[a-f0-9]{2}){5}).*?name: "([^"]+)"/)
power = bt_power_str.strip == "1"

if devices.length > 0
    log "  saving connected devices:"
    devices.each {|id, name| log "    #{name}"}
elsif !power
    log "  it's already turned off"
else
    log "  no devices connected"
end
File.open(CONNECTED_FILE, File::CREAT|File::WRONLY, 0644) do |f|
    f.write({devices:, power:}.to_json)
end

`#{BLUEUTIL} --power off`
