<?php
// Debug script to test YAML parsing
include_once '../../backend/blog-parser.php';

// Test with a sample YAML frontmatter
$testContent = "---
title: \"Title is test\"
category: \"Test Category\"
category_color: \"blue\"
excerpt: \"Test excerpt\"
read_time: 5
published_time: 2025-01-01T00:00:00Z
status: \"draft\"
images:
  - ../../Gallery/Blog-images/title-is-test/Mojave.webp
---

This is the content.";

echo "Testing YAML parsing...\n";
list($frontmatter, $markdown) = parseYamlFrontmatter($testContent);

echo "Frontmatter:\n";
print_r($frontmatter);

echo "\nMarkdown:\n";
echo $markdown;

echo "\nImages array:\n";
print_r($frontmatter['images'] ?? 'No images found');
?>
