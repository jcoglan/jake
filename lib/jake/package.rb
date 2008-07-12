require 'erb'

module Jake
  class Package < Buildable
    
    def source
      return @source if @source
      code = @config[:files].map { |path| Jake.read("#{ directory }/#{ path }") }.join("\n")
      template = ERB.new(code)
      @source = template.result(@build.helper.get_binding)
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

