module Jake
  class Bundle < Buildable
    
    def files
      base = parent ? parent.files : []
      base + @config[:files].map { |pkg| @build.package(pkg).files }.flatten
    end
    
    def source
      @source ||= @config[:files].map { |pkg| @build.package(pkg).source }.join("\n\n\n")
    end
    
    def code(name)
      joiner = (packer_settings(name) == false) ? "\n\n\n" : "\n"
      @code[name] ||= @config[:files].map { |pkg| @build.package(pkg).code(name) }.join(joiner)
    end
    
  end
end

