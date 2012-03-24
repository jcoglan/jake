module Jake
  class Package < Buildable
    
    # Returns a list of paths to all the files used to build this package.
    def files
      base = parent ? parent.files : []
      base + @config[:files].map do |path|
        path = Jake.path( directory, path)
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
    # the output using the given named set of Packr settings.
    def code(build_name, with_header = true)
      if cached = @code[build_name]
        return with_header ? cached[:with_header] : cached[:code]
      end
      
      code = Jake.erb(source).result(@build.helper.scope)
      head = header
      
      if packer = packer_settings(build_name)
        packer = packer.merge(:header => head)
        code = Packr.pack(code, packer)
      else
        code = head + "\n" + code if head
      end
      
      @code[name] = {
        :with_header => code,
        :code        => head && code[head.size..-1]
      }
      with_header ?
          @code[name][:with_header] :
          @code[name][:code]
    end
    
  end
end

