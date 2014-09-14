manuscript-logger
=================

A node.js app that keeps track of progress on a manuscript.

Which means you have to have [node.js](http://nodejs.org/) installed.

To install this script on your machine simply run `npm install manuscript-logger`

## Usage

Run `node index.js manuscriptdir/` the only argument is the directory you would like it to scan. It will scan sub-directories too.


When it runs it will create or append to a file in that directory called `_meta.progress.csv` with the current date and time, the number of files scanned, and the total word count from all those files (ignoring the meta headers). This CSV file should allow you to track and report on your own progress in a writing project.

## Meta Headers

These look like
```
---
author: Tim
date: 2014-09-13
status: outline
---
```

This script uses them specifically for tracking which files are in which stage of completion.

Valid options for the status field are:

- outline
- draft
- final-draft
- edited

Everything else is categorized as unknown.

The list of files in each phase is written out to a [taskpaper](http://hogbaysoftware.com/) file with headings for each status. The file is named `_meta.status.taskpaper`

This works exceptionally well with the [PlainTasks](https://github.com/aziz/PlainTasks) plugin for SublimeText
