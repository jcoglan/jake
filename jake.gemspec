Gem::Specification.new do |s|
  s.name              = "jake"
  s.version           = "1.1.1"
  s.summary           = "Build tools for JavaScript projects"
  s.author            = "James Coglan"
  s.email             = "jcoglan@gmail.com"
  s.homepage          = "http://github.com/jcoglan/jake"

  s.extra_rdoc_files  = %w[README.rdoc]
  s.rdoc_options      = %w[--main README.rdoc]

  s.files             = %w[History.txt README.rdoc] + Dir.glob("{bin,lib}/**/*")

  s.executables       = Dir.glob("bin/**").map { |f| File.basename(f) }
  s.require_paths     = ["lib"]

  s.add_dependency "eventful", ">= 1.0.0"
  s.add_dependency "packr", ">= 3.2.0"
  s.add_dependency "oyster", ">= 0.9.5"

  s.add_development_dependency "test-unit"
end
