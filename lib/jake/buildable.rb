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
      suffix = @build.use_suffix?(build_name) ? "-#{ build_name }" : ""
      @build.layout == 'together' ?
          "#{ @build.build_directory }/#{ @name }#{ suffix }.js" :
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
      content = @config[:header] ?
          Jake.read("#{ directory }/#{ @config[:header] }") :
          @build.header
      ERB.new(content).result(@build.helper.scope).strip
    end
    
    def packer_settings(build_name)
      global = @build.packer_settings(build_name)
      local  = @config[:packer]
      return false if global == false or local == false
      {}.merge(global || {}).merge(local || {})
    end
    
    def write!
      puts "Package #{@name}..."
      
      @build.each do |name, settings|
        next unless build_needed?(name)
        
        @build.helper.build = name
        path = build_path(name)
        FileUtils.mkdir_p(File.dirname(path))
        File.open(path, 'wb') { |f| f.write( (header + "\n\n" + code(name)).strip ) }
        
        size = (File.size(path)/1024.0).ceil
        path = path.sub(@build.build_directory, '')
        puts "  -- build '#{ name }' created #{ path }, #{ size } kb"
      end
    end
    
  end
end

