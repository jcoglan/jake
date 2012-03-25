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
      
      packer = packer_settings(build_name)
      head   = header
      
      if packer
        packer = packer.merge(:header => head)
        
        if source_map = packer.delete(:source_map)
          output_path = build_path(build_name)
          packer.update(:output_file => output_path)
          
          if source_map == :source
            source_offsets = {}
            code = head ? head + "\n" : ''
            
            files.each do |file|
              source_path = Packr::FileSystem.relative_path(file, output_path)
              source_offsets[source_path] = code.size
              code << Jake.erb(Jake.read(file)).result(@build.helper.scope) << "\n"
            end
            
            packer.update(:source_files => source_offsets)
          else
            source_path = Packr::FileSystem.relative_path(build_path(source_map), output_path)
            packer.update(:source_files => {source_path => 0})
            code = code(source_map)
          end
        else
          code = Jake.erb(source).result(@build.helper.scope)
        end
        
        code = Packr.pack(code, packer)
      else
        code = Jake.erb(source).result(@build.helper.scope)
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
    
  end
end

