export default function(hljs) {
    const COMMENT_MODE = hljs.COMMENT('--', '$');

    const beginKeywords = 'list show describe print terminate set unset create insert delete drop explain run select';

    return {
        case_insensitive: true,
        illegal: /[<>{}*]/,
        contains: [
            {
                beginKeywords,
                end: /;/, endsWithParent: true,
                lexemes: /[\w\.]+/,
                keywords: {
                    keyword: `${beginKeywords} properties topic topics stream streams table tables function functions source sources sink sinks connector connectors extended query queries if not and or exists with into on from by as is at partition partitions values script type types window where group having emit changes beginning between like limit size tumbling hopping advance session year month day hour minute second millisecond years months days hours minutes seconds milliseconds inner full outer left right join within distinct key load rename properties namespace primary materialized view delimited kafka_topic value_format`,
                    literal:
                        'true false null',
                    built_in:
                        'array map struct decimal varchar string boolean integer int bigint double'
                },
                contains: [
                    {
                        className: 'string',
                        begin: '\'', end: '\'',
                        contains: [hljs.BACKSLASH_ESCAPE, { begin: '\'\'' }]
                    },
                    {
                        className: 'string',
                        begin: '"', end: '"',
                        contains: [hljs.BACKSLASH_ESCAPE, { begin: '""' }]
                    },
                    {
                        className: 'string',
                        begin: '`', end: '`',
                        contains: [hljs.BACKSLASH_ESCAPE]
                    },
                    hljs.C_NUMBER_MODE,
                    hljs.C_BLOCK_COMMENT_MODE,
                    COMMENT_MODE,
                    hljs.HASH_COMMENT_MODE
                ]
            },
            hljs.C_BLOCK_COMMENT_MODE,
            COMMENT_MODE,
            hljs.HASH_COMMENT_MODE
        ]
    };
};
