module Jake
  class Package < Buildable
    
    # Returns a list of paths to all the files used to build this package.
    def files
      base = parent ? parent.files : []
      base + @config[:files].map do |path|
        path = "#{ directory }/#{ path }"
        File.file?(path) ? path : "#{ path }.js"
      end
    end
    
    # Returns the full uncompressed source code of this package, before
    # ERB processing. ERB output will be build-dependent; this method
    # simply builds the raw template for further processing by other
    # methods.
    def source
      @source ||= files.map { |path| Jake.read(path) }.join("\n\n\n")
    end
    
    # Returns the result of building the source template and minifying
    # the output using the given named set of PackR settings.
    def code(name)
      return @code[name] if @code[name]
      settings = packer_settings(name)
      output = ERB.new(source).result(@build.helper.scope)
      @code[name] = settings ? Packr.pack(output, settings) : output
    end
    
  end
end

