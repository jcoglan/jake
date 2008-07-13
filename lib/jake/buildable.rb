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
      @code = {}
    end
    
    def directory
      "#{ @build.source_directory }/#{ @config[:directory] }"
    end
    
    def build_path(build_name)
      @build.layout == 'together' ?
          "#{ @build.build_directory }/#{ @name }-#{ build_name }.js" :
          "#{ @build.build_directory }/#{ build_name }/#{ @name }.js"
    end
    
    def build_needed?(name)
      return true if @build.forced?
      path = build_path(name)
      return true unless File.file?(path)
      build_time = File.mtime(path)
      files.any? { |path| File.mtime(path) > build_time }
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
      
      @build.builds.each do |name, settings|
        unless build_needed?(name)
          puts "  -- build '#{ name }' up-to-date"
          next
        end
        
        @build.helper.build = name
        path = build_path(name)
        FileUtils.mkdir_p(File.dirname(path))
        File.open(path, 'wb') { |f| f.write( (header + "\n" + code(name)).strip ) }
        
        size = (File.size(path)/1024.0).ceil
        path = path.sub(@build.build_directory, '')
        puts "  -- build '#{ name }' created #{ path }, #{ size } kb"
      end
    end
    
  end
end

