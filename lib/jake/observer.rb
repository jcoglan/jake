module Jake
  # The +Observer+ class is used in conjunction with Ruby's +Observable+
  # module to provide typed event listeners. Use +jake_hook+ to register
  # new listeners in Jakefiles.
  class Observer
    def initialize(type, &block)
      @type, @block = type, block
      Build.add_observer(self)
    end
    
    def update(*args)
      @block[*args[1..-1]] if args.first == @type
    end
  end
end

