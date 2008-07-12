module Jake
  class Bundle < Buildable
    
    def source
      @source ||= @config[:files].map { |name| @build.package(name).source }.join("\n")
    end
    
  end
end

