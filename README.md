# Obsidian Consecutive Lists
Create lists that are displayed separately in reading mode, when separated by an empty line.

This plugin changes nothing about the way markdown is interpreted in Obsidian. It creates markdown entirely compatible with other parsers, ensuring your notes are transferrable, and completely unreliant on this plugin.

It works simply by automatically inserting alternating list characters in consecutive lists, so they appear correctly separated in reading mode.

## Explanation
Say you wanted to create these two lists:
- item 1
- item 2
- item 3

+ item 4
+ item 5
+ item 6

This wouldn't work using this markdown:

```
- item 1
- item 2
- item 3

- item 4
- item 5
- item 6
```

Which would result in this:

- item 1
- item 2
- item 3

- item 4
- item 5
- item 6

So the plugin automatically changes the list character for the second list, resulting in this markdown:

```
- item 1
- item 2
- item 3

+ item 4
+ item 5
+ item 6
```

Resulting in what we wanted:

- item 1
- item 2
- item 3

+ item 4
+ item 5
+ item 6
