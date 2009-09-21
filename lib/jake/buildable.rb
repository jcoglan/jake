module Jake
  # A +Buildable+ represents a group of files that may be merged to form a single
  # build file. There are two subtypes of +Buildable+; a +Package+ takes several
  # source files and produces a build file, and a +Bundle+ takes several +Package+
  # build files to produce another build file. This class should be considered
  # abstract as some of its methods must be filled in by subtypes.
  class Buildable
    
    attr_reader :name
    
    # Create a new +Buildable+ using a +Build+ container, a name and a configuration
    # hash, typically a subsection of jake.yml.
    def initialize(build, name, config)
      @build, @name = build, name
      @config = case config
      when Hash   then config
      when String then {:files => [config]}
      when Array  then {:files => config}
      end
      @code = {}
    end
    
    # Returns the parent +Buildable+ set using the +extends+ option, or +nil+ if
    # there is no parent.
    def parent
      return nil unless @config[:extends]
      @parent ||= @build.package(@config[:extends])
    end
    
    # Returns the source directory for this package.
    def directory
      dir = @config[:directory]
      return parent.directory if parent && !dir
      Jake.path(@build.source_directory, @config[:directory])
    end
    
    # Returns the path to the output file from this package for the given build name.
    def build_path(build_name)
      suffix = @build.use_suffix?(build_name) ? "-#{ build_name }" : ""
      @build.layout == 'together' ?
          Jake.path(@build.build_directory, "#{ @name }#{ suffix }.js") :
          Jake.path(@build.build_directory, build_name, "#{ @name }.js")
    end
    
    # Returns +true+ if the build file for the given build name is out of date and
    # should be regenerated.
    def build_needed?(name)
      return true if @build.forced?
      path = build_path(name)
      return true unless File.file?(path)
      build_time = File.mtime(path)
      files.any? { |path| File.mtime(path) > build_time }
    end
    
    # Returns the header string being used for this package.
    def header
      content = @config[:header] ?
          Jake.read(Jake.path( directory, @config[:header])) :
          (parent ? parent.header : @build.header)
      Jake.erb(content).result(@build.helper.scope).strip
    end
    
    # Returns the PackR settings to use for this package during the given build.
    def packer_settings(build_name)
      global = @build.packer_settings(build_name)
      local  = @config[:packer]
      return parent.packer_settings(build_name) if parent && !local
      return false if global == false or local == false
      {}.merge(global || {}).merge(local || {})
    end
    
    # Returns a hash containing any metadata attached to the package in the config.
    def meta
      @config[:meta] || {}
    end
    
    # Generates all the build files for this package by looping over all the
    # required builds and compressing the source code using each set of minification
    # options. Files are only generated if they are out of date or the build has
    # been forced.
    def write!
      @build.each do |name, settings|
        path = build_path(name)
        @build.fire(:file_not_changed, self, name, path) and next unless build_needed?(name)
        
        @build.helper.build = name.to_s
        FileUtils.mkdir_p(File.dirname(path))
        File.open(path, 'wb') { |f| f.write( (header + "\n\n" + code(name)).strip ) }
        
        @build.fire(:file_created, self, name, path)
        
        size = (File.size(path)/1024.0).ceil
        path = path.sub(@build.build_directory, '')
      end
    end
    
  end
end

