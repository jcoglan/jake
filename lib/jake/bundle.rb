module Jake
  class Bundle < Buildable
    
    def source
      @source ||= @config[:files].map { |pkg|
        @build.package(pkg).source
      }.join("\n")
    end
    
    def code(name)
      @code[name] ||= @config[:files].map { |pkg|
        @build.package(pkg).code(name)
      }.join("\n")
    end
    
  end
end

