require 'fileutils'
require 'packr'

module Jake
  class Package
    
    attr_reader :name
    
    def initialize(build, name, config)
      @build, @name, @config = build, name, config
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
    
    def source
      @source ||= [header, *@config[:files].map { |path| Jake.read("#{ directory }/#{ path }") }].join("\n")
    end
    
    def minified
      @minified ||= header + "\n" + Packr.pack(source, packer_settings)
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
      File.open(path, 'wb') { |f| f.write source }
      File.open(min_path, 'wb') { |f| f.write minified }
      
      puts "  -- created #{ path }, #{ (File.size(path)/1024.0).ceil } kb"
      puts "  -- created #{ min_path }, #{ (File.size(min_path)/1024.0).ceil } kb"
    end
  end
end

