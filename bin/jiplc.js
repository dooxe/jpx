/**
*	jipl to javascript compiler

*	@author dooxe
*/
var
    path    = require('path'),
    fs      = require('fs'),
    jiplc   = require(path.join(__dirname,'..','dist','jiplc'))
;

var input   = null;
var output  = null;
var args    = process.argv;
for(var i = 2; i < args.length; ++i)
{
    var arg = args[i-1];
    var val = args[i+0];
    switch(arg)
    {
        case "-i" : {
            input = val;
            break;
        }
        case "-o" : {
            output = val;
            break;
        }
    }
}

var contents = args[2];

//
//
//
if(input != null)
{
    var file = input;
    if(!fs.existsSync(file))
    {
        process.exit(1);
    }
    contents = fs.readFileSync(file,'utf-8');
}

if(!contents)
{
    console.error("No input content");
    process.exit(1);
}
contents = jiplc.compile(contents);

//
//
//
if(output)
{
    fs.writeFileSync(output, contents);
}
else 
{
    console.log(contents);
}