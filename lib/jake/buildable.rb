require 'fileutils'
require 'packr'

module Jake
  class Buildable
    
    attr_reader :name
    
    def initialize(build, name, config)
      @build, @name = build, name
      @config = case config
      when Hash   then config
      when String then {:files => [config]}
      when Array  then {:files => config}
      end
    end
    
    def directory
      "#{ @build.source_directory }/#{ @config[:directory] }"
    end
    
    def build_path
      "#{ @build.build_directory }/#{ @name }.js"
    end
    
    def minified_build_path
      "#{ @build.build_directory }/#{ @name }-min.js"
    end
    
    def header
      @config[:header] ?
          Jake.read("#{ directory }/#{ @config[:header] }") :
          @build.header
    end
    
    def packer_settings
      {}.merge(@build.packer_settings).merge(@config[:packer] || {})
    end
    
    def write!
      puts "\nBuilding package #{@name}"
      puts "  -- directory: #{ directory }"
      puts "  -- files:     #{ @config[:files].join(', ') }"
      puts "  -- settings:  #{ packer_settings.inspect }"
      
      path, min_path = build_path, minified_build_path
      [path, min_path].each { |p| FileUtils.mkdir_p(File.dirname(p)) }
      File.open(path, 'wb') { |f| f.write(header + "\n" + source) }
      File.open(min_path, 'wb') { |f| f.write(header + "\n" + minified) }
      
      [path, min_path].each do |p|
        puts "  -- created #{p}, #{ (File.size(p)/1024.0).ceil } kb"
      end
    end
    
  end
end

