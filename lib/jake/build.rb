module Jake
  class Build
    include Eventful
    include Enumerable
    attr_reader :config_files, :helper
    
    DEFAULT_LAYOUT = 'together'
    
    def initialize(dir, options = {})
      @dir    = File.expand_path(dir)
      @helper = Helper.new(options)
      force! if options[:force]
      
      path    = Jake.path(dir, CONFIG_FILE)
      yaml    = File.read(path)
      
      @config_files = [path]
      @config = Jake.symbolize_hash( YAML.load(Jake.erb(yaml).result(@helper.scope)) )
      
      helpers = Jake.path(dir, HELPER_FILE)
      if File.file?(helpers)
        load helpers
        @config_files << helpers
      end
      
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
    
    def each(&block)
      @builds.each(&block)
    end
    
    def force!
      @forced = true
    end
    
    def forced?
      defined?(@forced)
    end
    
    def packages
      list = []
      @packages.each { |name, pkg| list << name }
      @bundles.each  { |name, pkg| list << name }
      list
    end
    
    def package(name)
      @packages[name.to_sym] || @bundles[name.to_sym]
    end
    
    def run!
      FileUtils.cd(@dir) do
        @packages.each { |name, pkg| pkg.write! }
        @bundles.each  { |name, pkg| pkg.write! }
        fire(:build_complete)
      end
    end
    
    def build_directory
      Jake.path(@dir, @config[:build_directory] || '.')
    end
    alias :build_dir :build_directory
    
    def source_directory
      Jake.path(@dir, @config[:source_directory] || '.')
    end
    alias :source_dir :source_directory
    
    def header
      @config[:header] ?
          Jake.read(Jake.path(source_directory, @config[:header])) :
          ""
    end
    
    def packer_settings(build_name)
      build = @builds[build_name.to_sym]
      return false unless build
      build[:packer].nil? ? build : build[:packer]
    end
    
    def use_suffix?(build_name)
      build = @builds[build_name.to_sym]
      return true unless build
      build[:suffix] != false
    end
    
    def layout
      @config[:layout] || DEFAULT_LAYOUT
    end
    
  end
end

