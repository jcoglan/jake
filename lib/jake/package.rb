module Jake
  class Package
    
    attr_reader :name
    
    def initialize(build, name, config)
      @build, @name, @config = build, name, config
    end
    
    def directory
      "#{ @build.source_directory }/#{ @config[:directory] }"
    end
    
    def source
      @source ||= @config[:files].map { |path| Jake.read("#{ directory }/#{ path }") }.join("\n")
    end
  end
end

