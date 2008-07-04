module Jake
  class Package
    
    attr_reader :name
    
    def initialize(build, name, config)
      @build, @name, @config = build, name, config
      puts header
    end
    
    def directory
      "#{ @build.source_directory }/#{ @config[:directory] }"
    end
    
    def header
      @config[:header] ?
          Jake.read("#{ directory }/#{ @config[:header] }") :
          @build.header
    end
    
    def source
      @source ||= @config[:files].map { |path| Jake.read("#{ directory }/#{ path }") }.join("\n")
    end
  end
end

