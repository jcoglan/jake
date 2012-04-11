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
    
    def parent
      return nil unless @config[:extends]
      @parent ||= @build.package(@config[:extends])
    end
    
    def directory
      dir = @config[:directory]
      return parent.directory if parent && !dir
      Jake.path(@build.source_directory, @config[:directory])
    end
    
    def build_path(build_name)
      suffix = @build.use_suffix?(build_name) ? "-#{ build_name }" : ""
      @build.layout == 'together' ?
          Jake.path(@build.build_directory, "#{ @name }#{ suffix }.js") :
          Jake.path(@build.build_directory, build_name, "#{ @name }.js")
    end
    
    def build_needed?(name)
      return true if @build.forced?
      path = build_path(name)
      return true unless File.file?(path)
      build_time = File.mtime(path)
      
      input_files = files + @build.config_files
      input_files.any? { |path| File.mtime(path) > build_time }
    end
    
    def header
      content = @config[:header] ?
          Jake.read(Jake.path( directory, @config[:header])) :
          (parent ? parent.header : @build.header)
      
      return nil unless content
      header = Jake.erb(content).result(@build.helper.scope)
      return nil if header == ''
      header
    end
    
    def packer_settings(build_name)
      global = @build.packer_settings(build_name)
      local  = @config[:packer]
      return parent.packer_settings(build_name) if parent && !local
      return {:minify => false} if global == false or local == false
      {}.merge(global || {}).merge(local || {})
    end
    
    def meta
      @config[:meta] || {}
    end
    
    def write!
      @build.each do |name, settings|
        path = build_path(name)
        @build.fire(:file_not_changed, self, name, path) and next unless build_needed?(name)
        
        @build.helper.build = name.to_s
        FileUtils.mkdir_p(File.dirname(path))
        
        output_code = code(name)
        source_map = output_code.source_map if output_code.respond_to?(:source_map)
        
        File.open(path, 'w') { |f| f.write(output_code) }
        @build.fire(:file_created, self, name, path)
        
        if source_map and source_map.enabled?
          File.open(source_map.filename, 'w') { |f| f.write(source_map.to_s) }
          @build.fire(:file_created, self, name, source_map.filename)
        end
        
        size = (File.size(path)/1024.0).ceil
        path = path.sub(@build.build_directory, '')
      end
    end
    
  end
end

