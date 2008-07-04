module Jake
  class Bundle < Buildable
    
    def source
      @source ||= @config[:files].map { |name|  @build.package(name).source }.join("\n")
    end
    
    def minified
      @minified ||= @config[:files].map { |name|  @build.package(name).minified }.join("\n")
    end
    
  end
end

