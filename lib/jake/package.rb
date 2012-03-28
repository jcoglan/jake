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
      @source ||= files.map { |path| Jake.read(path) }.join("\n\n")
    end
    
    # Returns the result of building the source template and minifying
    # the output using the given named set of Packr settings.
    def code(build_name, with_header = true)
      if cached = @code[build_name]
        return with_header ? cached[:with_header] : cached[:code]
      end
      
      packer = packer_settings(build_name)
      head   = header
      
      if packer
        packer = packer.merge(:header => head)
        code = code_for_packer(packer, build_name)
      else
        code = compile_erb(source)
        code = head + "\n" + code if head
      end
      
      cached = @code[build_name] = {
        :with_header => code,
        :code        => head && code[head.size..-1]
      }
      with_header ?
          cached[:with_header] :
          cached[:code]
    end
    
  private
    
    def code_for_packer(packer, build_name)
      if source_map = packer.delete(:source_map)
        code = code_for_source_map(packer, build_path(build_name), source_map)
      else
        code = compile_erb(source)
      end
      Packr.pack(code, packer)
    end
    
    def code_for_source_map(packer, output_path, source_map)
      packer.update(:output_file => output_path)
      
      if source_map == :source
        code_for_original_map(packer)
      else
        source_path = Packr::FileSystem.relative_path(build_path(source_map), output_path)
        [{:code => code(source_map), :source => source_path}]
      end  
    end
    
    def code_for_original_map(packer)
      files.map do |file|
        {
          :code   => compile_erb(Jake.read(file)),
          :source => Packr::FileSystem.relative_path(file, packer[:output_file])
        }
      end
    end
    
    def compile_erb(template)
      Jake.erb(template).result(@build.helper.scope)
    end
    
  end
end

