require 'erb'

module Jake
  class Package < Buildable
    
    def source
      @source ||= @config[:files].map { |path| Jake.read("#{ directory }/#{ path }") }.join("\n")
    end
    
    def code(name)
      return @code[name] if @code[name]
      settings = packer_settings(name)
      output = ERB.new(source).result(@build.helper.get_binding)
      @code[name] ||= settings ? Packr.pack(output, settings) : output
    end
    
    def header
      reqs = @config[:requires] || []
      [super, *reqs.map { |r| "// @require #{r}" }].join("\n")
    end
    
  end
end

