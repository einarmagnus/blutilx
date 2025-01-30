require 'json'
require_relative "shared.rb"

log "Waking up, will configure BT"

settings = JSON.load_file(CONNECTED_FILE) rescue {}

power = settings["power"] || false
devices = settings["devices"] || []

if power
    log "  turning bluetooth on"
    `#{BLUEUTIL} --power on`

    devices.map do |device, name|
        Thread.new do
            log "  connecting to #{name}..."
            `#{BLUEUTIL} --connect #{device}`
        end
    end.each &:join
else
    log "  BT was turned off, leaving it off"
end
File.unlink CONNECTED_FILE rescue nil
