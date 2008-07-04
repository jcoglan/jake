require 'yaml'

module Jake
  class Build
    def initialize(dir)
      @dir = File.expand_path(dir)
      path = "#{dir}/#{CONFIG_FILE}"
      @config = Jake.symbolize_hash( YAML.load(File.read(path)) )
      @packages = @config[:packages].map { |name, conf| Package.new(self, name, conf) }
    end
    
    def run
      
    end
    
    def build_directory
      "#{ @dir }/#{ @config[:build_directory] || '.' }"
    end
    
    def source_directory
      "#{ @dir }/#{ @config[:source_directory] || '.' }"
    end
    
    def packer_settings
      @config[:packer] || {}
    end
  end
end

