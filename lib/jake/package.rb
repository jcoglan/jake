module Jake
  class Package < Buildable
    
    def source
      @source ||= @config[:files].map { |path| Jake.read("#{ directory }/#{ path }") }.join("\n")
    end
    
    def minified
      @minified ||= Packr.pack(source, packer_settings)
    end
    
    def header
      reqs = @config[:requires] || []
      [super, *reqs.map { |r| "// @require #{r}" }].join("\n")
    end
    
  end
end

