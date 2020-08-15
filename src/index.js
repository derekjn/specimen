import hljs from 'highlight.js/lib/core';
import ksql from './ksql-highlightjs';
hljs.registerLanguage('sql', ksql);
hljs.initHighlightingOnLoad();

export { Specimen } from './specimen';
