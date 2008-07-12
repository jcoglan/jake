module Jake
  VERSION = '0.9.0'
  
  CONFIG_FILE = 'jake.yml'
  HELPER_FILE = 'Jakefile'
  
  def self.build(path)
    Build.new(path).run!
  end
  
  def self.read(path)
    path = File.expand_path(path)
    path = File.file?(path) ? path : ( File.file?("#{path}.js") ? "#{path}.js" : nil )
    path and File.read(path).strip
  end
  
  def self.symbolize_hash(hash, deep = true)
    hash.inject({}) do |output, (key, value)|
      value = Jake.symbolize_hash(value) if deep and value.is_a?(Hash)
      output[(key.to_sym rescue key) || key] = value
      output
    end
  end
  
  class Helper
    attr_accessor :build
    def get_binding; binding; end
  end
end

require File.dirname(__FILE__) + '/jake/build'
require File.dirname(__FILE__) + '/jake/buildable'
require File.dirname(__FILE__) + '/jake/package'
require File.dirname(__FILE__) + '/jake/bundle'

def jake(name, &block)
  Jake::Helper.class_eval do
    define_method(name, &block)
  end
end
 
