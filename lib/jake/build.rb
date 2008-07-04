require 'yaml'
require 'fileutils'

module Jake
  class Build
    def initialize(dir)
      @dir = File.expand_path(dir)
      path = "#{dir}/#{CONFIG_FILE}"
      @config = Jake.symbolize_hash( YAML.load(File.read(path)) )
      @packages = @config[:packages].map { |name, conf| Package.new(self, name, conf) }
    end
    
    def run!
      FileUtils.rm_rf(build_directory)
      @packages.each { |p| p.write! }
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

