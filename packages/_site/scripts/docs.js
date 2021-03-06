const marked = require( 'marked' );
const fm = require( 'front-matter' );
const glob = require( 'glob' );
const _ = require( 'lodash' );
const path = require( 'path' );
const fs = require( 'fs' );

process.chdir( path.resolve( __dirname, '../' ) );

const cwd = process.cwd();
const renderer = new marked.Renderer();
var codes = {};

renderer.code = function( code, language ) {
	codes[ language ] = code;
	return '';
};

const docs = {};

glob( '**/*.md', {
	cwd: path.resolve( cwd, 'docs' )
}, function( err, files ) {
	if( err ) return;

	files.forEach(function( v, i ) {
		var componentName = path.dirname( v );
		var p = path.join( 'docs', v );
		docs[ componentName ] = docs[ componentName ] || [];
		docs[ componentName ].push({
			path: v
		});
	});

	// parse
	var doc;
	var id = 0;
	for( var i in docs ) {
		doc = docs[ i ];
		for( var j = 0, len = doc.length; j < len; j++ ) {
			var content = fs.readFileSync( path.resolve( cwd, 'docs', doc[ j ].path ), 'utf-8' );
			var parsed = fm( content );
			doc[ j ].attrs = parsed.attributes;
			doc[ j ].source = parsed.body;
			codes = {};
			doc[ j ].html = marked( parsed.body, { renderer: renderer } );
			doc[ j ].code = codes;
			doc[ j ].id = id++;
		}

		docs[ i ] = _.sortBy( docs[ i ], function( v ) {
			return v.attrs.order;
		} );
	}

	// extract js
	var output = '';
	var assignStr = '';
	_.each( docs, function( doc, name ) {
		_.each( doc, function( v, i ) {
			if( v.code.js ) {
				assignStr += 'var ' + name + i + ' = ' + v.code.js + ';\n';
			}
		} );
	} );

	output += assignStr;
	output += 'export default ';

	var jscodes = {};
	_.each( docs, function( doc, name ) {
		jscodes[ name ] = [];
		_.each( doc, function( v, i ) {
			if( v.code.js ) {
				jscodes[ name ].push( name + i );
			} else {
				// 占位
				jscodes[ name ].push( 'void 0' );
			}
		} );
	} );

	jscodes = JSON.stringify( jscodes );

	// e.g. "Table0" => Table0
	var regStr = '"(' + Object.keys( docs ).map(function( doc ) {
		return doc + '\\d+?';
	}).join('|') + ')"';

	jscodes = jscodes.replace(new RegExp( regStr, 'g' ), function(_, match) {
		return match;
	});

	jscodes = jscodes.replace(new RegExp( '"(void 0)"', 'g' ), function(_, match) {
		return match;
	});

	output += jscodes;

	fs.writeFileSync( 'src/docs.json', JSON.stringify( docs, 0, 4 ), 'utf-8' );
	fs.writeFileSync( 'src/docs-js.js', output, 'utf-8' );
} );
