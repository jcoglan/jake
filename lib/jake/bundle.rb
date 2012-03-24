module Jake
  class Bundle < Buildable
    
    # Returns a list of paths to all the files used to build this package.
    def files
      base = parent ? parent.files : []
      base + @config[:files].map { |pkg| @build.package(pkg).files }.flatten
    end
    
    # Returns the full uncompressed source code of this package, before
    # ERB processing. ERB output will be build-dependent; this method
    # simply builds the raw template for further processing by other
    # methods.
    def source
      @source ||= @config[:files].map { |pkg| @build.package(pkg).source }.join("\n\n\n")
    end
    
    # Returns the result of building the source template and minifying
    # the output using the given named set of PackR settings.
    def code(build_name)
      return @code[build_name] if @code[build_name]
      
      joiner = (packer_settings(build_name) == false) ? "\n\n" : ""
      
      code = @config[:files].map { |pkg| @build.package(pkg).code(build_name, false) }.join(joiner)
      if head = header
        code = head + code
      end
      
      @code[build_name] = code
    end
    
  end
end

