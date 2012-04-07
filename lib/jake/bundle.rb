module Jake
  class Bundle < Buildable
    
    def files
      base = parent ? parent.files : []
      base + @config[:files].map { |pkg| @build.package(pkg).files }.flatten
    end
    
    def source
      @source ||= @config[:files].map { |pkg| @build.package(pkg).source }.join("\n")
    end
    
    def code(build_name)
      return @code[build_name] if @code[build_name]
      
      packer = packer_settings(build_name)
      joiner = (packer[:minify] == false) ? "\n" : ""
      
      code = @config[:files].map { |pkg| @build.package(pkg).code(build_name, false) }.join(joiner)
      if head = header
        code = head + code
      end
      
      @code[build_name] = code
    end
    
  end
end

