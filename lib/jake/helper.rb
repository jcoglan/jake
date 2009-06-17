module Jake
  # The +Helper+ class stores helper methods that can be called from ERB
  # when generating source code. Use +jake_helper+ to define new helpers.
  class Helper
    attr_accessor :build
    attr_reader :options
    
    def initialize(options = {})
      @options = options
    end
    
    def scope; binding; end
  end
end

