module Jake
  class Helper
    attr_accessor :build
    attr_reader :options
    
    def initialize(options = {})
      @options = options
    end
    
    def scope; binding; end
  end
end

