require 'yaml'
require 'fileutils'

module Jake
  class Build
    
    DEFAULT_LAYOUT = 'together'
    
    include Enumerable
    attr_reader :helper
    
    def initialize(dir, config = nil, options = {})
      @dir = File.expand_path(dir)
      @helper = Helper.new(options)
      
      path = "#{dir}/#{CONFIG_FILE}"
      yaml = File.read(path)
      
      @config = Jake.symbolize_hash( config || YAML.load(ERB.new(yaml).result(@helper.scope)) )
      
      helpers = "#{dir}/#{HELPER_FILE}"
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
    
    def each(&block)
      @builds.each(&block)
    end
    
    def force!
      @forced = true
    end
    
    def forced?
      defined?(@forced)
    end
    
    def package(name)
      @packages[name.to_sym] || @bundles[name.to_sym]
    end
    
    def run!
      @packages.each { |name, pkg| pkg.write! }
      @bundles.each  { |name, pkg| pkg.write! }
      @helper.after_build(self) if @helper.respond_to?(:after_build)
    end
    
    def build_directory
      "#{ @dir }/#{ @config[:build_directory] || '.' }"
    end
    
    def source_directory
      "#{ @dir }/#{ @config[:source_directory] || '.' }"
    end
    
    def header
      @config[:header] ?
          Jake.read("#{ source_directory }/#{ @config[:header] }") :
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

