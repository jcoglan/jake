module Jake
  # A +Build+ encapsulates a single instance of running <tt>Jake.build!</tt>. It
  # is responsible for running the build and provides access to any configuration
  # data used to set up the build.
  class Build
    include Eventful
    
    DEFAULT_LAYOUT = 'together'
    
    include Enumerable
    attr_reader :helper
    
    # Builds are initialized using a directory in which to run the build, and an
    # options hash. Options are passed through to helper methods in the +options+
    # object.
    def initialize(dir, options = {})
      @dir    = File.expand_path(dir)
      @helper = Helper.new(options)
      force! if options[:force]
      
      path    = Jake.path(dir, CONFIG_FILE)
      yaml    = File.read(path)
      
      @config = Jake.symbolize_hash( YAML.load(Jake.erb(yaml).result(@helper.scope)) )
      
      helpers = Jake.path(dir, HELPER_FILE)
      load helpers if File.file?(helpers)
      
      @builds = @config[:builds] || {:src => false, :min => @config[:packer]}
      
      @packages = @config[:packages].inject({}) do |pkgs, (name, conf)|
        pkgs[name] = Package.new(self, name, conf)
        pkgs
      end
      
      @bundles = (@config[:bundles] || {}).inject({}) do |pkgs, (name, conf)|
        pkgs[name] = Bundle.new(self, name, conf)
        pkgs
      end
    end
    
    # Yields to the block for each build in the group.
    def each(&block)
      @builds.each(&block)
    end
    
    # Forces the build to generate new files even if target files appear up-to-date.
    def force!
      @forced = true
    end
    
    # Returns +true+ iff this is a forced build.
    def forced?
      defined?(@forced)
    end
    
    # Returns a list of names for all packages in the build.
    def packages
      list = []
      @packages.each { |name, pkg| list << name }
      @bundles.each  { |name, pkg| list << name }
      list
    end
    
    # Returns the +Buildable+ with the given name.
    def package(name)
      @packages[name.to_sym] || @bundles[name.to_sym]
    end
    
    # Runs the build, generating new files in +build_directory+.
    def run!
      FileUtils.cd(@dir) do
        @packages.each { |name, pkg| pkg.write! }
        @bundles.each  { |name, pkg| pkg.write! }
        fire(:build_complete)
      end
    end
    
    # Returns the path to the build directory, where generated files appear.
    def build_directory
      Jake.path(@dir, @config[:build_directory] || '.')
    end
    alias :build_dir :build_directory
    
    # Returns the path to the source directory, where source code is read from.
    def source_directory
      Jake.path(@dir, @config[:source_directory] || '.')
    end
    alias :source_dir :source_directory
    
    # Returns the header string used for the build, or an empty string if no
    # header file has been set.
    def header
      @config[:header] ?
          Jake.read(Jake.path(source_directory, @config[:header])) :
          ""
    end
    
    # Returns the minification settings for Packr for the given build name. Each
    # +Build+ object can build all its packages multiple times with different
    # minification settings in each run.
    def packer_settings(build_name)
      build = @builds[build_name.to_sym]
      return false unless build
      build[:packer].nil? ? build : build[:packer]
    end
    
    # Returns +true+ iff filename suffixes based on build name should be added
    # to generated files for the given build name.
    def use_suffix?(build_name)
      build = @builds[build_name.to_sym]
      return true unless build
      build[:suffix] != false
    end
    
    # Returns the name of the layout being used, either +together+ or +apart+.
    def layout
      @config[:layout] || DEFAULT_LAYOUT
    end
    
  end
end

