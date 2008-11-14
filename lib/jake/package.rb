module Jake
  class Package < Buildable
    
    def files
      @config[:files].map do |path|
        path = "#{ directory }/#{ path }"
        File.file?(path) ? path : "#{ path }.js"
      end
    end
    
    def source
      @source ||= files.map { |path| Jake.read(path) }.join("\n\n\n")
    end
    
    def code(name)
      return @code[name] if @code[name]
      settings = packer_settings(name)
      output = ERB.new(source).result(@build.helper.scope)
      @code[name] = settings ? Packr.pack(output, settings) : output
    end
    
    def header
      reqs = @config[:requires] || []
      [super, *reqs.map { |r| "// @require #{r}" }].join("\n")
    end
    
  end
end

