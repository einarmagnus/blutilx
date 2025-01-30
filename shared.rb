BLUEUTIL= File.join ENV["HOMEBREW_PREFIX"], "/bin/blueutil"
CONNECTED_FILE = File.join Dir.home, ".sleepwatcher.status.json"

def log *args
    puts "[#{Time.new.strftime "%Y.%m.%d, %H:%M:%S"}] #{args.map{|a|a.to_s}.join(" ")}"
end
