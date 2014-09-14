
var fs = require('fs');
var walk    = require('walk');
var yaml	= require('js-yaml');
var metaContent = require('./lib/content');
var files   = [];
var target	= '';
var argv = require('minimist')(process.argv.slice(2));

var manifest = [];

if (argv._.length === 1) {
	target = argv._[0];
	readTargetDir();
} else {
	console.log("ERROR: Wrong number of arguments, just give me the directory you want to look in.")
};

function readTargetDir() {
	console.log('target:' + target);
	// Walker options
	var walker  = walk.walk('./' + target, { followLinks: false });

	walker.on('file', function(root, stat, next) {
	    if (!stat.isDirectory()) {
	    	var extension = stat.name.split('.')[1];
	    	if (extension === 'md') {
	    		// Add this file to the list of files
		    	files.push(root + stat.name);
	    	}; 
	    };
	    next();
	});

	walker.on('end', function() {
		getWordCounts();
		console.dir(manifest);
		writeLogs(manifest);
	});
}

function getWordCounts() {
	for (var i = files.length - 1; i >= 0; i--) {
		
		var file = files[i];
		//read meta
		var contents = fs.readFileSync(file, 'utf8');
		var lines = contents.split('\n');
		var frontMatter = metaContent.getFrontMatter(lines);
		var newContent = lines.join('\n');
		//read text
		manifest.push({
			filename: file,
			yaml: frontMatter.trim(),
			wordCount: wc(newContent.trim()),
			meta: frontMatter ? yaml.load(frontMatter) : {}
		});
	};
}

function writeLogs(manifest) {
	var totalWordCount = 0;
	var unknown = [];
	var outline = [];
	var draft = [];
	var finaldraft = [];
	var edited = [];

	for (var i = manifest.length - 1; i >= 0; i--) {
		var fileEntry = manifest[i];
		totalWordCount += fileEntry.wordCount;
		if (fileEntry.meta.status !== undefined && fileEntry.meta.status !== '') {
			switch (fileEntry.meta.status.toLowerCase()) {
			  case 'outline':
			    outline.push(fileEntry);
			   	break;
			  case 'draft':
			    draft.push(fileEntry);
			    break;
			  case 'final-draft':
			    finaldraft.push(fileEntry);
			    break;
			  case 'edited':
			    edited.push(fileEntry);
			    break;
			  default:
			    unknown.push(fileEntry);
			    break;
			}
		};
		var taskBuffer = 'Status updated at ' + getDate() + '\n';
		
		
	};
	//Updates
	taskBuffer += 'Unknown:\n';
	for (var i = unknown.length - 1; i >= 0; i--) {
		taskBuffer += ' - ' + unknown[i].filename + ' (' + unknown[i].wordCount + ' words so far)\n';
	};
	taskBuffer += '\n';

	//Outlines
	taskBuffer += 'Outline:\n';
	for (var i = outline.length - 1; i >= 0; i--) {
		taskBuffer += ' - ' + outline[i].filename + ' (' + outline[i].wordCount + ' words so far)\n';
	};
	taskBuffer += '\n';		

	//Draft
	taskBuffer += 'Draft:\n';
	for (var i = draft.length - 1; i >= 0; i--) {
		taskBuffer += ' - ' + draft[i].filename + ' (' + draft[i].wordCount + ' words so far)\n';
	};
	taskBuffer += '\n';	

	//Draft-finished
	taskBuffer += 'Final Draft:\n';
	for (var i = finaldraft.length - 1; i >= 0; i--) {
		taskBuffer += ' - ' + finaldraft[i].filename + ' (' + finaldraft[i].meta.wordCount + ' words so far)\n';
	};
	taskBuffer += '\n';	

	//Edited
	taskBuffer += 'Edited:\n';
	for (var i = edited.length - 1; i >= 0; i--) {
		taskBuffer += ' - ' + edited[i].filename + ' (' + edited[i].meta.wordCount + ' words so far)\n';
	};
	taskBuffer += '\n';	
	fs.writeFileSync(target+'_meta.status.taskpaper', taskBuffer);
	
	var wcBuffer = getDate();
	wcBuffer += ',' + manifest.length + ',' + totalWordCount + '\n';
	fs.appendFileSync(target+'_meta.progress.csv', wcBuffer);
	
};

function wc(body){

	//var lines = (body.match(/\n/g) || '').length;
	var words = (body.split(/\s+/) || ' ').length - 1;
	//var chars = body.length;
	body = '';
	return words;
}

function getDate() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
}
