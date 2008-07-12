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
    
    def build_path(build_name)
      @build.layout == 'together' ?
          "#{ @build.build_directory }/#{ @name }-#{ build_name }.js" :
          "#{ @build.build_directory }/#{ build_name }/#{ @name }.js"
    end
    
    def header
      @config[:header] ?
          Jake.read("#{ directory }/#{ @config[:header] }") :
          @build.header
    end
    
    def packer_settings(build_name)
      global = @build.packer_settings(build_name)
      local  = @config[:packer]
      return false if global == false or local == false
      {}.merge(global || {}).merge(local || {})
    end
    
    def write!
      puts "\nBuilding package #{@name}"
      puts "  -- directory: #{ directory }"
      puts "  -- files:     #{ @config[:files].join(', ') }"
      
      @build.builds.each do |name, settings|
        settings = packer_settings(name)
        code = settings ? Packr.pack(source, settings) : source
        path = build_path(name)
        FileUtils.mkdir_p(File.dirname(path))
        File.open(path, 'wb') { |f| f.write( (header + "\n" + code).strip ) }
      end
    end
    
  end
end

