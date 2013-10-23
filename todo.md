TODO
----

## Bugs

* Make file links work properly, to enable Ctrl-click on a file name
* Back button takes 2 clicks - it's because History.pushState is happening twice 
  maybe because of change:filePath and change:folderPath maybe
* Remove Add file button when no folderPath
* Add Humane for error notifications
* node code/crood/server.js should work, that might be a change in apper
* On creating new file, reset associated syntax
* Hovering on Create New and Up Folder button shows weird transition

## Features

* Tests!
* New Folder button
* Overwriting file with unmergeable changes should alert user
* Moving away from unsaved file must alert user
* Chrome extension
* Plugin architecture
* List of recent files
* Maintain Undo history correctly across files. Maybe save that to localStorage
* Live update
* Options menu inside file's li element to rename, copy, etc
* Create new File/Folder
* Rename File/Folder
* Drag and drop move to different folder
* Run command in local folder's command prompt
* Commit to git from inside this? It's possible.
* Make an installable component that enables a hosted version of this to save to local
* Keyboard shortcut to open another window with the same folder and file view
* Make the folder animation work with simultaneous divs, instead of content replacement
