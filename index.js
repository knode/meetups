module.exports = main

var path = require('path')
  , fs = require('fs')

var through = require('through')
  , marked = require('marked')
  , ls = require('ls-stream')

if(require.main === module) {
  main()
    .pipe(require('JSONStream').stringify())
    .pipe(process.stdout)
}

function main() {
  return ls(__dirname)
    .pipe(filter())
    .pipe(annotateContent())
    .pipe(toMetadata())
}

// only emit entries that look like meetup markdown files.
function filter() {
  var stream = through(write)

  return stream

  function write(entry) {
    if(!/^(.+)\-(.+)(\-(.+))?/g.test(entry.path.replace(__dirname))) {
      entry.ignore()

      return
    }

    if(entry.stat.isFile() && path.extname(entry.path) === '.md') {
      stream.queue(entry)
    }
  }
}

// staple the file contents onto the meetup markdown files.
function annotateContent() {
  var stream = through(write, end)
    , pending = 0
    , ended

  return stream

  function write(entry) {
    ++pending
    fs.readFile(entry.path, 'utf8', onread)

    function onread(err, data) {
      if(err) {
        return stream.emit('error', err)
      }

      stream.queue({
          entry: entry
        , data: data
      })
      --pending
      check()
    }
  }

  function end() {
    ended = true
    check()
  }

  function check() {
    if(ended && !pending) {
      stream.queue(null)
    }
  }
}

// turn the meetup {data: filedata, entry: entry} data into
// metadata about the meetups.
function toMetadata() {
  var stream = through(write)

  return stream

  function write(data) {

    var lexed = marked.lexer(data.data)
      , plural = {
            'urls': true
          , 'organizers': true
        }
      , formats = []
      , format
      , meta

    meta = [lexed[1].header].concat(lexed[1].cells).reduce(function(lhs, rhs) {
      var key = slugify(rhs[0].slice(2, -3))

      lhs[key] = plural[key] ? rhs[1].split(/,\s*/) : rhs[1]

      return lhs
    }, {})

    meta.name = lexed[0].text

    while(lexed[0].type !== 'hr') {
      lexed.shift()
    }

    lexed = lexed.slice(2)

    // nom formats
    while(lexed.length && lexed[0].type === 'heading' && lexed[0].depth !== 2) {
      format = {}

      format.name = lexed[0].text
      format.info = []

      lexed.shift()

      while(lexed.length && lexed[0].type !== 'heading' && lexed[0].depth !== 3) {
        format.info.push(lexed.shift())
      }

      formats.push(format)
    }

    meta.formats = formats

    lexed.shift()

    meta.process = lexed.map(function(xs) {
      return xs.text || ''
    }).join('\n')


    stream.queue(meta)
  }
}

function oncomplete(data) {
  console.log(data)
}

// simple in this case:
function slugify(input) {
  input = input.toString()

  return input
        .replace(/[^\w\s\d\-]/g, '')
        .replace(/^\s*/, '')
        .replace(/\s*$/, '')
        .replace(/[\-\s]+/g, '-')
        .toLowerCase()
}
