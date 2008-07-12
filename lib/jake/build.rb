require 'yaml'
require 'fileutils'

module Jake
  class Build
    
    def initialize(dir, config = nil)
      @dir = File.expand_path(dir)
      
      path = "#{dir}/#{CONFIG_FILE}"
      @config = Jake.symbolize_hash( config || YAML.load(File.read(path)) )
      
      helpers = "#{dir}/#{HELPER_FILE}"
      load helpers if File.file?(helpers)
      
      @packages = @config[:packages].inject({}) do |pkgs, (name, conf)|
        pkgs[name] = Package.new(self, name, conf)
        pkgs
      end
      
      @bundles = (@config[:bundles] || {}).inject({}) do |pkgs, (name, conf)|
        pkgs[name] = Bundle.new(self, name, conf)
        pkgs
      end
    end
    
    def package(name)
      @packages[name.to_sym]
    end
    
    def run!
      @packages.each { |name, pkg| pkg.write! }
      @bundles.each  { |name, pkg| pkg.write! }
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
    
    def packer_settings
      @config[:packer] || {}
    end
    
  end
end

